-- CreateEnum
CREATE TYPE "TempRoomStatus" AS ENUM ('active', 'expired');

-- CreateTable
CREATE TABLE "TempRoom" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "usersEmails" TEXT[],
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TempRoomStatus" NOT NULL DEFAULT 'active',
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "roomName" TEXT,

    CONSTRAINT "TempRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempMessage" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageType" TEXT NOT NULL DEFAULT 'user',
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModelUsed" TEXT,

    CONSTRAINT "TempMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempRoom_roomId_key" ON "TempRoom"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "TempRoom_roomCode_key" ON "TempRoom"("roomCode");

-- CreateIndex
CREATE INDEX "TempRoom_roomCode_idx" ON "TempRoom"("roomCode");

-- CreateIndex
CREATE INDEX "TempRoom_expiryTime_idx" ON "TempRoom"("expiryTime");

-- CreateIndex
CREATE INDEX "TempRoom_status_idx" ON "TempRoom"("status");

-- CreateIndex
CREATE INDEX "TempRoom_createdBy_idx" ON "TempRoom"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "TempMessage_messageId_key" ON "TempMessage"("messageId");

-- CreateIndex
CREATE INDEX "TempMessage_roomId_idx" ON "TempMessage"("roomId");

-- CreateIndex
CREATE INDEX "TempMessage_userEmail_idx" ON "TempMessage"("userEmail");

-- CreateIndex
CREATE INDEX "TempMessage_timestamp_idx" ON "TempMessage"("timestamp");

-- AddForeignKey
ALTER TABLE "TempRoom" ADD CONSTRAINT "TempRoom_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempMessage" ADD CONSTRAINT "TempMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "TempRoom"("roomId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempMessage" ADD CONSTRAINT "TempMessage_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
