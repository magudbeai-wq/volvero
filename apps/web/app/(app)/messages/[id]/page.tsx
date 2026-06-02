'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft, Send, Smile, Paperclip, Phone, Video,
  MoreVertical, CheckCheck, Sparkles, Loader2, Mic,
  ShieldAlert, Trash2, Flag
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';
import { useSocket } from '@/lib/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { VideoCallModal } from '@/components/chat/VideoCallModal';

interface Message {
  id: string;
  senderId: string;
  content?: string;
  mediaUrl?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: { fullName: string; profilePhoto?: string };
  replyToId?: string;
  reactions?: string[];
}

interface ConversationData {
  conversation: {
    id: string;
    matchId?: string;
    participants: Array<{
      id: string;
      fullName: string;
      profilePhoto?: string;
      isVerified: boolean;
      isOnline: boolean;
      city?: string;
      email?: string;
    }>;
  };
  messages: Message[];
}

export default function ChatWindow() {
  const { id: conversationId } = useParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [showIcebreakerBtn, setShowIcebreakerBtn] = useState(true);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [safetyStep, setSafetyStep] = useState<'menu' | 'report'>('menu');
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coachSuggestion, setCoachSuggestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { user } = useAppStore();
  const queryClient = useQueryClient();

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Upload audio to server
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.webm');
        
        const toastId = toast.loading('Sending voice message...');
        try {
          const uploadRes = await api.post('/api/upload/audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const audioUrl = uploadRes.data.url;
          
          // Send message
          const newMsg = await api.post(`/api/messages/${conversationId}`, {
            content: '🎵 Voice Message',
            type: 'VOICE',
            mediaUrl: audioUrl
          }).then(r => r.data);
          
          queryClient.setQueryData(['messages', conversationId], (old: ConversationData | undefined) => {
            if (!old) return old;
            return { ...old, messages: [...old.messages, newMsg.message] };
          });
          socketSend(conversationId, newMsg.message.content, 'VOICE');
          toast.success('Sent!', { id: toastId });
        } catch (error) {
          toast.error('Failed to send voice message', { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBlockFromChat = async () => {
    if (!otherUser) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Blocking user...');
    try {
      await api.post('/api/users/block', { blockedId: otherUser.id });
      toast.success(`${otherUser.fullName} has been blocked.`, { id: toastId });
      setShowSafetyMenu(false);
      router.push('/messages');
    } catch {
      toast.error('Failed to block user.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportFromChat = async (reason: string) => {
    if (!otherUser) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Reporting and blocking user...');
    try {
      await api.post('/api/users/report', { reportedId: otherUser.id, reason });
      toast.success('Report submitted. User blocked.', { id: toastId });
      setShowSafetyMenu(false);
      setSafetyStep('menu');
      router.push('/messages');
    } catch {
      toast.error('Failed to report user.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnmatchFromChat = async () => {
    if (!data?.conversation?.matchId) {
      toast.error('Could not find match record to unmatch');
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Unmatching user...');
    try {
      await api.delete(`/api/matches/${data.conversation.matchId}`);
      toast.success('Unmatched successfully.', { id: toastId });
      setShowSafetyMenu(false);
      router.push('/messages');
    } catch {
      toast.error('Failed to unmatch.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  const {
    isConnected, joinConversation, leaveConversation,
    sendMessage: socketSend, sendTyping, stopTyping,
    onMessage, onTyping, onStopTyping
  } = useSocket();

  // Fetch messages
  const { data, isLoading } = useQuery<ConversationData>({
    queryKey: ['messages', conversationId],
    queryFn: () => api.get(`/api/messages/${conversationId}`).then(r => r.data),
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/messages/${conversationId}`, { content, type: 'TEXT' }).then(r => r.data),
    onSuccess: (newMsg) => {
      setMessage('');
      setShowIcebreakerBtn(false);
      queryClient.setQueryData(['messages', conversationId], (old: ConversationData | undefined) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, newMsg.message] };
      });
      // Also send via socket for real-time
      socketSend(conversationId, newMsg.message.content, 'TEXT');
    },
    onError: () => toast.error('Failed to send message'),
  });

  // Smart Icebreaker mutation
  const icebreakerMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      api.post('/api/ai/icebreaker', { targetUserId }).then(r => r.data),
    onSuccess: (data) => {
      if (data.icebreakers?.length > 0) {
        setMessage(data.icebreakers[0]);
        inputRef.current?.focus();
        toast.success('AI icebreaker generated! 🧊');
      }
    },
    onError: () => toast.error('Icebreaker generation failed'),
  });

  // Smart Coach mutation
  const coachMutation = useMutation({
    mutationFn: () => {
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : '';
      return api.post('/api/ai/coach', { message: lastMessage, toneMode: 'flirty' }).then(r => r.data);
    },
    onSuccess: (data) => {
      if (data.suggestion) {
        setMessage(data.suggestion);
        inputRef.current?.focus();
        toast.success('AI Coach suggested a reply! 🧠');
      }
    },
    onError: () => toast.error('Coach suggestion failed'),
  });

  const messages = data?.messages || [];
  const otherUser = data?.conversation?.participants?.find(p => p.id !== user?.id);

  // Socket: join room on mount
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
      return () => leaveConversation(conversationId);
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Socket: listen for new messages
  useEffect(() => {
    const cleanup = onMessage((msg: unknown) => {
      queryClient.setQueryData(['messages', conversationId], (old: ConversationData | undefined) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, msg as Message] };
      });
    });
    return cleanup;
  }, [onMessage, queryClient, conversationId]);

  // Socket: typing indicators
  useEffect(() => {
    const cleanupTyping = onTyping(() => setRemoteTyping(true));
    const cleanupStop = onStopTyping(() => setRemoteTyping(false));
    return () => { cleanupTyping(); cleanupStop(); };
  }, [onTyping, onStopTyping]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, remoteTyping]);

  // Handle typing events
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(conversationId);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId);
    }, 2000);
  };

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* ── Header ────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(10,10,31,0.95)',
          borderBottom: '1px solid rgba(139,92,246,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button onClick={() => router.push('/messages')} className="lg:hidden p-2 rounded-xl" style={{ color: '#9ca3af' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
              {otherUser?.profilePhoto ? (
                <Image src={otherUser.profilePhoto} alt={otherUser.fullName} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {otherUser?.fullName?.charAt(0) || '?'}
                </div>
              )}
            </div>
            {otherUser?.isOnline && <span className="badge-online absolute -bottom-0.5 -right-0.5" style={{ width: '10px', height: '10px' }} />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">{otherUser?.fullName || 'Match'}</div>
            <div className="text-xs" style={{ color: remoteTyping ? '#a78bfa' : otherUser?.isOnline ? '#22c55e' : '#6b7280' }}>
              {remoteTyping ? 'typing...' : otherUser?.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (otherUser?.email?.endsWith('@bot.velora.com')) {
                toast.error(`${otherUser.fullName} is busy and can't accept voice calls. Please send a text message! 💬`, { id: 'bot-voice-call' });
              } else {
                toast(`${otherUser?.fullName || 'User'} is currently offline. Voice calling is coming soon, try Video Call! 📞`, { id: 'voice-call-soon' });
              }
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer" 
            style={{ color: '#9ca3af' }}
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setIsVideoCallOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer" 
            style={{ color: '#9ca3af' }}
          >
            <Video className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => {
              const venue = prompt('Suggest a venue for a date?');
              if (venue && data?.conversation?.matchId) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(20, 0, 0, 0);
                api.post('/api/dates', {
                  matchId: data.conversation.matchId,
                  proposedAt: tomorrow.toISOString(),
                  venueName: venue
                }).then(() => toast.success('Date proposed!'));
              }
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#8b5cf6]/20 transition-colors" 
            style={{ color: '#a78bfa' }}
            title="Suggest a Date"
          >
            🍷
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSafetyMenu(!showSafetyMenu)}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
              style={{ color: '#9ca3af' }}
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
            
            {showSafetyMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl p-2 border shadow-2xl z-30"
                style={{
                  background: 'rgba(15, 15, 35, 0.98)',
                  borderColor: 'rgba(139, 92, 246, 0.25)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <button
                  onClick={() => {
                    setShowSafetyMenu(false);
                    handleUnmatchFromChat();
                  }}
                  disabled={isSubmitting}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Unmatch User
                </button>
                
                <button
                  onClick={() => {
                    setShowSafetyMenu(false);
                    handleBlockFromChat();
                  }}
                  disabled={isSubmitting}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Block User
                </button>
                
                <button
                  onClick={() => {
                    setShowSafetyMenu(false);
                    setSafetyStep('report');
                  }}
                  disabled={isSubmitting}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report & Block
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="text-5xl mb-4">💜</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Start the Conversation</h3>
            <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
              You matched! Say something interesting to break the ice.
            </p>
            {showIcebreakerBtn && otherUser && (
              <button
                onClick={() => icebreakerMutation.mutate(otherUser.id)}
                disabled={icebreakerMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
              >
                {icebreakerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Smart Icebreaker
              </button>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 mt-auto"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                  >
                    {otherUser?.fullName?.charAt(0) || '?'}
                  </div>
                )}

                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-0.5`}>
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed"
                    style={isMe
                      ? { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white', borderRadius: '20px 20px 6px 20px' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#f3f4f6', borderRadius: '20px 20px 20px 6px' }
                    }
                  >
                    {msg.type === 'VOICE' && msg.mediaUrl ? (
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        <audio controls src={msg.mediaUrl} className="h-8 w-48 rounded-lg outline-none" style={{ filter: isMe ? 'invert(1)' : 'none' }} />
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px]" style={{ color: '#4b5563' }}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                    {isMe && (
                      <CheckCheck className="w-3 h-3" style={{ color: msg.isRead ? '#a78bfa' : '#4b5563' }} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {remoteTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pl-9"
            >
              <div className="px-4 py-3 rounded-2xl flex gap-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#a78bfa' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────── */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(10,10,31,0.95)',
          borderTop: '1px solid rgba(139,92,246,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-end gap-2">
          <button className="p-2.5 rounded-xl flex-shrink-0 hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => coachMutation.mutate()} 
            disabled={coachMutation.isPending}
            className="p-2.5 rounded-xl flex-shrink-0 hover:bg-white/5 transition-colors" 
            style={{ color: '#8b5cf6' }}
            title="Get Smart Coach Suggestion"
          >
            {coachMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 rounded-3xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f3f4f6',
                maxHeight: '120px',
              }}
            />
          </div>

          <button className="p-2.5 rounded-xl flex-shrink-0 hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
            <Smile className="w-5 h-5" />
          </button>

          {message.trim() ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatRecordingTime(recordingTime)}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-lg"
                style={{ 
                  background: isRecording ? '#ef4444' : 'rgba(255,255,255,0.05)', 
                  border: isRecording ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: isRecording ? 'white' : '#6b7280' 
                }}
              >
                {isRecording ? <div className="w-4 h-4 rounded-sm bg-white" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Safety Report Modal Overlay */}
      <AnimatePresence>
        {safetyStep === 'report' && otherUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 rounded-none"
            style={{ background: 'rgba(3, 3, 17, 0.95)', backdropFilter: 'blur(15px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm p-6 space-y-6">
              <div className="text-center">
                <h3 className="font-display font-bold text-lg text-white">Report User</h3>
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                  Select a reason for reporting {otherUser.fullName}. They will also be blocked.
                </p>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {[
                  { reason: 'FAKE_PROFILE', label: 'Fake / Scam Profile' },
                  { reason: 'HARASSMENT', label: 'Harassment or Abuse' },
                  { reason: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content / Nudity' },
                  { reason: 'SPAM', label: 'Spam or Advertising' },
                  { reason: 'UNDERAGE', label: 'Underage User' },
                  { reason: 'OTHER', label: 'Other Reason' },
                ].map((item) => (
                  <button
                    key={item.reason}
                    onClick={() => handleReportFromChat(item.reason)}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-left text-xs font-semibold hover:bg-white/5 border transition-all text-gray-300 flex items-center justify-between cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {item.label}
                    <span className="text-gray-500">→</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSafetyStep('menu')}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl text-xs font-medium transition-all text-gray-400 hover:text-white text-center cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoCallModal 
        isOpen={isVideoCallOpen} 
        onClose={() => setIsVideoCallOpen(false)} 
        targetUser={otherUser || null}
      />
    </div>
  );
}
