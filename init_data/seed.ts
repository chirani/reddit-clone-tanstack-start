import { createComments } from "./createComments.ts";
import { createCommunities } from "./createCommunity.ts";
import { createPosts } from "./createPosts.ts";
import { createUsers } from "./createUsers.ts";

(async () => {
	await createUsers();
	await createCommunities();
	await createPosts();
	await createComments();
})();
