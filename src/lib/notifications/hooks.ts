import { infiniteQueryOptions, useMutation } from "@tanstack/react-query";
import type z from "zod";
import {
	type CreateNotificationSchema,
	createUserNotifications,
	fetchPaginatedNotifications,
	setNotificationAsSeen,
} from "./api";

export const useCreateNotification = () =>
	useMutation({
		mutationKey: ["create-notifications"],
		mutationFn: (data: z.infer<typeof CreateNotificationSchema>) =>
			createUserNotifications({ data }),
	});

export const useSetNotificationSeen = () => {
	return useMutation({
		mutationKey: ["set-notifications"],
		mutationFn: ({ ids }: { ids: string[] }) => setNotificationAsSeen({ data: { ids } }),
	});
};

export const fetchPaginatedNotificationsOpts = (pendingOnly: boolean = true) =>
	infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-paginated-notifications", `${pendingOnly}`],
		queryFn: ({ pageParam }) =>
			fetchPaginatedNotifications({ data: { offset: pageParam, pendingOnly } }),
		getNextPageParam: (lastPage) => lastPage.nextOffset,
	});
