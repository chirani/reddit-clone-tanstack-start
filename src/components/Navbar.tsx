import { Link } from "@tanstack/react-router";
import { Bell, Menu, PlusCircleIcon } from "lucide-react";
import type React from "react";
import { useAuthQuery, useSignOut } from "@/lib/auth/hooks";

const Navbar: React.FC = () => {
	const { data } = useAuthQuery();
	const { mutate: signOut, isPending: isSignouPending } = useSignOut();
	const isAuthenticated = !!data?.user;

	return (
		<nav className="navbar bg-base-100 shadow-sm sticky top-0 z-400">
			<div className="navbar-start">
				<Link type="button" className="btn btn-ghost" to="/">
					<img src="/community.svg" alt="Icon" width="100" />
				</Link>
			</div>
			<DesktopRightMenu
				isSignouPending={isSignouPending}
				signOut={signOut}
				isAuthenticated={isAuthenticated}
			/>
			<MobileRightMenu
				isSignouPending={isSignouPending}
				signOut={signOut}
				isAuthenticated={isAuthenticated}
			/>
		</nav>
	);
};

interface RightMenuProps {
	isAuthenticated: boolean;
	signOut: () => void;
	isSignouPending: boolean;
}

const DesktopRightMenu: React.FC<RightMenuProps> = ({
	isAuthenticated,
	signOut,
	isSignouPending,
}) => {
	return (
		<div className="hidden md:flex navbar-end gap-3">
			{isAuthenticated && (
				<>
					<Link to="/post/create">
						<button type="button" className="btn btn-primary w-full">
							Create A Post
						</button>
					</Link>
					<div className="indicator">
						<button className="btn btn-ghost" type="button" title="notification">
							<span className="indicator-item status status-error animate-pulse" />
							<Bell />
						</button>
					</div>
					<details open={false} className="dropdown dropdown-end">
						<summary className="btn btn-ghost m-1">
							<Menu className="text-primary" />
						</summary>
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
	);
};

const MobileRightMenu: React.FC<RightMenuProps> = ({
	isAuthenticated,
	signOut,
	isSignouPending,
}) => {
	return (
		<div className="flex md:hidden navbar-end gap-3">
			{isAuthenticated && (
				<>
					<Link to="/post/create">
						<button type="button" className="btn btn-primary">
							<PlusCircleIcon />
						</button>
					</Link>
					<div className="indicator">
						<button className="btn btn-ghost" type="button" title="notification">
							<span className="indicator-item status status-error animate-pulse" />
							<Bell />
						</button>
					</div>
					<details open={false} className="dropdown dropdown-end">
						<summary className="btn btn-ghost m-1">
							<Menu className="text-primary" />
						</summary>
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
						<button type="button" className="hidden md:visible btn btn-accent">
							Login
						</button>
					</Link>
				</>
			)}
		</div>
	);
};

export default Navbar;
