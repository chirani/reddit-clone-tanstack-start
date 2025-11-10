import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { account, session, user, verification } from "../../auth-schema";

export { account, session, user, verification };

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
