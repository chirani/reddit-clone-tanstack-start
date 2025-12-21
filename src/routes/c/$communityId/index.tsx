import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Post from "@/components/Post";
import { fetchCommunityMetadataOpts } from "@/lib/community/hooks";
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
	component: RouteComponent,
});

function RouteComponent() {
	const { communityId } = Route.useParams();
	const communityData = Route.useLoaderData();
	const { data } = useSuspenseInfiniteQuery(fetchPostsByCommunityPagintedQueryOptions(communityId));

	const posts = data?.pages.flatMap((p) => p.results) ?? [];
	return (
		<div className="main">
			<div className="card bg-base-100 border-2 border-base-200 w-full mb-4">
				<div className="card-body">
					<h1 className="text-4xl font-bold mb-3">{`c/${communityId}`} </h1>
					<p className="text-lg">{communityData[0].description}</p>
				</div>
			</div>
			{posts.map((post) => (
				<Post key={post.id} {...post} showUsername />
			))}
		</div>
	);
}
