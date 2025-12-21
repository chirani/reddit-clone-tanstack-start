import { queryOptions, useMutation } from "@tanstack/react-query";
import {
	addCommunityAdmin,
	type Community,
	createCommunity,
	fetchCommunityMetadata,
	fetchMyCommunities,
	joinCommunity,
	leaveCommunity,
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
		queryFn: async () => await fetchMyCommunities(),
	});

export const fetchCommunityMetadataOpts = (communityId: string) =>
	queryOptions({
		queryKey: ["fetch-community-metadata"],
		queryFn: async () => {
			return await fetchCommunityMetadata({ data: { communityId } });
		},
	});

export const useJoinCommunity = () => {
	return useMutation({
		mutationKey: ["join-community"],
		mutationFn: async (communityId: string) => {
			return await joinCommunity({ data: { communityId } });
		},
		onSuccess: async (_data, _variables, _onMutateResulr, context) => {
			await context.client.invalidateQueries({ queryKey: ["fetch-community-metadata"] });
		},
	});
};

export const useLeaveCommunity = () => {
	return useMutation({
		mutationKey: ["leave-community"],
		mutationFn: async (communityId: string) => {
			return await leaveCommunity({ data: { communityId } });
		},
		onSuccess: async (_data, _variables, _onMutateResulr, context) => {
			await context.client.invalidateQueries({ queryKey: ["fetch-community-metadata"] });
		},
	});
};
