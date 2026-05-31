'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up with email or phone. Build your rich dating profile with photos, voice intro, and personality details.',
    icon: '✨',
    color: '#8b5cf6',
  },
  {
    step: '02',
    title: 'Get Verified',
    description: 'Complete our quick selfie verification to get your blue badge. Verified profiles get 3x more matches.',
    icon: '✅',
    color: '#22c55e',
  },
  {
    step: '03',
    title: 'Discover Matches',
    description: 'Our smart engine curates your daily stack of compatible singles. Swipe, like, and super-like.',
    icon: '💜',
    color: '#3b82f6',
  },
  {
    step: '04',
    title: 'Connect & Chat',
    description: 'When you match, start the conversation with smart icebreakers. Chat, voice call, video call — all encrypted.',
    icon: '💬',
    color: '#f59e0b',
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" ref={ref} className="py-28 relative" style={{ background: 'rgba(139,92,246,0.03)' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
          >
            HOW IT WORKS
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 text-white">
            Your Journey to Love
            <br />
            <span className="gradient-text">Starts in 4 Steps</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #2563eb, transparent)' }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Icon circle */}
              <div className="relative inline-flex mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative z-10"
                  style={{
                    background: `rgba(${i === 0 ? '139,92,246' : i === 1 ? '34,197,94' : i === 2 ? '59,130,246' : '245,158,11'}, 0.15)`,
                    border: `2px solid ${step.color}40`,
                    boxShadow: `0 0 40px ${step.color}30`,
                  }}
                >
                  {step.icon}
                </div>
                {/* Step number */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
              </div>

              <h3 className="font-display font-bold text-lg mb-2 text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
