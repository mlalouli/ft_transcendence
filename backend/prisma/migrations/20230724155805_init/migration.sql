/*
  Warnings:

  - Added the required column `chihaja` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test27` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoFACode` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoFAState` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chihaja" TEXT NOT NULL,
ADD COLUMN     "test" INTEGER NOT NULL,
ADD COLUMN     "test27" TEXT NOT NULL,
ADD COLUMN     "twoFACode" TEXT NOT NULL,
ADD COLUMN     "twoFAState" BOOLEAN NOT NULL,
ADD COLUMN     "xp" DOUBLE PRECISION NOT NULL;
