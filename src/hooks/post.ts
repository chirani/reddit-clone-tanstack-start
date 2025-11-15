import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";

export const postSchema = z.object({
	title: z.string().max(255),
	body: z.string().min(1),
});

export const createPostServer = createServerFn({ method: "POST" })
	.inputValidator(postSchema)
	.handler(async ({ data }) => {
		const { body, title } = data;
		const results = await db.insert(posts).values({ body, title }).returning();

		return results;
	});

export const useCreatePost = () => {
	return useMutation({
		mutationKey: ["create-post"],
		mutationFn: async (data: { body: string; title: string }) => {
			const results = await createPostServer({ data });
			return results[0];
		},
	});
};
