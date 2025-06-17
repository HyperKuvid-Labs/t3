/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "roomId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_roomId_key" ON "Conversation"("roomId");
