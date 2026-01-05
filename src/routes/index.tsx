import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Post from "@/components/Post";
import { fetchPostsPagintedQueryOptions } from "@/lib/posts/hooks";
export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(fetchPostsPagintedQueryOptions());
	},
	head: () => ({
		meta: [
			{
				title: "Community",
			},
		],
	}),
});

function App() {
	const { data, fetchNextPage, isFetching, hasNextPage } = useSuspenseInfiniteQuery(
		fetchPostsPagintedQueryOptions(),
	);
	const { ref: inViewRef, inView } = useInView({ threshold: 0 });
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
		<main className="main flex flex-col items-stretch">
			{posts?.length && posts.map((post) => <Post key={post.id} {...post} showCommunity />)}
			<div className="p-4" ref={inViewRef} hidden={!hasNextPage || isFetching} />
		</main>
	);
}
