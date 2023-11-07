/*
  Warnings:

  - You are about to drop the column `lvl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lvl",
ALTER COLUMN "xp" SET DEFAULT 0.00,
ALTER COLUMN "xp" SET DATA TYPE DOUBLE PRECISION;
