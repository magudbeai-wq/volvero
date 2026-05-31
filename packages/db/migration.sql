-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SPEND', 'REFUND');
CREATE TYPE "CallStatus" AS ENUM ('MISSED', 'COMPLETED', 'REJECTED', 'ONGOING');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "coinBalance" INTEGER NOT NULL DEFAULT 0;

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

-- CreateIndex
CREATE INDEX "video_call_logs_callerId_idx" ON "video_call_logs"("callerId");
CREATE INDEX "video_call_logs_receiverId_idx" ON "video_call_logs"("receiverId");
CREATE INDEX "coin_transactions_userId_idx" ON "coin_transactions"("userId");
CREATE INDEX "profile_boosts_userId_idx" ON "profile_boosts"("userId");
CREATE INDEX "profile_boosts_isActive_idx" ON "profile_boosts"("isActive");
CREATE INDEX "profile_boosts_expiresAt_idx" ON "profile_boosts"("expiresAt");

-- AddForeignKey
ALTER TABLE "video_call_logs" ADD CONSTRAINT "video_call_logs_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_call_logs" ADD CONSTRAINT "video_call_logs_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profile_boosts" ADD CONSTRAINT "profile_boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
