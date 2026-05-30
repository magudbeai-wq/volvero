import { Router } from 'express';
import Stripe from 'stripe';
import { Webhook } from 'svix';
import { prisma } from '../lib/prisma.js';
import { sendEmail, EmailType } from '../services/email.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Lazy Stripe initialization
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith('sk_test_YOUR')) {
      throw new Error('Stripe not configured');
    }
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return _stripe;
}


// ── POST /webhooks/stripe ─────────────────────────────────────
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error({ err }, 'Stripe webhook signature verification failed');
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  logger.info({ type: event.type }, 'Stripe webhook received');

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) break;

        const priceId = subscription.items.data[0]?.price.id;
        let tier: 'FREE' | 'PREMIUM' | 'GOLD' = 'FREE';

        if (priceId === process.env.STRIPE_GOLD_MONTHLY_PRICE_ID) tier = 'GOLD';
        else if (priceId) tier = 'PREMIUM';

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            tier,
            status: subscription.status.toUpperCase() as 'ACTIVE',
            currentPeriodStart: new Date((subscription.current_period_start ?? 0) * 1000),
            currentPeriodEnd: new Date((subscription.current_period_end ?? 0) * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionTier: tier },
        });

        if (event.type === 'customer.subscription.created') {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            await sendEmail(EmailType.SUBSCRIPTION_WELCOME, {
              to: user.email,
              name: user.fullName,
              tier,
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: { tier: 'FREE', status: 'CANCELED', canceledAt: new Date() },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionTier: 'FREE', isIncognito: false },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info({ invoiceId: invoice.id }, 'Payment succeeded');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn({ invoiceId: invoice.id }, 'Payment failed');
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error({ error, eventType: event.type }, 'Webhook handler error');
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ── POST /webhooks/clerk ──────────────────────────────────────
router.post('/clerk', async (req, res) => {
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof evt;
  } catch (err) {
    res.status(400).send('Invalid Clerk webhook');
    return;
  }

  const { type, data } = evt;

  if (type === 'user.deleted') {
    const clerkId = data.id as string;
    await prisma.user.updateMany({
      where: { clerkId },
      data: { status: 'DEACTIVATED', deletedAt: new Date() },
    });
  }

  res.json({ received: true });
});

export default router;
