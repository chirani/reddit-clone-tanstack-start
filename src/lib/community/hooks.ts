import { queryOptions, useMutation } from "@tanstack/react-query";
import {
	addCommunityAdmin,
	type Community,
	createCommunity,
	fetchCommunities,
	fetchCommunityMetadata,
} from "./api";

export const useCreateCommunity = () => {
	const { mutateAsync: addAdmin } = useAddCommunityAdmin();

	return useMutation({
		mutationKey: ["create-community"],
		mutationFn: async (data: Community) => {
			return await createCommunity({ data });
		},
		onSuccess: async (data) => {
			const communityId = data[0].id;
			await addAdmin(communityId);
		},
	});
};

export const useAddCommunityAdmin = () =>
	useMutation({
		mutationKey: ["add-admin"],
		mutationFn: async (communityId: string) => {
			return await addCommunityAdmin({ data: { communityId } });
		},
	});

export const fetchCommunitiesQueryOpts = () =>
	queryOptions({
		queryKey: ["fetch-communities"],
		queryFn: async () => await fetchCommunities(),
	});

export const fetchCommunityMetadataOpts = (communityId: string) =>
	queryOptions({
		queryKey: ["fetch-community-metadata"],
		queryFn: async () => {
			return await fetchCommunityMetadata({ data: { communityId } });
		},
	});
