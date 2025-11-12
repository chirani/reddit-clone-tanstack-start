import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
});

function App() {
	return (
		<main className="main p-3 flex flex-col items-center">
			<div className="card card-xl border-2 bg-white">
				<div className="card-body">
					<div className="card-title">This Is Card Title</div>
					<Link to="/post/create" className="w-full bg-red-100">
						<button type="button" className="btn btn-primary w-full">
							Create A Post
						</button>
					</Link>
				</div>
			</div>
		</main>
	);
}
