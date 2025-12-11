import type { InfiniteData } from "@tanstack/react-query";
import { infiniteQueryOptions, queryOptions, useMutation } from "@tanstack/react-query";
import {
	addLikeServer,
	createPostServer,
	fetchPostBySlugServer,
	fetchPostsPaginatedServer,
	fetchPostsServer,
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

export const fetchPostsPagintedQueryOptions = () =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-posts-paginated"],
		queryFn: async ({ pageParam }) => {
			const results = await fetchPostsPaginatedServer({ data: { offset: pageParam, limit: 3 } });
			return results;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
	});

export const fetchPostBySlugQueryOptions = (postIdOrSlug: string) =>
	queryOptions({
		queryKey: ["fetch-post", postIdOrSlug],
		queryFn: async () => await fetchPostBySlugServer({ data: { postIdOrSlug } }),
	});

export const useLikePost = () => {
	return useMutation({
		mutationFn: async ({ postId }: { postId: string; slug?: string }) =>
			await addLikeServer({ data: { postId } }),
		mutationKey: ["add-like"],
		onMutate: async ({ postId, slug }, context) => {
			if (!slug) {
				await context.client.cancelQueries({ queryKey: ["fetch-posts-paginated"] });
				type posts = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;

				context.client.setQueryData<InfiniteData<posts>>(["fetch-posts-paginated"], (old) => {
					if (!old) return old;

					const newPages = old.pages.map((page) => ({
						...page,
						results: page.results.map((item) => {
							if (item.id === postId && !item.likedByUser) {
								return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
							}
							return item;
						}),
					}));

					return { ...old, pages: newPages };
				});
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
				await context.client.cancelQueries({ queryKey: ["fetch-posts-paginated"] });
				type Posts = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;

				context.client.setQueryData<InfiniteData<Posts>>(["fetch-posts-paginated"], (old) => {
					if (!old) return old;
					const newPages = old.pages.map((page) => ({
						...page,
						results: page.results.map((item) => {
							if (item.id === postId && item.likedByUser) {
								return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
							}
							return item;
						}),
					}));

					return { ...old, pages: newPages };
				});
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
