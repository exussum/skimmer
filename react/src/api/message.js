import { apiClient } from "../config";
import { useMutation } from "react-query";

const setGroup = async ({ groupId, messageIds }) => {
  const params = new URLSearchParams({
    messageIds: messageIds,
  });
  return apiClient.post(`/message/group/${groupId}`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const useSetGroupMutation = (setProcessing) => {
  const setGroupMutation = useMutation(setGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      setProcessing(false);
    },
  });
  return setGroupMutation;
};

const hideMessage = async ({ messageIds }) => {
  const params = new URLSearchParams({
    messageIds: messageIds,
  });
  return apiClient.post(`/message/hide`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const useHideMutation = () => {
  return useMutation(hideMessage);
};

export const getMessages = async ({ queryKey }) => {
  return apiClient.get(`/message/channel/${queryKey[1]}`).then((r) => r.data);
};
