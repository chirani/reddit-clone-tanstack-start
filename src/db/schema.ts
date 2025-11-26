import { sql } from "drizzle-orm";
import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { account, session, user, verification } from "../../auth-schema";

export { account, session, user, verification };

export function generateSlug(text: string) {
	const base = text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") // replace non-alphanumerics with dash
		.replace(/^-+|-+$/g, ""); // remove starting/ending dashes

	const id = nanoid(6); // short unique ID

	return `${base}-${id}`;
}

export const posts = pgTable("posts", {
	id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
	userId: text("user_id").references(() => user.id),
	title: text("title").notNull(),
	slug: text("slug").notNull(),
	body: text("body").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable(
	"likes",
	{
		userId: text("user_id").references(() => user.id),
		postId: text("post_id").references(() => posts.id),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const comments = pgTable(
	"comments",
	{
		userId: text("user_id").references(() => user.id),
		postId: text("post_id").references(() => posts.id),
		comment: text("comment").notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at"),
		deletedAt: timestamp("deleted_at"),
	},
	(table) => [primaryKey({ columns: [table.postId, table.userId] })],
);
