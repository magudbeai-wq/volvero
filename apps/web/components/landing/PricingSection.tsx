'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Get started and explore the platform',
    features: [
      '50 likes per day',
      'Basic profile',
      'View matches',
      'Limited messaging',
      'Basic filters',
    ],
    notIncluded: ['See who liked you', 'Rewind swipes', 'Smart icebreakers', 'Incognito mode'],
    cta: 'Get Started Free',
    ctaHref: '/sign-up',
    popular: false,
    color: '#6b7280',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 19.99,
    annualPrice: 12.49,
    description: 'The ultimate matching experience',
    features: [
      'Unlimited likes',
      'See who liked you',
      'Rewind last swipe',
      '1 Boost per month',
      'Advanced filters',
      'Smart icebreakers',
      'Smart bio generator',
      'Incognito mode',
      'Read receipts',
      'Priority ranking',
      'Verified badge priority',
    ],
    popular: true,
    cta: 'Start Premium',
    ctaHref: '/premium',
    color: '#8b5cf6',
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY,
  },
  {
    id: 'gold',
    name: 'Gold',
    monthlyPrice: 34.99,
    annualPrice: 24.99,
    description: 'VIP experience with maximum features',
    features: [
      'Everything in Premium',
      'Passport mode (any city)',
      '5 Boosts per month',
      'Priority support 24/7',
      'Early access to features',
      'VIP badge',
      'Unlimited rewinds',
      'Profile analytics',
      'Match insights',
    ],
    popular: false,
    cta: 'Go Gold',
    ctaHref: '/premium?plan=gold',
    color: '#fbbf24',
  },
];

export default function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" ref={ref} className="py-28 relative">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
          >
            PRICING
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 text-white">
            Simple, Transparent
            <br />
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#9ca3af' }}>
            Start free. Upgrade when you're ready.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${!isAnnual ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
              style={!isAnnual ? { background: '#7c3aed' } : {}}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              style={isAnnual ? { background: '#7c3aed' } : {}}
            >
              Annual
              <span className="text-xs rounded-full px-2 py-0.5" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                Save 37%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative rounded-4xl p-8 ${plan.popular ? 'scale-105' : ''}`}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.2))'
                  : 'rgba(22,22,48,0.8)',
                border: `1px solid ${plan.popular ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(20px)',
                boxShadow: plan.popular ? '0 0 60px rgba(139,92,246,0.2)' : 'none',
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  <Zap className="w-3 h-3" />
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-black text-white">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span style={{ color: '#6b7280' }}>/month</span>
                  )}
                </div>
                {isAnnual && plan.monthlyPrice > 0 && (
                  <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                    Billed annually (${(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/year)
                  </div>
                )}
                <p className="text-sm mt-3" style={{ color: '#9ca3af' }}>{plan.description}</p>
              </div>

              <Link
                href={plan.ctaHref}
                className={`w-full mb-8 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all`}
                style={plan.popular
                  ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' }
                  : plan.id === 'gold'
                  ? { background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: 'black' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }
                }
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${plan.color}25` }}
                    >
                      <Check className="w-3 h-3" style={{ color: plan.color }} />
                    </div>
                    <span style={{ color: '#d1d5db' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12 text-sm"
          style={{ color: '#6b7280' }}
        >
          🔒 7-day money-back guarantee · Cancel anytime · Secure payment via Stripe
        </motion.p>
      </div>
    </section>
  );
}
