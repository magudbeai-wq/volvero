'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Shield, MessageCircle, MapPin, Zap, Star, Heart, Eye } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Smart Compatibility Engine',
    description: 'Advanced algorithms analyze 40+ compatibility factors including lifestyle, goals, and personality to find your ideal match.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Shield,
    title: 'Verified Profiles Only',
    description: 'Every profile goes through our verification and identity check process. Blue badge = real person.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
  },
  {
    icon: MessageCircle,
    title: 'Encrypted Real-Time Chat',
    description: 'End-to-end encrypted messaging with voice notes, reactions, GIFs, and video calling built right in.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: MapPin,
    title: 'Global Discovery',
    description: 'Find singles nearby or across the globe with our location-based discovery and Passport mode.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Zap,
    title: 'Smart Icebreakers',
    description: 'Our system generates personalized conversation starters based on your shared interests. Never be awkward again.',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.3)',
  },
  {
    icon: Eye,
    title: 'Incognito Mode',
    description: 'Browse profiles privately. Control who sees your profile with Premium incognito mode.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
  },
  {
    icon: Star,
    title: 'Super Like & Boost',
    description: 'Stand out with Super Likes and Profile Boosts. Get 10x more visibility during peak hours.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.3)',
  },
  {
    icon: Heart,
    title: 'Deep Shared Values',
    description: 'Built with deep respect for diverse cultures and family-centered relationships globally.',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.3)',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={ref} className="py-28 relative">
      <div className="section-container">
        {/* Section Header */}
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
            PLATFORM FEATURES
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 text-white">
            Everything You Need to Find
            <br />
            <span className="gradient-text">Your Perfect Match</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: '#9ca3af' }}>
            Built from the ground up for the global community with enterprise-grade
            technology and breathtaking design.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="group card-hover p-6 cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `rgba(${hexToRgb(feature.color)}, 0.15)`,
                    boxShadow: `0 0 20px ${feature.glow}`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '139, 92, 246';
}
