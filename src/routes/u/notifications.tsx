import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { notificationTextFormatter } from "@/components/NotificationList";
import { fetchPaginatedNotificationsOpts } from "@/lib/notifications/hooks";

export const Route = createFileRoute("/u/notifications")({
	beforeLoad: async ({ context }) => {
		if (!context.userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	component: RouteComponent,
	ssr: false,
});

function RouteComponent() {
	const { data } = useSuspenseInfiniteQuery(fetchPaginatedNotificationsOpts(false));
	const notifications = data?.pages.flatMap((p) => p.results) ?? [];

	return (
		<div className={"main mx-3 sm:mx-0 flex flex-col gap-3 "}>
			{notifications.map((n) => (
				<div
					key={n.id}
					className={`p-3 rounded border border-base-300 ${n.seenAt ? "border-primary" : ""}`}
				>
					{notificationTextFormatter(n)}
				</div>
			))}
		</div>
	);
}
