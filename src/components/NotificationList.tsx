import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { userNotifications } from "@/db/schema";
import { fetchPaginatedNotificationsOpts, useSetNotificationSeen } from "@/lib/notifications/hooks";

const NotificationList: React.FC = () => {
	const { data } = useSuspenseInfiniteQuery(fetchPaginatedNotificationsOpts(true));
	const notifications = data?.pages.flatMap((p) => p.results) ?? [];

	if (!notifications.length) {
		return (
			<ul className="list bg-base-100 gap-3 p-3 shadow">
				<li className="text-center p-4">No New Notifications</li>
				<Link to="/u/notifications" className="btn btn-ghost">
					View Old Notifications
				</Link>
			</ul>
		);
	}
	return (
		<ul className="list bg-base-100 gap-3 p-3 shadow">
			{notifications.map((notification) => (
				<li key={notification.id}>
					<Link to="/post/$postId" params={{ postId: notification.postId }}>
						<Notification {...notification} />
					</Link>
				</li>
			))}
		</ul>
	);
};

type UserNotificationProps = typeof userNotifications.$inferSelect;
interface NotificationProps {
	id: string;
	byUsername: string | null;
	notificationType: UserNotificationProps["notificationType"];
}

const Notification: React.FC<NotificationProps> = (props) => {
	const { mutate: setNotificationSeen } = useSetNotificationSeen();
	const { ref: inViewRef, inView } = useInView({ threshold: 0, triggerOnce: true });

	useEffect(() => {
		if (inView) {
			setNotificationSeen({ ids: [props.id] });
		}
	}, [inView, props.id, setNotificationSeen]);

	return <p ref={inViewRef}>{notificationTextFormatter(props)}</p>;
};

export const notificationTextFormatter = (notificationData: NotificationProps) => {
	const action =
		notificationData.notificationType === "post_like"
			? "liked your post"
			: "commented on your post";

	return `${notificationData?.byUsername ?? "User"} ${action}`;
};

export default NotificationList;
