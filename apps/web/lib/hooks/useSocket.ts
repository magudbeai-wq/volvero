'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAppStore } from '@/lib/store/appStore';

let socket: Socket | null = null;

export function useSocket() {
  const { user } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!user?.id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    socket = io(apiUrl, {
      auth: { userId: user.id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      reconnectAttempts.current++;
      console.warn('[Socket] Connection error:', err.message, `(attempt ${reconnectAttempts.current})`);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user?.id]);

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join_conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit('leave_conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, type: string = 'TEXT') => {
    socket?.emit('send_message', { conversationId, content, type });
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    socket?.emit('typing', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socket?.emit('stop_typing', { conversationId });
  }, []);

  const onMessage = useCallback((handler: (msg: unknown) => void) => {
    socket?.on('new_message', handler);
    return () => { socket?.off('new_message', handler); };
  }, []);

  const onTyping = useCallback((handler: (data: { userId: string }) => void) => {
    socket?.on('user_typing', handler);
    return () => { socket?.off('user_typing', handler); };
  }, []);

  const onStopTyping = useCallback((handler: (data: { userId: string }) => void) => {
    socket?.on('user_stop_typing', handler);
    return () => { socket?.off('user_stop_typing', handler); };
  }, []);

  const onNewMatch = useCallback((handler: (data: unknown) => void) => {
    socket?.on('new_match', handler);
    return () => { socket?.off('new_match', handler); };
  }, []);

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    stopTyping,
    onMessage,
    onTyping,
    onStopTyping,
    onNewMatch,
  };
}
