"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Volume2, AlertCircle, Loader2, Waves, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import { transcribeAudio, chatResponse } from "../api/visa-api";

type CallEndEvent = {
  interviewId: string;
  reason: "completed" | "connect_error" | "runtime_error" | "user_interrupted" | "time_limit";
  callStarted: boolean;
  transcript?: any[];
};

interface ActiveCallInterfaceProps {
  assistantConfig: Record<string, any> | string; // Kept for prop signature compat
  interviewId: string;
  country: string;
  onCallEnd: (event: CallEndEvent) => void;
}

export function ActiveCallInterface({ assistantConfig, interviewId, country, onCallEnd }: ActiveCallInterfaceProps) {
  const targetDurationSeconds = 10 * 60;
  const [callStatus, setCallStatus] = useState<"connecting" | "active" | "ended">("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const initConfig = typeof assistantConfig === 'object' ? assistantConfig : {};
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessage, setAiMessage] = useState(initConfig.firstMessage || "Hello. I am the Consular Officer. Please state your name and purpose of travel.");
  
  const transcriptRef = useRef<any[]>([
    { role: "system", content: initConfig.systemPrompt || `You are a strict US Visa Consular Officer. Start the interview for ${country}. Keep responses short (1-2 sentences), blunt, and professional.` },
    { role: "assistant", content: initConfig.firstMessage || "Hello. I am the Consular Officer. Please state your name and purpose of travel." }
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isCallEndedRef = useRef(false);
  
  // Initialize Call
  useEffect(() => {
    setCallStatus("active");
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    
    // Speak initial message
    speakText(aiMessage);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Time limit check
  useEffect(() => {
    if (callStatus === "active" && elapsedTime >= targetDurationSeconds) {
      endCall("time_limit");
    }
  }, [elapsedTime, callStatus]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current
    
    setIsSpeaking(true);
    setVolumeLevel(0.8);
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Male")) || voices.find(v => v.lang.startsWith("en-"));
    if (englishVoice) utterance.voice = englishVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setVolumeLevel(0);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVolumeLevel(0);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (isMuted) {
      toast.error("Please unmute your microphone first.");
      return;
    }
    
    // Stop the interviewer from talking when user starts speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processAudioChunk();
      };

      mediaRecorder.start(1000); // Collect data every 1 second
      setIsRecording(true);
      setVolumeLevel(0.4); // Visual feedback
    } catch (err) {
      toast.error("Microphone access denied or unavailable.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setVolumeLevel(0);
    }
  };

  const processAudioChunk = async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn("No audio chunks collected.");
      return;
    }
    
    setIsThinking(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      console.log(`Processing audio blob of size: ${audioBlob.size} bytes`);
      
      // 1. Transcribe
      const transRes = await transcribeAudio(audioBlob);
      console.log("Transcription response:", transRes);
      
      const userText = transRes?.text;
      
      if (!userText || userText.trim() === "") {
        setIsThinking(false);
        toast.error("Could not hear you. Please try again.");
        return;
      }

      // Add to transcript
      transcriptRef.current.push({ role: "user", content: userText });

      // 2. Get AI Response
      const aiRes = await chatResponse(transcriptRef.current);
      const aiContent = aiRes?.content;
      
      if (aiContent) {
        if (isCallEndedRef.current) return;
        transcriptRef.current.push({ role: "assistant", content: aiContent });
        setAiMessage(aiContent);
        speakText(aiContent);
      }
    } catch (err) {
      toast.error("Connection error. Please check your internet.");
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const endCall = (reason: CallEndEvent["reason"] = "user_interrupted") => {
    isCallEndedRef.current = true;
    window.speechSynthesis.cancel();
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    
    setCallStatus("ended");
    onCallEnd({
      interviewId,
      reason,
      callStarted: true,
      transcript: transcriptRef.current,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-8 p-4">
      {/* Simulation Header */}
      <div className="w-full max-w-2xl flex items-center justify-between px-6 py-4 bg-muted/30 rounded-3xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Embassy Channel - {country}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm font-bold text-muted-foreground">
          <Clock size={14} /> {formatTime(elapsedTime)} / {formatTime(targetDurationSeconds)}
        </div>
      </div>

      {/* Main Visualizer Card */}
      <Card className="w-full max-w-2xl border-none bg-background shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <CardBody className="p-12 sm:p-20 flex flex-col items-center gap-12 relative z-10">
          <div className="relative cursor-pointer group" onClick={() => {
            if (isThinking || isSpeaking) return;
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}>
            <motion.div 
              animate={{ scale: 1 + volumeLevel * 1.5, opacity: 0.1 - volumeLevel * 0.05 }}
              className={`absolute -inset-20 rounded-full ${isRecording ? 'bg-red-500 ring-red-500/20' : 'bg-primary ring-primary/20'} ring-4`}
            />
            <motion.div 
              animate={{ scale: 1 + volumeLevel * 0.8, opacity: 0.2 }}
              className={`absolute -inset-10 rounded-full ${isRecording ? 'bg-red-500/40' : 'bg-primary/40'}`}
            />
            
            <div className={`size-40 rounded-full bg-background border-4 ${isRecording ? 'border-red-500/20' : 'border-primary/20'} flex items-center justify-center shadow-2xl relative z-10 overflow-hidden ${callStatus === 'connecting' || isThinking ? 'animate-pulse' : ''}`}>
               {isRecording ? (
                 <Mic className="text-red-500 size-16" />
               ) : isThinking ? (
                 <Loader2 className="text-primary size-16 animate-spin" />
               ) : isSpeaking ? (
                 <Waves className="text-primary size-16" />
               ) : (
                 <ShieldAlert className="text-muted-foreground size-16 group-hover:scale-110 transition-transform" />
               )}
               
               <div className="absolute bottom-6 flex gap-1 items-end h-8">
                  {[1,2,3,4,5].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: (isSpeaking || isRecording) ? [4, 12, 4] : 4 }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className={`w-1 ${isRecording ? 'bg-red-500/30' : 'bg-primary/30'} rounded-full`}
                    />
                  ))}
               </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight uppercase italic">
              {isThinking ? 'Analyzing Response...' : isRecording ? 'Listening...' : 'Consular Officer'}
            </h2>
            <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">
              {isSpeaking ? 'Officer is speaking...' : isRecording ? 'Tap orb to send response' : 'Tap orb to speak'}
            </p>
          </div>

          <div className="w-full p-6 bg-primary/5 rounded-4xl border border-primary/10 text-center min-h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isThinking ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-muted-foreground font-medium italic">
                    <Loader2 className="animate-spin size-4" /> Processing...
                 </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                   <p className="font-bold text-primary italic text-lg leading-relaxed">
                     "{aiMessage}"
                   </p>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">AI Intelligence Active</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardBody>

        <div className="bg-muted/10 border-t border-border/40 p-8 flex items-center justify-center gap-6">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="size-16 rounded-full border-2 transition-transform hover:scale-105"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="h-16 px-10 rounded-4xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20 gap-3 hover:scale-105 transition-transform"
            onClick={() => endCall("user_interrupted")}
          >
            <PhoneOff size={20} /> End Interview
          </Button>

          <div className="flex flex-col items-center gap-1">
             <div className="size-16 rounded-full border-2 border-border/40 flex items-center justify-center text-muted-foreground overflow-hidden relative">
               <motion.div 
                 animate={{ height: `${volumeLevel * 100}%` }}
                 className="absolute bottom-0 w-full bg-primary/10 transition-all"
               />
               <Volume2 size={24} className="relative z-10" />
             </div>
             <span className="text-[8px] font-black uppercase opacity-40">Output</span>
          </div>
        </div>
      </Card>

      <div className="max-w-xl p-4 flex gap-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
        <AlertCircle className="text-red-500 shrink-0" size={18} />
        <p className="text-xs font-semibold text-red-700/70 leading-relaxed">
          Tap the circular orb once to start recording your answer. Tap it again to send your response. The officer will evaluate your answers automatically.
        </p>
      </div>
    </div>
  );
}
