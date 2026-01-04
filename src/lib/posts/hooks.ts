import { infiniteQueryOptions, queryOptions, useMutation } from "@tanstack/react-query";
import {
	createPostServer,
	fetchPostByCommunityServer,
	fetchPostBySlugServer,
	fetchPostsPaginatedServer,
} from "./api";

export const useCreatePost = () => {
	return useMutation({
		mutationKey: ["create-post"],
		mutationFn: async (data: { body: string; title: string; communityId: string }) => {
			const results = await createPostServer({ data });
			return results[0];
		},
	});
};

export const fetchPostsPagintedQueryOptions = () =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-posts-paginated"],
		queryFn: async ({ pageParam }) => {
			const results = await fetchPostsPaginatedServer({ data: { offset: pageParam, limit: 6 } });
			return results;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
		staleTime: 600_000,
	});

export const fetchPostsByCommunityPagintedQueryOptions = (communityId: string) =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-posts-community-paginated", communityId],
		queryFn: async ({ pageParam }) => {
			const results = await fetchPostByCommunityServer({
				data: { offset: pageParam, limit: 3, communityId },
			});
			return results;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
	});

export const fetchPostBySlugQueryOptions = (postIdOrSlug: string) =>
	queryOptions({
		queryKey: ["fetch-post", postIdOrSlug],
		queryFn: async () => await fetchPostBySlugServer({ data: { postIdOrSlug } }),
	});
