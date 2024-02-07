import { apiClient } from "../config";
import { useQuery, useMutation } from "react-query";

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

const getStats = async () => {
  const lastSeenMessageId = localStorage.getItem("lastSeenMessageId");
  return await apiClient.get(`channel/stats?last_message_id=${lastSeenMessageId || ""}`).then((r) => r.data);
};

export const useStatsQuery = () => {
  const { data } = useQuery(["getStats"], getStats, { refetchIntervalInBackground: true, refetchInterval: 6000 });
  return { data };
};
