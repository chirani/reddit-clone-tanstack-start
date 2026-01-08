import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowDown01 } from "lucide-react";
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
			<div className="flex flex-row-reverse">
				<TopPostsDropDown />
			</div>
			{posts?.length && posts.map((post) => <Post key={post.id} {...post} showCommunity />)}
			<div className="p-4" ref={inViewRef} hidden={!hasNextPage || isFetching} />
		</main>
	);
}

const TopPostsDropDown = () => {
	return (
		<details className="dropdown dropdown-hover dropdown-end">
			<summary className="btn btn-ghost m-1">
				Top Posts <ArrowDown01 className="text-primary" />
			</summary>
			<ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-1 w-40 p-2 shadow-sm gap-2.5">
				<li>
					<button
						disabled={false}
						type="button"
						className="btn btn-sm btn-ghost"
						onClick={() => {}}
					>
						Today
					</button>
				</li>
				<li>
					<button
						disabled={false}
						type="button"
						className="btn btn-sm btn-ghost"
						onClick={() => {}}
					>
						Last 7 Days
					</button>
				</li>
				<li>
					<button
						disabled={false}
						type="button"
						className="btn btn-sm btn-ghost"
						onClick={() => {}}
					>
						Last 30 Days
					</button>
				</li>
				<li>
					<button
						disabled={false}
						type="button"
						className="btn btn-sm btn-ghost"
						onClick={() => {}}
					>
						Last 365 Days
					</button>
				</li>
			</ul>
		</details>
	);
};
