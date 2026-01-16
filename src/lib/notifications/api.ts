import { createServerFn } from "@tanstack/react-start";
import { and, eq, getTableColumns, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { posts, userNotifications, user as userSchema } from "@/db/schema";
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

		if (!post.length) {
			throw Error("Post Doesn't Exist");
		}
		const forUserId = post[0].userId ?? "null";
		const results = await db
			.insert(userNotifications)
			.values({
				byUserId: user.id,
				forUserId,
				notificationType,
				postId,
			})
			.returning();

		return results;
	});

export const fetchPendingNotifications = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			pendingOnly: z.boolean().default(true),
			offset: z.number().default(0),
			limit: z.number().default(6),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ context, data }) => {
		const { limit, offset, pendingOnly } = data;
		const { user } = context;

		const condition = pendingOnly
			? and(eq(userNotifications.forUserId, user.id), isNull(userNotifications.seenAt))
			: and(eq(userNotifications.forUserId, user.id));

		const results = await db
			.select({ ...getTableColumns(userNotifications), byUsername: userSchema.name })
			.from(userNotifications)
			.leftJoin(userSchema, eq(userNotifications.byUserId, userSchema.id))
			.groupBy(userNotifications.id, userSchema.name)
			.where(condition)
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
