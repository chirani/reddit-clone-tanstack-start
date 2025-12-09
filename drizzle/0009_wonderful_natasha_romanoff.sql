ALTER TABLE "community-admins" RENAME COLUMN "form_id" TO "community_id";--> statement-breakpoint
ALTER TABLE "community-admins" DROP CONSTRAINT "community-admins_form_id_communities_id_fk";
--> statement-breakpoint
DROP INDEX "form_role_unique";--> statement-breakpoint
ALTER TABLE "community-admins" ADD CONSTRAINT "community-admins_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "commuinty_role_unique" ON "community-admins" USING btree ("community_id","role");