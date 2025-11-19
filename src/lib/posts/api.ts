import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { generateSlug, likes, posts } from "@/db/schema";
import { userAuthMiddleware } from "@/lib/auth/hooks";

export const postSchema = z.object({
	title: z.string().max(255),
	body: z.string().min(125),
});

export const createPostServer = createServerFn({ method: "POST" })
	.inputValidator(postSchema)
	.handler(async ({ data }) => {
		const { body, title } = data;
		const results = await db
			.insert(posts)
			.values({ body, title, slug: generateSlug(title) })
			.returning();

		return results;
	});

export const removeLikeServer = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			postId: z.string(),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const results = await db
			.delete(likes)
			.where(and(eq(likes.postId, data.postId), eq(likes.userId, userId)))
			.returning();

		return results;
	});

export const addLikeServer = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			postId: z.string(),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const results = await db.insert(likes).values({ postId: data.postId, userId }).returning();

		return results;
	});

export const fetchPostsServer = createServerFn()
	.middleware([userAuthMiddleware])
	.handler(async ({ context }) => {
		const userId = context.user.id;

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				createdAt: posts.createdAt,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				likeCount: sql<number>`COUNT(${likes.postId})`,
			})
			.from(posts)
			.leftJoin(likes, eq(posts.id, likes.postId))
			.groupBy(posts.id)
			.orderBy(desc(posts.createdAt))
			.limit(10);

		return results;
	});
