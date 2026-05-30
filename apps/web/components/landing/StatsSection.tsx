'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 50000, suffix: '+', label: 'Registered Singles', labelAr: 'عضو مسجل', emoji: '👥' },
  { value: 12000, suffix: '+', label: 'Matches Made', labelAr: 'تطابق ناجح', emoji: '💜' },
  { value: 850, suffix: '+', label: 'Marriages & Engagements', labelAr: 'زواج وخطوبة', emoji: '💍' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', labelAr: 'معدل الرضا', emoji: '⭐' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const step = value / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-20 overflow-hidden"
      style={{ background: 'rgba(139,92,246,0.05)', borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}
    >
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-3">{stat.emoji}</div>
              <div
                className="font-display text-4xl sm:text-5xl font-black mb-2 gradient-text"
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                {stat.label}
              </div>
              <div className="text-xs mt-1" style={{ color: '#6b7280' }} dir="rtl">
                {stat.labelAr}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
