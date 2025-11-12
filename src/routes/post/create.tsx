import { createFileRoute, redirect } from "@tanstack/react-router";
import { useId } from "react";

export const Route = createFileRoute("/post/create")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { userSession } = context;

		if (!userSession) {
			throw redirect({ to: "/signup" });
		}
	},
});

function RouteComponent() {
	return (
		<main className="main p-3 items-center">
			<div className="card">
				<form className="card-body gap-3 w-96 md:w-[600px] mx-auto">
					<h1 className="card-title">What are you think today?</h1>
					<input className="input" placeholder="Post Title" type="text" />
					<textarea className="textarea" placeholder="Body" name="post" id={useId()}></textarea>
					<button type="button" className="btn btn-neutral">
						Publish
					</button>
				</form>
			</div>
		</main>
	);
}
