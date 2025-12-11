import type { accountInsertType } from "@/db/types.js";
import { db } from "../src/db/index.ts";
import { account, user } from "../src/db/schema.ts";
import { accounts, users } from "./account.ts";

const createUsers = async () => {
	const accountList: accountInsertType[] = accounts.map((a) => {
		return {
			accountId: a.account_id,
			id: a.id,
			password: a.password,
			providerId: "credential",
			userId: a.user_id,
		};
	});

	await db.insert(user).values(users);
	await db.insert(account).values(accountList);
};
const createCommunity = async () => {};

(async () => {
	await createUsers();
	await createCommunity();
})();
