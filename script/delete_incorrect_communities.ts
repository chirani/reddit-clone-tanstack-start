import { like } from "drizzle-orm";
import { db } from "../src/db/index.ts"
import { communities } from "../src/db/schema.ts"

(async()=>{

    const deletedItem =await db.update(communities).set({deletedAt:new Date()}).where(like(communities.title, '% %')).returning();
return deletedItem;
})()