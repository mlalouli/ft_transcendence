/*
  Warnings:

  - You are about to alter the column `xp` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lvl" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "xp" SET DEFAULT 0,
ALTER COLUMN "xp" SET DATA TYPE INTEGER;
