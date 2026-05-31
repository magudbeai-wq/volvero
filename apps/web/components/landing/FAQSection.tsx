'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'What is VOLVERO?',
    a: 'VOLVERO is an exclusive, smart matchmaking platform designed for individuals seeking serious, long-term relationships worldwide. We combine advanced algorithms with human-centered design to help you find your perfect match.',
  },
  {
    q: 'How does verification work?',
    a: 'You take a quick selfie that our system compares to your profile photos. Verified users get a blue badge and typically receive 3x more matches. The process is completely private and takes under 2 minutes.',
  },
  {
    q: 'Can I use the app anywhere in the world?',
    a: 'Absolutely. VOLVERO has an international user base spanning across North America, Europe, Asia, and the Middle East. Premium users can also use Passport mode to match globally in any city.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from Settings → Billing, or via our customer portal. Your Premium benefits will continue until the end of your current billing period.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. All messages are end-to-end encrypted. We never sell your data, and we strictly comply with GDPR and international privacy standards. You can also control your visibility with our Premium Incognito mode.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-white transition-colors"
        style={{ color: open ? '#f3f4f6' : '#9ca3af' }}
      >
        <div className="font-semibold text-base">{q}</div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="faq" ref={ref} className="py-28 relative" style={{ background: 'rgba(139,92,246,0.03)' }}>
      <div className="section-container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
          >
            FAQ
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 text-white">
            Common Questions
          </h2>
          <p className="text-lg" style={{ color: '#9ca3af' }}>
            Everything you need to know about VOLVERO.
          </p>
        </motion.div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} {...faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
