import { apiClient } from "../config";
import { AuthContext } from "../api/auth";
import { useQuery, useMutation } from "react-query";
import { useContext } from "react";

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

const getStats = async ({ queryKey }) => {
  return await apiClient.get(`channel/stats?last_message_id=${queryKey[1].current || ""}`).then((r) => r.data);
};

export const useStatsQuery = (ref) => {
  const { data } = useQuery(["getStats", ref], getStats, { refetchInterval: 6000 });
  return { data };
};
