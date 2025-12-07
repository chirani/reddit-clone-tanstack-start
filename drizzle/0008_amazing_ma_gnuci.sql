CREATE TYPE "public"."role" AS ENUM('admin', 'mod', 'monitor');--> statement-breakpoint
CREATE TABLE "community-admins" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"form_id" text,
	"role" "role",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "description" varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "tags" varchar[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "community-admins" ADD CONSTRAINT "community-admins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community-admins" ADD CONSTRAINT "community-admins_form_id_communities_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "form_role_unique" ON "community-admins" USING btree ("form_id","role");