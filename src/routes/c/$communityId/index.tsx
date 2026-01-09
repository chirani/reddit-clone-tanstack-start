import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import z from "zod";
import Post from "@/components/Post";
import TopPostsDropDown from "@/components/TopPostDropdown";
import {
	fetchCommunityMetadataOpts,
	useJoinCommunity,
	useLeaveCommunity,
} from "@/lib/community/hooks";
import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";

const createCommunitySearchSchema = z.object({
	top: z.enum(["1d", "7d", "30d", "365d"]).catch("7d"),
});

export const Route = createFileRoute("/c/$communityId/")({
	validateSearch: (search) => createCommunitySearchSchema.parse(search),
	loaderDeps: ({ search: { top } }) => ({ top }),
	loader: async ({ context, params, deps }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostsByCommunityPagintedQueryOptions(params.communityId, deps.top),
		);
		const communityMetaData = await context.queryClient.ensureQueryData(
			fetchCommunityMetadataOpts(params.communityId),
		);
		return communityMetaData;
	},
	head: ({ params }) => {
		return {
			meta: [
				{
					title: `${params.communityId} - Community`,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { communityId } = Route.useParams();
	const { top } = Route.useSearch();
	const { data: communityData } = useSuspenseQuery(fetchCommunityMetadataOpts(communityId));
	const { data, fetchNextPage, isFetching, hasNextPage } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(communityId, top),
	);
	const { mutate: joinCommunity, isPending: isJoinPending } = useJoinCommunity();
	const { mutate: leaveCommunity, isPending: isLeavePending } = useLeaveCommunity();

	const { ref: inViewRef, inView } = useInView({
		threshold: 0,
	});
	useEffect(() => {
		if (!isFetching && inView && hasNextPage) {
			fetchNextPage();
		}
	}, [isFetching, inView, fetchNextPage, hasNextPage]);

	const posts =
		data?.pages.flatMap((p, index) =>
			p.results.map((result) => ({ ...result, pageNumber: index })),
		) ?? [];

	return (
		<div className="main">
			<div className="card bg-base-100 border-2 border-base-200 m-6">
				<div className="card-body">
					<h1 className="text-2xl md:text-4xl font-bold mb-3 break-all">{`c/${communityId}`}</h1>
					<p className="text-lg">{communityData.description}</p>
					<div className="flex flex-row-reverse">
						<button
							disabled={isJoinPending || isLeavePending}
							className={`btn btn-lg ${
								communityData.isCommunityMember ? "btn-ghost" : "btn-accent enabled:animate-pulse"
							}`}
							type="button"
							onMouseDown={() => {
								communityData.isCommunityMember
									? leaveCommunity(communityId)
									: joinCommunity(communityId);
							}}
						>
							{communityData.isCommunityMember ? "Leave" : "Join"}
						</button>
					</div>
				</div>
			</div>
			<section>
				<div className="flex flex-row-reverse px-3">
					<TopPostsDropDown period={top} href="/c/$communityId" />
				</div>
				{posts.map((post) => (
					<Post key={post.id} {...post} likeLocation="community-page" showUsername />
				))}
				<div ref={inViewRef} className="p-3" />
			</section>
		</div>
	);
}
