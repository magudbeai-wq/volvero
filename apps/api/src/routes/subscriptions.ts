import Stripe from 'stripe';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { sendEmail, EmailType } from '../services/email.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Lazy Stripe initialization — won't crash server on missing/placeholder key
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith('sk_test_YOUR')) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return _stripe;
}
// Alias for export compatibility
const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ── GET /api/subscriptions/plans ─────────────────────────────
router.get('/plans', (_req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        nameAr: 'مجاني',
        nameSo: 'Bilaash',
        price: 0,
        currency: 'usd',
        interval: null,
        features: [
          '50 likes per day',
          'Basic filters',
          'Limited messages',
          'View profiles',
        ],
        limitations: {
          dailyLikes: 50,
          canSeeWhoLikedYou: false,
          canRewind: false,
          canBoost: false,
          incognito: false,
          passport: false,
        }
      },
      {
        id: 'premium_monthly',
        name: 'Premium',
        nameAr: 'مميز',
        nameSo: 'Heer Sarena',
        price: 1999,
        currency: 'usd',
        interval: 'month',
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        popular: true,
        features: [
          'Unlimited likes',
          'See who liked you',
          'Rewind last swipe',
          'Profile boost (1/month)',
          'Advanced filters',
          'Priority ranking',
          'AI matchmaking',
          'Incognito mode',
          'Read receipts',
        ],
        limitations: {
          dailyLikes: -1,
          canSeeWhoLikedYou: true,
          canRewind: true,
          canBoost: true,
          incognito: true,
          passport: false,
        }
      },
      {
        id: 'premium_annual',
        name: 'Premium Annual',
        nameAr: 'مميز سنوي',
        nameSo: 'Heer Sarena Sanad',
        price: 14999,
        currency: 'usd',
        interval: 'year',
        priceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
        savings: '37%',
        features: [
          'Everything in Premium',
          'Passport mode (any city)',
          '5 boosts/month',
          'Priority support',
          'Early access to features',
        ],
        limitations: {
          dailyLikes: -1,
          canSeeWhoLikedYou: true,
          canRewind: true,
          canBoost: true,
          incognito: true,
          passport: true,
        }
      },
    ]
  });
});

// ── POST /api/subscriptions/checkout ─────────────────────────
router.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { subscription: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    let customerId = user.subscription?.stripeCustomerId;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: user.id, supabaseId: user.supabaseId },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          tier: 'FREE',
          status: 'ACTIVE',
        },
        update: { stripeCustomerId: customerId },
      });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/premium/success`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
        metadata: { userId: user.id },
        allow_promotion_codes: true,
        subscription_data: {
          metadata: { userId: user.id },
        },
      });
    } catch (err: any) {
      if (err.message?.includes('No such customer')) {
        logger.warn(`Stripe customer ${customerId} not found. Re-creating customer...`);
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: { userId: user.id, supabaseId: user.supabaseId },
        });
        customerId = customer.id;
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        });
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/premium/success`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
          metadata: { userId: user.id },
          allow_promotion_codes: true,
          subscription_data: {
            metadata: { userId: user.id },
          },
        });
      } else {
        throw err;
      }
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    logger.error({ error }, 'Checkout error');
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ── POST /api/subscriptions/portal ────────────────────────────
router.post('/portal', requireAuth, async (req: AuthRequest, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    let customerId = subscription.stripeCustomerId;
    let session;
    try {
      session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      });
    } catch (err: any) {
      if (err.message?.includes('No such customer')) {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        logger.warn(`Stripe customer ${customerId} not found for portal. Re-creating...`);
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: { userId: user.id, supabaseId: user.supabaseId },
        });
        customerId = customer.id;
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        });
        session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });
      } else {
        throw err;
      }
    }

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ── GET /api/subscriptions/me ─────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export { stripe };
export default router;
