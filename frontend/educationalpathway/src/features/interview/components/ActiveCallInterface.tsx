
"use client";

import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  AlertCircle,
  Loader2,
  Waves,
  ShieldAlert,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { toast } from "react-hot-toast";

type CallEndEvent = {
  interviewId: string;
  reason: "completed" | "connect_error" | "runtime_error" | "user_interrupted" | "time_limit";
  callStarted: boolean;
};

interface ActiveCallInterfaceProps {
  assistantConfig: Record<string, any> | string;
  interviewId: string;
  country: string;
  onCallEnd: (event: CallEndEvent) => void;
}

export function ActiveCallInterface({ assistantConfig, interviewId, country, onCallEnd }: ActiveCallInterfaceProps) {
  const targetDurationSeconds = 5 * 60;
  const [callStatus, setCallStatus] = useState<"connecting" | "active" | "ended">("connecting");
  const[isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const hasCallStartedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const callEndReasonRef = useRef<CallEndEvent["reason"]>("completed");
  const onCallEndRef = useRef(onCallEnd);
  const sessionTokenRef = useRef(0);
  const handledErrorTokenRef = useRef<number | null>(null);

  const getReadableErrorMessage = (error: unknown) => {
    const rawMessage =
      error && typeof error === "object"
        ? ((error as { error?: { message?: string }; message?: string }).error?.message ||
          (error as { message?: string }).message)
        : undefined;

    const fallback = "Could not start interview session. Please retry.";
    if (!rawMessage) return fallback;

    const normalized = rawMessage.toLowerCase();
    if (normalized.includes("permission") || normalized.includes("microphone") || normalized.includes("notallowederror")) {
      return "Microphone access was blocked. Enable mic permission in your browser and retry.";
    }
    if (normalized.includes("network") || normalized.includes("websocket") || normalized.includes("timeout")) {
      return "Network issue while connecting to interview server. Check internet and retry.";
    }
    if (normalized.includes("assistant") || normalized.includes("invalid") || normalized.includes("not found")) {
      return "Interview configuration is invalid. Start a new interview session.";
    }

    return rawMessage;
  };

  useEffect(() => {
    onCallEndRef.current = onCallEnd;
  },[onCallEnd]);

  useEffect(() => {
    const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const hasValidStartPayload =
      (typeof assistantConfig === "string" && assistantConfig.trim().length > 0) ||
      (typeof assistantConfig === "object" && assistantConfig !== null && Object.keys(assistantConfig).length > 0);
    
    // Validating we received the inline config from your backend
    if (!hasValidStartPayload || !interviewId) {
      toast.error("Interview session data is missing. Please restart the interview.");
      setCallStatus("ended");
      onCallEnd({
        interviewId,
        reason: "connect_error",
        callStarted: false,
      });
      return;
    }

    if (!vapiPublicKey) {
      toast.error("Vapi public key is missing. Check NEXT_PUBLIC_VAPI_PUBLIC_KEY.");
      setCallStatus("ended");
      return;
    }

    hasEndedRef.current = false;
    hasCallStartedRef.current = false;
    callEndReasonRef.current = "completed";
    const sessionToken = ++sessionTokenRef.current;
    handledErrorTokenRef.current = null;

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      if (sessionToken !== sessionTokenRef.current) return;
      if (hasEndedRef.current) return;
      hasCallStartedRef.current = true;
      setCallStatus("active");
      toast.success("Consular Officer is now online.");

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    };

    const onCallEndEvent = () => {
      if (sessionToken !== sessionTokenRef.current) return;
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;
      setCallStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
      onCallEndRef.current({
        interviewId,
        reason: callEndReasonRef.current,
        callStarted: hasCallStartedRef.current,
      });
    };

    const onVolumeLevel = (level: number) => {
      if (sessionToken !== sessionTokenRef.current) return;
      if (!hasEndedRef.current) setVolumeLevel(level);
    };

    const onError = (error: unknown) => {
      if (sessionToken !== sessionTokenRef.current) return;
      if (hasEndedRef.current) return;
      if (handledErrorTokenRef.current === sessionToken) return;
      handledErrorTokenRef.current = sessionToken;

      toast.error(getReadableErrorMessage(error));
      
      hasEndedRef.current = true;
      setCallStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
      onCallEndRef.current({
        interviewId,
        reason: hasCallStartedRef.current ? "runtime_error" : "connect_error",
        callStarted: hasCallStartedRef.current,
      });
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEndEvent);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("error", onError);

    // Supports both web call token/url (string) and inline assistant config (object)
    vapi.start(assistantConfig).catch((err: unknown) => {
      onError(err);
    });

    return () => {
      hasEndedRef.current = true;
      try {
        (vapi as any).off?.("call-start", onCallStart);
        (vapi as any).off?.("call-end", onCallEndEvent);
        (vapi as any).off?.("volume-level", onVolumeLevel);
        (vapi as any).off?.("error", onError);
      } catch {}
      if (hasCallStartedRef.current) vapi.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      vapiRef.current = null;
      handledErrorTokenRef.current = null;
    };
  }, [assistantConfig, interviewId]);

  useEffect(() => {
    if (
      !hasEndedRef.current &&
      hasCallStartedRef.current &&
      callStatus === "active" &&
      elapsedTime >= targetDurationSeconds
    ) {
      callEndReasonRef.current = "time_limit";
      toast("Interview reached 5-minute limit and has been ended.");
      vapiRef.current?.stop();
      hasEndedRef.current = true;
      setCallStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
      onCallEndRef.current({
        interviewId,
        reason: "time_limit",
        callStarted: true,
      });
    }
  }, [elapsedTime, callStatus, interviewId]);

  const endCall = () => {
    callEndReasonRef.current = "user_interrupted";
    vapiRef.current?.stop();
    if (!hasEndedRef.current) {
      hasEndedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      onCallEndRef.current({
        interviewId,
        reason: "user_interrupted",
        callStarted: hasCallStartedRef.current,
      });
    }
    setCallStatus("ended");
  };

  const toggleMute = () => {
    vapiRef.current?.setMuted(!isMuted);
    setIsMuted(!isMuted);
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <CardBody className="p-12 sm:p-20 flex flex-col items-center gap-12 relative z-10">
          <div className="relative">
            <motion.div 
              animate={{ scale: 1 + volumeLevel * 1.5, opacity: 0.1 - volumeLevel * 0.05 }}
              className="absolute -inset-20 rounded-full bg-primary ring-4 ring-primary/20"
            />
            <motion.div 
              animate={{ scale: 1 + volumeLevel * 0.8, opacity: 0.2 }}
              className="absolute -inset-10 rounded-full bg-primary/40"
            />
            
            <div className={`size-40 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden ${callStatus === 'connecting' ? 'animate-pulse' : ''}`}>
               {callStatus === 'active' ? (
                 <Waves className="text-primary size-16" />
               ) : (
                 <ShieldAlert className="text-muted-foreground size-16" />
               )}
               
               <div className="absolute bottom-6 flex gap-1 items-end h-8">
                  {[1,2,3,4,5].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: callStatus === 'active' ?[4, 12, 4] : 4 }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-primary/30 rounded-full"
                    />
                  ))}
               </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight uppercase italic">
              {callStatus === 'connecting' ? 'Establishing Line...' : 'Consular Officer'}
            </h2>
            <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">
              {callStatus === 'active' ? 'Speak clearly into your microphone' : 'Waiting for connection...'}
            </p>
          </div>

          <div className="w-full p-6 bg-primary/5 rounded-[2rem] border border-primary/10 text-center min-h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {callStatus === 'connecting' ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-muted-foreground font-medium italic">
                    <Loader2 className="animate-spin size-4" /> Finalizing encrypted connection to embassy server...
                 </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                   <p className="font-bold text-primary italic text-lg leading-relaxed">
                     "What is the purpose of your trip, and why this program?"
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
            onClick={toggleMute}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 gap-3 hover:scale-105 transition-transform"
            onClick={endCall}
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
          The officer will be blunt and may interrupt you. This simulation is designed to be difficult to prepare you for actual visa questioning.
        </p>
      </div>
    </div>
  );
}