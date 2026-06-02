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

// ── POST /api/payments/create-coin-checkout ─────────────────────────────
router.post('/create-coin-checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { packageId } = req.body;
    const coinsStr = packageId.split('_')[1];
    const coins = Number(coinsStr);

    if (![100, 500, 1000, 5000].includes(coins)) {
      return res.status(400).json({ error: 'Invalid coin bundle amount' });
    }

    const pkg = COIN_PACKAGES[coins as keyof typeof COIN_PACKAGES];
    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId } });

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      customer: (sub?.stripeCustomerId && !sub.stripeCustomerId.startsWith('cust_dummy_')) ? sub.stripeCustomerId : undefined,
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
    };

    let session;
    try {
      session = await getStripe().checkout.sessions.create(sessionConfig);
    } catch (err: any) {
      if (err.message?.includes('No such customer') && sessionConfig.customer) {
        console.warn(`Customer ${sessionConfig.customer} not found in Stripe, retrying checkout without customer...`);
        delete sessionConfig.customer;
        session = await getStripe().checkout.sessions.create(sessionConfig);
      } else {
        throw err;
      }
    }

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe coin checkout session creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create coin checkout session', 
      details: error.message || String(error)
    });
  }
});

// ── POST /api/payments/create-subscription-checkout ─────────────────────────────
router.post('/create-subscription-checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.body;
    let priceId = '';

    if (planId === 'premium') {
      priceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_placeholder';
    } else if (planId === 'vip') {
      priceId = process.env.STRIPE_GOLD_MONTHLY_PRICE_ID || 'price_vip_placeholder';
    } else {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId } });

    // For test mode, if priceId doesn't exist, we will use a dummy price via price_data
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      customer: (sub?.stripeCustomerId && !sub.stripeCustomerId.startsWith('cust_dummy_')) ? sub.stripeCustomerId : undefined,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      subscription_data: {
        metadata: {
          userId: req.userId!,
        }
      }
    };

    if (!priceId.startsWith('price_')) {
      // Create a one-time payment instead of subscription if we don't have real price IDs set up yet (to prevent 500 error)
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `VOLVERO ${planId.toUpperCase()}` },
            unit_amount: planId === 'vip' ? 1999 : 999,
          },
          quantity: 1,
        },
      ];
      // Pass metadata on the session level since it's a payment
      sessionConfig.metadata = { userId: req.userId!, type: 'SUBSCRIPTION_DUMMY', plan: planId };
      delete sessionConfig.subscription_data;
    } else {
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    }

    let session;
    try {
      session = await getStripe().checkout.sessions.create(sessionConfig);
    } catch (err: any) {
      if (err.message?.includes('No such customer') && sessionConfig.customer) {
        console.warn(`Customer ${sessionConfig.customer} not found in Stripe, retrying checkout without customer...`);
        delete sessionConfig.customer;
        session = await getStripe().checkout.sessions.create(sessionConfig);
      } else {
        throw err;
      }
    }

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription checkout session', 
      details: error.message || String(error)
    });
  }
});

export default router;
