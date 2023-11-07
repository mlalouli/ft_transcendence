/*
  Warnings:

  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_followedId_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_followerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Blocked" INTEGER[],
ADD COLUMN     "Blocking" INTEGER[],
ADD COLUMN     "Blocks" INTEGER[],
ADD COLUMN     "Followed" INTEGER[],
ADD COLUMN     "Following" INTEGER[],
ADD COLUMN     "Friends" INTEGER[];

-- DropTable
DROP TABLE "Friends";
