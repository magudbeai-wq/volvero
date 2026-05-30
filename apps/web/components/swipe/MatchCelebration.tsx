'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, MessageCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchCelebrationProps {
  profile?: { fullName?: string; profilePhoto?: string };
  match?: { id: string; compatibility: number };
  onClose: () => void;
}

export default function MatchCelebration({ profile, match, onClose }: MatchCelebrationProps) {
  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const fire = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7c3aed', '#2563eb', '#fbbf24', '#a78bfa'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7c3aed', '#2563eb', '#fbbf24', '#a78bfa'],
      });

      if (Date.now() < end) requestAnimationFrame(fire);
    };

    fire();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm rounded-4xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0a2e, #0d1b4b)',
          border: '1px solid rgba(139,92,246,0.4)',
          boxShadow: '0 0 80px rgba(139,92,246,0.4)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {/* Hearts animation */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{ duration: 1.5, repeat: 2 }}
            className="text-6xl mb-4"
          >
            💜
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl font-black text-white mb-2"
          >
            It's a Match!
          </motion.h2>

          {match && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-2xl"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <Heart className="w-4 h-4" style={{ color: '#a78bfa' }} />
              <span className="font-bold text-white">{Math.round(match.compatibility * 100)}% Compatible</span>
            </motion.div>
          )}

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg mb-8"
            style={{ color: '#9ca3af' }}
          >
            You and <strong className="text-white">{profile?.fullName}</strong> have liked each other!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            {match && (
              <Link
                href={`/messages`}
                onClick={onClose}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Send a Message
              </Link>
            )}
            <button
              onClick={onClose}
              className="btn-secondary w-full justify-center py-3.5"
            >
              Keep Swiping
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
