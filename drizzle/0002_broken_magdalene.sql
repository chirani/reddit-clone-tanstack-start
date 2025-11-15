ALTER TABLE "todos" RENAME TO "posts";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "todos_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;