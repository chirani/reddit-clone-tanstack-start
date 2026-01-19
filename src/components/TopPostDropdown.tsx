import { Link } from "@tanstack/react-router";
import { ArrowDown01 } from "lucide-react";
import type { TopPostPeriod } from "@/lib/posts/api";

export const topPeriod: Record<TopPostPeriod, string> = {
	"1d": "Today",
	"7d": "This Week",
	"30d": "This Month",
	"365d": "This Year",
};

const TopPostsDropDown = ({
	period,
	href,
	communityId,
}: {
	period: TopPostPeriod;
	href: "/" | "/c/$communityId";
	communityId?: string | null;
}) => {
	const params = communityId ? { communityId } : {};

	return (
		<details className="dropdown dropdown-hover dropdown-end">
			<summary className="btn btn-ghost m-1">
				<span className="hidden sm:inline">Top Posts</span>
				<ArrowDown01 className="text-primary" /> {topPeriod[period]}
			</summary>
			<ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-1 p-2 shadow-sm gap-2.5">
				<li>
					<Link
						to={href}
						params={params}
						search={{ top: "1d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Today
					</Link>
				</li>
				<li>
					<Link
						to={href}
						params={params}
						search={{ top: "7d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 7 Days
					</Link>
				</li>
				<li>
					<Link
						to={href}
						params={params}
						search={{ top: "30d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 30 days
					</Link>
				</li>
				<li>
					<Link
						to={href}
						params={params}
						search={{ top: "365d" }}
						className="btn btn-sm btn-ghost"
						reloadDocument
					>
						Last 365 days
					</Link>
				</li>
			</ul>
		</details>
	);
};

export default TopPostsDropDown;
