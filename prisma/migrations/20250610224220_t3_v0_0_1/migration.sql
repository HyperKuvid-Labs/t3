-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('ollama', 'online');

-- CreateEnum
CREATE TYPE "ModelNameOllama" AS ENUM ('gemma3_27b', 'llama3_3_70b', 'deepseek_r1_70b', 'phi4_14b');

-- CreateEnum
CREATE TYPE "ModelNameOnline" AS ENUM ('gemini2_5_flash', 'gemini2_5_pro', 'deepseekv3', 'claude3_5');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authProvider" TEXT DEFAULT 'jwt',
    "authId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelThing" (
    "modelId" SERIAL NOT NULL,
    "type" "ModelType" NOT NULL DEFAULT 'ollama',
    "name" "ModelNameOllama" NOT NULL DEFAULT 'gemma3_27b',
    "nameOnline" "ModelNameOnline" NOT NULL DEFAULT 'gemini2_5_flash',
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelThing_pkey" PRIMARY KEY ("modelId")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "roomName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryResp" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "modelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,

    CONSTRAINT "QueryResp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserConversations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserConversations_AB_unique" ON "_UserConversations"("A", "B");

-- CreateIndex
CREATE INDEX "_UserConversations_B_index" ON "_UserConversations"("B");

-- AddForeignKey
ALTER TABLE "QueryResp" ADD CONSTRAINT "QueryResp_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ModelThing"("modelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResp" ADD CONSTRAINT "QueryResp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResp" ADD CONSTRAINT "QueryResp_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserConversations" ADD CONSTRAINT "_UserConversations_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserConversations" ADD CONSTRAINT "_UserConversations_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
