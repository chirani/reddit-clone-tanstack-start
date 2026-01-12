import type { InfiniteData } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { addLikeServer, removeLikeServer } from "../likes/api";
import { useCreateNotification } from "../notifications/hooks";
import type { fetchPostBySlugServer, fetchPostsPaginatedServer } from "../posts/api";

export type likeLocation = "main-page" | "post-page" | "community-page";

export const useLikePost = () => {
	const { mutate: createNotifications } = useCreateNotification();
	return useMutation({
		mutationFn: async ({
			postId,
		}: {
			postId: string;
			location?: likeLocation;
			pageNumber?: number;
			communityId?: string;
		}) => await addLikeServer({ data: { postId } }),
		mutationKey: ["add-like"],
		onMutate: async ({ postId, pageNumber = 0, location = "main-page", communityId }, context) => {
			if (location === "main-page") {
				await context.client.cancelQueries({ queryKey: ["fetch-posts-paginated"] });
				type postsPaginated = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;

				context.client.setQueryData<InfiniteData<postsPaginated>>(
					["fetch-posts-paginated"],
					(old) => {
						if (!old) return old;

						const newPages = old.pages.map((page, index) => {
							if (index !== pageNumber) return page;

							return {
								...page,
								results: page.results.map((item) => {
									if (item.id === postId && !item.likedByUser) {
										return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
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

			type communityPostsPaginated = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;
			if (location === "community-page") {
				await context.client.cancelQueries({
					queryKey: ["fetch-posts-community-paginated", communityId],
				});

				context.client.setQueryData<InfiniteData<communityPostsPaginated>>(
					["fetch-posts-community-paginated", communityId],
					(old) => {
						if (!old) return old;

						const newPages = old.pages.map((page, index) => {
							if (index !== pageNumber) return page;

							return {
								...page,
								results: page.results.map((item) => {
									if (item.id === postId && !item.likedByUser) {
										return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
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
			if (location === "post-page") {
				await context.client.cancelQueries({ queryKey: ["fetch-post", postId] });

				context.client.setQueryData(["fetch-post", postId], (old: posts) =>
					old.map((item) => {
						if (item.id === postId && !item.likedByUser) {
							return { ...item, likeCount: Number(item.likeCount) + 1, likedByUser: true };
						}
						return item;
					}),
				);
			}
		},
		onError(_data, { location, postId, communityId }, _onMutateResult, context) {
			if (location === "main-page") {
				context.client.invalidateQueries({ queryKey: ["fetch-posts"] });
			}
			if (location === "community-page") {
				context.client.invalidateQueries({
					queryKey: ["fetch-posts-community-paginated", communityId],
				});
			}
			if (location === "post-page") {
				context.client.invalidateQueries({ queryKey: ["fetch-post", postId] });
			}
		},
		onSuccess(_data, variables) {
			const { postId } = variables;
			createNotifications({ notificationType: "post_like", postId });
		},
	});
};

export const useUnlikePost = () => {
	return useMutation({
		mutationFn: async ({
			postId,
		}: {
			postId: string;
			location?: likeLocation;
			pageNumber?: number;
			communityId?: string;
		}) => await removeLikeServer({ data: { postId } }),
		mutationKey: ["remove-like"],
		onMutate: async ({ postId, location = "main-page", pageNumber = 0, communityId }, context) => {
			if (location === "main-page") {
				await context.client.cancelQueries({ queryKey: ["fetch-posts-paginated"] });
				type postsPaginated = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;

				context.client.setQueryData<InfiniteData<postsPaginated>>(
					["fetch-posts-paginated"],
					(old) => {
						if (!old) return old;

						const newPages = old.pages.map((page, index) => {
							if (index !== pageNumber) return page;

							return {
								...page,
								results: page.results.map((item) => {
									if (item.id === postId && item.likedByUser) {
										return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
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

			type communityPostsPaginated = Awaited<ReturnType<typeof fetchPostsPaginatedServer>>;
			if (location === "community-page") {
				await context.client.cancelQueries({
					queryKey: ["fetch-posts-community-paginated", communityId],
				});

				context.client.setQueryData<InfiniteData<communityPostsPaginated>>(
					["fetch-posts-community-paginated", communityId],
					(old) => {
						if (!old) return old;

						const newPages = old.pages.map((page, index) => {
							if (index !== pageNumber) return page;

							return {
								...page,
								results: page.results.map((item) => {
									if (item.id === postId && item.likedByUser) {
										return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
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

			if (location === "post-page") {
				type posts = Awaited<ReturnType<typeof fetchPostBySlugServer>>;
				await context.client.cancelQueries({ queryKey: ["fetch-post", postId] });

				context.client.setQueryData(["fetch-post", postId], (old: posts) =>
					old.map((item) => {
						if (item.id === postId && item.likedByUser) {
							return { ...item, likeCount: Number(item.likeCount) - 1, likedByUser: false };
						}
						return item;
					}),
				);
			}
		},
		onError(_data, { location, postId, communityId }, _onMutateResult, context) {
			if (location === "main-page") {
				context.client.invalidateQueries({ queryKey: ["fetch-posts"] });
			}
			if (location === "community-page") {
				context.client.invalidateQueries({
					queryKey: ["fetch-posts-community-paginated", communityId],
				});
			}
			if (location === "post-page") {
				context.client.invalidateQueries({ queryKey: ["fetch-post", postId] });
			}
		},
	});
};
