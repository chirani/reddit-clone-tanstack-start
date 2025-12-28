import * as fs from "node:fs/promises";
import { auth } from "../src/lib/auth.ts";

export type UserCredential = {
	password: string;
	email: string;
	name: string;
};

const userList = JSON.parse(
	await fs.readFile(new URL("./json/user_data.json", import.meta.url), "utf-8"),
);
const typedUsers = userList as UserCredential[];

export const createUsers = async () => {
	const usersList = typedUsers.map((u) => ({
		password: u.password,
		email: u.email,
		name: u.name,
	}));

	usersList.forEach(async (u) => {
		try {
			const res = await auth.api.signUpEmail({
				body: {
					...u,
				},
			});
			console.log("Sign up successful:", res);
		} catch (error) {
			console.log("Sign up failed:", error);
		}
	});
};
(async () => {
	await createUsers();
})();
