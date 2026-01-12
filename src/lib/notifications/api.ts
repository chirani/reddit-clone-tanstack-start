import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { posts, userNotifications } from "@/db/schema";
import { userAuthMiddleware } from "../auth/api";

export const CreateNotificationSchema = z.object({
	postId: z.string(),
	notificationType: z.enum(["post_like", "post_comment"]),
});

export const createUserNotifications = createServerFn({ method: "POST" })
	.inputValidator(CreateNotificationSchema)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const { postId, notificationType } = data;
		const { user } = context;
		const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

		if (post.length) {
			throw Error("Post Not Enough");
		}

		const results = await db
			.insert(userNotifications)
			.values({
				byUserId: user.id,
				forUserId: post[0].userId ?? "",
				notificationType,
				postId,
			})
			.returning();

		return results;
	});

export const fetchPendingNotifications = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			offset: z.number().default(0),
			limit: z.number().default(6),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const { limit, offset } = data;
		const { user } = context;

		const results = await db
			.select()
			.from(userNotifications)
			.where(and(eq(userNotifications.forUserId, user.id), isNull(userNotifications.seenAt)))
			.limit(limit)
			.offset(offset);

		return {
			results,
			nextOffset: results.length === limit ? offset + limit : null,
		};
	});

export const setNotificationAsSeen = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			ids: z.array(z.string()),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const { user } = context;
		const results = await db
			.update(userNotifications)
			.set({
				seenAt: new Date(),
			})
			.where(and(eq(userNotifications.forUserId, user.id), inArray(userNotifications.id, data.ids)))
			.returning();

		return { success: Boolean(results.length) };
	});
