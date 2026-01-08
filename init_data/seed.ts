import { countComments, createComments } from "./createComments.ts";
import { createCommunities } from "./createCommunity.ts";
import { countLikes, createLikes } from "./createLikes.ts";
import { createPosts } from "./createPosts.ts";
import { createUsers } from "./createUsers.ts";

(async () => {
	await createUsers();
	await createCommunities();
	await createPosts();
	await createComments();
	await countComments();
	await createLikes();
	await countLikes();
})();
