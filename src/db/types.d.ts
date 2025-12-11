import type { account, posts, user } from "./schema";

export type postInsertType = typeof posts.$inferInsert;
export type userInsertType = typeof user.$inferInsert;
export type accountInsertType = typeof account.$inferInsert;
