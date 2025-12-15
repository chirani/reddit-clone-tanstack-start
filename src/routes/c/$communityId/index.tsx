import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Network } from "lucide-react";
import Post from "@/components/Post";
import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/c/$communityId/")({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostsByCommunityPagintedQueryOptions(params.communityId),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { communityId } = Route.useParams();
	const { data } = useSuspenseInfiniteQuery(fetchPostsByCommunityPagintedQueryOptions(communityId));

	const posts = data?.pages.flatMap((p) => p.results) ?? [];
	return (
		<div className="main">
			<div className="breadcrumbs text-md px-6">
				<ul>
					<li>
						<Link hidden={!communityId} to="/c/$communityId" params={{ communityId: communityId }}>
							<Network className="h-4 w-4" />
							{`c/${communityId}`}
						</Link>
					</li>
				</ul>
			</div>
			{posts.map((post) => (
				<Post key={post.id} {...post} />
			))}
		</div>
	);
}
