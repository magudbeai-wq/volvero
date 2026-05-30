'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, Heart, CheckCircle,
  ShieldAlert, Loader2, MessageCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface PublicProfile {
  id: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  city?: string;
  country?: string;
  tribe?: string;
  religion?: string;
  maritalStatus?: string;
  educationLevel?: string;
  career?: string;
  height?: number;
  relationshipGoal?: string;
  languages: string[];
  interests: string[];
  personalityTraits: string[];
  lifestylePrefs: string[];
  profilePhoto?: string;
  photos: string[];
  isVerified: boolean;
  isOnline: boolean;
  lastSeenAt?: string;
  subscriptionTier: string;
  compatibility?: number;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyStep, setSafetyStep] = useState<'menu' | 'report'>('menu');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery<{ user: PublicProfile }>({
    queryKey: ['profile', id],
    queryFn: () => api.get(`/api/users/${id}`).then(r => r.data),
    retry: false,
  });

  const profile = data?.user;

  // Swipe / Action mutations
  const swipeMutation = useMutation({
    mutationFn: (direction: 'LEFT' | 'RIGHT' | 'SUPER') =>
      api.post('/api/matches/swipe', { targetId: id, direction }).then(r => r.data),
    onSuccess: (res) => {
      if (res.matched) {
        toast.success("It's a Match! 💜 Check your matches tab.");
      } else {
        toast.success(res.swipe.direction === 'LEFT' ? 'Passed.' : 'Liked! 💜');
      }
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      router.back();
    },
    onError: () => toast.error('Failed to register action.'),
  });

  const handleBlockUser = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Blocking user...');
    try {
      await api.post('/api/users/block', { blockedId: id });
      toast.success('User has been blocked.', { id: toastId });
      setShowSafetyModal(false);
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      router.push('/discover');
    } catch {
      toast.error('Failed to block user.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportUser = async (reason: string) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Reporting and blocking user...');
    try {
      await api.post('/api/users/report', { reportedId: id, reason });
      toast.success('Report submitted. User blocked.', { id: toastId });
      setShowSafetyModal(false);
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      router.push('/discover');
    } catch {
      toast.error('Failed to report user.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="font-display font-black text-xl text-white mb-2">Profile Not Found</h2>
        <p className="text-sm mb-6 max-w-xs" style={{ color: '#9ca3af' }}>
          This profile might be suspended, blocked, or in incognito mode.
        </p>
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const allPhotos = profile.photos.length > 0 ? profile.photos : [profile.profilePhoto || ''];
  const hasPhotos = allPhotos.filter(Boolean).length > 0;

  const nextPhoto = () => setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length);
  const prevPhoto = () => setActivePhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto relative flex flex-col">
      {/* ── Photo Gallery (Header) ───────────────────────── */}
      <div className="relative h-[480px] w-full flex-shrink-0">
        {hasPhotos ? (
          <Image
            src={allPhotos[activePhotoIdx]!}
            alt={profile.fullName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: 'linear-gradient(135deg, #1a0a2e, #0d1b4b)' }}
          >
            💜
          </div>
        )}

        {/* Top Controls Overlay */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg text-white"
            style={{ background: 'rgba(3,3,17,0.4)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              setShowSafetyModal(true);
              setSafetyStep('menu');
            }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg text-red-500"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', backdropFilter: 'blur(10px)' }}
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Navigation Indicators */}
        {allPhotos.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-2 flex items-center z-10">
              <button
                onClick={prevPhoto}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center z-10">
              <button
                onClick={nextPhoto}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
              {allPhotos.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: activePhotoIdx === i ? '16px' : '6px',
                    background: activePhotoIdx === i ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Compatibility badge */}
        {profile.compatibility !== undefined && (
          <div className="absolute bottom-4 right-4 z-10">
            <div
              className="rounded-2xl px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold text-white shadow-lg"
              style={{ background: 'rgba(139,92,246,0.95)', backdropFilter: 'blur(10px)' }}
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{profile.compatibility}% Match</span>
            </div>
          </div>
        )}

        {/* Gradient shadow at bottom of image */}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(0deg, var(--bg-primary) 0%, transparent 100%)' }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="px-4 sm:px-6 space-y-6 flex-1 -mt-8 relative z-10">
        {/* Basic Header Info card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-white">
                  {profile.fullName}{age ? `, ${age}` : ''}
                </h1>
                {profile.isVerified && (
                  <CheckCircle className="w-5 h-5" style={{ color: '#818cf8' }} />
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: '#a78bfa' }}>
                {profile.relationshipGoal?.replace('_', ' ')}
              </p>
            </div>
            
            {profile.isOnline && (
              <span className="badge-online shrink-0" style={{ width: '12px', height: '12px' }} />
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium mt-4 pt-4 border-t border-white/5" style={{ color: '#9ca3af' }}>
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}, {profile.country}
              </span>
            )}
            {profile.career && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.career}
              </span>
            )}
            {profile.height && (
              <span className="flex items-center gap-1">
                📏 {profile.height} cm
              </span>
            )}
          </div>
        </motion.div>

        {/* Bio Card */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-sm text-white mb-2">About Me</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{profile.bio}</p>
          </motion.div>
        )}

        {/* Cultural Identity Card */}
        {(profile.tribe || profile.religion || profile.maritalStatus || profile.educationLevel) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-sm text-white mb-3">Background</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {profile.tribe && (
                <div>
                  <div style={{ color: '#6b7280' }}>Tribe / Clan</div>
                  <div className="font-semibold text-white mt-0.5">{profile.tribe}</div>
                </div>
              )}
              {profile.religion && (
                <div>
                  <div style={{ color: '#6b7280' }}>Religion</div>
                  <div className="font-semibold text-white mt-0.5">{profile.religion}</div>
                </div>
              )}
              {profile.maritalStatus && (
                <div>
                  <div style={{ color: '#6b7280' }}>Marital Status</div>
                  <div className="font-semibold text-white mt-0.5">{profile.maritalStatus.replace('_', ' ')}</div>
                </div>
              )}
              {profile.educationLevel && (
                <div>
                  <div style={{ color: '#6b7280' }}>Education</div>
                  <div className="font-semibold text-white mt-0.5">{profile.educationLevel}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Interests & Preferences */}
        {profile.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-sm text-white mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-2xl text-xs font-semibold"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Personality Traits */}
        {profile.personalityTraits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-sm text-white mb-3">Personality Traits</h3>
            <div className="flex flex-wrap gap-2">
              {profile.personalityTraits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1.5 rounded-2xl text-xs font-semibold text-gray-300"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lifestyle Choices */}
        {profile.lifestylePrefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-sm text-white mb-3">Lifestyle</h3>
            <div className="flex flex-wrap gap-2">
              {profile.lifestylePrefs.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1.5 rounded-2xl text-xs font-semibold text-gray-300"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {pref}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Swipe / Connect Buttons at Bottom ─────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 p-4 border-t z-20 max-w-2xl mx-auto flex items-center justify-center gap-4"
        style={{
          background: 'rgba(10,10,31,0.95)',
          borderColor: 'rgba(139,92,246,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => swipeMutation.mutate('LEFT')}
          disabled={swipeMutation.isPending}
          className="flex-1 py-4.5 rounded-2xl font-semibold text-sm transition-all border shrink-0 text-center hover:bg-white/5 active:scale-95 cursor-pointer"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#9ca3af',
          }}
        >
          Pass
        </button>

        <button
          onClick={() => swipeMutation.mutate('RIGHT')}
          disabled={swipeMutation.isPending}
          className="flex-[2] py-4.5 rounded-2xl font-semibold text-sm transition-all text-center hover:opacity-90 active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer text-white"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
          }}
        >
          {swipeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 fill-white" />}
          Connect & Like
        </button>
      </div>

      {/* Safety Overlay Modal */}
      <AnimatePresence>
        {showSafetyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3, 3, 17, 0.95)', backdropFilter: 'blur(15px)' }}
            onClick={() => setShowSafetyModal(false)}
          >
            <div className="w-full max-w-sm p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
              {safetyStep === 'menu' ? (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Safety Options</h3>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                      How would you like to proceed with {profile.fullName}?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleBlockUser}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border cursor-pointer hover:bg-red-500/20"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Block {profile.fullName}
                    </button>

                    <button
                      onClick={() => setSafetyStep('report')}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all text-white border cursor-pointer hover:bg-white/10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      Report & Block
                    </button>

                    <button
                      onClick={() => setShowSafetyModal(false)}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all text-gray-400 text-center cursor-pointer hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <h3 className="font-display font-bold text-lg text-white">Report User</h3>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                      Select a reason for reporting {profile.fullName}. They will also be blocked.
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
                        onClick={() => handleReportUser(item.reason)}
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
