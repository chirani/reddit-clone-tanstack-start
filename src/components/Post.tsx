import { Link } from "@tanstack/react-router";
import { MessageSquareText, ThumbsUp } from "lucide-react";
import { useLikePost, useUnlikePost } from "@/lib/posts/hooks";

interface IPost {
	id: string;
	title: string;
	body: string;
	slug: string;
	likeCount: number;
	likedByUser: boolean;
}

const Post = ({ id, title, body, likeCount, likedByUser, slug }: IPost) => {
	const { mutate: likePost } = useLikePost();
	const { mutate: unlikePost } = useUnlikePost();
	const toggleLike = () => (likedByUser ? unlikePost({ postId: id }) : likePost({ postId: id }));

	return (
		<div className="mb-0 bg-white border-b border-b-zinc-200">
			<Link to="/post/$postId" params={{ postId: slug }} className="visited:text-teal-800">
				<div className="p-6 hover:opacity-50">
					<h2 className="text-2xl font-semibold">{title}</h2>
					<p className="text-lg">{body}</p>
				</div>
			</Link>
			<div className="flex flex-row px-6 py-3 gap-3">
				<button
					type="button"
					className={`btn btn-ghost rounded-full ${likedByUser ? "text-teal-500" : "text-zinc-600"}`}
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
