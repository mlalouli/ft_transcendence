/*
  Warnings:

  - You are about to drop the `ChannelBan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelBan" DROP CONSTRAINT "ChannelBan_ChannelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelBan" DROP CONSTRAINT "ChannelBan_userId_fkey";

-- DropIndex
DROP INDEX "User_id_login_key";

-- DropTable
DROP TABLE "ChannelBan";

-- CreateTable
CREATE TABLE "_ChannelBans" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelBans_AB_unique" ON "_ChannelBans"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelBans_B_index" ON "_ChannelBans"("B");

-- AddForeignKey
ALTER TABLE "_ChannelBans" ADD CONSTRAINT "_ChannelBans_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelBans" ADD CONSTRAINT "_ChannelBans_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
