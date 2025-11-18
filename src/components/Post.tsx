import { ThumbsUp } from "lucide-react";

interface IPost {
	id: string;
	title: string;
	body: string;
	likeCount: number;
}

const Post = ({ id, title, body, likeCount }: IPost) => {
	return (
		<div key={id} className="mb-4 p-4 bg-white border-b border-b-zinc-200">
			<h2 className="text-2xl font-semibold">{title}</h2>
			<p className="text-lg">{body}</p>
			<div className="flex flex-row mt-4">
				<button type="button" className="btn btn-ghost rounded-full">
					{Math.abs(likeCount)}
					<ThumbsUp className="text-zinc-600 text-md" />
				</button>
			</div>
		</div>
	);
};

export default Post;
