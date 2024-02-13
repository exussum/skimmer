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

const acknowledgeMessage = async ({ messageIds }) => {
  const params = new URLSearchParams({
    messageIds: messageIds,
  });
  return apiClient.post(`/message/acknowledge`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const useMarkReadMutation = () => {
  return useMutation(markReadMessage);
};

const markReadMessage = async ({ messageIds }) => {
  const params = new URLSearchParams({
    messageIds: messageIds,
  });
  return apiClient.post(`/message/mark_read`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const useAcknowledgeMutation = () => {
  return useMutation(acknowledgeMessage);
};

export const getMessages = async ({ queryKey }) => {
  return apiClient.get(`/message/channel/${queryKey[1]}`).then((r) => r.data);
};
