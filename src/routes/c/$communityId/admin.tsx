import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Post from "@/components/Post";

import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/c/$communityId/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	const { communityId } = Route.useParams();

	const { data } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(communityId, "365d"),
	);

	const posts =
		data?.pages.flatMap((p, index) =>
			p.results.map((result) => ({ ...result, pageNumber: index })),
		) ?? [];

	return (
		<div className="main">
			{posts.map((post) => (
				<Post key={post.id} {...post} likeLocation="community-page" showUsername />
			))}
		</div>
	);
}
