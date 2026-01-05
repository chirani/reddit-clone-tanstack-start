import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Post from "@/components/Post";
import {
	fetchCommunityMetadataOpts,
	useJoinCommunity,
	useLeaveCommunity,
} from "@/lib/community/hooks";
import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/c/$communityId/")({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostsByCommunityPagintedQueryOptions(params.communityId),
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
	const { data: communityData } = useSuspenseQuery(fetchCommunityMetadataOpts(communityId));
	const { data, fetchNextPage, isFetching, hasNextPage } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(communityId),
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
							className={`btn btn-xl ${
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
				{posts.map((post) => (
					<Post key={post.id} {...post} likeLocation="community-page" showUsername />
				))}
				<div ref={inViewRef} className="p-3" />
			</section>
		</div>
	);
}
