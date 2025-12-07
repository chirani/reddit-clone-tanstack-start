import { Link } from "@tanstack/react-router";
import type React from "react";
import { useAuthQuery, useSignOut } from "@/lib/auth/hooks";

const Navbar: React.FC = () => {
	const { data } = useAuthQuery();
	const { mutate: signOut, isPending: isSignouPending } = useSignOut();
	const isAuthenticated = !!data?.user;

	return (
		<div className="navbar bg-base-100 shadow-sm">
			<div className="navbar-start">
				<Link type="button" className="btn btn-ghost" to="/">
					<img src="/jumpr.svg" alt="Icon" width="65" />
				</Link>
			</div>

			<div className="navbar-end gap-3">
				{isAuthenticated && (
					<>
						<Link to="/post/create">
							<button type="button" className="btn btn-primary w-full">
								Create A Post
							</button>
						</Link>
						<details className="dropdown dropdown-end">
							<summary className="btn m-1">...More</summary>
							<ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-1 w-52 p-2 shadow-sm gap-2.5">
								<li>
									<Link to="/community/create" className="btn btn-sm btn-ghost">
										+ Create a Community
									</Link>
								</li>
								<li>
									<button
										disabled={isSignouPending}
										type="button"
										className="btn btn-sm btn-outline"
										onClick={() => {
											signOut();
										}}
									>
										Log out
									</button>
								</li>
							</ul>
						</details>
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
