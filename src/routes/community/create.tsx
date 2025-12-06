import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/community/create")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/community/create"!</div>;
}
