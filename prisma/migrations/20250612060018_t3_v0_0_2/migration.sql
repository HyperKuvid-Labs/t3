/*
  Warnings:

  - You are about to drop the column `authId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ModelThing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authProvider` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('jwt', 'oauth');

-- DropForeignKey
ALTER TABLE "QueryResp" DROP CONSTRAINT "QueryResp_modelId_fkey";

-- AlterTable
ALTER TABLE "QueryResp" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authId",
DROP COLUMN "username",
ADD COLUMN     "name" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL,
DROP COLUMN "authProvider",
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL;

-- DropTable
DROP TABLE "ModelThing";

-- CreateTable
CREATE TABLE "Model" (
    "modelId" SERIAL NOT NULL,
    "type" "ModelType" NOT NULL DEFAULT 'ollama',
    "name" "ModelNameOllama" NOT NULL DEFAULT 'gemma3_27b',
    "nameOnline" "ModelNameOnline" NOT NULL DEFAULT 'gemini2_5_flash',
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("modelId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentMessageId" INTEGER,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "originalContent" TEXT,
    "editReason" TEXT,
    "modelId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Model_isActive_idx" ON "Model"("isActive");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_parentMessageId_idx" ON "Message"("parentMessageId");

-- CreateIndex
CREATE INDEX "Conversation_roomName_idx" ON "Conversation"("roomName");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("modelId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResp" ADD CONSTRAINT "QueryResp_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("modelId") ON DELETE RESTRICT ON UPDATE CASCADE;
