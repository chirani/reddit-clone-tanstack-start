import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowDown01 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import z from "zod";
import Post from "@/components/Post";
import type { TopPostPeriod } from "@/lib/posts/api";
import { fetchPostsPagintedQueryOptions } from "@/lib/posts/hooks";

const createCommunitySearchSchema = z.object({
	top: z.enum(["1d", "7d", "30d", "365d"]).catch("7d"),
});

export const Route = createFileRoute("/")({
	validateSearch: (search) => createCommunitySearchSchema.parse(search),
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loaderDeps: ({ search: { top } }) => ({ top }),
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureInfiniteQueryData(fetchPostsPagintedQueryOptions(deps.top));
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
		fetchPostsPagintedQueryOptions(deps.top),
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
			<div className="flex flex-row-reverse px-3">
				<TopPostsDropDown period={deps.top} />
			</div>

			{posts?.length && posts.map((post) => <Post key={post.id} {...post} showCommunity />)}
			<div className="p-4" ref={inViewRef} hidden={!hasNextPage || isFetching} />
		</main>
	);
}

const topPeriod: Record<TopPostPeriod, string> = {
	"1d": "Today",
	"7d": "This Week",
	"30d": "This Month",
	"365d": "This Year",
};

const TopPostsDropDown = ({ period }: { period: TopPostPeriod }) => {
	return (
		<details className="dropdown dropdown-hover dropdown-end">
			<summary className="btn btn-ghost m-1">
				Top Posts <ArrowDown01 className="text-primary" /> {topPeriod[period]}
			</summary>
			<ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-1 p-2 shadow-sm gap-2.5">
				<li>
					<Link to="/" search={{ top: "1d" }} className="btn btn-sm btn-ghost" reloadDocument>
						Today
					</Link>
				</li>
				<li>
					<Link to="/" search={{ top: "7d" }} className="btn btn-sm btn-ghost" reloadDocument>
						Last 7 Days
					</Link>
				</li>
				<li>
					<Link to="/" search={{ top: "30d" }} className="btn btn-sm btn-ghost" reloadDocument>
						Last 30 days
					</Link>
				</li>
				<li>
					<Link to="/" search={{ top: "365d" }} className="btn btn-sm btn-ghost" reloadDocument>
						Last 365 days
					</Link>
				</li>
			</ul>
		</details>
	);
};
