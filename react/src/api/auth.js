import { apiClient } from "../config";

export const loginRedirect = async () => {
  return apiClient.get("auth/start").then((res) => res.data.url);
};

export const getWhoAmi = async () => {
  return await apiClient.get("auth/whoami").then((res) => res.data.email);
};

export const logout = async () => {
  return await apiClient.get("auth/logout");
};
