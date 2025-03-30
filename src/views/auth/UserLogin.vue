<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">登入</h2>
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

        <!-- reCAPTCHA v2 勾選框 -->
        <div class="form-group recaptcha-container">
          <div ref="recaptchaContainer" class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
          <div v-if="captchaError" class="captcha-error">請勾選「我不是機器人」</div>
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
            <button type="button" @click="quickLogin('Waylay')" class="quick-login-btn">
              <i class="bi bi-lightning-charge"></i> Waylay
            </button>
            <button type="button" @click="quickLogin('Cypher')" class="quick-login-btn">
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
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
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
  // 確保腳本已載入
  if (!recaptchaLoaded.value) {
    await loadRecaptchaScript();
  }
  
  // 確保 DOM 已更新
  await nextTick();
  
  // 確保容器元素存在且 grecaptcha 已載入
  if (recaptchaContainer.value && window.grecaptcha && window.grecaptcha.render) {
    try {
      // 嘗試渲染 reCAPTCHA
      // 可能需要檢查元素是否已經包含 reCAPTCHA 以避免重複渲染
      if (!recaptchaContainer.value.querySelector('iframe')) {
        window.grecaptcha.render(recaptchaContainer.value, {
          'sitekey': recaptchaSiteKey
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
    // 路由變化後，確保 reCAPTCHA 重新初始化
    nextTick(() => {
      initializeRecaptcha();
    });
  }
);

// 組件掛載後
onMounted(async () => {
  await initializeRecaptcha();
});

// 驗證 reCAPTCHA 是否已勾選
function validateRecaptcha() {
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
  if (window.grecaptcha) {
    window.grecaptcha.reset();
  }
  captchaError.value = false;
}

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
    recaptchaResponse: recaptchaResponse // 將 reCAPTCHA 回應傳送到後端
  };

  // 清除之前的 Authorization header (避免和其他登入狀態衝突)
  axios.defaults.headers.common["Authorization"] = ``;
  try {
    const response = await axios.post("/api/auth/login", data);

    if (response.data.success) {
      const result = await Swal.fire({
        title: response.data.message,
        icon: "success",
      });
      const decodedToken = jwtDecode(response.data.token);
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
    resetRecaptcha();
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
  
  // 在快速登入時，需要用戶仍然手動勾選 reCAPTCHA
  await login(); // 呼叫 login 函數
}
</script>

<style scoped>
:root {
  --primary-color: #ff9b20; /* 修改為橙色，與註冊頁面一致 */
  --primary-hover: #e7840b; /* 修改為深橙色 */
  --error-color: #dc3545;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --text-color: #333;
  --text-light: #666;
  --border-color: #ddd;
  --bg-color: #f9f9f9;
  --card-bg: #fff;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --input-radius: 6px;
}

/* 整體容器 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh; /* 從100vh改為85vh，考慮到navbar和footer的空間 */
  background-color: var(--bg-color);
  padding: 15px; /* 減少內邊距 */
}

.login-card {
  width: 100%;
  max-width: 420px; /* 略微縮小最大寬度 */
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 20px; /* 減少內邊距 */
}

.login-title {
  text-align: center;
  margin-bottom: 20px; /* 減少下邊距 */
  color: var(--primary-color);
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 減少表單元素間距 */
}

/* 表單元素 */
.form-group {
  margin-bottom: 0;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 10px 12px; /* 減少輸入框內邊距 */
  border: 1px solid var(--border-color);
  border-radius: var(--input-radius);
  font-size: 15px; /* 略微縮小字體 */
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
  outline: none;
}

.form-group label {
  display: block;
  margin-bottom: 5px; /* 減少標籤下邊距 */
  font-weight: 500;
  color: var(--text-color);
}

/* 密碼容器相關樣式 */
.password-container {
  position: relative;
  width: 100%;
}

.password-container input {
  width: 100%;
  padding-right: 40px; /* 為眼睛圖標預留空間 */
}

.eye-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; /* 減小尺寸 */
  height: 30px; /* 減小尺寸 */
  color: var(--text-light);
  transition: color 0.2s;
}

.eye-icon:hover {
  color: var(--primary-color);
}

/* reCAPTCHA 相關樣式 */
.recaptcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0; /* 減少上下間距 */
}

.captcha-error {
  color: var(--error-color);
  font-size: 12px; /* 略微縮小字體 */
  margin-top: 3px; /* 減少上邊距 */
}

/* 按鈕樣式 */
.submit-button {
  background-color: #ff9b20; /* 使用橙色，與註冊頁面一致 */
  color: white;
  border: none;
  border-radius: var(--input-radius);
  padding: 10px 15px; /* 減少內邊距 */
  font-size: 15px; /* 略微縮小字體 */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 減少圖標與文字間距 */
  width: 100%;
}

.submit-button:hover {
  background-color: #e7840b; /* 懸停時的深橙色 */
}

.submit-button:disabled {
  background-color: #cccccc;
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
  margin-top: -5px; /* 減少上邊距 */
  margin-bottom: 5px; /* 減少下邊距 */
}

.form-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 13px; /* 略微縮小字體 */
  display: inline-flex;
  align-items: center;
  gap: 4px; /* 減少圖標與文字間距 */
  transition: color 0.2s;
}

.form-links a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* 分隔線 */
.divider {
  position: relative;
  text-align: center;
  margin: 15px 0; /* 減少上下間距 */
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--border-color);
}

.divider span {
  position: relative;
  background-color: var(--card-bg);
  padding: 0 10px;
  color: var(--text-light);
  font-size: 14px;
}

/* 社交登入按鈕 */
.social-login {
  display: flex;
  justify-content: center;
  margin-bottom: 8px; /* 減少下邊距 */
}

/* 快速登入區塊 */
.quick-login {
  margin-top: 15px; /* 減少上邊距 */
  border-top: 1px solid var(--border-color);
  padding-top: 15px; /* 減少上內邊距 */
}

.quick-login-title {
  font-size: 15px; /* 略微縮小字體 */
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px; /* 減少下邊距 */
  text-align: center;
}

.quick-login-buttons {
  display: flex;
  justify-content: center;
  gap: 12px; /* 減少按鈕間距 */
}

.quick-login-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: var(--input-radius);
  padding: 8px 12px; /* 減少內邊距 */
  font-size: 13px; /* 略微縮小字體 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px; /* 減少圖標與文字間距 */
}

.quick-login-btn:hover {
  background-color: #5a6268;
}

.register-link {
  justify-content: center;
  margin-top: 8px; /* 減少上邊距 */
}

/* 響應式設計 */
@media (max-width: 768px) {
  .login-card {
    padding: 20px;
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
