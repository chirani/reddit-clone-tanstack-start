import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import z from "zod";
import NewFirst from "@/components/NewFirst";
import Post from "@/components/Post";
import TopPostsDropDown from "@/components/TopPostDropdown";
import { fetchPostsPagintedQueryOptions } from "@/lib/posts/hooks";

const createCommunitySearchSchema = z.object({
	top: z.enum(["1d", "7d", "30d", "365d"]).catch("7d"),
	is_new: z.boolean().catch(false),
});

export const Route = createFileRoute("/")({
	validateSearch: (search) => createCommunitySearchSchema.parse(search),
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loaderDeps: ({ search: { top, is_new } }) => ({ top, is_new }),
	loader: async ({ context, deps: { top, is_new } }) => {
		await context.queryClient.ensureInfiniteQueryData(fetchPostsPagintedQueryOptions(top, is_new));
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
	const deps = Route.useLoaderDeps();
	const { ref: inViewRef, inView } = useInView({ threshold: 0 });

	const { data, fetchNextPage, isFetching, hasNextPage } = useSuspenseInfiniteQuery(
		fetchPostsPagintedQueryOptions(deps.top, true),
	);

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
			<div className="flex flex-row-reverse gap-3 px-3">
				<TopPostsDropDown period={deps.top} href="/" />
				<NewFirst isNew={!!deps.is_new} href="/" />
			</div>
			{posts?.length && posts.map((post) => <Post key={post.id} {...post} showCommunity />)}
			<div className="p-4" ref={inViewRef} hidden={!hasNextPage || isFetching} />
		</main>
	);
}
