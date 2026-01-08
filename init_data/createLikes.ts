import { faker } from "@faker-js/faker";
import { eq, sql } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { likes, posts, user } from "../src/db/schema.ts";

type LikeType = typeof likes.$inferInsert;

export const createLikes = async () => {
	const userList = await db.select().from(user);
	const postList = await db.select().from(posts);

	function generateLikes(count: number): LikeType[] {
		return Array.from({ length: count }, () => {
			const postId = postList[faker.number.int({ min: 0, max: postList.length - 1 })].id;
			const userId = userList[faker.number.int({ min: 0, max: userList.length - 1 })].id;
			const createdAt = faker.date.past({ years: 3 });

			return {
				userId,
				postId,
				createdAt,
			};
		});
	}

	const generatedLikes = generateLikes(180_000);

	generatedLikes.forEach(async (element) => {
		try {
			await db.insert(likes).values(element);
		} catch (_err) {
			console.log("failed");
		}
	});
};

export const countLikes = async () => {
	const postList = await db.select().from(posts);

	postList.forEach(async (post) => {
		await db
			.update(posts)
			.set({
				likeCount: sql<number>`
                (	SELECT COUNT(*)
                    FROM ${likes}
                    WHERE ${likes.postId} = ${post.id}
                )`,
			})
			.where(eq(posts.id, post.id));
	});
};
