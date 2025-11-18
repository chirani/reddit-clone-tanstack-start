import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchPostQueryOptions } from "@/hooks/post";

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
					<div key={post.id} className="mb-4 p-4 bg-white shadow-sm">
						<h2 className="text-2xl font-semibold">{post.title}</h2>
						<p className="text-lg">{post.body}</p>
					</div>
				))}
		</main>
	);
}
