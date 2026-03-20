import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
    }
    return Promise.reject(err);
  }
);

export default api;
