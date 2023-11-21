import { apiClient } from "../config";
import { createContext, useState } from "react";

const DEFAULT_STATE = { status: null, login: null };

export const loginRedirect = async () => {
  return apiClient.get("auth/start").then((res) => res.data.url);
};

export const getWhoAmi = async () => {
  return await apiClient.get("auth/whoami").then((res) => res.data.email);
};

export const logout = async () => {
  return await apiClient.get("auth/logout");
};

export const useAuthState = () => {
  return useState(DEFAULT_STATE);
};

export const AuthContext = createContext(DEFAULT_STATE);
