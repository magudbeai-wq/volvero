import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Lazy Stripe initialization
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Stripe not configured');
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return _stripe;
}

const COIN_PACKAGES = {
  100: { amount: 99, currency: 'eur' },   // €0.99
  500: { amount: 499, currency: 'eur' },  // €4.99
  1000: { amount: 999, currency: 'eur' }, // €9.99
  5000: { amount: 3999, currency: 'eur' },// €39.99
};

// ── POST /api/payments/buy-coins ─────────────────────────────
router.post('/buy-coins', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    const coins = Number(amount);

    if (![100, 500, 1000, 5000].includes(coins)) {
      return res.status(400).json({ error: 'Invalid coin bundle amount' });
    }

    const pkg = COIN_PACKAGES[coins as keyof typeof COIN_PACKAGES];
    
    // Find user's stripe customer id if exists
    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId } });

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      customer: sub?.stripeCustomerId || undefined,
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            product_data: {
              name: `${coins} VOLVERO Coins`,
              description: `Virtual currency for Profile Boosts and Premium features.`,
            },
            unit_amount: pkg.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?success=true&coins=${coins}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?canceled=true`,
      metadata: {
        userId: req.userId!,
        type: 'COIN_PURCHASE',
        coins: coins.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
