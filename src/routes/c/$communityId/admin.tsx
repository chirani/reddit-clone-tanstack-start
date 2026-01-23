import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Post from "@/components/Post";
import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/c/$communityId/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	const { communityId } = Route.useParams();

	const { data, isFetching, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(communityId, "365d"),
	);

	const posts =
		data?.pages.flatMap((p, index) =>
			p.results.map((result) => ({ ...result, pageNumber: index })),
		) ?? [];

	const { ref: inViewRef, inView } = useInView({
		threshold: 0,
	});

	useEffect(() => {
		if (!isFetching && inView && hasNextPage) {
			fetchNextPage();
		}
	}, [isFetching, inView, fetchNextPage, hasNextPage]);

	return (
		<div className="main">
			{posts.map((post) => (
				<Post key={post.id} {...post} likeLocation="community-page" showUsername />
			))}
			<div className="p-1" ref={inViewRef} />
		</div>
	);
}
