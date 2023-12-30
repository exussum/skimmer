import { apiClient } from "../config";
import { useMutation, useQueryClient } from "react-query";

export const fetchGroups = async ({ queryKey }) => {
  const [, channelId] = queryKey;
  return apiClient.get(`/group/${channelId}`).then((res) => res.data);
};

const addGroup = async ({ name, channelId }) => {
  const params = new URLSearchParams({
    name: name,
  });
  return apiClient.post(`/group/${channelId}`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const useAddGroupMutation = (channelId, setProcessing) => {
  const queryClient = useQueryClient();
  const addMutation = useMutation(addGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });
  return addMutation;
};

const deleteGroup = async ({ channelId, id }) => {
  return apiClient.delete(`/group/${channelId}/${id}`);
};

export const useDeleteGroupMutation = (channelId, setProcessing) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(deleteGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });
  return deleteMutation;
};
