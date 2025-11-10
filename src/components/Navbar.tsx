import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import type React from "react";
import { authClient } from "@/lib/auth-client";

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

interface INavbar {
	islogged: boolean;
}

const Navbar: React.FC<INavbar> = ({ islogged }) => {
	const { mutate: signOut } = useSignOut();

	return (
		<div className="navbar bg-base-100 shadow-sm">
			<div className="navbar-start">
				<button type="button" className="btn btn-ghost text-xl">
					daisyUI
				</button>
			</div>

			<div className="navbar-end">
				{islogged && (
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
