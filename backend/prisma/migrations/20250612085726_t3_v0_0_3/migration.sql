-- AlterTable
ALTER TABLE "Model" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "nameOnline" DROP NOT NULL,
ALTER COLUMN "nameOnline" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentCoversationId" INTEGER;

-- CreateIndex
CREATE INDEX "User_currentCoversationId_idx" ON "User"("currentCoversationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCoversationId_fkey" FOREIGN KEY ("currentCoversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
