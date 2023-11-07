/*
  Warnings:

  - You are about to drop the column `muteDuration` on the `ChannelMute` table. All the data in the column will be lost.
  - You are about to drop the column `mutedAt` on the `ChannelMute` table. All the data in the column will be lost.
  - Made the column `name` on table `Channel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hasPassword` on table `Channel` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `finishAt` to the `ChannelMute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "hasPassword" SET NOT NULL,
ALTER COLUMN "hasPassword" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ChannelMute" DROP COLUMN "muteDuration",
DROP COLUMN "mutedAt",
ADD COLUMN     "finishAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "muteAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
