interface CommentProps {
	comment: string;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
	return <div className="p-3 bg-base-200">{comment}</div>;
};

export default Comment;
