import { apiClient } from "../config";
import { useContext, createContext, useState } from "react";
import { useQuery } from "react-query";

const DEFAULT_STATE = { status: null, login: null };
export const AuthContext = createContext(null);

const getWhoAmi = async () => {
  return await apiClient.get("auth/whoami").then((res) => res.data);
};

export const useWhoAmIQuery = () => {
  const { setCtx } = useContext(AuthContext);
  const { isLoading, data, error } = useQuery(["whoami"], getWhoAmi);
  return { setCtx, isLoading, data, error };
};

export const useLoginRedirectQuery = () => {
  const { setCtx } = useContext(AuthContext);
  const { isLoading, data, error } = useQuery(["loginRedirect"], loginRedirect);
  return { setCtx, isLoading, data, error };
};

export const loginRedirect = async () => {
  return await apiClient.get("auth/start").then((res) => res.data.url);
};

const logout = async () => {
  return await apiClient.get("auth/logout");
};

export const useLogoutQuery = () => {
  const { setCtx } = useContext(AuthContext);
  const { isLoading, isError } = useQuery(["logout"], logout);
  return { setCtx, isLoading, isError };
};

export const useAuthState = () => {
  return useState(DEFAULT_STATE);
};
