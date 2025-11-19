import { queryOptions, useMutation } from "@tanstack/react-query";
import { addLikeServer, createPostServer, fetchPostsServer } from "./api";

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

export const useLikePost = () => {
	return useMutation({
		mutationFn: async (postId: string) => await addLikeServer({ data: { postId } }),
		mutationKey: ["add-like"],
		onMutate: async (postId, context) => {
			await context.client.cancelQueries({ queryKey: ["fetch-posts"] });
			type posts = Awaited<ReturnType<typeof fetchPostsServer>>;

			context.client.setQueryData(["fetch-posts"], (old: posts) =>
				old.map((item) => {
					if (item.id === postId && !item.likedByUser) {
						return { ...item, likeCount: Number(item.likeCount) + 1 };
					}
					return item;
				}),
			);
		},
		onSuccess(_data, _variables, _onMutateResult, context) {
			context.client.invalidateQueries({ queryKey: ["fetch-posts"] });
		},
	});
};
