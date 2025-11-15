import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account, session, user, verification } from "../../auth-schema";

export { account, session, user, verification };

export const posts = pgTable("posts", {
	id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
	userId: text("user_id").references(() => user.id),
	title: text("title").notNull(),
	body: text("body").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
