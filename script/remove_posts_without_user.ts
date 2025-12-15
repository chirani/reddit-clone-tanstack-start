import { count, isNull } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { posts } from "../src/db/schema.ts";

(async () => {
	const res = await db.select({ count: count() }).from(posts).where(isNull(posts.userId));
	console.log(res.length);
	const res2 = await db.delete(posts).where(isNull(posts.userId)).returning();
	console.log(res2);
})();
