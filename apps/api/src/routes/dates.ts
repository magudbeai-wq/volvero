import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── GET /api/dates ───────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dates = await prisma.dateEvent.findMany({
      where: {
        OR: [
          { proposerId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: {
        proposer: { select: { id: true, fullName: true, profilePhoto: true } },
        receiver: { select: { id: true, fullName: true, profilePhoto: true } },
      },
      orderBy: { proposedAt: 'asc' }
    });
    res.json({ dates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// ── POST /api/dates ──────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { matchId, proposedAt, location, venueName } = req.body;
    
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    const receiverId = match.userAId === req.userId ? match.userBId : match.userAId;

    const date = await prisma.dateEvent.create({
      data: {
        matchId,
        proposerId: req.userId!,
        receiverId,
        proposedAt: new Date(proposedAt),
        location,
        venueName,
        status: 'PROPOSED'
      }
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'SYSTEM',
        title: 'New Date Proposal! 🍷',
        message: 'Your match suggested a date. Tap to view.',
      }
    });

    // Send a system message in the chat
    const conversation = await prisma.conversation.findUnique({ where: { matchId } });
    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.userId!,
          type: 'SYSTEM',
          content: `🍷 Suggested a date at ${venueName || location} for ${new Date(proposedAt).toLocaleString()}`,
        }
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessage: '🍷 Date proposed', lastMsgAt: new Date() }
      });
    }

    res.json({ date });
  } catch (error) {
    res.status(500).json({ error: 'Failed to propose date' });
  }
});

// ── PATCH /api/dates/:id ───────────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // ACCEPTED, DECLINED, CANCELLED
    const dateId = req.params.id as string;
    const date = await prisma.dateEvent.findUnique({ where: { id: dateId } });
    
    if (!date) return res.status(404).json({ error: 'Date not found' });
    if (date.receiverId !== req.userId && date.proposerId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.dateEvent.update({
      where: { id: dateId },
      data: { status }
    });

    // System message
    const conversation = await prisma.conversation.findUnique({ where: { matchId: date.matchId } });
    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.userId!,
          type: 'SYSTEM',
          content: `🍷 Date ${status.toLowerCase()}`,
        }
      });
    }

    res.json({ date: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update date' });
  }
});

export default router;
