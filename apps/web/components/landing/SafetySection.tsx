'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, UserCheck, Lock, MessageSquare, AlertOctagon } from 'lucide-react';

const FEATURES = [
  {
    title: 'Verified Profiles',
    description: 'Every profile goes through a rigorous identity check. No bots, no fake accounts.',
    icon: UserCheck,
  },
  {
    title: 'Privacy Controls',
    description: 'You decide who sees your photos and information. Total control over your visibility.',
    icon: Lock,
  },
  {
    title: 'Secure Messaging',
    description: 'End-to-end encrypted chats keep your conversations private and secure.',
    icon: MessageSquare,
  },
  {
    title: 'Report & Block Tools',
    description: 'Zero tolerance for harassment. Quick tools to report and block unwanted behavior.',
    icon: AlertOctagon,
  },
];

export default function SafetySection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="safety" ref={ref} className="py-28 relative overflow-hidden bg-[#0B1020]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Shield Motif */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Glowing Badge */}
              <motion.div
                animate={{ 
                  boxShadow: ['0px 0px 40px rgba(124, 58, 237, 0.4)', '0px 0px 80px rgba(236, 72, 153, 0.4)', '0px 0px 40px rgba(124, 58, 237, 0.4)']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center bg-[#131A2B] border border-[#7C3AED]/30 relative z-10"
              >
                <ShieldCheck className="w-32 h-32 text-[#7C3AED] drop-shadow-[0_0_15px_rgba(124,58,237,0.8)]" />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] opacity-30 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#EC4899] opacity-20 blur-2xl" />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
                style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#EC4899' }}
              >
                TRUST & SECURITY
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 text-white leading-tight">
                Your Safety is Our <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">
                  Highest Priority
                </span>
              </h2>
              <p className="text-lg text-gray-400">
                We believe finding love should be a safe and joyful experience. That's why we've built industry-leading security features into every aspect of VOLVERO.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="p-6 rounded-2xl bg-[#131A2B] border border-white/5 hover:border-[#7C3AED]/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0B1020] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#EC4899]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
