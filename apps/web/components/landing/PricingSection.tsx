'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Star, Zap, Crown, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');

const PLANS = [
  {
    id: 'coins',
    name: 'Coins',
    badge: 'Pay as you go',
    icon: Coins,
    price: 'From $4.99',
    period: '',
    description: 'Perfect for occasional interactions',
    features: [
      'Voice Calls',
      'Virtual Gifts',
      'Profile Boosts',
    ],
    cta: 'Buy Coins',
    ctaHref: '/buy-coins',
    popular: false,
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.15)',
    borderStyle: 'border-[#7C3AED]/20 hover:border-[#7C3AED]/40',
    bgStyle: 'bg-[#131A2B]/80',
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Subscription',
    icon: Zap,
    price: '$9.99',
    period: '/month',
    description: 'The ultimate matching experience',
    features: [
      'Unlimited Likes',
      'See who liked you',
      'Read receipts'
    ],
    popular: true,
    cta: 'Start Premium',
    ctaHref: '/premium',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.25)',
    borderStyle: 'border-[#EC4899]/40 hover:border-[#EC4899]/60',
    bgStyle: 'bg-gradient-to-b from-[#131A2B] to-[#1a1025]',
  },
  {
    id: 'vip',
    name: 'VIP',
    badge: 'Ultimate',
    icon: Crown,
    price: '$19.99',
    period: '/month',
    description: 'Maximum features & ultimate status',
    features: [
      'All Premium features',
      '5 Free Boosts/month',
      'Priority matching',
      'Exclusive VIP badge'
    ],
    popular: false,
    cta: 'Go VIP',
    ctaHref: '/vip',
    color: '#FBBF24',
    glowColor: 'rgba(251,191,36,0.25)',
    borderStyle: 'border-[#FBBF24]/50 hover:border-[#FBBF24]/70',
    bgStyle: 'bg-gradient-to-br from-[#131A2B] via-[#EC4899]/10 to-[#FBBF24]/10',
  },
];

export default function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const router = useRouter();

  const handleCheckout = async (planId: string) => {
    // 1. Block unregistered / unauthenticated users and redirect them to sign-in
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in or sign up to buy pricing plans!');
      router.push('/sign-in');
      return;
    }

    try {
      if (planId === 'coins') {
        // Redirect to profile wallet or buy-coins directly
        router.push('/messages'); // Ideally opens the wallet, but let's go to app
        toast.success('Open your Wallet inside the app to buy coins!');
        return;
      }

      const toastId = toast.loading('Initiating secure checkout...');
      const res = await api.post('/api/payments/create-subscription-checkout', { planId });
      const { sessionId, url } = res.data;
      
      if (url) {
        toast.dismiss(toastId);
        window.location.href = url;
        return;
      }
      
      const stripe = await stripePromise;
      if (stripe && sessionId) {
        toast.dismiss(toastId);
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error("Stripe failed to load");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.dismiss();
        toast.error('Please sign in to subscribe!');
        router.push('/sign-in');
      } else {
        toast.dismiss();
        const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Checkout failed. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  return (
    <section id="pricing" ref={ref} className="py-28 relative overflow-hidden bg-[#0B1020]">
      {/* Abstract Background Blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#EC4899]/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FBBF24]/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED]"
          >
            <Star className="w-3.5 h-3.5" />
            UNLOCK MORE
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">Journey</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Whether you want to pay as you go or unlock everything, we have the perfect plan to boost your matches.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`relative rounded-3xl p-8 backdrop-blur-xl border ${plan.borderStyle} ${plan.bgStyle} transition-all duration-500 hover:-translate-y-2 flex flex-col`}
                style={{
                  boxShadow: `0 10px 40px ${plan.glowColor}`,
                }}
              >
                {/* VIP specific gradient overlay */}
                {plan.id === 'vip' && (
                  <div className="absolute inset-0 rounded-3xl opacity-20 bg-gradient-to-br from-[#FBBF24] to-[#EC4899] pointer-events-none" />
                )}

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 bg-gradient-to-r from-[#EC4899] to-[#7C3AED] shadow-lg shadow-[#EC4899]/30">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    MOST POPULAR
                  </div>
                )}
                
                {plan.id === 'vip' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1.5 bg-gradient-to-r from-[#FBBF24] to-[#fde68a] shadow-lg shadow-[#FBBF24]/40">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    ULTIMATE
                  </div>
                )}

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-2xl text-white mb-1">{plan.name}</h3>
                      <p className="text-[#a1a1aa] text-sm font-medium">{plan.badge}</p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10"
                      style={{ color: plan.color, boxShadow: `0 0 20px ${plan.glowColor}` }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-400 font-medium">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm mt-3 text-gray-400">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${plan.color}20` }}
                        >
                          <Check className="w-3 h-3" style={{ color: plan.color }} />
                        </div>
                        <span className="text-gray-200 text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan.id)}
                    className="group relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all overflow-hidden mt-auto"
                    style={
                      plan.id === 'vip'
                        ? { background: 'linear-gradient(to right, #FBBF24, #EC4899)', color: '#fff' }
                        : plan.id === 'premium'
                        ? { background: '#EC4899', color: '#fff' }
                        : { background: 'rgba(124,58,237,0.1)', color: '#fff', border: '1px solid rgba(124,58,237,0.5)' }
                    }
                  >
                    {/* Hover effect layer */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">{plan.cta}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16 text-sm text-gray-500 font-medium"
        >
          Payments are securely processed. Cancel subscriptions anytime.
        </motion.p>
      </div>
    </section>
  );
}
