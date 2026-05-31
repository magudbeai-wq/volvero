"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, MessageCircleHeart, Globe } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Upload photos and tell your story',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Sparkles,
    title: 'Discover Matches',
    description: 'AI-powered recommendations',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageCircleHeart,
    title: 'Connect',
    description: 'Chat, voice call, and video call',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Build Relationships',
    description: 'Meet people worldwide',
    color: 'from-rose-500 to-orange-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-[#0B1020] relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[128px] -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#EC4899]/10 rounded-full blur-[128px] translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">VOLVERO</span> Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Your journey to finding meaningful connections is just a few steps away. Experience the future of dating.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Connecting lines for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#7C3AED]/20 to-transparent z-0" />
                )}
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-full" />
                    <div className={`w-24 h-24 rounded-2xl bg-[#131A2B] border border-gray-800 flex items-center justify-center shadow-xl group-hover:border-[#7C3AED]/50 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2`}>
                      <div className={`absolute inset-0 bg-gradient-to-tr ${step.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                      <Icon className="w-10 h-10 text-white relative z-10" />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-[#0B1020]">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#EC4899] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
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
