/*
  Warnings:

  - You are about to drop the column `twoFACode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFAState` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "twoFACode",
DROP COLUMN "twoFAState";
