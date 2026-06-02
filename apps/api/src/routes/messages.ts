import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/messages/:conversationId ─────────────────────────
router.get('/:conversationId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const { before, limit = '50' } = req.query;

    // Verify user is part of conversation and load participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [{ userAId: req.userId }, { userBId: req.userId }],
      },
      include: {
        userA: {
          select: { id: true, fullName: true, profilePhoto: true, isVerified: true, isOnline: true, city: true, email: true },
        },
        userB: {
          select: { id: true, fullName: true, profilePhoto: true, isVerified: true, isOnline: true, city: true, email: true },
        },
      },
    });

    if (!conversation) return res.status(403).json({ error: 'Access denied' });

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId as string,
        isDeleted: false,
        ...(before ? { createdAt: { lt: new Date(before as string) } } : {}),
      },
      include: {
        sender: {
          select: { id: true, fullName: true, profilePhoto: true, isVerified: true }
        },
        replyTo: {
          select: { id: true, content: true, type: true }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId as string,
        senderId: { not: req.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const formattedConversation = {
      id: conversation.id,
      matchId: conversation.matchId,
      participants: [conversation.userA, conversation.userB],
    };

    res.json({
      conversation: formattedConversation,
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── POST /api/messages/:conversationId ────────────────────────
router.post('/:conversationId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'TEXT', mediaUrl, replyToId } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [{ userAId: req.userId }, { userBId: req.userId }],
      },
    });

    if (!conversation) return res.status(403).json({ error: 'Access denied' });

    const message = await prisma.message.create({
      data: {
        conversationId: conversationId as string,
        senderId: req.userId!,
        content,
        type,
        mediaUrl,
        replyToId,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, profilePhoto: true }
        },
        replyTo: {
          select: { id: true, content: true, type: true }
        },
      },
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId as string },
      data: {
        lastMessage: type === 'TEXT' ? content : `📎 ${type.toLowerCase()}`,
        lastMsgAt: new Date(),
      },
    });

    // Trigger bot auto-reply asynchronously
    import('../services/bot.js').then(({ handleBotReply }) => {
      handleBotReply(conversationId as string, req.userId!, content as string);
    }).catch((err) => {
      console.error('Failed to load bot reply service:', err);
    });

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── DELETE /api/messages/:messageId ──────────────────────────
router.delete('/:messageId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const message = await prisma.message.findFirst({
      where: { id: req.params.messageId as string, senderId: req.userId },
    });

    if (!message) return res.status(404).json({ error: 'Message not found' });

    await prisma.message.update({
      where: { id: message.id },
      data: { isDeleted: true, content: null },
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ── PATCH /api/messages/:messageId/react ─────────────────────
router.patch('/:messageId/react', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { emoji } = req.body;
    const message = await prisma.message.findUnique({
      where: { id: req.params.messageId as string },
    });

    if (!message) return res.status(404).json({ error: 'Message not found' });

    const reactions = (message.reactions as Record<string, string[]>) || {};
    if (!reactions[emoji]) reactions[emoji] = [];

    const userIndex = reactions[emoji].indexOf(req.userId!);
    if (userIndex > -1) {
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(req.userId!);
    }

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { reactions },
    });

    res.json({ message: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

export default router;
