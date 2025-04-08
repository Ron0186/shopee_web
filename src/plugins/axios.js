import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 增加允許跨域憑證
  withCredentials: true,
});

// 🔒 自動在請求中加入 Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 針對綠界支付的請求特別處理
    if (config.url && config.url.includes("ecpay")) {
      // 確保內容類型正確（可能需要 form 格式）
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 新增支付相關的方法
export const payment = {
  // 處理信用卡付款
  creditCardPayment: (paymentData) => {
    return instance
      .post("/ecpay/credit-card", paymentData)
      .then((response) => {
        // 檢查是否包含重定向 URL
        if (response.data && response.data.redirect) {
          // 如果需要重定向到第三方頁面
          window.location.href = response.data.redirect;
          return { redirected: true };
        }
        return response.data;
      })
      .catch((error) => {
        console.error("信用卡支付失敗:", error);
        throw error;
      });
  },

  // 查詢付款狀態
  checkPaymentStatus: (orderId) => {
    return instance.get(`/ecpay/check-status/${orderId}`);
  },
  // 處理支付回調
  handleCallback: (callbackData) => {
    return instance.post("/api/payment/ecpay/callback", callbackData);
  },
};

export default instance;
