'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Phone, 
  Maximize2, 
  Minimize2,
  Settings,
  Users,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/providers/auth-context';

interface VideoCallProps {
  bookingId: number;
  peerUserId: number;
  peerUserName: string;
  onEndCall: () => void;
  onToggleChat?: () => void;
  showChatButton?: boolean;
}

interface Participant {
  socketId: string;
  userId: number;
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export const VideoCall = ({ 
  bookingId, 
  peerUserId, 
  peerUserName, 
  onEndCall, 
  onToggleChat,
  showChatButton = true 
}: VideoCallProps) => {
  const { user } = useAuth();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err: any) {
      console.error('Failed to get media devices:', err);
      setError(`Camera/Microphone access denied: ${err.message}`);
      return null;
    }
  }, []);

  const initializePeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc_ice_candidate', {
          bookingId,
          targetSocketId: '',
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[VideoCall] Received remote track:', event.streams[0]);
      const [remoteMediaStream] = event.streams;
      setRemoteStream(remoteMediaStream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteMediaStream;
      }
      
      setIsConnected(true);
      setIsConnecting(false);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[VideoCall] ICE Connection State:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setIsConnecting(false);
        setError('Connection lost. Trying to reconnect...');
      }
    };

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    peerConnectionRef.current = pc;
    return pc;
  }, [bookingId]);

  const initializeSocket = useCallback(async () => {
    const { io } = await import('socket.io-client');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const token = localStorage.getItem('token');
    
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[VideoCall] Socket connected:', socket.id);
      socket.emit('join_video_call', { bookingId });
    });

    socket.on('participant_joined', async (data: { fromSocketId: string; fromUserId: number }) => {
      console.log('[VideoCall] Participant joined:', data);
      
      if (!peerConnectionRef.current) return;
      
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socket.emit('webrtc_offer', {
          bookingId,
          targetSocketId: data.fromSocketId,
          offer: peerConnectionRef.current.localDescription
        });
      } catch (err) {
        console.error('[VideoCall] Error creating offer:', err);
      }
    });

    socket.on('webrtc_offer', async (data: { fromSocketId: string; fromUserId: number; offer: RTCSessionDescriptionInit }) => {
      console.log('[VideoCall] Received offer from:', data.fromUserId);
      
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socket.emit('webrtc_answer', {
          bookingId,
          targetSocketId: data.fromSocketId,
          answer: peerConnectionRef.current.localDescription
        });
      } catch (err) {
        console.error('[VideoCall] Error handling offer:', err);
      }
    });

    socket.on('webrtc_answer', async (data: { fromSocketId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('[VideoCall] Received answer');
      
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (err) {
        console.error('[VideoCall] Error handling answer:', err);
      }
    });

    socket.on('webrtc_ice_candidate', async (data: { fromSocketId: string; candidate: RTCIceCandidateInit }) => {
      console.log('[VideoCall] Received ICE candidate');
      
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('[VideoCall] Error adding ICE candidate:', err);
      }
    });

    socket.on('participant_left', (data: { userId: number }) => {
      console.log('[VideoCall] Participant left:', data.userId);
      setRemoteStream(null);
      setIsConnected(false);
    });

    socket.on('video_toggled', (data: { userId: number; enabled: boolean }) => {
      console.log('[VideoCall] Video toggled:', data);
    });

    socket.on('audio_toggled', (data: { userId: number; enabled: boolean }) => {
      console.log('[VideoCall] Audio toggled:', data);
    });

    socketRef.current = socket;
    return socket;
  }, [bookingId]);

  useEffect(() => {
    const setupCall = async () => {
      setIsConnecting(true);
      setError(null);
      
      const stream = await initializeMedia();
      if (!stream) {
        setIsConnecting(false);
        return;
      }
      
      initializePeerConnection(stream);
      await initializeSocket();
    };

    setupCall();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (socketRef.current) {
        socketRef.current.emit('leave_video_call', { bookingId });
        socketRef.current.disconnect();
      }
    };
  }, [initializeMedia, initializePeerConnection, initializeSocket, bookingId]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        socketRef.current?.emit('toggle_audio', {
          bookingId,
          enabled: audioTrack.enabled
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        socketRef.current?.emit('toggle_video', {
          bookingId,
          enabled: videoTrack.enabled
        });
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (socketRef.current) {
      socketRef.current.emit('leave_video_call', { bookingId });
      socketRef.current.disconnect();
    }
    
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      <div className="flex-1 relative bg-black">
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Connecting to {peerUserName}...</p>
            </div>
          </div>
        )}

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          style={{ transform: 'scaleX(-1)' }}
        />

        {!remoteStream && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-white text-lg">Waiting for {peerUserName} to join...</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-24 left-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
              You
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'} animate-pulse`} />
          <span className="text-white text-sm">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            Session with {peerUserName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showChatButton && onToggleChat && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleChat}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="circle"
            size="icon"
            onClick={toggleAudio}
            className={`w-14 h-14 ${isAudioEnabled ? 'bg-muted hover:bg-muted/80' : 'bg-destructive hover:bg-destructive/80'}`}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6 text-destructive-foreground" />}
          </Button>

          <Button
            variant="circle"
            size="icon"
            onClick={toggleVideo}
            className={`w-14 h-14 ${isVideoEnabled ? 'bg-muted hover:bg-muted/80' : 'bg-destructive hover:bg-destructive/80'}`}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6 text-destructive-foreground" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90"
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="absolute top-20 right-4 bg-card border border-border rounded-lg p-4 shadow-xl z-50">
          <h3 className="font-bold mb-2">Settings</h3>
          <p className="text-sm text-muted-foreground">Audio and video settings can be adjusted in your browser settings.</p>
        </div>
      )}
    </div>
  );
};