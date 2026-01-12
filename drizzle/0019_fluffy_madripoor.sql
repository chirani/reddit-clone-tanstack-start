CREATE TYPE "public"."notification_type" AS ENUM('post_like', 'post_comment');--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"for_user_id" text NOT NULL,
	"post_id" text,
	"seen_at" timestamp,
	"notificationType" "notification_type" DEFAULT 'post_like' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_for_user_id_user_id_fk" FOREIGN KEY ("for_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;