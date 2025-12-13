import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { communityIdFormatter, communitySchema } from "@/lib/community/api";
import { useCreateCommunity } from "@/lib/community/hooks";

export const Route = createFileRoute("/community/create")({
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
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(communitySchema),
	});
	const { mutate: createCommunity, isPending } = useCreateCommunity();

	const onSubmit = handleSubmit((data) => {
		createCommunity({ ...data });
	});

	return (
		<main className="main items-center">
			<div className="card">
				<form className="card-body gap-3 w-full md:w-[600px] mx-auto" onSubmit={onSubmit}>
					<h1 className="card-title">Create A Comminty</h1>

					<input
						className="input"
						placeholder="Community Title"
						type="text"
						{...register("title")}
					/>
					{errors?.title?.message && <p className="text-error px-3">{errors.title.message}</p>}
					<textarea
						className="textarea"
						placeholder="Community Description"
						{...register("description")}
					/>
					{errors?.description?.message && (
						<p className="text-error px-3">{errors.description.message}</p>
					)}
					{!!watch("title") && (
						<p className="font-bold">
							<span className="font-medium">Communiuty Display name: </span>
							{communityIdFormatter(watch("title", ""))}
						</p>
					)}
					<button type="submit" className="btn btn-neutral" disabled={isPending}>
						{!isPending ? "Launch a Community" : "Pending..."}
					</button>
				</form>
			</div>
		</main>
	);
}
