/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id42` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_pseudo_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "id42",
DROP COLUMN "password",
ADD COLUMN     "login" TEXT,
ALTER COLUMN "pseudo" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "twoFAState" SET DEFAULT false,
ALTER COLUMN "twoFACode" DROP NOT NULL,
ALTER COLUMN "xp" DROP NOT NULL;
