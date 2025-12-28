interface CommentProps {
	comment: string;
	username: string;
}

const Comment: React.FC<CommentProps> = ({ comment, username }) => {
	return (
		<div className="p-3 bg-base-100 odd:bg-base-200">
			<p className="text-primary text-sm">{`u/${username}`}</p>
			<p>{comment}</p>
		</div>
	);
};

export default Comment;
