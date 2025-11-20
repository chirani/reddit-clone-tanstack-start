import { Link } from "@tanstack/react-router";
import { ThumbsUp } from "lucide-react";
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
	const toggleLike = () => (likedByUser ? unlikePost(id) : likePost(id));

	return (
		<Link to="/post/$postId" params={{ postId: slug }}>
			<div className="mb-0 p-6 bg-white border-b border-b-zinc-200">
				<h2 className="text-2xl font-semibold">{title}</h2>
				<p className="text-lg">{body}</p>
				<div className="flex flex-row mt-4">
					<button
						type="button"
						className={`btn btn-ghost rounded-full ${likedByUser ? "text-teal-500" : "text-zinc-600"}`}
						onMouseDown={toggleLike}
					>
						{likeCount}
						<ThumbsUp className="text-md" fill="red" />
					</button>
				</div>
			</div>
		</Link>
	);
};

export default Post;
