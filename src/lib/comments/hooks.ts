import { infiniteQueryOptions, useMutation } from "@tanstack/react-query";
import { deleteComment, fetchPostComments, postComment } from "./api";

export const usePostComment = () => {
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ postId, comment }: { postId: string; comment: string; slug?: string }) =>
			await postComment({ data: { postId, comment } }),
		onSuccess: (_data, _params, _onMutateResult, context) => {
			context.client.invalidateQueries({ queryKey: ["fetch-comments"] });
		},
	});
};

export const useRemoveComment = () => {
	return useMutation({
		mutationKey: ["post-comment"],
		mutationFn: async ({ commentId }: { commentId: string }) =>
			await deleteComment({ data: { commentId } }),
	});
};

export const fetchPostCommentsQueryOpts = (postId: string) => {
	return infiniteQueryOptions({
		initialPageParam: 0,
		queryKey: ["fetch-comments", postId],
		queryFn: async ({ pageParam }) => {
			const page = await fetchPostComments({ data: { postId, offset: pageParam, limit: 7 } });
			return page;
		},
		getNextPageParam: (lastPage) => lastPage.nextOffset,
	});
};
