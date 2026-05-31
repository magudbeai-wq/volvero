'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Emma & Lucas',
    quote: 'We met across the world! The smart matching engine completely understood our dynamic. After months of daily video calls, we finally met in person and it was magical.',
    rating: 5,
    location: 'New York & Paris',
  },
  {
    name: 'Sarah & John',
    quote: 'The video calls made it feel real from day one. I loved how secure and intuitive the platform felt. We are now engaged!',
    rating: 5,
    location: 'London, UK',
  },
  {
    name: 'Mia & David',
    quote: 'VOLVERO connected us when we thought it was impossible. The deep personality insights helped us build a foundation before we even spoke.',
    rating: 5,
    location: 'Sydney, Australia',
  },
];

export default function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="stories" ref={ref} className="py-28 relative overflow-hidden bg-[#0B1020]">
      {/* Background Ambient */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#EC4899] opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#7C3AED] opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#7C3AED' }}
          >
            SUCCESS STORIES
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-white">
            Real Couples, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">
              Real Connections
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group h-full"
            >
              {/* Animated Glowing Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED] to-[#EC4899] rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative h-full bg-[#131A2B] rounded-3xl p-8 border border-white/10 flex flex-col">
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, index) => (
                    <Star key={index} className="w-5 h-5 fill-[#EC4899] text-[#EC4899]" />
                  ))}
                </div>
                
                <blockquote className="flex-1 text-lg leading-relaxed text-gray-300 mb-8 font-medium">
                  "{t.quote}"
                </blockquote>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{t.name}</div>
                    <div className="text-sm text-[#7C3AED] font-medium">{t.location}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
