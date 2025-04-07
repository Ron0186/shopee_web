import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 增加允許跨域憑證
  withCredentials: true,
  // 設置全局超時時間
  timeout: 30000,
});

// 新增重試機制
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// 響應攔截器
instance.interceptors.response.use(
  function (response) {
    // 檢查 API 回應是否包含特定錯誤碼或訊息
    if (response.data && response.data.error) {
      console.error("API 回傳錯誤:", response.data.error);
    }
    return response;
  },
  async function (error) {
    // 獲取原始請求配置
    const config = error.config;

    // 初始化重試計數
    config.__retryCount = config.__retryCount || 0;

    // 檢查是否是網絡錯誤或超時且尚未超過最大重試次數
    if (
      (error.message.includes("Network Error") ||
        error.code === "ECONNABORTED") &&
      config.__retryCount < MAX_RETRIES
    ) {
      console.log(
        `請求失敗，正在重試 (${config.__retryCount + 1}/${MAX_RETRIES})...`
      );

      // 增加重試計數
      config.__retryCount += 1;

      // 延遲重試
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

      // 重新發送請求
      return instance(config);
    }

    // 處理常見錯誤
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 403:
          window.location.href = "/403";
          break;
        case 400:
          console.error("付款資訊有誤:", error.response.data);
          break;
        case 500:
          console.error("伺服器內部錯誤:", error.response.data);
          break;
        case 504:
          console.error("伺服器響應超時:", error.response.data);
          break;
      }
    } else if (error.message && error.message.includes("Network Error")) {
      console.error("網絡連接錯誤，可能是請求被中斷:", error);
    } else if (error.message && error.message.includes("timeout")) {
      console.error("請求超時:", error);
    } else if (error.request) {
      // 沒有收到回應
      console.error("未收到回應:", error.request);
    } else {
      console.error("未知錯誤:", error);
    }

    return Promise.reject(error);
  }
);

// 🔒 自動在請求中加入 Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加請求識別符號，方便日誌跟踪
    config.requestId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    console.log(
      `發送請求 [${config.requestId}]: ${config.method} ${config.url}`
    );

    // 針對 FormData 的請求自動處理 Content-Type
    if (config.data instanceof FormData) {
      // 讓瀏覽器自動設置正確的 Content-Type 和 boundary
      delete config.headers["Content-Type"];
      console.log(`請求 [${config.requestId}] 使用 FormData 格式`);
    }

    // 針對綠界支付的請求特別處理
    if (config.url && config.url.includes("ecpay")) {
      // 確保內容類型正確（可能需要 form 格式）
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return config;
  },
  (error) => {
    console.error("請求配置錯誤:", error);
    return Promise.reject(error);
  }
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

// 導出取消請求的工具函數
export const getCancelToken = () => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  return source;
};

export default instance;
