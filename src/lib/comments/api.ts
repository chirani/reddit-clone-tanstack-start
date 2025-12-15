import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { comments, posts, user } from "@/db/schema";
import { userAuthMiddleware } from "../auth/api";

export const postComment = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			postId: z.string(),
			comment: z.string(),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const { postId, comment } = data;
		if (comment.length === 0) {
			throw Error("Comment can't be empty");
		}
		const results = await db.insert(comments).values({ postId, comment, userId }).returning();

		return results;
	});

export const deleteComment = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			commentId: z.string(),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.user.id;
		const { commentId } = data;
		const results = await db
			.update(comments)
			.set({ deletedAt: new Date() })
			.where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
			.returning();

		return results;
	});

export const fetchPostComments = createServerFn()
	.inputValidator(
		z.object({
			slug: z.string(),
			limit: z.number().default(3),
			offset: z.number().default(0),
			id: z.string().nullable().default(null),
		}),
	)
	.handler(async ({ data }) => {
		const { limit, offset, id } = data;

		async function fetchPosts(postId: string) {
			const results = await db
				.select({
					id: comments.id,
					username: user.name,
					comment: comments.comment,
					createdAt: comments.createdAt,
				})
				.from(comments)
				.leftJoin(user, eq(comments.userId, user.id))
				.groupBy(comments.id, user.name)
				.where(eq(comments.postId, postId))
				.orderBy(desc(comments.createdAt))
				.limit(limit)
				.offset(offset);

			return results;
		}

		if (id !== null) {
			const results = await fetchPosts(id);
			return { results, nextOffset: results.length === limit ? offset + limit : null };
		}

		const postId = await db
			.select({ id: posts.id })
			.from(posts)
			.where(eq(posts.slug, data.slug))
			.limit(1);

		if (postId.length === 0) {
			const error = new Error("Post doesn't exist in DB");
			throw error;
		}

		const results = await fetchPosts(postId[0].id);

		return { results, nextOffset: results.length === limit ? offset + limit : null };
	});
