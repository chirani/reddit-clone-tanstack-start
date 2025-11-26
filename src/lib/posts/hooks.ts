import { queryOptions, useMutation } from "@tanstack/react-query";
import {
	addLikeServer,
	createPostServer,
	deleteComment,
	fetchPostBySlugServer,
	fetchPostsServer,
	postComment,
	removeLikeServer,
} from "./api";

export const useCreatePost = () => {
	return useMutation({
		mutationKey: ["create-post"],
		mutationFn: async (data: { body: string; title: string }) => {
			const results = await createPostServer({ data });
			return results[0];
		},
	});
};

export const fetchPostsQueryOptions = () =>
	queryOptions({
		queryKey: ["fetch-posts"],
		queryFn: async () => {
			const results = await fetchPostsServer();
			return results;
		},
	});

export const fetchPostBySlugQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: ["fetch-post", slug],
		queryFn: async () => await fetchPostBySlugServer({ data: { slug } }),
	});

export const useLikePost = () => {
	return useMutation({
		mutationFn: async ({ postId }: { postId: string; slug?: string }) =>
			await addLikeServer({ data: { postId } }),
		mutationKey: ["add-like"],
		onMutate: async ({ postId, slug }, context) => {
			if (!slug) {
				await context.client.cancelQueries({ queryKey: ["fetch-posts"] });
				type posts = Awaited<ReturnType<typeof fetchPostsServer>>;

				context.client.setQueryData(["fetch-posts"], (old: posts) =>
					old.map((item) => {
						if (item.id === postId && !item.likedByUser) {
							return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
						}
						return item;
					}),
				);
				return;
			}

			type posts = Awaited<ReturnType<typeof fetchPostBySlugServer>>;
			await context.client.cancelQueries({ queryKey: ["fetch-post", slug] });

			context.client.setQueryData(["fetch-post", slug], (old: posts) =>
				old.map((item) => {
					if (item.id === postId && !item.likedByUser) {
						return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
					}
					return item;
				}),
			);
		},
		onError(_data, _variables, _onMutateResult, context) {
			context.client.invalidateQueries({ queryKey: ["fetch-posts"] });
		},
	});
};

export const useUnlikePost = () => {
	return useMutation({
		mutationFn: async ({ postId }: { postId: string; slug?: string }) =>
			await removeLikeServer({ data: { postId } }),
		mutationKey: ["remove-like"],
		onMutate: async ({ postId, slug }, context) => {
			if (!slug) {
				await context.client.cancelQueries({ queryKey: ["fetch-posts"] });
				type posts = Awaited<ReturnType<typeof fetchPostsServer>>;

				context.client.setQueryData(["fetch-posts"], (old: posts) =>
					old.map((item) => {
						if (item.id === postId && item.likedByUser) {
							return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
						}
						return item;
					}),
				);
				return;
			}

			type posts = Awaited<ReturnType<typeof fetchPostBySlugServer>>;
			await context.client.cancelQueries({ queryKey: ["fetch-post"] });

			context.client.setQueryData(["fetch-post", slug], (old: posts) =>
				old.map((item) => {
					if (item.id === postId && item.likedByUser) {
						return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
					}
					return item;
				}),
			);
		},
		onError(_data, { slug }, _onMutateResult, context) {
			context.client.invalidateQueries({ queryKey: ["fetch-posts"] });
			if (slug) {
				context.client.invalidateQueries({ queryKey: ["fetch-post", slug] });
			}
		},
	});
};

export const usePostComment = () => {
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ postId, comment }: { postId: string; comment: string }) =>
			await postComment({ data: { postId, comment } }),
	});
};

export const useRemoveComment = () => {
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ commentId }: { commentId: string }) =>
			await deleteComment({ data: { commentId } }),
	});
};
