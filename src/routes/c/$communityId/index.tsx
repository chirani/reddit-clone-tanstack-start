import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
	const params = Route.useParams();

	const { data } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(params.communityId),
	);
	const posts = data?.pages.flatMap((p) => p.results) ?? [];
	return (
		<div className="main">
			{posts.map((post) => (
				<Post key={post.id} {...post} />
			))}
		</div>
	);
}
