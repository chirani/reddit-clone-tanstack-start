import {
	type InfiniteData,
	infiniteQueryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	fetchPostByCommunityServer,
	fetchPostBySlugServer,
	fetchPostsPaginatedServer,
} from "../posts/api";
import { deleteComment, fetchPostComments, postComment } from "./api";

export const usePostComment = () => {
	const { updateCommentCountClient } = useUpdateCommentCount();
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ postId, comment }: { postId: string; comment: string; slug?: string }) =>
			await postComment({ data: { postId, comment } }),
		async onMutate({ postId }) {
			updateCommentCountClient(postId, "post-page");
		},

		onSuccess: (_data, _params, _onMutateResult, context) => {
			context.client.invalidateQueries({ queryKey: ["fetch-comments"] });
		},
	});
};

export const useRemoveComment = () => {
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ commentId }: { commentId: string }) =>
			await deleteComment({ data: { commentId } }),
	});
};

export const fetchPostCommentsQueryOpts = (postId: string) => {
	return infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-comments", postId],
		queryFn: async ({ pageParam }) => {
			const page = await fetchPostComments({ data: { postId, offset: pageParam, limit: 7 } });
			return page;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
	});
};
export type CommentLocation = "main-page" | "post-page" | "community-page";

export const useUpdateCommentCount = () => {
	const queryClient = useQueryClient();

	const updateCommentCountClient = async (
		postId: string,
		commentLocation: CommentLocation = "main-page",
		pageNumber = 0,
		communityId: string = "",
	) => {
		if (commentLocation === "main-page") {
			await queryClient.cancelQueries({ queryKey: ["fetch-posts-paginated"] });
			type postsPaginated = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;

			queryClient.setQueryData<InfiniteData<postsPaginated>>(["fetch-posts-paginated"], (old) => {
				if (!old) return old;

				const newPages = old.pages.map((page, index) => {
					if (index !== pageNumber) return page;

					return {
						...page,
						results: page.results.map((item) => {
							if (item.id === postId) {
								return { ...item, commentCount: Number(item.commentCount) + 1 };
							}
							return item;
						}),
					};
				});

				return { ...old, pages: newPages };
			});
			return;
		}

		type communityPostsPaginated = Awaited<ReturnType<typeof fetchPostByCommunityServer>>;

		if (commentLocation === "community-page") {
			await queryClient.cancelQueries({
				queryKey: ["fetch-posts-community-paginated", communityId],
			});

			queryClient.setQueryData<InfiniteData<communityPostsPaginated>>(
				["fetch-posts-community-paginated", communityId],
				(old) => {
					if (!old) return old;

					const newPages = old.pages.map((page, index) => {
						if (index !== pageNumber) return page;

						return {
							...page,
							results: page.results.map((item) => {
								if (item.id === postId) {
									return { ...item, commentCount: Number(item.commentCount) + 1 };
								}
								return item;
							}),
						};
					});

					return { ...old, pages: newPages };
				},
			);
			return;
		}

		type posts = Awaited<ReturnType<typeof fetchPostBySlugServer>>;

		if (commentLocation === "post-page") {
			await queryClient.cancelQueries({ queryKey: ["fetch-post", postId] });

			queryClient.setQueryData(["fetch-post", postId], (old: posts) =>
				old.map((item) => {
					if (item.id === postId) {
						return { ...item, commentCount: Number(item.commentCount) + 1 };
					}
					return item;
				}),
			);
			return;
		}
	};

	return { updateCommentCountClient };
};
