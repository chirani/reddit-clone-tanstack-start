import { db } from "../src/db/index.ts";
import { comments, posts } from "../src/db/schema.ts";
import {  eq, isNull } from "drizzle-orm";



(async function() {
    const res =   await db.select({id:posts.id}).from(posts).where(isNull(posts.communityId))

    res.forEach(async (post)=>{
        console.log("Post Id", post.id)
        await db.delete(comments).where(eq(comments.postId,post.id))
    })
    
    const res2 =  await db.delete(posts).where(isNull(posts.communityId)).returning()
    console.log(res2)
})();