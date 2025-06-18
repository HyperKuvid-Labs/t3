/*
  Warnings:

  - The values [claude3_5] on the enum `ModelNameOnline` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModelNameOnline_new" AS ENUM ('gemini2_5_flash', 'gemini2_5_pro', 'deepseekv3', 'claude4_0');
ALTER TABLE "Model" ALTER COLUMN "nameOnline" TYPE "ModelNameOnline_new" USING ("nameOnline"::text::"ModelNameOnline_new");
ALTER TYPE "ModelNameOnline" RENAME TO "ModelNameOnline_old";
ALTER TYPE "ModelNameOnline_new" RENAME TO "ModelNameOnline";
DROP TYPE "ModelNameOnline_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "TempMessage" DROP CONSTRAINT "TempMessage_userEmail_fkey";

-- AlterTable
ALTER TABLE "TempMessage" ALTER COLUMN "userEmail" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TempMessage" ADD CONSTRAINT "TempMessage_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
