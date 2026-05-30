'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
  AnimatePresence,
} from 'framer-motion';
import Image from 'next/image';
import { Heart, X, Star, MapPin, Briefcase, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  city?: string;
  career?: string;
  bio?: string;
  profilePhoto?: string;
  photos: string[];
  isVerified: boolean;
  compatibility?: number;
  distance?: number;
  interests: string[];
  religion?: string;
  tribe?: string;
}

interface SwipeCardProps {
  profile: Profile;
  isTop: boolean;
  onSwipe: (direction: 'LEFT' | 'RIGHT' | 'SUPER') => void;
  style?: React.CSSProperties;
}

export default function SwipeCard({ profile, isTop, onSwipe, style }: SwipeCardProps) {
  const router = useRouter();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyStep, setSafetyStep] = useState<'menu' | 'report'>('menu');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlockUser = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Blocking user...');
    try {
      await api.post('/api/users/block', { blockedId: profile.id });
      toast.success(`${profile.fullName} has been blocked.`, { id: toastId });
      setShowSafetyModal(false);
      // Trigger card swipe left to animate away
      await handleButtonSwipe('LEFT');
    } catch {
      toast.error('Failed to block user. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportUser = async (reason: string) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Reporting and blocking user...');
    try {
      await api.post('/api/users/report', { reportedId: profile.id, reason });
      toast.success(`Report submitted. ${profile.fullName} has been blocked.`, { id: toastId });
      setShowSafetyModal(false);
      // Trigger card swipe left to animate away
      await handleButtonSwipe('LEFT');
    } catch {
      toast.error('Failed to report user. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity = useTransform(y, [-100, -40], [1, 0]);
  const cardOpacity = useTransform(x, [-300, 0, 300], [0.5, 1, 0.5]);

  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;

    const { offset, velocity } = info;

    if (Math.abs(velocity.y) > velocityThreshold && velocity.y < 0) {
      // Super like (swipe up fast)
      await controls.start({ y: -1000, opacity: 0, transition: { duration: 0.4 } });
      onSwipe('SUPER');
      return;
    }

    if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      await controls.start({ x: 1000, rotate: 30, opacity: 0, transition: { duration: 0.4 } });
      onSwipe('RIGHT');
    } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      await controls.start({ x: -1000, rotate: -30, opacity: 0, transition: { duration: 0.4 } });
      onSwipe('LEFT');
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    }
  };

  const handleButtonSwipe = async (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
    if (direction === 'RIGHT') {
      await controls.start({ x: 1000, rotate: 30, opacity: 0, transition: { duration: 0.4 } });
    } else if (direction === 'LEFT') {
      await controls.start({ x: -1000, rotate: -30, opacity: 0, transition: { duration: 0.4 } });
    } else {
      await controls.start({ y: -1000, opacity: 0, transition: { duration: 0.4 } });
    }
    onSwipe(direction);
  };

  const photoUrl = profile.profilePhoto || profile.photos[0];

  return (
    <motion.div
      className="swipe-card absolute inset-0"
      style={{ x, y, rotate, opacity: cardOpacity, ...style }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{ scale: 1.02 }}
      whileHover={isTop ? { scale: 1.01 } : {}}
    >
      {/* Card image */}
      <div className="absolute inset-0 rounded-4xl overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={profile.fullName}
            fill
            className="object-cover"
            priority={isTop}
            sizes="(max-width: 640px) 100vw, 480px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: 'linear-gradient(135deg, #1a0a2e, #0d1b4b)' }}
          >
            💜
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)' }}
        />
      </div>

      {/* Like/Nope/Super indicators */}
      <motion.div className="swipe-like-indicator" style={{ opacity: likeOpacity }}>
        LIKE
      </motion.div>
      <motion.div className="swipe-nope-indicator" style={{ opacity: nopeOpacity }}>
        NOPE
      </motion.div>
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-black text-yellow-400 border-4 border-yellow-400 rounded-xl px-5 py-1"
        style={{ opacity: superOpacity, textShadow: '0 2px 8px rgba(251,191,36,0.5)' }}
      >
        ⭐ SUPER
      </motion.div>

      {/* Compatibility badge */}
      <div className="absolute top-4 right-4">
        <div
          className="rounded-2xl px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold"
          style={{ background: 'rgba(139,92,246,0.9)', backdropFilter: 'blur(10px)' }}
        >
          <Heart className="w-3.5 h-3.5 text-white fill-white" />
          <span className="text-white">{profile.compatibility ?? 0}%</span>
        </div>
      </div>

      {/* Profile info (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${profile.id}`);
              }}
              className="flex items-center gap-2 mb-1 cursor-pointer group/name hover:opacity-85 transition-opacity"
              title="Click to view full profile"
            >
              <h2 className="text-white font-display font-black text-2xl truncate group-hover/name:text-[#a78bfa] transition-colors">
                {profile.fullName}{age ? `, ${age}` : ''}
              </h2>
              {profile.isVerified && (
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
              )}
            </div>

            {(profile.city || profile.career) && (
              <div className="flex flex-wrap gap-3 text-sm mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.city}
                    {profile.distance && ` · ${Math.round(profile.distance)}km`}
                  </span>
                )}
                {profile.career && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {profile.career}
                  </span>
                )}
              </div>
            )}

            {profile.bio && (
              <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {profile.bio}
              </p>
            )}

            {profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 4).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs rounded-full px-2.5 py-1 font-medium"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white' }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {isTop && (
          <div className="flex justify-center gap-4 mt-6">
            <motion.button
              onClick={() => handleButtonSwipe('LEFT')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid rgba(239,68,68,0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <X className="w-6 h-6" style={{ color: '#ef4444' }} />
            </motion.button>

            <motion.button
              onClick={() => handleButtonSwipe('SUPER')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: 'rgba(251,191,36,0.15)',
                border: '2px solid rgba(251,191,36,0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />
            </motion.button>

            <motion.button
              onClick={() => handleButtonSwipe('RIGHT')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid rgba(34,197,94,0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Heart className="w-6 h-6 fill-current" style={{ color: '#22c55e' }} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Safety Action Button (Top Left) */}
      {isTop && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSafetyModal(true);
              setSafetyStep('menu');
            }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              backdropFilter: 'blur(10px)',
            }}
            title="Safety Options"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Safety Modal Overlay */}
      <AnimatePresence>
        {showSafetyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 rounded-4xl"
            style={{ background: 'rgba(3, 3, 17, 0.95)', backdropFilter: 'blur(15px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm p-6 space-y-6">
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

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
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
    </motion.div>
  );
}
