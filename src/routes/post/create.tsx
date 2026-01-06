import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { fetchCommunitiesQueryOpts } from "@/lib/community/hooks";
import { postSchema } from "@/lib/posts/api";
import { useCreatePost } from "@/lib/posts/hooks";

const createCommunitySearchSchema = z.object({
	communityId: z.string().catch(""),
});

export const Route = createFileRoute("/post/create")({
	validateSearch: (search) => createCommunitySearchSchema.parse(search),
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { userSession } = context;

		if (!userSession) {
			throw redirect({ to: "/signup" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchCommunitiesQueryOpts());
	},

	head: () => ({
		meta: [
			{
				title: "Write Post - Community",
			},
		],
	}),
});

function RouteComponent() {
	const { communityId } = Route.useSearch();
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(postSchema),
	});
	const { data } = useSuspenseQuery(fetchCommunitiesQueryOpts());
	const { mutateAsync: createPost, isPending } = useCreatePost();

	const onSubmit = handleSubmit(async (data) => {
		await createPost({ ...data });
		reset();
	});

	return (
		<main className="main items-center">
			<div className="card">
				<form className="card-body gap-3 w-full md:w-150 mx-auto" onSubmit={onSubmit}>
					<h1 className="card-title">What are you think today?</h1>
					<select
						className="select w-full"
						defaultValue={communityId}
						disabled={Boolean(communityId)}
						{...register("communityId")}
					>
						<option value="" disabled>
							Select Community
						</option>
						{data.map((community) => (
							<option className="option" key={community.communityId} value={community.communityId}>
								{community.communityId}
							</option>
						))}
					</select>
					{errors?.communityId?.message && (
						<p className="text-error">{errors?.communityId?.message}</p>
					)}
					<input className="input" placeholder="Post Title" type="text" {...register("title")} />
					{errors?.title?.message && <p className="text-error px-3">{errors.title.message}</p>}
					<textarea className="textarea" placeholder="Body" {...register("body")} />
					{errors?.body?.message && <p className="text-error px-3">{errors.body.message}</p>}
					<button type="submit" className="btn btn-neutral" disabled={isPending}>
						{!isPending ? "Publish" : "Pending..."}
					</button>
				</form>
			</div>
		</main>
	);
}
