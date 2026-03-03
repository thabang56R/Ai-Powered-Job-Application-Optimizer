import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5159";

const http = axios.create({
  baseURL: `${API_BASE}/api`,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("hirelens_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

export default http;