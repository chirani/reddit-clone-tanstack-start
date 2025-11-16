import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSignIn } from "@/hooks/auth";

export const Route = createFileRoute("/signin")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { userSession } = context;

		if (userSession) {
			throw redirect({ to: "/" });
		}
	},
});

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8, " password must be 8 characters or longer"),
});

function RouteComponent() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
	});
	const { mutate: signIn, isPending } = useSignIn();

	const onSubmit = handleSubmit((data) => {
		signIn({ ...data });
	});

	return (
		<main className="main">
			<form onSubmit={onSubmit} className="mx-auto card w-96 bg-base-100 card-lg shadow-sm">
				<div className="card-body gap-3">
					<h2 className="card-title">Sign In</h2>
					<input
						type="email"
						{...register("email")}
						placeholder="Email"
						className="input"
						required
					/>
					{errors?.email?.message && (
						<div className="text-error py-3 px-1">{errors.email.message}</div>
					)}
					<input
						type="password"
						{...register("password")}
						placeholder="Password"
						className="input"
						required
					/>
					{errors?.password?.message && (
						<div className="text-error px-1">{errors.password.message}</div>
					)}
					<button type="submit" className="w-full btn btn-primary" disabled={isPending}>
						{!isPending ? "Login" : "Pending..."}
					</button>
				</div>
			</form>
		</main>
	);
}
