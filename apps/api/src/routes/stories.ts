import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/stories ──────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();

    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
        user: { status: 'ACTIVE' },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
            isVerified: true,
            isOnline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Group by user
    const grouped = stories.reduce<Record<string, { user: typeof stories[0]['user']; stories: typeof stories }>>((acc, story) => {
      const uid = story.userId;
      if (!acc[uid]) {
        acc[uid] = { user: story.user, stories: [] };
      }
      acc[uid].stories.push(story);
      return acc;
    }, {});

    res.json({ stories: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// ── POST /api/stories ─────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { mediaUrl, caption, duration = 5 } = req.body;

    if (!mediaUrl) return res.status(400).json({ error: 'Media URL required' });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await prisma.story.create({
      data: {
        userId: req.userId!,
        mediaUrl,
        caption,
        duration: Math.min(Number(duration), 30),
        expiresAt,
      },
    });

    res.status(201).json({ story });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// ── POST /api/stories/:id/view ────────────────────────────────
router.post('/:id/view', requireAuth, async (req: AuthRequest, res) => {
  try {
    const story = await prisma.story.findUnique({ where: { id: req.params.id as string } });
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.viewers.includes(req.userId!)) {
      await prisma.story.update({
        where: { id: story.id },
        data: {
          viewCount: { increment: 1 },
          viewers: { push: req.userId! },
        },
      });
    }

    res.json({ message: 'View recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// ── DELETE /api/stories/:id ───────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const story = await prisma.story.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });

    if (!story) return res.status(404).json({ error: 'Story not found' });

    await prisma.story.delete({ where: { id: story.id } });

    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
