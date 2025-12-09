ALTER TABLE "community-admins"
DROP CONSTRAINT IF EXISTS "commuinty_role_unique";
DROP INDEX IF EXISTS "commuinty_role_unique";
ALTER TABLE "community-admins" ALTER COLUMN "community_id" SET NOT NULL;