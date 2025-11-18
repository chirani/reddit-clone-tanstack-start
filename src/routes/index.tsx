import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import Post from "@/components/Post";
import { fetchPostQueryOptions } from "@/lib/posts/hooks";

export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchPostQueryOptions());
	},
});

function App() {
	const { data: posts } = useSuspenseQuery(fetchPostQueryOptions());

	return (
		<main className="main p-3 flex flex-col items-stretch">
			{posts?.length &&
				posts.map((post) => (
					<Post
						key={post.id}
						id={post.id}
						title={post.title}
						body={post.body}
						likeCount={post.likeCount}
					/>
				))}
		</main>
	);
}
