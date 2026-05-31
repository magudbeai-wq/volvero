'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Star, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scaleHeart = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  // Generate stable random particles to prevent hydration mismatches
  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      color: ['#7C3AED', '#EC4899', '#FBBF24'][Math.floor(Math.random() * 3)]
    }));
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0B1020' }}
    >
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.png" 
          alt="VOLVERO Premium Matchmaking" 
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/90 via-[#0B1020]/60 to-[#0B1020]" />
      </div>

      {/* Radial glows */}
      <motion.div className="absolute inset-0 pointer-events-none z-0" style={{ opacity }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-[100px]" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #9333EA 0%, transparent 70%)' }} />
      </motion.div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              opacity: 0.6
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      <motion.div
        className="section-container relative z-10 py-32 text-center w-full max-w-7xl mx-auto"
        style={{ y, opacity }}
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-medium backdrop-blur-md relative overflow-hidden"
          style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(236,72,153,0.3)',
            color: '#EC4899',
          }}
        >
          <Sparkles className="w-4 h-4 text-pink-400" />
          Connect Beyond Borders
          <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse ml-1" style={{ backgroundColor: '#FBBF24' }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          style={{ letterSpacing: '-0.03em' }}
        >
          <span className="block text-white drop-shadow-2xl">Find Meaningful</span>
          <span className="block drop-shadow-2xl pb-2" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connections</span>
          <span className="block text-white drop-shadow-2xl">Anywhere in the World</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="max-w-3xl mx-auto text-lg sm:text-2xl mb-12 leading-relaxed drop-shadow-md font-medium"
          style={{ color: '#e5e7eb' }}
        >
          Join millions of people discovering relationships, friendships, and real connections on VOLVERO.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 relative z-30"
        >
          <Link href="/sign-up" 
            className="flex items-center gap-2 rounded-2xl px-10 py-5 font-bold text-white text-lg transition-all hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, #7C3AED, #9333EA, #EC4899)', 
              boxShadow: '0 10px 40px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' 
            }}
          >
            Start Matching
            <ArrowRight className="w-6 h-6" />
          </Link>
          <Link href="#features" 
            className="flex items-center gap-2 rounded-2xl px-10 py-5 font-bold text-white text-lg backdrop-blur-md transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Explore Profiles
          </Link>
        </motion.div>

        {/* Floating Profile Cards */}
        <div className="absolute inset-0 pointer-events-none z-20 hidden sm:block">
          {/* Card 1 */}
          <motion.div
            className="absolute top-[15%] left-[5%] lg:left-[10%] w-64 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl p-4"
            style={{ 
              background: 'rgba(19,26,43,0.8)', 
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.2)',
              rotate: -8
            }}
            animate={{ y: [0, -15, 0], rotate: [-8, -6, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#7C3AED]">
                <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" alt="Sophia" fill className="object-cover" sizes="56px" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Sophia, 24</h3>
                <p className="text-[#94A3B8] text-sm flex items-center gap-1"><Heart className="w-3 h-3 text-[#EC4899] fill-[#EC4899]" /> 97% Match · Paris</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            className="absolute top-[20%] right-[5%] lg:right-[10%] w-64 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl p-4"
            style={{ 
              background: 'rgba(19,26,43,0.8)', 
              border: '1px solid rgba(236,72,153,0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(236,72,153,0.2)',
              rotate: 6
            }}
            animate={{ y: [0, -20, 0], rotate: [6, 8, 6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#EC4899]">
                <Image src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" alt="James" fill className="object-cover" sizes="56px" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">James, 28</h3>
                <p className="text-[#94A3B8] text-sm flex items-center gap-1"><Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" /> 94% Match · London</p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            className="absolute bottom-[25%] left-[8%] lg:left-[15%] w-64 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl p-4"
            style={{ 
              background: 'rgba(19,26,43,0.8)', 
              border: '1px solid rgba(251,191,36,0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.15)',
              rotate: 5
            }}
            animate={{ y: [0, 15, 0], rotate: [5, 3, 5] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FBBF24]">
                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" alt="Aria" fill className="object-cover" sizes="56px" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Aria, 26</h3>
                <p className="text-[#94A3B8] text-sm flex items-center gap-1"><Heart className="w-3 h-3 text-[#EC4899] fill-[#EC4899]" /> 92% Match · Tokyo</p>
              </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            className="absolute bottom-[30%] right-[8%] lg:right-[15%] w-64 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl p-4"
            style={{ 
              background: 'rgba(19,26,43,0.8)', 
              border: '1px solid rgba(147,51,234,0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(147,51,234,0.2)',
              rotate: -6
            }}
            animate={{ y: [0, 12, 0], rotate: [-6, -4, -6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#9333EA]">
                <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Marco" fill className="object-cover" sizes="56px" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Marco, 30</h3>
                <p className="text-[#94A3B8] text-sm flex items-center gap-1"><Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" /> 89% Match · Milan</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Massive 3D Glowing Heart Centerpiece Background (subtle behind content) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"
          style={{ scale: scaleHeart }}
        >
          <div className="relative w-64 h-64 sm:w-96 sm:h-96" style={{ perspective: '1000px' }}>
            <motion.div 
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, 5, -5, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-full h-full fill-current text-white/5 drop-shadow-[0_0_100px_rgba(124,58,237,0.3)]" strokeWidth={0.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-sm font-semibold relative z-30"
          style={{ color: '#d1d5db' }}
        >
          {[
            { icon: <Shield className="w-4 h-4 text-[#7C3AED]" />, text: 'End-to-End Encrypted' },
            { icon: <Star className="w-4 h-4 text-[#FBBF24]" />, text: 'Verified Profiles' },
            { icon: <Globe className="w-4 h-4 text-[#EC4899]" />, text: '190+ Countries' },
            { icon: <Sparkles className="w-4 h-4 text-[#9333EA]" />, text: '4.9/5 Rating' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 drop-shadow-md bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-14 border-2 border-white/20 rounded-full flex justify-center p-2 backdrop-blur-sm">
          <motion.div 
            className="w-2 h-2 bg-white/60 rounded-full"
            animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
