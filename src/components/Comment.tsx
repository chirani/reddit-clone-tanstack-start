interface CommentProps {
	comment: string;
	username: string;
}

const Comment: React.FC<CommentProps> = ({ comment, username }) => {
	return (
		<div className="p-3 bg-base-100 odd:bg-base-300">
			<span className="text-primary">
				{username}
				{": "}
			</span>
			{comment}
		</div>
	);
};

export default Comment;
