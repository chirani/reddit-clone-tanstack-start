import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareText } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { usePostComment } from "@/lib/posts/hooks";

const commentSchema = z.object({
	comment: z.string().min(1),
});

interface ICommentInput {
	postId: string;
}
const CommentInput: React.FC<ICommentInput> = (props) => {
	const [commentHidden, toggleHidden] = useState<boolean>(false);
	const { mutate: postComment, isPending } = usePostComment();
	const { register, handleSubmit, setFocus, reset } = useForm({
		resolver: zodResolver(commentSchema),
	});
	const onSubmit = handleSubmit((data) => {
		console.log(data);
		postComment({ comment: data.comment.trim(), postId: props.postId });
		reset();
	});

	return (
		<form onSubmit={onSubmit}>
			<label
				onMouseDown={() => {
					setFocus("comment");
					toggleHidden(true);
				}}
				htmlFor="comment"
				className="input md:input-lg rounded-full"
				hidden={commentHidden}
			>
				<MessageSquareText className="text-md mx-3" />
				<p className="opacity-50">Green Eggs and Ham</p>
			</label>
			<textarea
				className="textarea"
				placeholder="Write Comment..."
				hidden={!commentHidden}
				{...register("comment")}
			/>
			<div className="flex flex-row-reverse py-3 gap-3" hidden={!commentHidden}>
				<button disabled={isPending} title="Post Comment" type="submit" className="btn btn-neutral">
					Post Comment
				</button>
			</div>
		</form>
	);
};

export default CommentInput;
