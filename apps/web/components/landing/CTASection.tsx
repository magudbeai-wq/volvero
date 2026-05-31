'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-4xl p-12 sm:p-20 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.3) 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          </div>

          <div className="relative z-10">
            <div className="text-5xl mb-6">💜</div>
            <h2 className="font-display text-4xl sm:text-6xl font-black mb-6 text-white leading-tight">
              Your Story Starts Here
              <br />
              <span className="gradient-text">On VOLVERO</span>
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Join millions finding meaningful connections worldwide on VOLVERO. Start free today — no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="btn-primary text-lg px-10 py-4">
                Find Your Match Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#pricing" className="btn-secondary text-lg px-10 py-4">
                View Pricing
              </Link>
            </div>

            <p className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Free forever · No credit card · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
