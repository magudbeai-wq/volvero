import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  clerkId?: string;
  user?: {
    id: string;
    clerkId: string;
    subscriptionTier: string;
    status: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify with Clerk
    const sessionClaims = await clerkClient.verifyToken(token);

    if (!sessionClaims?.sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const clerkId = sessionClaims.sub;

    // Get user from our DB
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        subscriptionTier: true,
        status: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found. Please complete onboarding.' });
      return;
    }

    if (user.status === 'BANNED') {
      res.status(403).json({ error: 'Account has been banned.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Account is temporarily suspended.' });
      return;
    }

    req.userId = user.id;
    req.clerkId = clerkId;
    req.user = user;

    next();
  } catch (error) {
    logger.error({ error }, 'Auth middleware error');
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function requirePremium(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.subscriptionTier === 'FREE') {
    res.status(403).json({
      error: 'Premium subscription required',
      code: 'UPGRADE_REQUIRED',
      upgradeUrl: '/premium',
    });
    return;
  }

  next();
}

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const adminKey = req.headers['x-admin-key'];

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}
