'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, Crown, Sparkles, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium',
    period: 'monthly',
    price: 19.99,
    annualSavings: null,
    popular: true,
    color: '#8b5cf6',
    features: ['Unlimited likes', 'See who liked you', 'Rewind swipes', '1 Boost/month', 'Advanced filters', 'AI icebreakers', 'Incognito mode'],
  },
  {
    id: 'premium_annual',
    name: 'Premium Annual',
    period: 'annually',
    price: 149.99,
    monthlyEquivalent: 12.50,
    annualSavings: '37%',
    popular: false,
    color: '#3b82f6',
    features: ['All Premium features', 'Passport mode', '5 Boosts/month', 'Priority support'],
  },
  {
    id: 'gold',
    name: 'Gold',
    period: 'monthly',
    price: 34.99,
    annualSavings: null,
    popular: false,
    color: '#fbbf24',
    features: ['All Premium features', 'Passport mode', '5 Boosts/month', 'VIP badge', 'Profile analytics', 'Priority support 24/7'],
  },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/api/subscriptions/plans').then(r => r.data),
  });

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const priceId = plansData?.plans?.find((p: { id: string; priceId?: string }) => p.id === planId)?.priceId;
      if (!priceId) {
        toast.error('Plan not configured yet. Please add your Stripe price IDs.');
        setLoading(null);
        return;
      }
      const { data } = await api.post('/api/subscriptions/checkout', { priceId });
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/discover" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#9ca3af' }}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
          <Crown className="w-4 h-4" />
          UPGRADE YOUR EXPERIENCE
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
          Find Love
          <span className="gradient-text"> Faster</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: '#9ca3af' }}>
          Premium members get 10x more matches and find their partner 3x faster.
        </p>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-4xl p-7 flex flex-col`}
            style={{
              background: plan.popular
                ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))'
                : 'rgba(22,22,48,0.8)',
              border: `1px solid ${plan.popular ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
              outline: plan.popular ? '2px solid #7c3aed' : 'none',
              outlineOffset: '-1px',
              boxShadow: plan.popular ? '0 0 40px rgba(139,92,246,0.2)' : 'none',
            }}
          >
            {plan.popular && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                ⭐ MOST POPULAR
              </div>
            )}
            {plan.annualSavings && (
              <div className="absolute -top-3.5 right-4 px-3 py-1 rounded-full text-xs font-bold text-black"
                style={{ background: '#fbbf24' }}>
                Save {plan.annualSavings}
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-display font-black text-xl text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-white">${plan.price}</span>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  /{plan.period === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              {plan.monthlyEquivalent && (
                <div className="text-sm mt-0.5" style={{ color: '#a78bfa' }}>
                  ${plan.monthlyEquivalent}/month
                </div>
              )}
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${plan.color}20` }}
                  >
                    <Check className="w-3 h-3" style={{ color: plan.color }} />
                  </div>
                  <span style={{ color: '#d1d5db' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading === plan.id}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={plan.id === 'gold'
                ? { background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: 'black' }
                : plan.popular
                ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }
                : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }
              }
            >
              {loading === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {plan.id === 'gold' ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  Get {plan.name}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust */}
      <p className="text-center text-sm" style={{ color: '#4b5563' }}>
        🔒 Secure payment via Stripe · Cancel anytime · 7-day money-back guarantee
      </p>
    </div>
  );
}
