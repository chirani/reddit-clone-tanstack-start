import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { postSchema } from "@/lib/posts/api";
import { useCreatePost } from "@/lib/posts/hooks";

export const Route = createFileRoute("/post/create")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { userSession } = context;

		if (!userSession) {
			throw redirect({ to: "/signup" });
		}
	},
});

function RouteComponent() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(postSchema),
	});
	const { mutate: createPost, isPending } = useCreatePost();

	const onSubmit = handleSubmit((data) => {
		createPost({ ...data });
	});

	return (
		<main className="main items-center">
			<div className="card">
				<form className="card-body gap-3 w-full md:w-[600px] mx-auto" onSubmit={onSubmit}>
					<h1 className="card-title">What are you think today?</h1>

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
