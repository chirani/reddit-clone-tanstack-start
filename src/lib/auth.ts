import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";

export const auth = betterAuth({
	enabled: true,
	emailAndPassword: {
		enabled: true,
	},
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
	}),
	//...your config
	plugins: [tanstackStartCookies()], // make sure this is the last plugin in the array
});
