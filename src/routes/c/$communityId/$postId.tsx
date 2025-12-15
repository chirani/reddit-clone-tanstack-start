import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareText, Network, ThumbsUp, User } from "lucide-react";
import Comment from "@/components/Comment";
import CommentInput from "@/components/CommentInput";
import { fetchPostCommentsQueryOpts } from "@/lib/comments/hooks";
import { fetchPostBySlugQueryOptions, useLikePost, useUnlikePost } from "@/lib/posts/hooks";

export const Route = createFileRoute("/c/$communityId/$postId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const { postId } = params;
		const posts = await context.queryClient.ensureQueryData(fetchPostBySlugQueryOptions(postId));
		await context.queryClient.ensureInfiniteQueryData(fetchPostCommentsQueryOpts(postId));
		return { post: posts[0] };
	},
	notFoundComponent: NotFoundComponent,
	head: ({ params, loaderData }) => {
		const post = loaderData?.post;
		const title = post?.title ?? params.postId;

		return {
			meta: [
				{
					title: `${title} - Community`,
				},
			],
		};
	},
});

function RouteComponent() {
	const { postId } = Route.useParams();
	const { data } = useSuspenseQuery(fetchPostBySlugQueryOptions(postId));
	const { data: commentData } = useSuspenseInfiniteQuery(fetchPostCommentsQueryOpts(postId));
	const { mutate: likePost } = useLikePost();
	const { mutate: unlikePost } = useUnlikePost();
	const { title, body, username, slug, likedByUser, id, likeCount, communityId } = data[0];
	const comments = commentData?.pages.flatMap((p) => p.results) ?? [];
	const toggleLike = () =>
		likedByUser ? unlikePost({ postId: id, slug }) : likePost({ postId: id, slug });

	return (
		<div className="main p-4">
			<div className="breadcrumbs text-md mb-2">
				<ul>
					<li>
						<Link
							hidden={!communityId}
							to="/c/$communityId"
							params={{ communityId: communityId ?? "" }}
						>
							<Network className="h-4 w-4" />
							{`c/${communityId}`}
						</Link>
					</li>
					<li>
						<div>
							<User className="h-4 w-4" />
							{username}
						</div>
					</li>
				</ul>
			</div>
			<h1 className="text-4xl font-bold mb-3">{title}</h1>

			<p className="text-lg mt-3">{body}</p>
			<div className="flex flex-row px-0 py-3 gap-3">
				<button
					type="button"
					className={`btn btn-ghost rounded-full ${likedByUser ? `text-info` : `text-base-content`}`}
					onClick={toggleLike}
				>
					{likeCount}
					<ThumbsUp className="text-md" />
				</button>
				<button type="button" className="btn btn-ghost rounded-full text-zinc-600">
					{0}
					<MessageSquareText className="text-md" />
				</button>
			</div>
			<hr className="my-4" />
			<CommentInput postId={id} />
			<section className="flex flex-col gap-3 mt-4">
				{comments.map((comment) => (
					<Comment key={comment.id} comment={comment.comment} />
				))}
			</section>
		</div>
	);
}

function NotFoundComponent() {
	const { postId } = Route.useParams();

	return (
		<div className="main text-4xl text-error">{`Can't find anything for posts/${postId}`}</div>
	);
}
