import { useMutation, useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import type React from "react";
import { authClient } from "@/lib/auth-client";

export const useSession = () => {
	return useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const session = await authClient.getSession();
			return session;
		},
	});
};

export const useSignOut = () => {
	return useMutation({
		mutationFn: async () => {
			const session = await authClient.getSession();

			if (session === null) {
				return;
			}
			await authClient.signOut();
		},
		onSuccess: () => {
			throw redirect({ to: "/signup" });
		},
	});
};

const Navbar: React.FC = () => {
	const { data } = useSession();
	const { mutate: signOut } = useSignOut();
	const isLogged = !!data?.data?.user;
	return (
		<div className="navbar bg-base-100 shadow-sm">
			<div className="navbar-start">
				<button type="button" className="btn btn-ghost text-xl">
					daisyUI
				</button>
			</div>

			<div className="navbar-end">
				{isLogged && (
					<button
						type="button"
						className="btn"
						onMouseDown={() => {
							signOut();
						}}
					>
						Log out
					</button>
				)}
			</div>
		</div>
	);
};

export default Navbar;
