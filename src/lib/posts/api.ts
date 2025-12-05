import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { generateSlug, likes, posts, user } from "@/db/schema";
import { userAuthMiddleware } from "@/lib/auth/api";

export const postSchema = z.object({
	title: z.string().max(255),
	body: z.string().min(125),
});

export const createPostServer = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(postSchema)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { body, title } = data;
		const results = await db
			.insert(posts)
			.values({ userId, body, title, slug: generateSlug(title) })
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
				slug: posts.slug,
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

export const fetchPostsPaginatedServer = createServerFn()
	.inputValidator(
		z.object({
			limit: z.number().default(10),
			offset: z.number().default(0),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const { limit, offset } = data;

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				slug: posts.slug,
				createdAt: posts.createdAt,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				likeCount: sql<number>`COUNT(${likes.postId})`,
			})
			.from(posts)
			.leftJoin(likes, eq(posts.id, likes.postId))
			.groupBy(posts.id)
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset(offset);

		return { results, nextOffset: results.length === limit ? offset + limit : null };
	});

export const fetchPostBySlugServer = createServerFn()
	.inputValidator(
		z.object({
			slug: z.string(),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ data, context }) => {
		const userId = context.user.id;

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				slug: posts.slug,
				username: user.name,
				createdAt: posts.createdAt,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				likeCount: sql<number>`COUNT(${likes.postId})`,
			})
			.from(posts)
			.leftJoin(likes, eq(posts.id, likes.postId))
			.leftJoin(user, eq(posts.userId, user.id))
			.groupBy(posts.id, user.name)
			.where(eq(posts.slug, data.slug))
			.limit(1);

		if (results.length === 0) {
			throw notFound();
		}

		return results;
	});
