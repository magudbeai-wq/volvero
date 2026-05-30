'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is LAMAANE DOORE only for Somalis?',
    qSo: 'Ma LAMAANE DOORE Soomaalida kaliya baa loogu talagalay?',
    a: 'LAMAANE DOORE was built specifically for the global Somali community, but anyone who appreciates Somali culture and values is welcome to join.',
  },
  {
    q: 'Is the app halal and Islamically appropriate?',
    qSo: 'Ma app-ku halal ma yahay?',
    a: 'Yes. LAMAANE DOORE is designed with Islamic values at its core. We focus on marriage-oriented relationships, require verification, and have strict content moderation.',
  },
  {
    q: 'How does verification work?',
    qSo: 'Sidee xaqiijintu u shaqaysaa?',
    a: 'You take a selfie that our AI compares to your profile photos. Verified users get a blue badge and 3x more matches. The process takes under 2 minutes.',
  },
  {
    q: 'Can I use the app outside Somalia?',
    qSo: 'Ma isticmaali karaa app-ka Soomaaliya ka baxsan?',
    a: 'Absolutely. LAMAANE DOORE has users in 40+ countries including the UK, US, Canada, UAE, Kenya, and Ethiopia. Premium users can use Passport mode to match globally.',
  },
  {
    q: 'How do I cancel my subscription?',
    qSo: 'Sideen joojin karaa xiriirkaygii?',
    a: 'You can cancel anytime from Settings → Billing, or via our Stripe customer portal. Your benefits continue until the end of your billing period.',
  },
  {
    q: 'Is my data private and secure?',
    qSo: 'Ma macluumaadkaygii sir ma yahay?',
    a: 'All messages are end-to-end encrypted. We never sell your data. You control your visibility with our incognito mode. GDPR and privacy-first by design.',
  },
];

function FAQItem({ q, qSo, a, index }: { q: string; qSo: string; a: string; index: number }) {
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
        <div>
          <div className="font-semibold text-base">{q}</div>
          <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{qSo}</div>
        </div>
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
            Everything you need to know about LAMAANE DOORE.
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
