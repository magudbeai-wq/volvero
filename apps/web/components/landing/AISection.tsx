'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp } from 'lucide-react';

export default function AISection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const AI_FEATURES = [
    { icon: Brain, title: 'Compatibility Scoring', desc: 'Analyzes 40+ data points across religion, lifestyle, interests, and personality to generate your match score.' },
    { icon: Target, title: 'Smart Recommendations', desc: 'Daily curated stacks of profiles ranked by compatibility. Better matches over time as the AI learns your preferences.' },
    { icon: Zap, title: 'AI Icebreakers', desc: 'Personalized conversation starters generated from shared interests. Never run out of things to say.' },
    { icon: TrendingUp, title: 'Profile Optimization', desc: 'Get AI suggestions to improve your profile completion, photo quality, and bio to attract better matches.' },
  ];

  return (
    <section id="ai" ref={ref} className="py-28 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent)' }}
      />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
            >
              <Brain className="w-3.5 h-3.5" />
              AI-POWERED MATCHING
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 text-white leading-tight">
              Smarter Matches
              <br />
              <span className="gradient-text">Powered by AI</span>
            </h2>

            <p className="text-lg mb-10" style={{ color: '#9ca3af', lineHeight: '1.8' }}>
              Our proprietary compatibility engine was built specifically for the Somali Muslim community.
              It understands the nuances of Somali culture, Islamic values, and what makes a truly
              compatible match — not just shared hobbies.
            </p>

            <div className="space-y-6">
              {AI_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
                    >
                      <Icon className="w-5 h-5 text-brand-400" style={{ color: '#a78bfa' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div
              className="rounded-4xl p-8"
              style={{
                background: 'rgba(22,22,48,0.8)',
                border: '1px solid rgba(139,92,246,0.25)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <h4 className="font-display font-bold text-lg text-white mb-6 text-center">
                Compatibility Analysis
              </h4>

              {[
                { label: 'Religious Values', value: 98, color: '#8b5cf6' },
                { label: 'Life Goals', value: 94, color: '#3b82f6' },
                { label: 'Personality Match', value: 87, color: '#22c55e' },
                { label: 'Interest Overlap', value: 82, color: '#f59e0b' },
                { label: 'Geographic Proximity', value: 76, color: '#ec4899' },
              ].map((item, i) => (
                <div key={item.label} className="mb-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: '#9ca3af' }}>{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${item.value}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${item.color}80, ${item.color})` }}
                    />
                  </div>
                </div>
              ))}

              <div
                className="mt-6 rounded-2xl p-4 text-center"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <div className="font-display text-5xl font-black gradient-text">94%</div>
                <div className="text-sm font-medium mt-1 text-white">Overall Compatibility Score</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>درجة التوافق الإجمالية</div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-glass"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'rgba(22,22,48,0.9)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-xs font-semibold text-white">AI Match</div>
              <div className="text-xs" style={{ color: '#a78bfa' }}>Updated daily</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
