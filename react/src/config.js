import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";

export const SKIMMER_API_URL = process.env.REACT_APP_SKIMMER_API_URL;
export const apiClient = applyCaseMiddleware(
  axios.create({
    baseURL: SKIMMER_API_URL,
    timeout: 3000,
    headers: { "Content-type": "application/json" },
    withCredentials: true,
  }),
);

apiClient.interceptors.response.use(
  (e) => {
    return e;
  },
  (e) => {
    console.log(e);
    if (e.response && 401 === e.response.status) {
      window.location.reload();
    } else {
      return Promise.reject(e);
    }
  },
);
