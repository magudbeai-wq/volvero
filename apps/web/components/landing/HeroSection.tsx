'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const FLOATING_CARDS = [
    { name: 'Amina H.', age: 26, city: 'London', match: 97, emoji: '💜', delay: 0 },
    { name: 'Fadumo A.', age: 24, city: 'Toronto', match: 94, emoji: '⭐', delay: 0.15 },
    { name: 'Hawo M.', age: 28, city: 'Mogadishu', match: 91, emoji: '✨', delay: 0.3 },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030311 0%, #0d1228 50%, #030311 100%)' }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity }}
      >
        <div
          className="w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, #2563eb 50%, transparent 100%)' }}
        />
      </motion.div>

      <motion.div
        className="section-container relative z-10 py-32 text-center"
        style={{ y, opacity }}
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-medium"
          style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa',
          }}
        >
          <Sparkles className="w-4 h-4" />
          AI-Powered Somali Matchmaking Platform
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          <span className="block text-white">Find Your</span>
          <span className="block gradient-text">Perfect Somali</span>
          <span className="block text-white">Match</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl mb-10 leading-relaxed"
          style={{ color: '#9ca3af' }}
        >
          LAMAANE DOORE combines AI-powered compatibility with deep Somali cultural values.
          Meet verified singles who share your faith, traditions, and life goals.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <Link href="/sign-up" className="btn-primary text-base px-8 py-4 text-lg">
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#how-it-works" className="btn-secondary text-base px-8 py-4 text-lg">
            See How It Works
          </Link>
        </motion.div>

        {/* Floating Match Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="relative flex justify-center items-center gap-4 flex-wrap"
        >
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              className="glass rounded-3xl p-5 flex items-center gap-4 shadow-glass"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                delay: card.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                minWidth: '200px',
                background: 'rgba(22,22,48,0.85)',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)' }}
              >
                {card.emoji}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-sm">{card.name}, {card.age}</div>
                <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>{card.city}</div>
                <div
                  className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
                >
                  <Heart className="w-3 h-3" />
                  {card.match}% Match
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm"
          style={{ color: '#6b7280' }}
        >
          {[
            { icon: '🔒', text: 'End-to-End Encrypted' },
            { icon: '✅', text: 'Verified Profiles Only' },
            { icon: '🌍', text: 'Global Somali Community' },
            { icon: '💜', text: 'Culturally Authentic' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: '#4b5563' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
