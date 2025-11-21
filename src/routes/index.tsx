import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import Post from "@/components/Post";
import { fetchPostsQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchPostsQueryOptions());
	},
});

function App() {
	const { data: posts } = useSuspenseQuery(fetchPostsQueryOptions());

	return (
		<main className="main flex flex-col items-stretch">
			{posts?.length && posts.map((post) => <Post key={post.id} {...post} />)}
		</main>
	);
}
