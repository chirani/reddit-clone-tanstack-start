import { faker } from "@faker-js/faker";
import { eq, isNull, sql } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { comments, posts, user } from "../src/db/schema.ts";

type CommentType = typeof comments.$inferInsert;

export const createComments = async () => {
	console.log("[4/5] create comments");
	await db.delete(posts).where(isNull(posts.communityId));
	const createdPosts = await db.select().from(posts);
	const postNumber = createdPosts.length;
	const createdUsers = await db.select().from(user);
	const userNumber = createdUsers.length;

	function generateComments(count: number): CommentType[] {
		return Array.from({ length: count }, () => {
			const postId = createdPosts[faker.number.int({ min: 0, max: postNumber - 1 })].id;
			const userId = createdUsers[faker.number.int({ min: 0, max: userNumber - 1 })].id;

			return {
				postId,
				userId,
				comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 5 })),
				createdAt: faker.date.past({ years: 3 }),
			};
		});
	}

	const generatedComments = generateComments(30_000);

	generatedComments.forEach(async (element) => {
		await db.insert(comments).values(element);
	});
};

export const countComments = async () => {
	const postList = await db.select().from(posts);

	postList.forEach(async (post) => {
		await db
			.update(posts)
			.set({
				commentCount: sql<number>`
				(	SELECT COUNT(*)
					FROM ${comments}
					WHERE ${comments.postId} = ${post.id}
				)`,
			})
			.where(eq(posts.id, post.id));
	});
};

(async () => {
	await countComments();
})();
