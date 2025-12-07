import { useMutation } from "@tanstack/react-query";
import { type Community, createCommunity } from "./api";

export const useCreateCommunity = () => {
	return useMutation({
		mutationKey: ["create-community"],
		mutationFn: async (data: Community) => {
			return await createCommunity({ data });
		},
	});
};
