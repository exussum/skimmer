import { apiClient } from "../config";
import { useMutation } from "react-query";

export const getChannel = async ({ queryKey }) => {
  return apiClient.get(`/channel/${queryKey[1]}`).then((r) => r.data);
};

const deleteChannel = async ({ id }) => {
  return apiClient.delete(`/channel/${id}`);
};

export const useDeleteChannelMutation = (onSuccess) => {
  const mutation = useMutation({
    mutationFn: deleteChannel,
    onSuccess: async (data, variables, context) => {
      onSuccess(variables.id);
    },
  });
  return (id) => {
    mutation.mutate({ id: id });
  };
};
