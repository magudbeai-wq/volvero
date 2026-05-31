import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const BOOST_COST = 100;
const BOOST_DURATION_MINUTES = 30;

// ── POST /api/boosts/activate ──────────────────────────────
router.post('/activate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { coinBalance: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.coinBalance < BOOST_COST) {
      return res.status(400).json({ error: 'Insufficient coins. Please purchase more coins to activate a Profile Boost.' });
    }

    // Check if user already has an active boost
    const activeBoost = await prisma.profileBoost.findFirst({
      where: {
        userId: req.userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    if (activeBoost) {
      return res.status(400).json({ error: 'You already have an active profile boost.' });
    }

    // Transaction to deduct coins and create boost
    const expiresAt = new Date(Date.now() + BOOST_DURATION_MINUTES * 60 * 1000);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId },
        data: { coinBalance: { decrement: BOOST_COST } }
      }),
      prisma.coinTransaction.create({
        data: {
          userId: req.userId!,
          amount: -BOOST_COST,
          type: 'SPEND',
          referenceId: 'profile_boost',
        }
      }),
      prisma.profileBoost.create({
        data: {
          userId: req.userId!,
          isActive: true,
          expiresAt,
        }
      })
    ]);

    res.json({ message: 'Profile boost activated successfully!', expiresAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate profile boost' });
  }
});

export default router;
