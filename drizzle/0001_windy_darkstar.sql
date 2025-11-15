ALTER TABLE "todos" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "body" text NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;