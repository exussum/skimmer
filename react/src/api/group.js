import { apiClient } from "../config";

export const fetchGroups = async ({ queryKey }) => {
  const [, channelId] = queryKey;
  return apiClient.get(`/group/${channelId}`).then((res) => res.data);
};

export const addGroup = async ({ name, channelId }) => {
  const params = new URLSearchParams({
    name: name,
  });
  return apiClient.post(`/group/${channelId}`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const deleteGroup = async ({ channelId, id }) => {
  return apiClient.delete(`/group/${channelId}/${id}`);
};
