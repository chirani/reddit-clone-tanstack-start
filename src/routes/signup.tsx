import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { useSignUp } from "@/lib/auth/hooks";

export const Route = createFileRoute("/signup")({
	component: Signup,
	beforeLoad: ({ context }) => {
		const { userSession } = context;

		if (userSession?.user) {
			throw redirect({ to: "/", search: { top: "7d", is_new: false } });
		}
	},
});

const signupSchema = z.object({
	name: z.string().min(3, "Name too short"),
	email: z.email(),
	password: z.string().min(8, " password must be 8 characters or longer"),
});

export default function Signup() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(signupSchema),
	});

	const { mutate: signUp } = useSignUp();

	const onSubmit = handleSubmit((data) => {
		signUp({ ...data });
	});

	return (
		<main className="my-16">
			<form
				onSubmit={onSubmit}
				className="mx-4 sm:mx-auto sm:w-96 card bg-base-100 card-lg shadow-sm"
			>
				<div className="card-body gap-3">
					<h2 className="card-title">Sign Up</h2>

					<input type="text" {...register("name")} placeholder="Name" className="input" required />
					{errors?.name?.message && (
						<div className="text-error py-3 px-1">{errors.name.message}</div>
					)}
					<input type="email" {...register("email")} placeholder="Email" className="input" />
					{errors?.email?.message && (
						<div className="text-error py-3 px-1">{errors.email.message}</div>
					)}
					<input
						type="password"
						{...register("password")}
						placeholder="Password"
						className="input"
					/>
					{errors?.password?.message && (
						<div className="text-error py-3 px-1">{errors.password.message}</div>
					)}
					<button type="submit" className="w-full btn btn-primary">
						Sign Up
					</button>
				</div>
			</form>
		</main>
	);
}
