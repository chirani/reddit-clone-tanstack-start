CREATE TABLE "communities" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(128),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp;