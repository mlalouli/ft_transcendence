/*
  Warnings:

  - A unique constraint covering the columns `[pseudo]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_pseudo_key" ON "user"("pseudo");
