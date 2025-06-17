/*
  Warnings:

  - Added the required column `deletedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('user', 'ai', 'system');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('team', 'direct', 'ai_enabled');

-- DropIndex
DROP INDEX "Conversation_roomName_idx";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'team';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "aiPrompt" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'user',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ConversationInvitation" (
    "id" SERIAL NOT NULL,
    "inviterUserId" INTEGER NOT NULL,
    "invitedUserId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationInvitation_invitedUserId_status_idx" ON "ConversationInvitation"("invitedUserId", "status");

-- CreateIndex
CREATE INDEX "ConversationInvitation_conversationId_idx" ON "ConversationInvitation"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationInvitation_status_idx" ON "ConversationInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationInvitation_inviterUserId_invitedUserId_conversa_key" ON "ConversationInvitation"("inviterUserId", "invitedUserId", "conversationId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE INDEX "Conversation_aiEnabled_idx" ON "Conversation"("aiEnabled");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_messageType_idx" ON "Message"("messageType");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Model_type_idx" ON "Model"("type");

-- CreateIndex
CREATE INDEX "QueryResp_userId_idx" ON "QueryResp"("userId");

-- CreateIndex
CREATE INDEX "QueryResp_conversationId_idx" ON "QueryResp"("conversationId");

-- CreateIndex
CREATE INDEX "QueryResp_createdAt_idx" ON "QueryResp"("createdAt");

-- CreateIndex
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");

-- AddForeignKey
ALTER TABLE "ConversationInvitation" ADD CONSTRAINT "ConversationInvitation_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationInvitation" ADD CONSTRAINT "ConversationInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationInvitation" ADD CONSTRAINT "ConversationInvitation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
