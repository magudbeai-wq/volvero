'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, Shield, X, CreditCard, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/users/me').then((res) => res.data),
  });

  const packages = [
    { id: 'coins_100', amount: 100, price: 0.99, popular: false, icon: '🥉' },
    { id: 'coins_500', amount: 500, price: 4.99, popular: true, icon: '🥈' },
    { id: 'coins_1000', amount: 1000, price: 9.99, popular: false, icon: '🥇' },
    { id: 'coins_5000', amount: 5000, price: 39.99, popular: false, icon: '💎', label: 'Best Value' },
  ];

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    const toastId = toast.loading('Initiating purchase...');
    try {
      const res = await api.post('/api/payments/create-coin-checkout', { packageId });
      const { sessionId } = res.data;
      
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      toast.error('Failed to initiate checkout. Please try again.', { id: toastId });
      setIsProcessing(false);
    }
  };

  const activateBoost = async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Activating Profile Boost...');
    try {
      await api.post('/api/boosts/activate');
      toast.success('Boost Activated! Your profile is now pushed to the top.', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    } catch (error: any) {
      if (error.response?.status === 402) {
        toast.error('Not enough coins! Purchase some coins first.', { id: toastId });
      } else {
        toast.error('Failed to activate boost.', { id: toastId });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(19, 26, 43, 0.95)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-violet-600/20 to-pink-600/20" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative p-6">
            <div className="flex flex-col items-center text-center mt-4 mb-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 0 40px rgba(251, 191, 36, 0.3)' }}>
                <Coins className="w-10 h-10 text-yellow-900" />
              </div>
              <h2 className="text-2xl font-bold text-white font-display">Your Wallet</h2>
              <p className="text-gray-400 mt-1">Current Balance: <span className="font-bold text-yellow-400">{user?.coinBalance || 0} Coins</span></p>
            </div>

            {/* Profile Boost Upsell */}
            <div className="mb-8 p-4 rounded-2xl relative overflow-hidden group border border-pink-500/30" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(124, 58, 237, 0.1))' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-pink-500/30" />
              <div className="relative flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-pink-500" />
                    <h3 className="font-bold text-white">Profile Boost</h3>
                  </div>
                  <p className="text-xs text-gray-400">Get 10x more matches for 30 mins</p>
                </div>
                <button 
                  onClick={activateBoost}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #EC4899, #9333EA)' }}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : '150 Coins'}
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Buy Coins</h3>
              <div className="grid grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing}
                    className="relative flex flex-col items-center p-4 rounded-2xl border transition-all hover:bg-white/5 active:scale-95 disabled:opacity-50"
                    style={{
                      borderColor: pkg.popular ? '#FBBF24' : 'rgba(255,255,255,0.1)',
                      background: pkg.popular ? 'rgba(251, 191, 36, 0.05)' : 'transparent'
                    }}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-yellow-900 bg-yellow-400">
                        POPULAR
                      </div>
                    )}
                    {pkg.label && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-violet-500">
                        {pkg.label}
                      </div>
                    )}
                    <span className="text-3xl mb-2">{pkg.icon}</span>
                    <span className="font-bold text-white">{pkg.amount}</span>
                    <span className="text-xs text-gray-400 mb-2">Coins</span>
                    <div className="mt-auto px-3 py-1 rounded-lg text-sm font-semibold bg-white/10 text-white w-full text-center">
                      €{pkg.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secure payments powered by Stripe
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
