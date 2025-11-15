import { Link } from "@tanstack/react-router";
import type React from "react";
import { useAuthQuery, useSignOut } from "@/hooks/auth";

const Navbar: React.FC = () => {
	const { data } = useAuthQuery();
	const { mutate: signOut } = useSignOut();

	const isAuthenticated = !!data?.user;

	return (
		<div className="navbar bg-base-100 shadow-sm">
			<div className="navbar-start">
				<Link to="/">
					<button type="button" className="btn btn-ghost text-xl">
						daisyUI
					</button>
				</Link>
			</div>

			<div className="navbar-end gap-3">
				{isAuthenticated && (
					<>
						<Link to="/post/create" className="bg-red-100">
							<button type="button" className="btn btn-primary w-full">
								Create A Post
							</button>
						</Link>
						<button
							type="button"
							className="btn btn-outline btn-neutral"
							onMouseDown={() => {
								signOut();
							}}
						>
							Log out
						</button>
					</>
				)}
				{!isAuthenticated && (
					<>
						<Link to="/signup">
							<button type="button" className="btn">
								Signup
							</button>
						</Link>
						<Link to="/signin">
							<button type="button" className="btn btn-accent">
								Login
							</button>
						</Link>
					</>
				)}
			</div>
		</div>
	);
};

export default Navbar;
