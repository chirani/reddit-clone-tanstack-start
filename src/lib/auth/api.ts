import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const getUserSession = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();

	if (!headers) {
		return null;
	}

	const userSession = await auth.api.getSession({ headers });

	if (!userSession) return null;

	return userSession;
});

export const authQueries = {
	all: ["auth"],
	user: () =>
		queryOptions({
			queryKey: [...authQueries.all, "user"],
			queryFn: async () => await getUserSession(),
			staleTime: 5000,
		}),
};

export const userAuthMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });

		if (!session?.user) {
			throw redirect({ to: "/signin" });
		}
		return next({ context: { session: session.session, user: session.user } });
	},
);
