import { infiniteQueryOptions, queryOptions, useMutation } from "@tanstack/react-query";
import {
	createPostServer,
	fetchPostByCommunityServer,
	fetchPostBySlugServer,
	fetchTopPostsPaginated,
	type TopPostPeriod,
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

export const fetchPostsPagintedQueryOptions = (top: TopPostPeriod = "30d", isNew?: boolean) =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-posts-paginated"],
		queryFn: async ({ pageParam }) => {
			const results = await fetchTopPostsPaginated({
				data: { offset: pageParam, top, isNew, limit: 6 },
			});
			return results;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
		staleTime: 600_000,
	});

export const fetchPostsByCommunityPagintedQueryOptions = (
	communityId: string,
	period: TopPostPeriod,
) =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-posts-community-paginated", communityId],
		queryFn: async ({ pageParam }) => {
			const results = await fetchPostByCommunityServer({
				data: { offset: pageParam, limit: 3, communityId, period },
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
