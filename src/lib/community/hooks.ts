import { useMutation } from "@tanstack/react-query";
import { addAdmin, type Community, createCommunity } from "./api";

export const useCreateCommunity = () => {
	const { mutateAsync: addAdmin } = useAddAdmin();

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

export const useAddAdmin = () =>
	useMutation({
		mutationKey: ["add-admin"],
		mutationFn: async (communityId: string) => {
			return await addAdmin({ data: { communityId } });
		},
	});
