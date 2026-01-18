import { Link } from "@tanstack/react-router";
import { Bell, Menu, PlusCircleIcon } from "lucide-react";
import type React from "react";
import { useId } from "react";
import { useAuthQuery, useSignOut } from "@/lib/auth/hooks";
import NotificationList from "./NotificationList";

const Navbar: React.FC = () => {
	const { data } = useAuthQuery();
	const { mutate: signOut, isPending: isSignouPending } = useSignOut();
	const isAuthenticated = !!data?.user;

	return (
		<nav className="navbar bg-base-100 shadow-sm sticky top-0 z-400">
			<div className="navbar-start">
				<Link
					type="button"
					className="btn btn-ghost"
					to="/"
					search={{ top: "7d" }}
					viewTransition={true}
				>
					<img src="/logo_full.svg" alt="Icon" width="100" />
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
	const notificationPopover = useId();
	const menuPopover = useId();
	return (
		<div className="hidden md:flex navbar-end gap-3">
			{isAuthenticated && (
				<>
					<Link to="/post/create" search={{ communityId: "" }}>
						<button type="button" className="btn btn-primary w-full">
							Create A Post
						</button>
					</Link>
					<div className="indicator">
						<button
							className="btn btn-ghost"
							type="button"
							title="notification"
							popoverTarget={notificationPopover}
							style={{ anchorName: "--anchor-1" }}
						>
							<span className="indicator-item status status-error animate-pulse" />
							<Bell />
						</button>
					</div>
					<button
						className="btn btn-ghost"
						type="button"
						title="menu"
						popoverTarget={menuPopover}
						style={{ anchorName: "--anchor-2" }}
					>
						<Menu className="text-primary" />
					</button>
					<ul
						className="dropdown dropdown-end menu sm:w-96 bg-transparent"
						popover="auto"
						id={notificationPopover}
						style={{ positionAnchor: "--anchor-1" } as React.CSSProperties}
					>
						<NotificationList />
					</ul>
					<ul
						className="dropdown dropdown-end menu sm:w-64 bg-base-100 flex flex-col gap-3 p-3 shadow"
						popover="auto"
						id={menuPopover}
						style={{ positionAnchor: "--anchor-2" } as React.CSSProperties}
					>
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
		<div className="flex md:hidden navbar-end gap-0 sm:gap-3">
			{isAuthenticated && (
				<>
					<Link to="/post/create" search={{ communityId: "" }}>
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
