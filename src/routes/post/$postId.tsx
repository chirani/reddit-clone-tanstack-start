import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchPostBySlugQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/post/$postId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { postId } = params;
		await context.queryClient.ensureQueryData(fetchPostBySlugQueryOptions(postId));
	},
	notFoundComponent: NotFoundComponent,
});

function RouteComponent() {
	const { postId } = Route.useParams();
	const { data } = useSuspenseQuery(fetchPostBySlugQueryOptions(postId));
	const postData = data[0];

	return (
		<div className="main p-4">
			<h1 className="text-3xl">{postData.title}</h1>
			<p className="text-md">
				By <span className="text-primary">{postData.username}</span>
			</p>
			<p className="text-lg mt-3">{postData.body}</p>
		</div>
	);
}

function NotFoundComponent() {
	const { postId } = Route.useParams();

	return (
		<div className="main text-4xl text-error">{`Can't find anything for posts/${postId}`}</div>
	);
}
