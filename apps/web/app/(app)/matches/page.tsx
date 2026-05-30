'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';

export default function MatchesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.get('/api/matches').then(r => r.data),
  });

  const matches = data?.matches || [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-white mb-1">Your Matches</h1>
        <p style={{ color: '#9ca3af' }}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} waiting
        </p>
      </div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">💜</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No matches yet</h3>
          <p className="mb-6" style={{ color: '#9ca3af' }}>
            Start swiping to find your perfect Somali match!
          </p>
          <Link href="/discover" className="btn-primary">
            Start Discovering
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: {
            id: string;
            user: {
              id: string;
              fullName: string;
              profilePhoto?: string;
              city?: string;
              isVerified: boolean;
              isOnline: boolean;
            };
            compatibility: number;
            conversation?: { id: string; lastMessage?: string; lastMsgAt?: string };
            createdAt: string;
          }, i: number) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={match.conversation ? `/messages/${match.conversation.id}` : '#'}
                className="flex items-center gap-4 p-4 rounded-3xl transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(22,22,48,0.8)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-700 to-blue-700">
                    {match.user.profilePhoto ? (
                      <Image
                        src={match.user.profilePhoto}
                        alt={match.user.fullName}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {match.user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  {match.user.isOnline && (
                    <span className="badge-online absolute -bottom-1 -right-1" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-white truncate">{match.user.fullName}</span>
                    {match.user.isVerified && (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#818cf8' }} />
                    )}
                  </div>
                  {match.user.city && (
                    <div className="text-xs mb-1" style={{ color: '#6b7280' }}>
                      {match.user.city}
                    </div>
                  )}
                  {match.conversation?.lastMessage ? (
                    <p className="text-sm truncate" style={{ color: '#9ca3af' }}>
                      {match.conversation.lastMessage}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: '#a78bfa' }}>
                      Send the first message! 💜
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
                  >
                    <Heart className="w-3 h-3" />
                    {Math.round((match.compatibility || 0.8) * 100)}%
                  </div>
                  <div className="text-xs" style={{ color: '#4b5563' }}>
                    {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                  </div>
                  <MessageCircle className="w-4 h-4" style={{ color: '#6b7280' }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
