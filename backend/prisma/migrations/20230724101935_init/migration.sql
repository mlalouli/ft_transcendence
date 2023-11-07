-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "id_42" INTEGER NOT NULL,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "twoFAState" BOOLEAN NOT NULL,
    "twoFACode" TEXT NOT NULL,
    "xp" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
