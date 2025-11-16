import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";

export const postSchema = z.object({
	title: z.string().max(255),
	body: z.string().min(125),
});

export const createPostServer = createServerFn({ method: "POST" })
	.inputValidator(postSchema)
	.handler(async ({ data }) => {
		const { body, title } = data;
		const results = await db.insert(posts).values({ body, title }).returning();

		return results;
	});

export const fetchPostsServer = createServerFn().handler(async () => {
	const results = await db.select().from(posts).limit(10);

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

export const fetchPostQueryOptions = () =>
	queryOptions({
		queryKey: ["fetch-posts"],
		queryFn: async () => {
			const results = await fetchPostsServer();
			return results;
		},
	});

export const useFetchPost = () => {
	return useQuery(fetchPostQueryOptions());
};
