import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
	const { data } = useSuspenseInfiniteQuery(fetchPostsByCommunityPagintedQueryOptions(communityId));
	const { mutate: joinCommunity, isPending: isJoinPending } = useJoinCommunity();
	const { mutate: leaveCommunity, isPending: isLeavePending } = useLeaveCommunity();

	const posts = data?.pages.flatMap((p) => p.results) ?? [];
	return (
		<div className="main">
			<div className="card bg-base-100 border-2 border-base-200 m-6">
				<div className="card-body">
					<h1 className="text-4xl font-bold mb-3">{`c/${communityId}`} </h1>
					<p className="text-lg">{communityData.description}</p>
					<div className="flex flex-row-reverse">
						<button
							disabled={isJoinPending || isLeavePending}
							className={`btn btn-xl${
								communityData.isCommunityMember ? " btn-ghost" : " btn-accent enabled:animate-pulse"
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
			{posts.map((post) => (
				<Post key={post.id} {...post} showUsername />
			))}
		</div>
	);
}
