import { createServerFn } from "@tanstack/react-start";
import { eq, isNull } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { communities, communityAdmins } from "@/db/schema";
import { userAuthMiddleware } from "../auth/api";

export const communitySchema = z.object({
	title: z
		.string()
		.min(3)
		.transform(
			(val) =>
				val
					.replace(/ /g, "_") // replace spaces
					.replace(/[^\p{L}\p{N}_]/gu, "")
					.toLowerCase(), // remove special chars
		),
	description: z.string().min(100),
	tags: z.array(z.string()).default([]),
});
export type Community = z.infer<typeof communitySchema>;

export const createCommunity = createServerFn({ method: "POST" })
	.inputValidator(communitySchema)
	.middleware([userAuthMiddleware])
	.handler(async ({ data }) => {
		const existingCommunities = await db
			.select()
			.from(communities)
			.where(eq(communities.title, data.title))
			.limit(1);

		if (existingCommunities.length) {
			throw Error("conflict");
		}

		const newCommunity = await db
			.insert(communities)
			.values({ ...data, id: data.title })
			.returning();

		return newCommunity;
	});

export const addCommunityAdmin = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			communityId: z.string(),
			role: z.enum(["admin", "mod", "monitor"]).default("admin"),
		}),
	)
	.middleware([userAuthMiddleware])
	.handler(async ({ data, context }) => {
		const { user } = context;
		const { role, communityId } = data;

		const communityAdmin = await db
			.insert(communityAdmins)
			.values({
				role,
				communityId,
				userId: user.id,
			})
			.returning();

		return communityAdmin;
	});

export const fetchCommunities = createServerFn({ method: "GET" })
	.middleware([userAuthMiddleware])
	.handler(async () => {
		const communityAdmin = await db.select().from(communities).where(isNull(communities.deletedAt));
		return communityAdmin;
	});
