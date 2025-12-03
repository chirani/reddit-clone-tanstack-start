import { db } from "../src/db/index.ts";
import { comments } from "../src/db/schema.ts";
import { count,  eq, isNull, or } from "drizzle-orm";



(async function() {
    const res =  await db.select({count:count()}).from(comments).where(isNull(comments.comment))
    console.log(res.length)
    const res2 =  await db.delete(comments).where(or(isNull(comments.comment),eq(comments.comment,""))).returning()
    console.log(res2)   
})();