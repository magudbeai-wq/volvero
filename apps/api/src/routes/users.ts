import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// ── GET /api/users/me ────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        subscription: true,
        _count: {
          select: {
            matchesA: { where: { status: 'MATCHED' } },
            matchesB: { where: { status: 'MATCHED' } },
            swipesGiven: true,
            swipesReceived: true,
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── POST /api/users/onboard ──────────────────────────────────
const onboardSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  tribe: z.string().optional(),
  religion: z.enum(['ISLAM', 'CHRISTIANITY', 'SECULAR', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  maritalStatus: z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'PREFER_NOT_TO_SAY']).optional(),
  educationLevel: z.enum(['HIGH_SCHOOL', 'SOME_COLLEGE', 'BACHELORS', 'MASTERS', 'PHD', 'VOCATIONAL', 'OTHER']).optional(),
  career: z.string().optional(),
  height: z.number().min(100).max(250).optional(),
  relationshipGoal: z.enum(['MARRIAGE', 'LONG_TERM', 'SHORT_TERM', 'FRIENDSHIP', 'NOT_SURE']).optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
});

router.post('/onboard', async (req, res) => {
  try {
    const data = onboardSchema.parse(req.body);

    // Calculate profile completion
    const completionFields = ['dateOfBirth', 'gender', 'city', 'country', 'religion', 'bio', 'career', 'height', 'relationshipGoal'];
    const filled = completionFields.filter(f => (data as Record<string, unknown>)[f]);
    const completion = Math.round((filled.length / completionFields.length) * 100);

    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      create: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        profileCompletion: completion,
        isProfileComplete: completion >= 70,
        referralCode: generateReferralCode(),
      },
      update: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        profileCompletion: completion,
        isProfileComplete: completion >= 70,
      },
    });

    res.status(201).json({ user, message: 'Profile created successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// ── PATCH /api/users/me ──────────────────────────────────────
router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const allowedFields = [
      'fullName', 'nickname', 'bio', 'city', 'country', 'tribe', 'religion',
      'maritalStatus', 'educationLevel', 'career', 'company', 'height',
      'relationshipGoal', 'languages', 'interests', 'personalityTraits',
      'lifestylePrefs', 'minAgePreference', 'maxAgePreference', 'maxDistance',
      'showDistance', 'showAge', 'isIncognito', 'gender', 'photos', 'profilePhoto',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updates,
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if blocked
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.userId, blockedId: id },
          { blockerId: id, blockedId: req.userId },
        ]
      }
    });

    if (block) return res.status(404).json({ error: 'User not found' });

    const user = await prisma.user.findUnique({
      where: { id, status: 'ACTIVE' },
      select: {
        id: true,
        fullName: true,
        nickname: true,
        dateOfBirth: true,
        gender: true,
        bio: true,
        city: true,
        country: true,
        tribe: true,
        religion: true,
        maritalStatus: true,
        educationLevel: true,
        career: true,
        height: true,
        relationshipGoal: true,
        languages: true,
        interests: true,
        personalityTraits: true,
        lifestylePrefs: true,
        profilePhoto: true,
        photos: true,
        voiceIntroUrl: true,
        isVerified: true,
        verificationStatus: true,
        isOnline: true,
        lastSeenAt: true,
        subscriptionTier: true,
        matchCount: true,
        createdAt: true,
        showAge: true,
        showDistance: true,
        isIncognito: true,
      },
    });

    if (!user || user.isIncognito) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Record profile visit
    if (req.userId !== id) {
      await prisma.profileVisit.create({
        data: { visitedId: id, visitorId: req.userId! }
      }).catch(() => {}); // non-critical
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── GET /api/users/visitors ───────────────────────────────────
router.get('/me/visitors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const visitors = await prisma.profileVisit.findMany({
      where: { visitedId: req.userId },
      include: {
        visitor: {
          select: {
            id: true, fullName: true, profilePhoto: true,
            city: true, isVerified: true, isOnline: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ visitors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// ── POST /api/users/location ──────────────────────────────────
router.post('/location', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, city, country } = req.body;

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        latitude,
        longitude,
        city: city || undefined,
        country: country || undefined,
        locationUpdatedAt: new Date(),
      },
    });

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// ── PATCH /api/users/online ───────────────────────────────────
router.patch('/online', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { isOnline } = req.body;

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        isOnline,
        lastSeenAt: isOnline ? undefined : new Date(),
      },
    });

    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── POST /api/users/block ──────────────────────────────────────
router.post('/block', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { blockedId, reason } = req.body;

    if (!blockedId) return res.status(400).json({ error: 'Blocked user ID is required' });
    if (blockedId === req.userId) return res.status(400).json({ error: 'You cannot block yourself' });

    // Verify user exists
    const targetUser = await prisma.user.findUnique({ where: { id: blockedId } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.userId!, blockedId } },
    });

    if (existingBlock) return res.json({ message: 'User already blocked' });

    // Create block and clean up matching/swipe data in a transaction
    await prisma.$transaction([
      prisma.block.create({
        data: { blockerId: req.userId!, blockedId, reason },
      }),
      // Remove swipes in both directions
      prisma.swipe.deleteMany({
        where: {
          OR: [
            { giverId: req.userId, receiverId: blockedId },
            { giverId: blockedId, receiverId: req.userId },
          ],
        },
      }),
      // Remove matches in both directions
      prisma.match.deleteMany({
        where: {
          OR: [
            { userAId: req.userId, userBId: blockedId },
            { userAId: blockedId, userBId: req.userId },
          ],
        },
      }),
    ]);

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// ── POST /api/users/unblock ────────────────────────────────────
router.post('/unblock', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { blockedId } = req.body;

    if (!blockedId) return res.status(400).json({ error: 'Blocked user ID is required' });

    const block = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.userId!, blockedId } },
    });

    if (!block) return res.status(404).json({ error: 'Block record not found' });

    await prisma.block.delete({
      where: { id: block.id },
    });

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// ── GET /api/users/me/blocked ──────────────────────────────────
router.get('/me/blocked', requireAuth, async (req: AuthRequest, res) => {
  try {
    const blocks = await prisma.block.findMany({
      where: { blockerId: req.userId },
      include: {
        blocked: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.json({ blockedUsers: blocks.map(b => b.blocked) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

// ── POST /api/users/report ─────────────────────────────────────
router.post('/report', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { reportedId, reason, description, evidence } = req.body;

    if (!reportedId) return res.status(400).json({ error: 'Reported user ID is required' });
    if (reportedId === req.userId) return res.status(400).json({ error: 'You cannot report yourself' });

    const validReasons = [
      'FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM',
      'UNDERAGE', 'SCAM', 'OTHER'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({ where: { id: reportedId } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Create report and automatically block the user for safety
    await prisma.$transaction([
      prisma.report.create({
        data: {
          reporterId: req.userId!,
          reportedId,
          reason,
          description,
          evidence: evidence || [],
        },
      }),
      // Automatically block reported user
      prisma.block.upsert({
        where: { blockerId_blockedId: { blockerId: req.userId!, blockedId: reportedId } },
        create: { blockerId: req.userId!, blockedId: reportedId, reason: `Automatically blocked after report: ${reason}` },
        update: {},
      }),
      // Remove swipes
      prisma.swipe.deleteMany({
        where: {
          OR: [
            { giverId: req.userId, receiverId: reportedId },
            { giverId: reportedId, receiverId: req.userId },
          ],
        },
      }),
      // Remove matches
      prisma.match.deleteMany({
        where: {
          OR: [
            { userAId: req.userId, userBId: reportedId },
            { userAId: reportedId, userBId: req.userId },
          ],
        },
      }),
    ]);

    res.json({ message: 'User reported and blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report user' });
  }
});

// ── POST /api/users/verify-request ─────────────────────────────
router.post('/verify-request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { selfieUrl } = req.body;

    if (!selfieUrl) return res.status(400).json({ error: 'Selfie photo URL is required for verification' });

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        selfieVerifyUrl: selfieUrl,
        verificationStatus: 'PENDING',
      },
    });

    res.json({ user, message: 'Verification request submitted successfully. Our safety team will review it within 24 hours.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default router;
