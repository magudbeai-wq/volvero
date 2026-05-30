import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId

export function initSocket(httpServer: HttpServer): void {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      if (!userId) return next(new Error('No userId provided'));

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true },
      });

      if (!user || user.status === 'BANNED') return next(new Error('Unauthorized'));

      socket.data.userId = userId;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId as string;
    connectedUsers.set(userId, socket.id);

    logger.info({ userId }, 'Socket connected');

    // Mark user online
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeenAt: new Date() },
    }).catch(() => {});

    // Notify contacts that user is online
    socket.broadcast.emit('user:online', { userId });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // ── Message Events ─────────────────────────────────────
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      type: string;
      mediaUrl?: string;
      replyToId?: string;
    }) => {
      try {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: data.conversationId,
            OR: [{ userAId: userId }, { userBId: userId }],
          },
        });

        if (!conversation) return;

        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            type: data.type as 'TEXT',
            mediaUrl: data.mediaUrl,
            replyToId: data.replyToId,
          },
          include: {
            sender: {
              select: { id: true, fullName: true, profilePhoto: true }
            },
          },
        });

        // Update conversation
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            lastMessage: data.type === 'TEXT' ? data.content : `📎 ${data.type.toLowerCase()}`,
            lastMsgAt: new Date(),
          },
        });

        // Get recipient
        const recipientId = conversation.userAId === userId
          ? conversation.userBId
          : conversation.userAId;

        // Emit to recipient
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message:received', { message, conversationId: data.conversationId });
        }

        // Confirm to sender
        socket.emit('message:sent', { message, conversationId: data.conversationId });

      } catch (error) {
        logger.error({ error }, 'Message send error');
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // ── Typing Indicators ──────────────────────────────────
    socket.on('typing:start', async ({ conversationId }: { conversationId: string }) => {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      });

      if (!conversation) return;

      const recipientId = conversation.userAId === userId
        ? conversation.userBId
        : conversation.userAId;

      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:update', {
          conversationId,
          userId,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', async ({ conversationId }: { conversationId: string }) => {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      });

      if (!conversation) return;

      const recipientId = conversation.userAId === userId
        ? conversation.userBId
        : conversation.userAId;

      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:update', {
          conversationId,
          userId,
          isTyping: false,
        });
      }
    });

    // ── Read Receipts ──────────────────────────────────────
    socket.on('message:read', async ({ conversationId }: { conversationId: string }) => {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true },
      }).catch(() => {});
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      logger.info({ userId }, 'Socket disconnected');

      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeenAt: new Date() },
      }).catch(() => {});

      socket.broadcast.emit('user:offline', { userId });
    });
  });

  logger.info('🔌 Socket.io initialized');
}

export function getConnectedUsers(): Map<string, string> {
  return connectedUsers;
}
