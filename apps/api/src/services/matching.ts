/**
 * AI-Powered Compatibility Scoring Engine
 * 
 * Scoring factors:
 * - Preference match (religion, lifestyle, goals): 40%
 * - Interest overlap (cosine similarity): 25%
 * - Activity score (profile quality, recency): 20%
 * - Geographic proximity: 15%
 */

import type { User } from '@prisma/client';

type ScoringUser = Pick<User,
  | 'religion' | 'relationshipGoal' | 'interests' | 'personalityTraits'
  | 'lifestylePrefs' | 'latitude' | 'longitude' | 'lastSeenAt'
  | 'profileCompletion' | 'isVerified' | 'matchCount' | 'tribe'
  | 'maritalStatus' | 'educationLevel'
>;

export function calculateCompatibility(userA: ScoringUser, userB: ScoringUser): number {
  const weights = {
    preference: 0.40,
    interests: 0.25,
    activity: 0.20,
    proximity: 0.15,
  };

  const preferenceScore = scorePreferences(userA, userB);
  const interestScore = scoreInterests(userA, userB);
  const activityScore = scoreActivity(userB);
  const proximityScore = scoreProximity(userA, userB);

  const total =
    preferenceScore * weights.preference +
    interestScore * weights.interests +
    activityScore * weights.activity +
    proximityScore * weights.proximity;

  // Add small random variation for freshness (±5%)
  const variation = (Math.random() - 0.5) * 0.1;

  return Math.max(0, Math.min(1, total + variation));
}

function scorePreferences(userA: ScoringUser, userB: ScoringUser): number {
  let score = 0;
  let maxScore = 0;

  // Religion compatibility (highest weight in Somali culture)
  maxScore += 3;
  if (userA.religion && userB.religion) {
    if (userA.religion === userB.religion) score += 3;
    else if (
      (userA.religion === 'ISLAM' && userB.religion === 'ISLAM') ||
      (userA.religion === 'SECULAR' && userB.religion !== 'PREFER_NOT_TO_SAY')
    ) score += 1;
  }

  // Relationship goal alignment (critical)
  maxScore += 3;
  if (userA.relationshipGoal && userB.relationshipGoal) {
    if (userA.relationshipGoal === userB.relationshipGoal) score += 3;
    else if (
      (userA.relationshipGoal === 'MARRIAGE' && userB.relationshipGoal === 'LONG_TERM') ||
      (userA.relationshipGoal === 'LONG_TERM' && userB.relationshipGoal === 'MARRIAGE')
    ) score += 2;
    else score += 0.5;
  }

  // Marital status compatibility
  maxScore += 2;
  if (userA.maritalStatus && userB.maritalStatus) {
    if (userA.maritalStatus === 'NEVER_MARRIED' && userB.maritalStatus === 'NEVER_MARRIED') score += 2;
    else if (userA.maritalStatus === userB.maritalStatus) score += 1.5;
    else score += 0.8;
  }

  // Education level proximity
  maxScore += 1;
  if (userA.educationLevel && userB.educationLevel) {
    const levels = ['HIGH_SCHOOL', 'SOME_COLLEGE', 'BACHELORS', 'MASTERS', 'PHD'];
    const diff = Math.abs(levels.indexOf(userA.educationLevel) - levels.indexOf(userB.educationLevel));
    score += Math.max(0, 1 - diff * 0.25);
  }

  // Lifestyle preferences overlap
  maxScore += 2;
  if (userA.lifestylePrefs.length && userB.lifestylePrefs.length) {
    const overlap = userA.lifestylePrefs.filter(p => userB.lifestylePrefs.includes(p));
    const union = new Set([...userA.lifestylePrefs, ...userB.lifestylePrefs]).size;
    score += 2 * (overlap.length / union);
  }

  return maxScore > 0 ? score / maxScore : 0.5;
}

function scoreInterests(userA: ScoringUser, userB: ScoringUser): number {
  const aInterests = userA.interests || [];
  const bInterests = userB.interests || [];

  if (!aInterests.length || !bInterests.length) return 0.5;

  // Jaccard similarity
  const intersection = aInterests.filter(i => bInterests.includes(i));
  const union = new Set([...aInterests, ...bInterests]).size;

  return intersection.length / union;
}

function scoreActivity(user: ScoringUser): number {
  let score = 0;

  // Profile completeness
  score += (user.profileCompletion / 100) * 0.4;

  // Verified bonus
  if (user.isVerified) score += 0.2;

  // Recent activity (last seen within 7 days)
  if (user.lastSeenAt) {
    const daysSinceActive = (Date.now() - user.lastSeenAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 1) score += 0.3;
    else if (daysSinceActive < 3) score += 0.2;
    else if (daysSinceActive < 7) score += 0.1;
  }

  // Match count (social proof)
  if (user.matchCount > 0) {
    score += Math.min(0.1, user.matchCount * 0.01);
  }

  return Math.min(1, score);
}

function scoreProximity(userA: ScoringUser, userB: ScoringUser): number {
  if (!userA.latitude || !userA.longitude || !userB.latitude || !userB.longitude) {
    return 0.5; // Default if no location
  }

  const { calculateDistance } = require('./geolocation.js');
  const distance = calculateDistance(
    userA.latitude, userA.longitude,
    userB.latitude, userB.longitude
  );

  // Score: 1.0 at 0km, 0.0 at 500km
  return Math.max(0, 1 - distance / 500);
}

/**
 * Generate AI icebreaker suggestions based on shared interests
 */
export function generateRuleBasedIcebreaker(
  userA: Pick<User, 'fullName' | 'interests'>,
  userB: Pick<User, 'interests' | 'city' | 'career'>
): string[] {
  const sharedInterests = userA.interests.filter(i => userB.interests.includes(i));

  const templates: string[] = [];

  if (sharedInterests.length > 0) {
    templates.push(
      `I noticed we both love ${sharedInterests[0]}! What's your take on it?`,
      `${sharedInterests[0]} fan here too — what's your favorite part about it?`
    );
  }

  if (userB.city) {
    templates.push(`How long have you been in ${userB.city}? Any hidden gems I should know about?`);
  }

  if (userB.career) {
    templates.push(`Your work in ${userB.career} sounds fascinating — what do you love most about it?`);
  }

  templates.push(
    "If you could travel anywhere in Somalia right now, where would you go?",
    "What's your idea of a perfect weekend?",
    "Coffee or tea person? And where's your go-to spot?",
  );

  return templates.slice(0, 3);
}
