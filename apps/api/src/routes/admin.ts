import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin key
router.use(requireAdmin);

// ── GET /api/admin/dashboard ──────────────────────────────────
router.get('/dashboard', async (_req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalMatches,
      totalMessages,
      pendingReports,
      newUsersToday,
      newUsersWeek,
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.user.count({ where: { subscriptionTier: { not: 'FREE' } } }),
      prisma.match.count({ where: { status: 'MATCHED' } }),
      prisma.message.count({ where: { isDeleted: false } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
    ]);

    // Revenue from Stripe (simplified)
    const subscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE', tier: { not: 'FREE' } }
    });

    const estimatedMRR = subscriptions * 1999; // cents

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalMatches,
        totalMessages,
        pendingReports,
        newUsersToday,
        newUsersWeek,
        estimatedMRR,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : '0',
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = '0', limit = '50', search, status, tier } = req.query;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (tier) where.subscriptionTier = tier;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, fullName: true, email: true, phone: true,
          gender: true, city: true, country: true,
          status: true, subscriptionTier: true, isVerified: true,
          verificationStatus: true, profileCompletion: true,
          matchCount: true, createdAt: true, lastSeenAt: true,
          isOnline: true,
        },
        skip: Number(page) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── PATCH /api/admin/users/:id/status ────────────────────────
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.params.id,
        action: `USER_${status}`,
        target: req.params.id,
        metadata: { reason },
      }
    }).catch(() => {});

    res.json({ user, message: `User ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// ── PATCH /api/admin/users/:id/verify ────────────────────────
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const { approved } = req.body;

    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
        isVerified: approved,
      },
    });

    res.json({ message: approved ? 'User verified' : 'Verification rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── GET /api/admin/reports ────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const { status = 'PENDING', page = '0' } = req.query;

    const reports = await prisma.report.findMany({
      where: { status: status as 'PENDING' },
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        reported: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: Number(page) * 20,
      take: 20,
    });

    const total = await prisma.report.count({ where: { status: status as 'PENDING' } });

    res.json({ reports, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ── PATCH /api/admin/reports/:id ─────────────────────────────
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNotes,
        resolvedAt: status !== 'PENDING' ? new Date() : undefined,
      },
    });

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// ── GET /api/admin/analytics ──────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    // Last 30 days growth
    const days = 30;
    const dailyStats = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, matches, messages] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: date, lt: nextDate } } }),
        prisma.match.count({ where: { createdAt: { gte: date, lt: nextDate } } }),
        prisma.message.count({ where: { createdAt: { gte: date, lt: nextDate } } }),
      ]);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users,
        matches,
        messages,
      });
    }

    res.json({ dailyStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
