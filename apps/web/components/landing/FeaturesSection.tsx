"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Video, Phone, Coins, Flame, Star, BrainCircuit, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Real-time Messaging',
    description: 'Connect instantly with your matches through seamless, fast, and reliable chat.',
    color: 'from-blue-500 to-indigo-500',
    shadowColor: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Video,
    title: 'Video Calls',
    description: 'See the real person behind the profile with high-quality, secure video calling.',
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'group-hover:shadow-pink-500/20',
  },
  {
    icon: Phone,
    title: 'Voice Calls',
    description: 'Hear their voice and build deeper connections before meeting in person.',
    color: 'from-emerald-400 to-teal-500',
    shadowColor: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: Coins,
    title: 'Coins & Gifts',
    description: 'Show your appreciation by sending virtual gifts and earning rewards.',
    color: 'from-amber-400 to-orange-500',
    shadowColor: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Flame,
    title: 'Profile Boosts',
    description: 'Stand out from the crowd and get seen by up to 10x more potential matches.',
    color: 'from-orange-500 to-red-500',
    shadowColor: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: Star,
    title: 'Premium Membership',
    description: 'Unlock exclusive features, unlimited likes, and advanced filters.',
    color: 'from-purple-500 to-indigo-500',
    shadowColor: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: BrainCircuit,
    title: 'AI Matchmaking',
    description: 'Our smart algorithm learns your preferences to suggest highly compatible profiles.',
    color: 'from-cyan-400 to-blue-500',
    shadowColor: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Verification & Safety',
    description: 'Your safety is our priority with strict profile verification and reporting tools.',
    color: 'from-green-400 to-emerald-600',
    shadowColor: 'group-hover:shadow-green-500/20',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-[#131A2B] relative overflow-hidden border-t border-gray-800/50">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED]/50 to-transparent"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold mb-6"
          >
            <Star className="w-4 h-4" /> Premium Experience
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            Everything you need to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">Connect Meaningfully</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            VOLVERO brings you the most advanced suite of features to ensure your online dating experience is fun, safe, and successful.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className={`group relative p-6 rounded-3xl bg-[#0B1020]/50 backdrop-blur-md border border-gray-800/50 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl ${feature.shadowColor}`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <Icon className="w-7 h-7 text-white relative z-10" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
