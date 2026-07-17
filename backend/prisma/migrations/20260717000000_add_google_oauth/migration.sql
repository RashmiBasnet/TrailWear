-- Google sign-in.
--
-- `password` becomes nullable: accounts created through Google never have one.
-- Existing rows keep their hash, so this is safe to apply to live data.
--
-- `googleId` holds Google's `sub` claim and is UNIQUE, so a single Google
-- account cannot be attached to two TrailWear users. NULL for password accounts,
-- and Postgres allows many NULLs under a unique index, so unlinked accounts do
-- not collide with each other.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
