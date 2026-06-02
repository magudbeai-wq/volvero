import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { calculateCompatibility } from '../services/matching.js';
import { calculateDistance } from '../services/geolocation.js';

const router = Router();

// ── GET /api/matches/discover ─────────────────────────────────
// Returns a curated stack of profiles to swipe on
router.get('/discover', requireAuth, async (req: AuthRequest, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const page = Number(req.query.page) || 0;
    const limit = 20;

    // Get already-swiped, blocked, and blocking IDs
    const [swiped, blockedByMe, blockingMe] = await Promise.all([
      prisma.swipe.findMany({
        where: { giverId: req.userId },
        select: { receiverId: true },
      }),
      prisma.block.findMany({
        where: { blockerId: req.userId },
        select: { blockedId: true },
      }),
      prisma.block.findMany({
        where: { blockedId: req.userId },
        select: { blockerId: true },
      }),
    ]);

    const excludedIds = [
      req.userId!,
      ...swiped.map((s: any) => s.receiverId),
      ...blockedByMe.map((b: any) => b.blockedId),
      ...blockingMe.map((b: any) => b.blockerId),
    ];

    // Build smart filters
    const filters: Record<string, unknown> = {
      id: { notIn: excludedIds },
      status: 'ACTIVE',
      isIncognito: false,
      isProfileComplete: true,
    };

    // Gender preference
    if (currentUser.gender === 'MALE') {
      filters.gender = 'FEMALE';
    } else if (currentUser.gender === 'FEMALE') {
      filters.gender = 'MALE';
    }

    // Age range filter
    if (currentUser.minAgePreference && currentUser.maxAgePreference) {
      const now = new Date();
      const minDob = new Date(now.getFullYear() - currentUser.maxAgePreference, 0, 1);
      const maxDob = new Date(now.getFullYear() - currentUser.minAgePreference, 11, 31);
      filters.dateOfBirth = { gte: minDob, lte: maxDob };
    }

    const candidateFields = {
      id: true,
      fullName: true,
      nickname: true,
      dateOfBirth: true,
      gender: true,
      bio: true,
      city: true,
      country: true,
      religion: true,
      educationLevel: true,
      career: true,
      height: true,
      interests: true,
      personalityTraits: true,
      lifestylePrefs: true,
      profilePhoto: true,
      photos: true,
      voiceIntroUrl: true,
      isVerified: true,
      isOnline: true,
      lastSeenAt: true,
      latitude: true,
      longitude: true,
      showDistance: true,
      showAge: true,
      relationshipGoal: true,
      matchCount: true,
      subscriptionTier: true,
      maritalStatus: true,
      profileCompletion: true,
    };

    const getScoredProfiles = async (whereFilters: Record<string, unknown>, applyDistanceFilter: boolean) => {
      const candidates = await prisma.user.findMany({
        where: whereFilters as Record<string, unknown>,
        select: candidateFields,
        skip: page * limit,
        take: limit * 3,
      });

      if (candidates.length === 0) return { scored: [], rawLength: 0 };

      // Fetch active boosts for these candidates
      const candidateIds = candidates.map((c: any) => c.id);
      const activeBoosts = await prisma.profileBoost.findMany({
        where: {
          userId: { in: candidateIds },
          isActive: true,
          expiresAt: { gt: new Date() }
        },
        select: { userId: true }
      });
      const boostedUserIds = new Set(activeBoosts.map((b: any) => b.userId));

      // Score and rank candidates
      const scored = candidates
        .map((candidate: any) => {
          const score = calculateCompatibility(currentUser, candidate);
          const distance = (currentUser.latitude && currentUser.longitude && candidate.latitude && candidate.longitude)
            ? calculateDistance(
                currentUser.latitude, currentUser.longitude,
                candidate.latitude, candidate.longitude
              )
            : null;

          return {
            ...candidate,
            compatibility: Math.min(100, Math.round(score * 100) + (boostedUserIds.has(candidate.id) ? 30 : 0)),
            isBoosted: boostedUserIds.has(candidate.id),
            distance: candidate.showDistance ? distance : null,
            latitude: undefined,
            longitude: undefined,
          };
        })
        .filter((c: any) => {
          // Distance filter
          if (applyDistanceFilter && currentUser.maxDistance && c.distance !== null) {
            return c.distance <= currentUser.maxDistance;
          }
          return true;
        })
        .sort((a: any, b: any) => b.compatibility - a.compatibility);

      return { scored, rawLength: candidates.length };
    };

    // Tier 1: Preferred filters (matching gender, age preferences, and distance)
    let { scored, rawLength } = await getScoredProfiles(filters, true);

    // Tier 2: Relaxed Age & Gender (matching everyone, but keeping distance constraint)
    if (scored.length === 0 && (filters.gender || filters.dateOfBirth)) {
      console.log('🔄 Discover: Tier 1 empty. Relaxing gender and age restrictions...');
      const relaxedFilters = {
        id: { notIn: excludedIds },
        status: 'ACTIVE',
        isIncognito: false,
        isProfileComplete: true,
      };
      const res = await getScoredProfiles(relaxedFilters, true);
      scored = res.scored;
      rawLength = res.rawLength;
    }

    // Tier 3: Global Relaxed (relaxing gender, age range, AND distance constraints)
    if (scored.length === 0) {
      console.log('🔄 Discover: Tier 2 empty. Relaxing distance restriction globally...');
      const relaxedFilters = {
        id: { notIn: excludedIds },
        status: 'ACTIVE',
        isIncognito: false,
        isProfileComplete: true,
      };
      const res = await getScoredProfiles(relaxedFilters, false);
      scored = res.scored;
      rawLength = res.rawLength;
    }

    const sliced = scored.slice(0, limit);
    res.json({ profiles: sliced, hasMore: rawLength > limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discovery profiles' });
  }
});

// ── POST /api/matches/swipe ────────────────────────────────────
router.post('/swipe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { targetId, direction } = req.body;

    if (!['LEFT', 'RIGHT', 'SUPER'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid swipe direction' });
    }

    // Check existing swipe
    const existing = await prisma.swipe.findUnique({
      where: { giverId_receiverId: { giverId: req.userId!, receiverId: targetId } },
    });

    if (existing) return res.status(409).json({ error: 'Already swiped on this user' });

    // Free tier like limit (50/day)
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { subscriptionTier: true }
    });

    if (currentUser?.subscriptionTier === 'FREE' && direction !== 'LEFT') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const likesToday = await prisma.swipe.count({
        where: {
          giverId: req.userId,
          direction: { in: ['RIGHT', 'SUPER'] },
          createdAt: { gte: todayStart }
        }
      });

      if (likesToday >= 50) {
        return res.status(429).json({
          error: 'Daily like limit reached',
          code: 'LIKE_LIMIT_REACHED',
          resetAt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        });
      }
    }

    // Create swipe
    const swipe = await prisma.swipe.create({
      data: { giverId: req.userId!, receiverId: targetId, direction },
    });

    let matched = false;
    let match = null;

    // Check for mutual like
    if (direction === 'RIGHT' || direction === 'SUPER') {
      const [theirSwipe, targetUser] = await Promise.all([
        prisma.swipe.findFirst({
          where: {
            giverId: targetId,
            receiverId: req.userId,
            direction: { in: ['RIGHT', 'SUPER'] },
          },
        }),
        prisma.user.findUnique({
          where: { id: targetId },
          select: { email: true }
        })
      ]);

      const isBot = targetUser?.email?.endsWith('@bot.velora.com');

      if (theirSwipe || isBot) {
        // Get both users for compatibility
        const [userA, userB] = await Promise.all([
          prisma.user.findUnique({ where: { id: req.userId } }),
          prisma.user.findUnique({ where: { id: targetId } }),
        ]);

        const compatibility = userA && userB
          ? calculateCompatibility(userA, userB)
          : 0.5;

        // Create match
        const [userAId, userBId] = [req.userId!, targetId].sort();
        match = await prisma.match.create({
          data: {
            userAId,
            userBId,
            status: 'MATCHED',
            compatibility,
          },
        });

        // Create conversation
        await prisma.conversation.create({
          data: {
            matchId: match.id,
            userAId,
            userBId,
          }
        });

        // Update match counts
        await Promise.all([
          prisma.user.update({ where: { id: req.userId }, data: { matchCount: { increment: 1 } } }),
          prisma.user.update({ where: { id: targetId }, data: { matchCount: { increment: 1 } } }),
        ]);

        // Send match notifications
        await Promise.all([
          prisma.notification.create({
            data: {
              userId: req.userId!,
              type: 'MATCH',
              title: "It's a Match! 💜",
              message: "You have a new match! Start the conversation.",
              data: { matchId: match.id, userId: targetId },
            }
          }),
          prisma.notification.create({
            data: {
              userId: targetId,
              type: 'MATCH',
              title: "It's a Match! 💜",
              message: "You have a new match! Start the conversation.",
              data: { matchId: match.id, userId: req.userId },
            }
          }),
        ]);

        matched = true;
      }
    }

    res.json({ swipe, matched, match });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process swipe' });
  }
});

// ── GET /api/matches ───────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userAId: req.userId }, { userBId: req.userId }],
        status: 'MATCHED',
      },
      include: {
        userA: {
          select: {
            id: true, fullName: true, profilePhoto: true, photos: true,
            city: true, isVerified: true, isOnline: true, lastSeenAt: true,
          }
        },
        userB: {
          select: {
            id: true, fullName: true, profilePhoto: true, photos: true,
            city: true, isVerified: true, isOnline: true, lastSeenAt: true,
          }
        },
        conversation: {
          select: { id: true, lastMessage: true, lastMsgAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = matches.map((m: any) => ({
      id: m.id,
      compatibility: m.compatibility,
      isRead: m.isRead,
      createdAt: m.createdAt,
      conversation: m.conversation,
      user: m.userAId === req.userId ? m.userB : m.userA,
    }));

    res.json({ matches: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// ── DELETE /api/matches/:id ────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const match = await prisma.match.findFirst({
      where: {
        id: req.params.id as string,
        OR: [{ userAId: req.userId }, { userBId: req.userId }],
      },
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });

    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'UNMATCHED' },
    });

    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unmatch' });
  }
});

// ── POST /api/matches/rewind ───────────────────────────────────
router.post('/rewind', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { subscriptionTier: true }
    });

    if (user?.subscriptionTier === 'FREE') {
      return res.status(403).json({
        error: 'Rewind is a Premium feature',
        code: 'UPGRADE_REQUIRED',
      });
    }

    const lastSwipe = await prisma.swipe.findFirst({
      where: { giverId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastSwipe) return res.status(404).json({ error: 'No swipe to rewind' });

    await prisma.swipe.delete({ where: { id: lastSwipe.id } });

    res.json({ message: 'Rewound successfully', rewoundId: lastSwipe.receiverId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rewind' });
  }
});

export default router;
