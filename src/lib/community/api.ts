import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { communities, communityAdmins } from "@/db/schema";
import { userAuthMiddleware } from "../auth/api";

export const communitySchema = z.object({
	title: z.string().min(3),
	description: z.string().min(100),
	tags: z.array(z.string()).default([]),
});
export type Community = z.infer<typeof communitySchema>;

export const createCommunity = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(communitySchema)
	.handler(async ({ data }) => {
		const similarCommunities = await db
			.select()
			.from(communities)
			.where(eq(communities.title, data.title))
			.limit(1);

		if (similarCommunities) {
			throw Error("conflict");
		}

		const newCommunity = await db
			.insert(communities)
			.values({ ...data })
			.returning();

		return newCommunity;
	});

export const addAdmin = createServerFn({ method: "POST" })
	.inputValidator(z.object({ communityId: z.string() }))
	.middleware([userAuthMiddleware])
	.handler(async ({ data, context }) => {
		const { user } = context;

		const communityAdmin = await db.insert(communityAdmins).values({
			role: "admin",
			userId: user.id,
			communityId: data.communityId,
		});

		return communityAdmin;
	});
