import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/notifications ────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.json({ notifications, unreadCount, page, limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ── PUT /api/notifications/read-all ───────────────────────────
router.put('/read-all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// ── PUT /api/notifications/:id/read ───────────────────────────
router.put('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ── Helper: Create notification ───────────────────────────────
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type as any,
      title: params.title,
      message: params.body,
      data: {
        ...(params.link ? { link: params.link } : {}),
        ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
      },
    },
  });
}

export default router;
