import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareText } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const commentSchema = z.object({
	comment: z.string(),
});
interface ICommentInput {
	id: string;
}
const CommentInput: React.FC<ICommentInput> = () => {
	const [commentHidden, toggleHidden] = useState<boolean>(false);
	const {
		register,
		handleSubmit,
		setFocus,
		reset,
		//formState: { errors },
	} = useForm({
		resolver: zodResolver(commentSchema),
	});
	const onSubmit = handleSubmit((data) => {
		console.log(data);
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
				className="input md:input-xl rounded-full"
				hidden={commentHidden}
			>
				<MessageSquareText className="text-md mx-3" />
				<p className="opacity-50">Green Eggs and Ham</p>
			</label>
			<input
				className="input input-lg"
				placeholder="Write Comment..."
				{...register("comment")}
				hidden={!commentHidden}
			/>
		</form>
	);
};

export default CommentInput;
