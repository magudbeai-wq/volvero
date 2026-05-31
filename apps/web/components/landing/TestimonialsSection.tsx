'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: 'Emma & John',
    location: 'Toronto, Canada',
    married: true,
    quote: 'We matched in the first week! The smart matching engine really understood what we were looking for. Married after 6 months of knowing each other. VOLVERO changed our lives.',
    match: 98,
    time: '6 months ago',
  },
  {
    name: 'Sarah & Michael',
    location: 'London, UK',
    married: false,
    quote: 'I struggled to find someone who truly shares my values. VOLVERO found me a match from my city who I would have never met otherwise.',
    match: 95,
    time: '3 months ago',
  },
  {
    name: 'Amina & Yusuf',
    location: 'Minneapolis, USA',
    married: true,
    quote: 'The verification system gave me so much confidence. Every profile I interacted with was real. We\'re now engaged and planning our wedding!',
    match: 92,
    time: '1 year ago',
  },
  {
    name: 'Nadia & Omar',
    location: 'Dubai, UAE',
    married: false,
    quote: 'The smart icebreakers were genius. I was nervous to start conversations but the suggestions felt so natural. We\'ve been together for 4 months now.',
    match: 89,
    time: '4 months ago',
  },
];

export default function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="stories" ref={ref} className="py-28 relative overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
          >
            SUCCESS STORIES
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 text-white">
            Real Love Stories
            <br />
            <span className="gradient-text">From Our Community</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="card p-8 relative"
            >
              {/* Quote mark */}
              <div
                className="absolute top-6 right-8 text-6xl font-black opacity-10"
                style={{ color: '#8b5cf6', lineHeight: 1 }}
              >
                "
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm" style={{ color: '#9ca3af' }}>{t.location}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
                    >
                      💜 {t.match}% Match
                    </span>
                    {t.married && (
                      <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold"
                        style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                        💍 Married
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <blockquote className="text-base mb-3 leading-relaxed" style={{ color: '#d1d5db' }}>
                "{t.quote}"
              </blockquote>

              <div className="mt-4 text-xs" style={{ color: '#6b7280' }}>
                {t.time}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
