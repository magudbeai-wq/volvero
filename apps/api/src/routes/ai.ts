import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { generateRuleBasedIcebreaker } from '../services/matching.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── POST /api/ai/icebreaker ───────────────────────────────────
router.post('/icebreaker', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { targetUserId } = req.body;

    const [currentUser, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.userId },
        select: { fullName: true, interests: true }
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { interests: true, city: true, career: true }
      }),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Try OpenAI first if available
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-YOUR')) {
      try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const sharedInterests = currentUser.interests.filter(i => targetUser.interests.includes(i));

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a Somali dating coach for LAMAANE DOORE. Generate 3 warm, culturally respectful icebreaker messages for a Somali dating app. Keep them short (1-2 sentences), genuine, and not generic. Don't use pickup lines. Focus on shared interests and cultural connection.`
            },
            {
              role: 'user',
              content: `Generate 3 icebreakers. Shared interests: ${sharedInterests.join(', ')}. Target user's city: ${targetUser.city}. Their career: ${targetUser.career}. Return as JSON array: ["message1", "message2", "message3"]`
            }
          ],
          temperature: 0.8,
          max_tokens: 300,
        });

        const content = completion.choices[0]?.message?.content || '';
        const icebreakers = JSON.parse(content);

        return res.json({ icebreakers, source: 'ai' });
      } catch (aiError) {
        logger.warn({ aiError }, 'OpenAI failed, using rule-based fallback');
      }
    }

    // Rule-based fallback
    const icebreakers = generateRuleBasedIcebreaker(currentUser, targetUser);
    res.json({ icebreakers, source: 'rule-based' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate icebreaker' });
  }
});

// ── POST /api/ai/bio-suggest ──────────────────────────────────
router.post('/bio-suggest', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        fullName: true, career: true, interests: true,
        city: true, relationshipGoal: true, personalityTraits: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-YOUR')) {
      try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You write attractive, authentic dating profile bios for Somali users. Keep bios under 150 words. Be warm, specific, and culturally aware. Avoid clichés.'
            },
            {
              role: 'user',
              content: `Write a dating profile bio for: Career: ${user.career}, Interests: ${user.interests.join(', ')}, City: ${user.city}, Looking for: ${user.relationshipGoal}. Make it feel genuine and unique.`
            }
          ],
          temperature: 0.9,
          max_tokens: 200,
        });

        return res.json({
          bio: completion.choices[0]?.message?.content,
          source: 'ai'
        });
      } catch (aiError) {
        logger.warn({ aiError }, 'OpenAI bio generation failed');
      }
    }

    // Rule-based fallback
    const bio = `${user.career ? `Working in ${user.career}` : 'Career-focused'}. Passionate about ${user.interests.slice(0, 2).join(' and ')}. Based in ${user.city || 'a beautiful city'}. Looking for ${user.relationshipGoal?.toLowerCase().replace('_', ' ') || 'something meaningful'}.`;
    res.json({ bio, source: 'rule-based' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate bio' });
  }
});

// ── GET /api/ai/recommendations ──────────────────────────────
router.get('/recommendations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const recommendations = await prisma.aIRecommendation.findMany({
      where: { userId: req.userId, isShown: false, expiresAt: { gt: new Date() } },
      include: {
        target: {
          select: {
            id: true, fullName: true, profilePhoto: true,
            city: true, isVerified: true, interests: true, bio: true,
          }
        }
      },
      orderBy: { score: 'desc' },
      take: 10,
    });

    // Mark as shown
    const ids = recommendations.map(r => r.id);
    if (ids.length > 0) {
      await prisma.aIRecommendation.updateMany({
        where: { id: { in: ids } },
        data: { isShown: true },
      });
    }

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
