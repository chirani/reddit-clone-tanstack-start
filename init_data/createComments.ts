import { faker } from "@faker-js/faker";
import { isNull } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { comments, posts, user } from "../src/db/schema.ts";

type CommentType = typeof comments.$inferInsert;

(async () => {
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
})();
