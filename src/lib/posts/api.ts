import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, or, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { comments, generateSlug, likes, posts, user } from "@/db/schema";
import { userAuthMiddleware } from "@/lib/auth/api";

export const postSchema = z.object({
	title: z.string().max(255),
	body: z.string().min(125),
	communityId: z.string().min(5),
});

export const createPostServer = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(postSchema)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { body, title, communityId } = data;
		const generatedSlug = generateSlug(title);

		const results = await db
			.insert(posts)
			.values({ userId, body, title, communityId, slug: generatedSlug, id: generatedSlug })
			.returning();

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

export type TopPostPeriod = "1d" | "7d" | "30d" | "365d";

function getDateCutoff(period: TopPostPeriod): Date {
	const now = new Date();

	switch (period) {
		case "1d":
			now.setDate(now.getDate() - 1);
			break;
		case "7d":
			now.setDate(now.getDate() - 7);
			break;
		case "30d":
			now.setDate(now.getDate() - 30);
			break;
		case "365d":
			now.setDate(now.getDate() - 365);
			break;
	}

	return now;
}

export const fetchTopPostsPaginated = createServerFn()
	.inputValidator(
		z.object({
			limit: z.number().default(10),
			offset: z.number().default(0),
			period: z.enum(["1d", "7d", "30d", "365d"]).default("365d"),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const { limit, offset } = data;
		const cutoffDate = getDateCutoff(data.period);

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				body: posts.body,
				communityId: posts.communityId,
				username: user.name,
				createdAt: posts.createdAt,
				commentCount: posts.commentCount,
				likeCount: posts.likeCount,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				recentLikeCount: sql<number>`COUNT(${likes.postId})`.as("recent_like_count"),
			})
			.from(posts)
			.leftJoin(
				likes,
				sql`${likes.postId} = ${posts.id}
         		AND ${likes.createdAt} >= ${cutoffDate}`,
			)
			.leftJoin(user, eq(user.id, posts.userId))
			.groupBy(posts.id, user.name)
			.orderBy(desc(sql`recent_like_count`), desc(posts.id))
			.offset(offset)
			.limit(limit);

		const filteredResults = results.filter((item) => {
			return item.username !== null && item.communityId !== null;
		});

		return {
			results: filteredResults,
			nextOffset: results.length === limit ? offset + limit : null,
		};
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
				username: user.name,
				communityId: posts.communityId,
				createdAt: posts.createdAt,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
			})
			.from(posts)
			.leftJoin(user, eq(posts.userId, user.id))
			.leftJoin(likes, eq(posts.id, likes.postId))
			.groupBy(posts.id, user.name)
			.orderBy(desc(posts.createdAt))
			.offset(offset)
			.limit(limit);

		const filteredResults = results.filter((item) => {
			return item.username !== null && item.communityId !== null;
		});

		return {
			results: filteredResults,
			nextOffset: results.length === limit ? offset + limit : null,
		};
	});

export const fetchPostBySlugServer = createServerFn()
	.inputValidator(
		z.object({
			postIdOrSlug: z.string(),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { postIdOrSlug } = data;

		await db
			.update(posts)
			.set({
				likeCount: sql<number>`
				(
					SELECT COUNT(*)
					FROM ${likes}
					WHERE ${likes.postId} = ${postIdOrSlug}
				)
			`,
				commentCount: sql<number>`
				(
					SELECT COUNT(*)
					FROM ${comments}
					WHERE ${comments.postId} = ${postIdOrSlug}
				)
			`,
			})
			.where(eq(posts.id, postIdOrSlug))
			.returning();

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				slug: posts.slug,
				username: user.name,
				communityId: posts.communityId,
				createdAt: posts.createdAt,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
			})
			.from(posts)
			.leftJoin(likes, eq(posts.id, likes.postId))
			.leftJoin(user, eq(posts.userId, user.id))
			.groupBy(posts.id, user.name)
			.where(or(eq(posts.id, postIdOrSlug), eq(posts.slug, postIdOrSlug)))
			.limit(1);

		if (results.length === 0) {
			throw notFound();
		}

		return results;
	});

export const fetchTopPostByCommunity = createServerFn()
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			communityId: z.string(),
			limit: z.number().default(10),
			offset: z.number().default(0),
		}),
	)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { limit, offset, communityId } = data;

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				slug: posts.slug,
				username: user.name,
				communityId: posts.communityId,
				createdAt: posts.createdAt,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
			})
			.from(posts)
			.leftJoin(likes, eq(posts.id, likes.postId))
			.leftJoin(user, eq(posts.userId, user.id))
			.groupBy(posts.id, user.name)
			.where(eq(posts.communityId, communityId))
			.limit(limit)
			.offset(offset);

		return {
			results,
			nextOffset: results.length === limit ? offset + limit : null,
		};
	});

export const fetchPostByCommunityServer = createServerFn()
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			communityId: z.string(),
			limit: z.number().default(10),
			offset: z.number().default(0),
			period: z.enum(["1d", "7d", "30d", "365d"]).default("365d"),
		}),
	)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { limit, offset, communityId, period } = data;
		const cutoffDate = getDateCutoff(period);

		const results = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				body: posts.body,
				communityId: posts.communityId,
				username: user.name,
				createdAt: posts.createdAt,
				commentCount: posts.commentCount,
				likeCount: posts.likeCount,
				likedByUser: sql<boolean>`BOOL_OR(${eq(likes.userId, userId)})`,
				recentLikeCount: sql<number>`COUNT(${likes.postId})`.as("recent_like_count"),
			})
			.from(posts)
			.leftJoin(
				likes,
				sql`${likes.postId} = ${posts.id}
         		AND ${likes.createdAt} >= ${cutoffDate}`,
			)
			.leftJoin(user, eq(user.id, posts.userId))
			.groupBy(posts.id, user.name)
			.where(eq(posts.communityId, communityId))
			.orderBy(desc(sql`recent_like_count`), desc(posts.id))
			.offset(offset)
			.limit(limit);

		return {
			results,
			nextOffset: results.length === limit ? offset + limit : null,
		};
	});
