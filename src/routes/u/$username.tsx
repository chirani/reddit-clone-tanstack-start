import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/u/$username")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();

	return <div>Hello {params.username}!</div>;
}
