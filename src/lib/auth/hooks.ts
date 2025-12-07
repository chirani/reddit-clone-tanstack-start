import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { getContext } from "@/integrations/tanstack-query/root-provider";
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
		onSuccess: async () => {
			await Promise.all([
				router.invalidate(),
				queryClient.invalidateQueries({ queryKey: ["user"] }),
			]);
			window.location.replace("/");
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
		onSuccess: async () => {
			await Promise.all([
				router.invalidate(),
				queryClient.invalidateQueries({ queryKey: ["user"] }),
			]);
			window.location.replace("/");
		},
	});
};

export const useSignOut = () => {
	const router = useRouter();
	const context = getContext();

	return useMutation({
		mutationFn: async () => {
			return await authClient.signOut();
		},
		onSuccess: async () => {
			await Promise.all([
				router.invalidate(),
				context.queryClient.invalidateQueries({ queryKey: ["user"] }),
			]);
			window.location.replace("/");
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
