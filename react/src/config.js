import axios from "axios";

export const SKIMMER_API_URL = process.env.REACT_APP_SKIMMER_API_URL;
export const apiClient = axios.create({
  baseURL: SKIMMER_API_URL,
  timeout: 1000,
  headers: { "Content-type": "application/json" },
  withCredentials: true,
});
