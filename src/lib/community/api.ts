import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { communities, communityAdmins, communityMemberships } from "@/db/schema";
import { userAuthMiddleware, userMiddlewareNB } from "../auth/api";

export const communityIdFormatter = (communityId: string = "") => {
	if (communityId === "") return "";
	return communityId
		.replace(/ /g, "_")
		.replace(/[^a-zA-Z0-9_]/g, "")
		.toLowerCase();
};
export const communitySchema = z.object({
	title: z
		.string()
		.min(3)
		.transform((val) => communityIdFormatter(val)),
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

export const fetchMyCommunities = createServerFn({ method: "GET" })
	.middleware([userAuthMiddleware])
	.handler(async ({ context }) => {
		const userId = context.user.id;
		const myCommunities = await db
			.select()
			.from(communityMemberships)
			.where(eq(communityMemberships.userId, userId));

		return myCommunities;
	});

export const fetchCommunityMetadata = createServerFn({ method: "GET" })
	.middleware([userMiddlewareNB])
	.inputValidator(
		z.object({
			communityId: z.string().min(3),
		}),
	)
	.handler(async ({ data, context }) => {
		let isCommunityMember = false;

		if (context?.user) {
			const commUser = await db
				.select()
				.from(communityMemberships)
				.where(
					and(
						eq(communityMemberships.communityId, data.communityId),
						eq(communityMemberships.userId, context.user.id),
					),
				)
				.limit(1);

			isCommunityMember = commUser.length > 0;
		}
		const communityMetadata = await db
			.select()
			.from(communities)
			.where(eq(communities.id, data.communityId))
			.limit(1);

		return { ...communityMetadata[0], isCommunityMember };
	});

export const joinCommunity = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			communityId: z.string().min(3),
		}),
	)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { communityId } = data;

		const existingMembership = db
			.select()
			.from(communityMemberships)
			.where(
				and(
					eq(communityMemberships.userId, userId),
					eq(communityMemberships.communityId, communityId),
				),
			);

		if ((await existingMembership).length) {
			throw Error("Already a member");
		}

		const res = await db.insert(communityMemberships).values({ communityId, userId }).returning();

		return res;
	});

export const leaveCommunity = createServerFn({ method: "POST" })
	.middleware([userAuthMiddleware])
	.inputValidator(
		z.object({
			communityId: z.string().min(3),
		}),
	)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;
		const { communityId } = data;

		const existingMembership = await db
			.select()
			.from(communityMemberships)
			.where(
				and(
					eq(communityMemberships.userId, userId),
					eq(communityMemberships.communityId, communityId),
				),
			);

		if (!existingMembership.length) {
			throw Error("Not a member");
		}

		const res = await db
			.delete(communityMemberships)
			.where(
				and(
					eq(communityMemberships.communityId, communityId),
					eq(communityMemberships.userId, userId),
				),
			)
			.returning();

		return res;
	});
