import * as fs from "node:fs/promises";
import { db } from "../src/db/index.ts";
import { communities, communityAdmins, user } from "../src/db/schema.ts";

export const communityIdFormatter = (communityId: string = "") => {
	if (communityId === "") return "";
	return communityId
		.replace(/ /g, "_")
		.replace(/[^a-zA-Z0-9_]/g, "")
		.toLowerCase();
};

type Community = {
	title: string;
	description: string;
};

const communityList = JSON.parse(
	await fs.readFile(new URL("./json/community_data.json", import.meta.url), "utf-8"),
);
const typedCommunityList = communityList as Community[];

export const createCommunities = async () => {
	type communityType = typeof communities.$inferInsert;
	const communityListFixed: communityType[] = typedCommunityList.map((c) => ({
		id: communityIdFormatter(c.title),
		title: c.title,
		slug: communityIdFormatter(c.title),
		description: c.description,
	}));
	const newCommunitites = await db
		.insert(communities)
		.values(communityListFixed)
		.onConflictDoNothing()
		.returning();
	return newCommunitites;
};

(async () => {
	const newCommunities = await createCommunities();
	const users = await db.select().from(user);

	const numberOfUsers = users.length;

	newCommunities.forEach(async (nc) => {
		const randomNumber = Math.floor(Math.random() * numberOfUsers - 1);
		await db.insert(communityAdmins).values({
			userId: users[randomNumber]?.id,
			communityId: nc.id,
			role: "admin",
		});
	});
})();
