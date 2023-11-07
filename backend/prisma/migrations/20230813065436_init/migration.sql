/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `hasPassword` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_ownerId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "ownerId",
ADD COLUMN     "hasPassword" BOOLEAN NOT NULL,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_ChannelOwners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelOwners_AB_unique" ON "_ChannelOwners"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelOwners_B_index" ON "_ChannelOwners"("B");

-- AddForeignKey
ALTER TABLE "_ChannelOwners" ADD CONSTRAINT "_ChannelOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelOwners" ADD CONSTRAINT "_ChannelOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
