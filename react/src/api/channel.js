import { apiClient } from "../config";

export const deleteChannel = async ({ id }) => {
  return apiClient.delete(`/channel/${id}`);
};

export const getChannel = async ({ queryKey }) => {
  return apiClient.get(`/channel/${queryKey[1]}`).then((r) => r.data);
};
