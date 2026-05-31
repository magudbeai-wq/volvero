'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; fullName: string; profilePhoto?: string } | null;
  isIncoming?: boolean;
}

export function VideoCallModal({ isOpen, onClose, targetUser, isIncoming = false }: VideoCallModalProps) {
  const [callState, setCallState] = useState<'CONNECTING' | 'RINGING' | 'CONNECTED'>('CONNECTING');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('CONNECTING');
      // Simulate getting media
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setCallState('RINGING');
          
          // Simulate answer after 3 seconds
          if (!isIncoming) {
            setTimeout(() => {
              setCallState('CONNECTED');
              toast.success(`${targetUser?.fullName} joined the call!`);
            }, 3000);
          }
        })
        .catch(() => {
          toast.error('Camera/Microphone access denied');
          onClose();
        });
    } else {
      // Cleanup
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    }
  }, [isOpen, isIncoming, targetUser, onClose]);

  const handleEndCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    toast('Call ended', { icon: '📞' });
    onClose();
  };

  if (!isOpen || !targetUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
        <div className="relative w-full max-w-4xl h-[100dvh] sm:h-[85vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Main Video Area */}
          <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
            {callState === 'CONNECTED' ? (
              // Remote Video (Simulated placeholder for now)
              <div className="absolute inset-0">
                <Image 
                  src={targetUser.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'} 
                  alt={targetUser.fullName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 z-10">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#8b5cf6]/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                  <Image 
                    src={targetUser.profilePhoto || '/default-avatar.png'} 
                    alt={targetUser.fullName}
                    fill
                    className="object-cover"
                  />
                  {callState === 'RINGING' && (
                    <motion.div 
                      className="absolute inset-0 border-4 border-[#8b5cf6] rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold text-white">{targetUser.fullName}</h2>
                  <p className="text-[#a78bfa] mt-2 flex items-center justify-center gap-2">
                    {callState === 'CONNECTING' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {callState === 'CONNECTING' ? 'Connecting...' : 'Ringing...'}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video Picture-in-Picture */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-6 right-6 w-32 h-48 sm:w-48 sm:h-72 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-20"
            >
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror local video
              />
            </motion.div>
          </div>

          {/* Controls Bar */}
          <div className="h-24 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-6 pb-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-all hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
