import * as fs from "node:fs/promises";
import { generateSlug, type posts } from "../src/db/schema.ts";
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
