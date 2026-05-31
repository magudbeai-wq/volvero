'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Sparkles, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] pt-32 pb-20 overflow-hidden flex items-center bg-[#0B1020]">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-900/20 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#EC4899]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/15 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 h-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center h-full">
          
          {/* Left Column: Typography & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ opacity }}
            className="flex flex-col items-start pt-10"
          >
            {/* Top Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md mb-8"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-semibold text-violet-200">Connect Beyond Borders</span>
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse ml-2" />
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-black text-5xl sm:text-6xl xl:text-7xl leading-[1.1] mb-6 tracking-tight">
              <span className="text-white block mb-2">Find Meaningful</span>
              <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#EC4899] to-[#FBBF24]">
                Connections
              </span>
              <span className="text-white block">Anywhere in the World</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Meet verified people, chat instantly, make video calls, and build real relationships across borders on VOLVERO.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/sign-up" className="relative group overflow-hidden rounded-2xl p-[1px] w-full sm:w-auto">
                <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] rounded-2xl opacity-100 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="relative bg-[#0B1020]/20 backdrop-blur-sm px-8 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-transparent">
                  <span className="font-bold text-white text-lg">Start Matching</span>
                  <Heart className="w-5 h-5 ml-2 text-white group-hover:scale-110 transition-transform" />
                </div>
              </Link>
              <Link href="/sign-up" className="px-8 py-4 rounded-2xl flex items-center justify-center border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all">
                Create Free Account
              </Link>
            </div>
            
            {/* Small trust indicator */}
            <p className="mt-6 text-sm text-gray-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" /> Free to join. No credit card required.
            </p>
          </motion.div>

          {/* Right Column: Visuals & Floating Elements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[600px] w-full hidden lg:block"
          >
            {/* Main Center Image */}
            <motion.div 
              style={{ y: y1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[450px] rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.3)] z-10 border border-white/10"
            >
              <Image 
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80" 
                alt="Happy couple" 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-transparent opacity-80" />
            </motion.div>

            {/* Glowing 3D Heart */}
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 right-10 z-20 w-24 h-24 bg-gradient-to-br from-[#EC4899] to-[#7C3AED] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.5)] border border-white/20 backdrop-blur-xl"
            >
              <Heart className="w-12 h-12 text-white fill-white" />
            </motion.div>

            {/* Floating Card 1: Sophia */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              style={{ y: y2 }}
              className="absolute top-20 left-4 z-20 w-64 p-4 rounded-2xl bg-[#131A2B]/80 backdrop-blur-xl border border-[#7C3AED]/30 shadow-2xl transform -rotate-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#EC4899]">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" alt="Sophia" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Sophia, 24</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Paris, FR</p>
                </div>
                <div className="ml-auto bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                  97%
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: James */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              style={{ y: y1 }}
              className="absolute bottom-20 right-4 z-20 w-64 p-4 rounded-2xl bg-[#131A2B]/80 backdrop-blur-xl border border-[#EC4899]/30 shadow-2xl transform rotate-3"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#7C3AED]">
                  <Image src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" alt="James" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">James, 28</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> London, UK</p>
                </div>
                <div className="ml-auto bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                  94%
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Matches Notification */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-10 left-10 z-20 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] shadow-[0_10px_30px_rgba(236,72,153,0.3)] transform -rotate-2"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm">You have a new match!</span>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
