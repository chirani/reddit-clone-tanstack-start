import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getContext } from "@/integrations/tanstack-query/root-provider";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { authQueries } from "./api";

export const useSignIn = () => {
	const router = useRouter();
	const session = authClient.useSession();
	const { queryClient } = getContext();
	const user = session?.data?.user;
	return useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			if (user) return;
			return await authClient.signIn.email({
				email,
				password,
			});
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["user"] });
			router.invalidate();
		},
	});
};

export const useSignUp = () => {
	const router = useRouter();
	const { queryClient } = getContext();
	return useMutation({
		mutationFn: async ({
			email,
			password,
			name,
		}: {
			email: string;
			password: string;
			name: string;
		}) => {
			return await authClient.signUp.email({
				email,
				password,
				name,
			});
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["user"] });
			router.invalidate();
		},
	});
};

export const userAuthMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });

		if (!session?.user) {
			throw new Error("Unauthorized");
		}
		return next({ context: { session: session.session, user: session.user } });
	},
);

export const useSignOut = () => {
	const router = useRouter();
	const context = getContext();

	return useMutation({
		mutationFn: async () => {
			await authClient.signOut();
		},
		onSuccess: async () => {
			await Promise.all([
				router.invalidate(),
				context.queryClient.invalidateQueries({ queryKey: ["user"] }),
			]);
		},
	});
};

export const useAuthQuery = () => useQuery(authQueries.user());

export const useAuthentication = () => useSuspenseQuery(authQueries.user());

export const useAuthenticatedUser = () => {
	const { data: userSession } = useAuthentication();

	if (userSession !== null) {
		throw new Error("User is not authenticated!");
	}

	return userSession;
};
