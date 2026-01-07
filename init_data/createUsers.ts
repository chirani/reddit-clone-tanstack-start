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
	console.log("[1/5] create users");
	typedUsers.forEach(async (u) => {
		try {
			await auth.api.signUpEmail({
				body: {
					...u,
				},
			});
			console.log("Sign up successful");
		} catch (_error) {
			console.log("Sign up failed:");
		}
	});
};
