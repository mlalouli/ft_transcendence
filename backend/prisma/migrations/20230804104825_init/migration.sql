/*
  Warnings:

  - Made the column `xp` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "xp" SET NOT NULL;
