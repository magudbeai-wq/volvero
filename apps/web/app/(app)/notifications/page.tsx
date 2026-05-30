'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Heart, MessageCircle, Star, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  MATCH: { icon: Heart, color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  MESSAGE: { icon: MessageCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  LIKE: { icon: Star, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  SUPER_LIKE: { icon: Star, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  PROFILE_VISIT: { icon: Bell, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  SYSTEM: { icon: Shield, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications').then(r => r.data),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/api/notifications/read-all').then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-black text-white mb-0.5">Notifications</h1>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No notifications yet</h3>
          <p style={{ color: '#9ca3af' }}>You'll see likes, matches, and messages here.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: {
            id: string;
            type: string;
            title: string;
            body: string;
            isRead: boolean;
            link?: string;
            imageUrl?: string;
            createdAt: string;
          }, i: number) => {
            const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.SYSTEM;
            const Icon = config.icon;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={notif.link || '#'}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{
                    background: notif.isRead ? 'rgba(22,22,48,0.6)' : 'rgba(139,92,246,0.08)',
                    border: `1px solid ${notif.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(139,92,246,0.2)'}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: config.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-white">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#8b5cf6' }} />
                      )}
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: '#9ca3af' }}>{notif.body}</p>
                    <div className="text-xs mt-1" style={{ color: '#4b5563' }}>
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
