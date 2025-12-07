import { sql } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { account, session, user, verification } from "../../auth-schema.ts";

export { account, session, user, verification };

const timestamps = {
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at"),
	deletedAt: timestamp("deleted_at"),
};

export function generateSlug(text: string) {
	const base = text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") // replace non-alphanumerics with dash
		.replace(/^-+|-+$/g, ""); // remove starting/ending dashes

	const id = nanoid(8); // short unique ID

	return `${base}-${id}`;
}

export const posts = pgTable("posts", {
	id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
	userId: text("user_id").references(() => user.id),
	title: text("title").notNull(),
	slug: text("slug").notNull(),
	body: text("body").notNull(),
	...timestamps,
});

export const likes = pgTable(
	"likes",
	{
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const communities = pgTable("communities", {
	id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
	title: varchar("title", { length: 128 }),
	description: varchar("description", { length: 512 }).notNull(),
	tags: varchar("tags").array().notNull().default([]),
	...timestamps,
});
export const roleEnum = pgEnum("role", ["admin", "mod", "monitor"]);

export const communityAdmins = pgTable(
	"community-admins",
	{
		id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
		user_id: text("user_id")
			.references(() => user.id)
			.notNull(),
		communityId: text("form_id").references(() => communities.id),
		role: roleEnum(),
		...timestamps,
	},
	(table) => {
		return {
			formRoleUnique: uniqueIndex("form_role_unique").on(table.communityId, table.role),
		};
	},
);

export const comments = pgTable("comments", {
	id: text("id").default(sql`gen_random_uuid()`).primaryKey(),
	userId: text("user_id")
		.references(() => user.id)
		.notNull(),
	postId: text("post_id")
		.references(() => posts.id)
		.notNull(),
	comment: text("comment").notNull(),
	...timestamps,
});
