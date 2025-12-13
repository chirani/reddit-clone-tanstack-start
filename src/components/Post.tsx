import { Link } from "@tanstack/react-router";
import { MessageSquareText, ThumbsUp } from "lucide-react";
import { useLikePost, useUnlikePost } from "@/lib/posts/hooks";

interface PostProps {
	id: string;
	title: string;
	body: string;
	slug: string;
	username: string | null;
	communityId: string | null;
	likeCount: number;
	likedByUser: boolean;
}

const Post = ({
	id,
	title,
	body,
	likeCount,
	likedByUser,
	username = "",
	communityId = "",
}: PostProps) => {
	const { mutate: likePost } = useLikePost();
	const { mutate: unlikePost } = useUnlikePost();
	const toggleLike = () => (likedByUser ? unlikePost({ postId: id }) : likePost({ postId: id }));

	return (
		<div className="mb-0 bg-base-100 border-b border-b-base-200">
			<Link to="/post/$postId" params={{ postId: id }} className="visited:text-accent-content">
				<div className="p-6 hover:opacity-50">
					<h2 className="text-2xl font-semibold ">{title}</h2>
					<p className="text-md">
						By <span className="text-primary">{username}</span> c/
						<span className="text-primary">{communityId}</span>
					</p>
					<p className="text-lg">{body}</p>
				</div>
			</Link>
			<div className="flex flex-row px-6 py-3 gap-3">
				<button
					type="button"
					className={`btn btn-ghost rounded-full ${likedByUser ? "text-info" : "text-base-content"}`}
					onClick={toggleLike}
				>
					{likeCount}
					<ThumbsUp className="text-md" />
				</button>
				<button type="button" className="btn btn-ghost rounded-full text-zinc-600">
					{0}
					<MessageSquareText className="text-md" />
				</button>
			</div>
		</div>
	);
};

export default Post;
