import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { userAuthMiddleware } from "@/lib/auth/api";

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
