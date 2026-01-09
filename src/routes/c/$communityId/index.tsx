import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown01 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import z from "zod";
import Post from "@/components/Post";
import {
	fetchCommunityMetadataOpts,
	useJoinCommunity,
	useLeaveCommunity,
} from "@/lib/community/hooks";
import type { TopPostPeriod } from "@/lib/posts/api";
import { fetchPostsByCommunityPagintedQueryOptions } from "@/lib/posts/hooks";
import { topPeriod } from "@/routes";

const createCommunitySearchSchema = z.object({
	top: z.enum(["1d", "7d", "30d", "365d"]).catch("7d"),
});

export const Route = createFileRoute("/c/$communityId/")({
	validateSearch: (search) => createCommunitySearchSchema.parse(search),
	loaderDeps: ({ search: { top } }) => ({ top }),
	loader: async ({ context, params, deps }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostsByCommunityPagintedQueryOptions(params.communityId, deps.top),
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
	const { top } = Route.useSearch();
	const { data: communityData } = useSuspenseQuery(fetchCommunityMetadataOpts(communityId));
	const { data, fetchNextPage, isFetching, hasNextPage } = useSuspenseInfiniteQuery(
		fetchPostsByCommunityPagintedQueryOptions(communityId, top),
	);
	const { mutate: joinCommunity, isPending: isJoinPending } = useJoinCommunity();
	const { mutate: leaveCommunity, isPending: isLeavePending } = useLeaveCommunity();

	const { ref: inViewRef, inView } = useInView({
		threshold: 0,
	});
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
		<div className="main">
			<div className="card bg-base-100 border-2 border-base-200 m-6">
				<div className="card-body">
					<h1 className="text-2xl md:text-4xl font-bold mb-3 break-all">{`c/${communityId}`}</h1>
					<p className="text-lg">{communityData.description}</p>
					<div className="flex flex-row-reverse">
						<button
							disabled={isJoinPending || isLeavePending}
							className={`btn btn-lg ${
								communityData.isCommunityMember ? "btn-ghost" : "btn-accent enabled:animate-pulse"
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
			<section>
				<div className="flex flex-row-reverse px-3">
					<TopPostsDropDown communityId={communityId} period={top} />
				</div>
				{posts.map((post) => (
					<Post key={post.id} {...post} likeLocation="community-page" showUsername />
				))}
				<div ref={inViewRef} className="p-3" />
			</section>
		</div>
	);
}

const TopPostsDropDown = ({
	period,
	communityId,
}: {
	period: TopPostPeriod;
	communityId: string;
}) => {
	return (
		<details className="dropdown dropdown-hover dropdown-end">
			<summary className="btn btn-ghost m-1">
				Top Posts <ArrowDown01 className="text-primary" /> {topPeriod[period]}
			</summary>
			<ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-1 p-2 shadow-sm gap-2.5">
				<li>
					<Link
						to="/c/$communityId"
						params={{ communityId }}
						search={{ top: "1d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Today
					</Link>
				</li>
				<li>
					<Link
						to="/c/$communityId"
						params={{ communityId }}
						search={{ top: "7d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 7 Days
					</Link>
				</li>
				<li>
					<Link
						to="/c/$communityId"
						params={{ communityId }}
						search={{ top: "30d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 30 days
					</Link>
				</li>
				<li>
					<Link
						to="/c/$communityId"
						params={{ communityId }}
						search={{ top: "365d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 365 days
					</Link>
				</li>
			</ul>
		</details>
	);
};
