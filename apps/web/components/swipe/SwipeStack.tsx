'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, RotateCcw, Settings2, Zap, Loader2, X } from 'lucide-react';
import SwipeCard from './SwipeCard';
import MatchCelebration from './MatchCelebration';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface DiscoverProfile {
  id: string;
  fullName: string;
  profilePhoto?: string;
  photos: string[];
  city?: string;
  country?: string;
  bio?: string;
  age?: number;
  career?: string;
  tribe?: string;
  isVerified: boolean;
  interests: string[];
  compatibility?: number;
  distance?: number;
}
export default function SwipeStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchData, setMatchData] = useState<{
    matched: boolean;
    match?: { id: string; compatibility: number };
    profile?: { fullName: string; profilePhoto?: string };
  } | null>(null);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [distance, setDistance] = useState(50);

  const queryClient = useQueryClient();

  // Load current user for filters
  const { data: userData } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (userData?.user) {
      setMinAge(userData.user.minAgePreference || 18);
      setMaxAge(userData.user.maxAgePreference || 60);
      setDistance(userData.user.maxDistance || 50);
    }
  }, [userData]);

  const filterMutation = useMutation({
    mutationFn: (updates: { minAgePreference: number; maxAgePreference: number; maxDistance: number }) =>
      api.patch('/api/users/me', updates).then(r => r.data),
    onSuccess: () => {
      toast.success('Filters applied! 💜');
      setShowFilters(false);
      // Invalidate both discover and me profile query to refresh stack
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      setCurrentIndex(0); // Reset index for new stack!
    },
    onError: () => {
      toast.error('Failed to save filters.');
    },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['discover'],
    queryFn: () => api.get('/api/matches/discover').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetId, direction }: { targetId: string; direction: string }) =>
      api.post('/api/matches/swipe', { targetId, direction }).then(r => r.data),
    onSuccess: (data) => {
      if (data.matched) {
        setMatchData({
          matched: true,
          match: data.match,
          profile: profiles[currentIndex],
        });
      }
    },
    onError: (err: Error & { response?: { data?: { error?: string; code?: string } } }) => {
      const code = err.response?.data?.code;
      if (code === 'LIKE_LIMIT_REACHED') {
        toast.error('Daily like limit reached! Upgrade to Premium for unlimited likes.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });

  const rewindMutation = useMutation({
    mutationFn: () => api.post('/api/matches/rewind').then(r => r.data),
    onSuccess: () => {
      setCurrentIndex(prev => Math.max(0, prev - 1));
      toast.success('Rewound!');
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || 'Rewind failed');
    },
  });

  const profiles: DiscoverProfile[] = data?.profiles || [];
  const hasMore = data?.hasMore;

  const handleSwipe = useCallback(async (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    setCurrentIndex(prev => prev + 1);

    swipeMutation.mutate({ targetId: profile.id, direction });
  }, [currentIndex, profiles, swipeMutation]);

  const handleMatchClose = () => {
    setMatchData(null);
  };

  // Refetch when near the end
  if (!isLoading && currentIndex >= profiles.length - 3 && hasMore) {
    queryClient.invalidateQueries({ queryKey: ['discover'] });
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }}
          />
          <p style={{ color: '#9ca3af' }}>Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">Something went wrong</h3>
          <p className="mb-6" style={{ color: '#9ca3af' }}>Failed to load profiles</p>
          <button onClick={() => refetch()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="font-display font-bold text-2xl text-white mb-3">You've seen everyone!</h3>
          <p className="mb-8 max-w-xs" style={{ color: '#9ca3af' }}>
            Come back tomorrow for fresh matches, or expand your filters to discover more people.
          </p>
          <button onClick={() => { setCurrentIndex(0); refetch(); }} className="btn-primary">
            Refresh Matches
          </button>
        </motion.div>
      </div>
    );
  }

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => rewindMutation.mutate()}
          disabled={rewindMutation.isPending || currentIndex === 0}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          <span className="font-display font-black text-white text-sm">DISCOVER</span>
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative px-4 pb-4">
        <AnimatePresence mode="popLayout">
          {visibleProfiles.map((profile, i) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              isTop={i === 0}
              onSwipe={handleSwipe}
              style={{
                zIndex: visibleProfiles.length - i,
                scale: 1 - i * 0.04,
                y: i * 10,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Match Celebration Modal */}
      <AnimatePresence>
        {matchData?.matched && (
          <MatchCelebration
            profile={matchData.profile}
            match={matchData.match}
            onClose={handleMatchClose}
          />
        )}
      </AnimatePresence>

      {/* Discover Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 rounded-none"
            style={{ background: 'rgba(3, 3, 17, 0.95)', backdropFilter: 'blur(15px)' }}
            onClick={() => setShowFilters(false)}
          >
            <div className="w-full max-w-sm p-6 space-y-6 card" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-white">Discovery Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Age Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold" style={{ color: '#9ca3af' }}>
                    <span>Age Preference</span>
                    <span className="text-[#a78bfa]">{minAge} - {maxAge} years</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={minAge}
                      onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                    />
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                    />
                  </div>
                </div>

                {/* Distance Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold" style={{ color: '#9ca3af' }}>
                    <span>Maximum Distance</span>
                    <span className="text-[#a78bfa]">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  filterMutation.mutate({
                    minAgePreference: minAge,
                    maxAgePreference: maxAge,
                    maxDistance: distance,
                  })
                }
                disabled={filterMutation.isPending}
                className="w-full py-4.5 rounded-2xl text-sm font-semibold text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                }}
              >
                {filterMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
