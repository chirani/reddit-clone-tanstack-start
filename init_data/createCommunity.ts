import * as fs from "node:fs/promises";
import { faker } from "@faker-js/faker";
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

export const generateCommunities = async () => {
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

export const createCommunities = async () => {
	console.log("[2/5] create communities");
	const newCommunities = await generateCommunities();
	const users = await db.select().from(user);

	const numberOfUsers = users.length;

	newCommunities.forEach(async (nc) => {
		const randomNumber = faker.number.int({ min: 0, max: numberOfUsers - 1 });
		await db.insert(communityAdmins).values({
			userId: users[randomNumber]?.id,
			communityId: nc.id,
			role: "admin",
		});
	});
};
