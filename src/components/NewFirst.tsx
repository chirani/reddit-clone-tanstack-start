import { Link } from "@tanstack/react-router";

interface NewFirstPops {
	href: "/" | "/c/$communityId";
	isNew: boolean;
}

const NewFirst: React.FC<NewFirstPops> = (props) => {
	const { isNew, href } = props;

	return (
		<Link
			to={href}
			className={`btn m-1 ${isNew ? "btn-active" : "btn-ghost"}`}
			search={{ top: "365d", is_new: true }}
		>
			New
		</Link>
	);
};
export default NewFirst;
