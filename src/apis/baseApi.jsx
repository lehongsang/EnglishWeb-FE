import axios from "axios";
import queryString from "query-string";
import { getAuth } from "firebase/auth";

const BASE_URL = "https://english-learning-website-be-nhom32.onrender.com";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "content-type": "application/json",
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

// Thêm interceptor để tự động đính kèm Firebase ID Token vào mọi request
axiosClient.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);