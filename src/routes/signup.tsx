import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";

export const useSignIn = () => {
	return useMutation({
		mutationFn: async ({
			email,
			password,
			name,
		}: {
			email: string;
			password: string;
			name: string;
		}) => {
			authClient.getSession();
			return await authClient.signUp.email({
				email,
				password,
				name,
			});
		},
		onSuccess() {
			throw redirect({ to: "/signup" });
		},
	});
};

export const Route = createFileRoute("/signup")({
	component: Signup,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (session?.data?.user) {
			throw redirect({ to: "/" });
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

	const { mutate: signIn } = useSignIn();

	const onSubmit = handleSubmit((data) => {
		signIn({ ...data });
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<form onSubmit={onSubmit} className="card w-96 bg-base-100 card-lg shadow-sm">
				<div className="card-body gap-3">
					<h2 className="card-title">Sign Up</h2>

					<input type="text" {...register("name")} placeholder="Name" className="input" required />
					{errors?.name?.message && (
						<div className="text-error py-3 px-1">{errors.name.message}</div>
					)}
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
						<div className="text-error py-3 px-1">{errors.password.message}</div>
					)}
					<button type="submit" className="w-full btn btn-primary">
						Sign Up
					</button>
				</div>
			</form>
		</div>
	);
}
