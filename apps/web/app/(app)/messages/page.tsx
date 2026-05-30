'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.get('/api/matches').then(r => r.data),
  });

  const matches = (data?.matches || []).filter((m: { conversation?: { lastMessage?: string; lastMsgAt?: string } }) => m.conversation);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-white mb-1">Messages</h1>
        <p style={{ color: '#9ca3af' }}>
          {matches.length} active conversation{matches.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
        </div>
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">💬</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No conversations yet</h3>
          <p className="mb-6" style={{ color: '#9ca3af' }}>
            Match with someone and start a conversation!
          </p>
          <Link href="/discover" className="btn-primary">Find Matches</Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {matches.map((match: {
            id: string;
            user: { id: string; fullName: string; profilePhoto?: string; isVerified: boolean; isOnline: boolean; city?: string };
            conversation: { id: string; lastMessage?: string; lastMsgAt?: string };
          }, i: number) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/messages/${match.conversation.id}`}
                className="flex items-center gap-4 p-4 rounded-3xl transition-all hover:scale-[1.01] cursor-pointer"
                style={{
                  background: 'rgba(22,22,48,0.8)',
                  border: '1px solid rgba(139,92,246,0.12)',
                }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                    {match.user.profilePhoto ? (
                      <Image src={match.user.profilePhoto} alt={match.user.fullName} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-white font-bold">
                        {match.user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  {match.user.isOnline && <span className="badge-online absolute -bottom-1 -right-1" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-white text-sm truncate">{match.user.fullName}</span>
                    {match.user.isVerified && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#818cf8' }} />}
                  </div>
                  <p className="text-sm truncate" style={{ color: '#9ca3af' }}>
                    {match.conversation.lastMessage || 'Say hello! 👋'}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-xs mb-2" style={{ color: '#4b5563' }}>
                    {match.conversation.lastMsgAt
                      ? formatDistanceToNow(new Date(match.conversation.lastMsgAt), { addSuffix: true })
                      : ''}
                  </div>
                  <MessageCircle className="w-4 h-4 ml-auto" style={{ color: '#6b7280' }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
