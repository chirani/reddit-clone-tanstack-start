import { isNotNull } from "drizzle-orm";
import { user } from "../auth-schema.ts";
import { db } from "../src/db/index.ts";
import { communityAdmins, communityMemberships, posts } from "../src/db/schema.ts";
import { createCommunities } from "./createCommunity.ts";
import { postFormatted } from "./createPosts.ts";
import { createUsers } from "./createUsers.ts";

(async () => {
	await createUsers();
	const createdUsers = await db.select().from(user).where(isNotNull(user.id));
	console.log("users length", createdUsers?.length);
	const numberOfUsers = createdUsers.length;

	const createdCommunities = await createCommunities();

	const createCommunityAdmin = async () => {
		const randomNumber = Math.floor(Math.random() * numberOfUsers - 1);

		createdCommunities.forEach((c) => {
			db.insert(communityAdmins).values({
				communityId: c.id,
				userId: createdUsers[randomNumber].id,
				role: "admin",
			});
		});
	};

	const createPosts = async () => {
		const randomNumber = Math.floor(Math.random() * numberOfUsers - 60);
		const postFormatted2 = postFormatted.map((pf) => ({
			...pf,
			userId: createdUsers[randomNumber].id,
		}));
		type communityMembershipType = typeof communityMemberships.$inferInsert;

		const communityMemberList: communityMembershipType[] = postFormatted.map((p) => ({
			userId: p.userId ?? "",
			communityId: p.communityId ?? "",
		}));

		await db.insert(communityMemberships).values(communityMemberList);
		await db.insert(posts).values(postFormatted2);
	};

	await createCommunityAdmin();
	await createPosts();
})();
