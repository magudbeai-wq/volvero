-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'CHRISTIANITY', 'SECULAR', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'SOME_COLLEGE', 'BACHELORS', 'MASTERS', 'PHD', 'VOCATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipGoal" AS ENUM ('MARRIAGE', 'LONG_TERM', 'SHORT_TERM', 'FRIENDSHIP', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'GOLD');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LEFT', 'RIGHT', 'SUPER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'MATCHED', 'UNMATCHED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE', 'GIF', 'STICKER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'UNDERAGE', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SPEND', 'REFUND');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('MISSED', 'COMPLETED', 'REJECTED', 'ONGOING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH', 'MESSAGE', 'LIKE', 'SUPER_LIKE', 'PROFILE_VISIT', 'SUBSCRIPTION', 'SYSTEM', 'STORY', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DateEventStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "bio" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationUpdatedAt" TIMESTAMP(3),
    "religion" "Religion",
    "maritalStatus" "MaritalStatus",
    "educationLevel" "EducationLevel",
    "career" TEXT,
    "company" TEXT,
    "height" INTEGER,
    "relationshipGoal" "RelationshipGoal",
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personalityTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lifestylePrefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profilePhoto" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voiceIntroUrl" TEXT,
    "introVideoUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "selfieVerifyUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "coinBalance" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "showDistance" BOOLEAN NOT NULL DEFAULT true,
    "showAge" BOOLEAN NOT NULL DEFAULT true,
    "isIncognito" BOOLEAN NOT NULL DEFAULT false,
    "maxDistance" INTEGER NOT NULL DEFAULT 50,
    "minAgePreference" INTEGER NOT NULL DEFAULT 18,
    "maxAgePreference" INTEGER NOT NULL DEFAULT 60,
    "achievementBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "referralCode" TEXT,
    "referredBy" TEXT,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "likesGiven" INTEGER NOT NULL DEFAULT 0,
    "likesReceived" INTEGER NOT NULL DEFAULT 0,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'MATCHED',
    "compatibility" DOUBLE PRECISION,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "lastMessage" TEXT,
    "lastMsgAt" TIMESTAMP(3),
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_call_logs" (
    "id" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'ONGOING',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "mediaUrl" TEXT,
    "replyToId" TEXT,
    "reactions" JSONB DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_boosts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "caption" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 5,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "viewers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_visits" (
    "id" TEXT NOT NULL,
    "visitedId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "isShown" BOOLEAN NOT NULL DEFAULT false,
    "isActedOn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dailyUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalSwipes" INTEGER NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "date_events" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "proposedAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "venueName" TEXT,
    "status" "DateEventStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "date_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "users_supabaseId_idx" ON "users"("supabaseId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_latitude_longitude_idx" ON "users"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "users_subscriptionTier_idx" ON "users"("subscriptionTier");

-- CreateIndex
CREATE INDEX "users_isOnline_idx" ON "users"("isOnline");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "swipes_giverId_idx" ON "swipes"("giverId");

-- CreateIndex
CREATE INDEX "swipes_receiverId_idx" ON "swipes"("receiverId");

-- CreateIndex
CREATE INDEX "swipes_direction_idx" ON "swipes"("direction");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_giverId_receiverId_key" ON "swipes"("giverId", "receiverId");

-- CreateIndex
CREATE INDEX "matches_userAId_idx" ON "matches"("userAId");

-- CreateIndex
CREATE INDEX "matches_userBId_idx" ON "matches"("userBId");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "matches_userAId_userBId_key" ON "matches"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_matchId_key" ON "conversations"("matchId");

-- CreateIndex
CREATE INDEX "conversations_userAId_idx" ON "conversations"("userAId");

-- CreateIndex
CREATE INDEX "conversations_userBId_idx" ON "conversations"("userBId");

-- CreateIndex
CREATE INDEX "conversations_lastMsgAt_idx" ON "conversations"("lastMsgAt");

-- CreateIndex
CREATE INDEX "video_call_logs_callerId_idx" ON "video_call_logs"("callerId");

-- CreateIndex
CREATE INDEX "video_call_logs_receiverId_idx" ON "video_call_logs"("receiverId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "coin_transactions_userId_idx" ON "coin_transactions"("userId");

-- CreateIndex
CREATE INDEX "profile_boosts_userId_idx" ON "profile_boosts"("userId");

-- CreateIndex
CREATE INDEX "profile_boosts_isActive_idx" ON "profile_boosts"("isActive");

-- CreateIndex
CREATE INDEX "profile_boosts_expiresAt_idx" ON "profile_boosts"("expiresAt");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_reportedId_idx" ON "reports"("reportedId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "blocks_blockerId_idx" ON "blocks"("blockerId");

-- CreateIndex
CREATE INDEX "blocks_blockedId_idx" ON "blocks"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_blockerId_blockedId_key" ON "blocks"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "stories_userId_idx" ON "stories"("userId");

-- CreateIndex
CREATE INDEX "stories_expiresAt_idx" ON "stories"("expiresAt");

-- CreateIndex
CREATE INDEX "profile_visits_visitedId_idx" ON "profile_visits"("visitedId");

-- CreateIndex
CREATE INDEX "profile_visits_visitorId_idx" ON "profile_visits"("visitorId");

-- CreateIndex
CREATE INDEX "profile_visits_createdAt_idx" ON "profile_visits"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_idx" ON "ai_recommendations"("userId");

-- CreateIndex
CREATE INDEX "ai_recommendations_score_idx" ON "ai_recommendations"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ai_recommendations_userId_targetId_key" ON "ai_recommendations"("userId", "targetId");

-- CreateIndex
CREATE INDEX "admin_logs_adminId_idx" ON "admin_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_logs_action_idx" ON "admin_logs"("action");

-- CreateIndex
CREATE INDEX "admin_logs_createdAt_idx" ON "admin_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "platform_stats_date_key" ON "platform_stats"("date");

-- CreateIndex
CREATE INDEX "date_events_matchId_idx" ON "date_events"("matchId");

-- CreateIndex
CREATE INDEX "date_events_proposerId_idx" ON "date_events"("proposerId");

-- CreateIndex
CREATE INDEX "date_events_receiverId_idx" ON "date_events"("receiverId");

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_call_logs" ADD CONSTRAINT "video_call_logs_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_call_logs" ADD CONSTRAINT "video_call_logs_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_boosts" ADD CONSTRAINT "profile_boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_visitedId_fkey" FOREIGN KEY ("visitedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "date_events" ADD CONSTRAINT "date_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "date_events" ADD CONSTRAINT "date_events_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "date_events" ADD CONSTRAINT "date_events_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

