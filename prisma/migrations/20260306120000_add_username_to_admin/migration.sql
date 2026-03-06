-- AlterTable: Make email optional, add username
ALTER TABLE "Admin" ADD COLUMN "username" TEXT;

-- Backfill: Set username from email prefix for existing rows
UPDATE "Admin" SET "username" = SPLIT_PART("email", '@', 1) WHERE "username" IS NULL;

-- Make username required and unique
ALTER TABLE "Admin" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- Make email optional
ALTER TABLE "Admin" ALTER COLUMN "email" DROP NOT NULL;
