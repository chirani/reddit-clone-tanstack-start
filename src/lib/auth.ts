import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { db } from "@/db";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
	},
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
	}),
	//...your config
	plugins: [reactStartCookies()], // make sure this is the last plugin in the array
});
