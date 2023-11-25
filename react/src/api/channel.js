import { apiClient } from "../config";

export const deleteChannel = async ({ id }) => {
  return apiClient.delete(`/channel/${id}`);
};
