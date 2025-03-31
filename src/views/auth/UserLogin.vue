<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">登入</h2>
      
      <!-- reCAPTCHA 開關 -->
      <div class="recaptcha-toggle-container">
        <span>reCAPTCHA:</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="enableRecaptcha" @change="handleRecaptchaToggle">
          <span class="toggle-slider"></span>
        </label>
        <span>{{ enableRecaptcha ? '開啟' : '關閉' }}</span>
      </div>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">使用者名稱</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-input"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <div class="password-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="form-input"
              placeholder="請輸入密碼"
            />
            <span class="eye-icon" @click="togglePasswordVisibility">
              <i v-if="showPassword" class="bi bi-eye"></i>
              <i v-else class="bi bi-eye-slash"></i>
            </span>
          </div>
        </div>

        <!-- reCAPTCHA v2 勾選框，只有在啟用時顯示 -->
        <div v-if="enableRecaptcha" class="form-group recaptcha-container">
          <div
            ref="recaptchaContainer"
            class="g-recaptcha"
            :data-sitekey="recaptchaSiteKey"
          ></div>
          <div v-if="captchaError" class="captcha-error">
            請勾選「我不是機器人」
          </div>
        </div>

        <div class="form-links forgot-password">
          <router-link to="/forgot-password">
            <i class="bi bi-question-circle"></i> 忘記密碼?
          </router-link>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button">
            <i class="bi bi-box-arrow-in-right"></i> 開始購物吧!
          </button>
        </div>

        <!-- 添加分隔線 -->
        <div class="divider">
          <span>或</span>
        </div>

        <!-- 添加 Google 登入按鈕 -->
        <div class="social-login">
          <GoogleLoginButton />
        </div>

        <div class="form-links register-link">
          <router-link to="/user/register">
            <i class="bi bi-person-plus"></i> 還沒有帳號？立即註冊
          </router-link>
        </div>

        <!-- 快速登入區塊 -->
        <div class="quick-login">
          <h3 class="quick-login-title">快速登入</h3>
          <div class="quick-login-buttons">
            <button
              type="button"
              @click="quickLogin('Waylay')"
              class="quick-login-btn"
            >
              <i class="bi bi-lightning-charge"></i> Waylay
            </button>
            <button
              type="button"
              @click="quickLogin('Cypher')"
              class="quick-login-btn"
            >
              <i class="bi bi-shield-lock"></i> Cypher
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { useUserStore } from "@/stores/user";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton.vue"; // 引入 Google 登入按鈕

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const username = ref("");
const password = ref("");
const showPassword = ref(false); // 添加密碼顯示切換狀態
const captchaError = ref(false);
const recaptchaContainer = ref(null);
const recaptchaLoaded = ref(false);

// 新增 reCAPTCHA 功能開關
const enableRecaptcha = ref(false);

// 從 localStorage 讀取開關狀態，確保頁面重載後狀態保持不變
onMounted(() => {
  const savedState = localStorage.getItem('recaptchaEnabled');
  if (savedState !== null) {
    enableRecaptcha.value = savedState === 'true';
  }
});

// 處理 reCAPTCHA 切換開關
function handleRecaptchaToggle() {
  // 保存開關狀態到 localStorage
  localStorage.setItem('recaptchaEnabled', enableRecaptcha.value);
  
  if (enableRecaptcha.value) {
    // 如果開啟，則初始化 reCAPTCHA
    nextTick(() => {
      initializeRecaptcha();
    });
  } else {
    // 如果關閉，則重置錯誤狀態
    captchaError.value = false;
  }
}

// 切換密碼可見性
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// reCAPTCHA 網站金鑰 - 替換成你的 Site Key
const recaptchaSiteKey = "6LdxawIrAAAAAHO4ioKiJ8BM20rteeaTjuLylhmT";

// 載入 reCAPTCHA 腳本
function loadRecaptchaScript() {
  return new Promise((resolve) => {
    // 如果已經載入過，直接返回
    if (window.grecaptcha) {
      recaptchaLoaded.value = true;
      return resolve();
    }

    // 載入 reCAPTCHA 腳本
    const recaptchaScript = document.createElement("script");
    recaptchaScript.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
    recaptchaScript.async = true;
    recaptchaScript.defer = true;

    // 定義全局回調函數
    window.onRecaptchaLoaded = () => {
      recaptchaLoaded.value = true;
      resolve();
    };

    document.head.appendChild(recaptchaScript);
  });
}

// 初始化 reCAPTCHA
async function initializeRecaptcha() {
  // 如果 reCAPTCHA 未啟用，則不載入
  if (!enableRecaptcha.value) return;

  // 確保腳本已載入
  if (!recaptchaLoaded.value) {
    await loadRecaptchaScript();
  }

  // 確保 DOM 已更新
  await nextTick();

  // 確保容器元素存在且 grecaptcha 已載入
  if (
    recaptchaContainer.value &&
    window.grecaptcha &&
    window.grecaptcha.render
  ) {
    try {
      // 嘗試渲染 reCAPTCHA
      // 可能需要檢查元素是否已經包含 reCAPTCHA 以避免重複渲染
      if (!recaptchaContainer.value.querySelector("iframe")) {
        window.grecaptcha.render(recaptchaContainer.value, {
          sitekey: recaptchaSiteKey,
        });
      }
    } catch (error) {
      console.error("reCAPTCHA 初始化失敗:", error);
    }
  }
}

// 監聽路由變化
watch(
  () => route.fullPath,
  () => {
    // 路由變化後，如果 reCAPTCHA 已啟用，確保 reCAPTCHA 重新初始化
    if (enableRecaptcha.value) {
      nextTick(() => {
        initializeRecaptcha();
      });
    }
  }
);

// 組件掛載後
onMounted(async () => {
  // 如果 reCAPTCHA 已啟用，則初始化
  if (enableRecaptcha.value) {
    await initializeRecaptcha();
  }
});

// 驗證 reCAPTCHA 是否已勾選
function validateRecaptcha() {
  // 如果 reCAPTCHA 未啟用，直接返回 true
  if (!enableRecaptcha.value) {
    return true;
  }
  
  if (window.grecaptcha) {
    const response = window.grecaptcha.getResponse();
    if (response.length === 0) {
      captchaError.value = true;
      return false;
    } else {
      captchaError.value = false;
      return response;
    }
  }
  captchaError.value = true;
  return false;
}

// 重設 reCAPTCHA
function resetRecaptcha() {
  if (enableRecaptcha.value && window.grecaptcha) {
    window.grecaptcha.reset();
  }
  captchaError.value = false;
}

// 新增存储管理方法
const syncStorage = {
  setToken(token) {
    localStorage.setItem("authToken", token); // 长期存储
    sessionStorage.setItem("authToken", token); // 会话存储
  },
  clearTokens() {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  },
};

async function login() {
  if (username.value === "") {
    username.value = null;
  }

  if (password.value === "") {
    password.value = null;
  }

  // 驗證 reCAPTCHA
  const recaptchaResponse = validateRecaptcha();
  if (!recaptchaResponse) {
    return; // 如果 reCAPTCHA 未通過，不繼續登入流程
  }

  const data = {
    username: username.value,
    password: password.value,
    recaptchaResponse: recaptchaResponse === true ? null : recaptchaResponse, // 根據是否啟用 reCAPTCHA 傳遞不同的值
  };

  // 清除之前的 Authorization header (避免和其他登入狀態衝突)
  axios.defaults.headers.common["Authorization"] = ``;
  
  try {
    // 根據 reCAPTCHA 狀態選擇不同的 API
    const loginUrl = enableRecaptcha.value 
      ? "/api/auth/login" 
      : "/api/auth/login/withoutReCaptcha";
    
    const response = await axios.post(loginUrl, data);

    if (response.data.success) {
      const decodedToken = jwtDecode(response.data.token);
      // 設定 token
      syncStorage.setToken(response.data.token);

      // 同步儲存使用者資訊到 localStorage
      localStorage.setItem("userId", decodedToken.userId);
      localStorage.setItem("username", decodedToken.sub);

      const result = await Swal.fire({
        title: response.data.message,
        icon: "success",
      });
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      //設定userStore
      userStore.saveUserData(
        decodedToken.sub,
        decodedToken.userId,
        response.data.token,
        decodedToken.roles
      );

      // 如果用戶是賣家，獲取他們的商店 ID
      if (decodedToken.roles && decodedToken.roles.includes("SELLER")) {
        try {
          // 調用新增的 API 獲取商店 ID
          const shopResponse = await axios.get(
            `/api/user/${decodedToken.userId}/shop`
          );
          if (shopResponse.data && shopResponse.data.shopId) {
            // 將 shopId 轉換為字符串並更新到 UserStore
            userStore.updateShopId(shopResponse.data.shopId.toString());
            console.log("成功獲取商店 ID:", shopResponse.data.shopId);
          }
        } catch (shopError) {
          console.error("獲取商店 ID 失敗:", shopError);
        }
      }

      userStore.reloadUserData();
      if (result.isConfirmed) {
        router.push("/shop");
      }
    }
  } catch (error) {
    let errorMessage = "登入失敗，請稍後再試"; // 預設錯誤訊息

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        errorMessage = data.message || "帳號或密碼錯誤";
      } else if (status === 400) {
        errorMessage = data.message || "請求格式錯誤";
      } else if (status === 403) {
        errorMessage = data.message || "您沒有權限執行此操作";
      } else if (status === 404) {
        errorMessage = data.message || "找不到資源";
      } else if (status >= 500) {
        errorMessage = data.message || "伺服器發生錯誤";
      } else {
        errorMessage = `登入失敗，錯誤碼：${status}`;
      }
    } else if (error.request) {
      errorMessage = "網路連線異常，請檢查您的網路";
    } else {
      errorMessage = "發生未知的錯誤";
    }
    Swal.fire({
      title: "錯誤:" + errorMessage,
      icon: "error",
    });
    // 登入失敗時重設 reCAPTCHA
    if (enableRecaptcha.value) {
      resetRecaptcha();
    }
  }
}

async function quickLogin(user) {
  // 快速登入的邏輯
  let userData = {};
  if (user === "Waylay") {
    userData = { username: "Waylay", password: "Test" };
  } else if (user === "Cypher") {
    userData = { username: "Cypher", password: "Test" };
  } else {
    return; // 未知的用戶
  }

  username.value = userData.username; // 自動填入帳號
  password.value = userData.password; // 自動填入密碼

  // 在快速登入時，如果啟用了 reCAPTCHA，用戶仍需手動勾選
  await login(); // 呼叫 login 函數
}

window.addEventListener("storage", (event) => {
  if (event.key === "authToken") {
    // 當其他分頁更新 localStorage 時，同步到 sessionStorage
    sessionStorage.setItem("tempAuthToken", event.newValue);
  }
});

// 修改跨标签页事件監聽，統一使用 authToken 鍵
window.addEventListener("storage", (event) => {
  if (event.key === "authToken") {
    // 當其他分頁更新 localStorage 時，同步到 sessionStorage
    sessionStorage.setItem("authToken", event.newValue);
    if (!event.newValue) router.push("/user/login");
  }
});
</script>

<style scoped>
/* 整體容器 - 調整高度和大小 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 75vh;
  padding: 15px;
  /* 移除背景色設定，使用網站原有背景色 */
}

.login-card {
  width: 100%;
  max-width: 500px; /* 稍微加寬 */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  padding: 25px; /* 稍微增加內邊距 */
  border: 1px solid #e8e8e8;
}

.login-title {
  text-align: center;
  margin-bottom: 16px;
  color: #ff9b20;
  font-weight: 600;
  font-size: 1.5rem; /* 增大標題 */
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px; /* 增加間距 */
}

/* reCAPTCHA 開關樣式 */
.recaptcha-toggle-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
  gap: 8px;
  font-size: 14px; /* 增大字體 */
  color: #555;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px; /* 稍微放大 */
  height: 24px; /* 稍微放大 */
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px; /* 調整大小 */
  width: 18px; /* 調整大小 */
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #ff9b20;
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px #ff9b20;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* 表單元素 */
.form-group {
  margin-bottom: 0;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 9px 12px; /* 增加內邊距 */
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px; /* 增大字體 */
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #ff9b20;
  box-shadow: 0 0 0 2px rgba(255, 155, 32, 0.1);
  outline: none;
}

.form-group label {
  display: block;
  margin-bottom: 5px; /* 增加下邊距 */
  font-weight: 500;
  color: #333;
  font-size: 15px; /* 增大字體 */
}

/* 密碼容器相關樣式 */
.password-container {
  position: relative;
  width: 100%;
}

.password-container input {
  width: 100%;
  padding-right: 38px; /* 調整右內邊距 */
}

.eye-icon {
  position: absolute;
  right: 10px; /* 調整位置 */
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10;
  user-select: none;
  color: #666;
  transition: color 0.2s;
}

.eye-icon:hover {
  color: #ff9b20;
}

/* reCAPTCHA 相關樣式 */
.recaptcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0; /* 增加間距 */
}

.captcha-error {
  color: #dc3545;
  font-size: 12px; /* 增大字體 */
  margin-top: 3px; /* 增加上邊距 */
}

/* 按鈕樣式 */
.submit-button {
  background-color: #ff9b20;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 14px; /* 增加內邊距 */
  font-size: 16px; /* 增大字體 */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 增加間距 */
  width: 100%;
}

.submit-button:hover {
  background-color: #e7840b;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 連結樣式 */
.form-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  justify-content: flex-end;
  margin-top: -4px;
  margin-bottom: 4px;
}

.form-links a {
  color: #ff9b20;
  text-decoration: none;
  font-size: 14px; /* 增大字體 */
  display: inline-flex;
  align-items: center;
  gap: 5px; /* 增加間距 */
  transition: color 0.2s;
}

.form-links a:hover {
  color: #e7840b;
  text-decoration: underline;
}

/* 分隔線 */
.divider {
  position: relative;
  text-align: center;
  margin: 14px 0; /* 增加上下邊距 */
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
}

.divider span {
  position: relative;
  background-color: #fff;
  padding: 0 10px; /* 增加左右內邊距 */
  color: #888;
  font-size: 14px; /* 增大字體 */
  padding: 0 15px; /* 增加左右內邊距 */

}

/* 社交登入按鈕 */
.social-login {
  display: flex;
  justify-content: center;
  margin-bottom: 10px; /* 增加下邊距 */
}

/* 快速登入區塊 */
.quick-login {
  margin-top: 14px; /* 增加上邊距 */
  border-top: 1px solid #eee;
  padding-top: 14px; /* 增加上內邊距 */
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px; /* 增加內邊距 */
}

.quick-login-title {
  font-size: 15px; /* 增大字體 */
  font-weight: 600;
  color: #444;
  margin-bottom: 10px; /* 增加下邊距 */
  text-align: center;
}

.quick-login-buttons {
  display: flex;
  justify-content: center;
  gap: 20px; /* 增加按鈕之間的間距 */
}


.quick-login-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px; /* 增加內邊距 */
  font-size: 14px; /* 增大字體 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px; /* 增加間距 */
}

.quick-login-btn:hover {
  background-color: #5a6268;
}

.register-link {
  justify-content: center;
  margin-top: 8px; /* 增加上邊距 */
}

/* 響應式設計 */
@media (max-width: 768px) {
  .login-card {
    max-width: 95%;
    padding: 20px; /* 增加內邊距 */
  }

  .quick-login-buttons {
    flex-direction: column;
    align-items: center;
  }

  .quick-login-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>