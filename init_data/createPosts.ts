import * as fs from "node:fs/promises";
import { isNull } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { communities, communityMemberships, generateSlug, posts, user } from "../src/db/schema.ts";

export type Post = {
	title: string;
	body: string;
};

const postsList = JSON.parse(
	await fs.readFile(new URL("./json/posts_data.json", import.meta.url), "utf-8"),
);
const typedPostList = postsList as Post[];

type postType = typeof posts.$inferInsert;

export const postFormatted: postType[] = typedPostList.map((p) => ({
	title: p.title,
	slug: generateSlug(p.title),
	id: generateSlug(p.title),
	body: p.body,
	userId: "",
}));

(async () => {
	await db.delete(posts).where(isNull(posts.communityId));
	const createCommunities = await db.select().from(communities);
	const communityNumber = createCommunities.length;
	const createdUsers = await db.select().from(user);

	const userNumber = createdUsers.length;
	console.log(userNumber);
	const postsList: postType[] = postFormatted.map((pf) => {
		const randomUser = Math.floor(Math.random() * userNumber);
		const randomCommunity = Math.floor(Math.random() * communityNumber);

		return {
			...pf,
			userId: createdUsers[randomUser].id,
			communityId: createCommunities[randomCommunity].id,
		};
	});
	const communityMemberList = postsList.map((cm) => ({
		userId: cm.userId ?? "",
		communityId: cm.communityId ?? "",
	}));
	await db.insert(communityMemberships).values(communityMemberList);
	await db.insert(posts).values(postsList).returning();
})();
