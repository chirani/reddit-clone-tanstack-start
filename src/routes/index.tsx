import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return <main className="p-3 bg-red-200"></main>;
}
