import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

<<<<<<< HEAD
instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response && error.response.status && error.response.status === 403) {
    window.location.href = "/403";
  }
  return Promise.reject(error);
});

=======
>>>>>>> b9553c7 (商品頁面CRUD)
// 🔒 自動在請求中加入 Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
