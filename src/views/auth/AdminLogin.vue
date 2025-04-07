<template>
  <div class="login-container">
    <div class="login-card">
      <h2>管理員登入</h2>
      
      <!-- reCAPTCHA 開關 -->
      <div class="recaptcha-toggle-container">
        <span>reCAPTCHA:</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="enableRecaptcha" @change="handleRecaptchaToggle">
          <span class="toggle-slider"></span>
        </label>
        <span>{{ enableRecaptcha ? '開啟' : '關閉' }}</span>
      </div>

      <!-- 帳號輸入 -->
      <div class="form-group">
        <label for="username">管理員名稱：</label>
        <input type="text" id="username" v-model="username" placeholder="請輸入帳號">
      </div>

      <!-- 密碼輸入 -->
      <div class="form-group">
        <label for="password">密碼：</label>
        <input type="password" id="password" v-model="password" placeholder="請輸入密碼">
      </div>

      <!-- reCAPTCHA v2 勾選框，只有在啟用時顯示 -->
      <div v-if="enableRecaptcha" class="form-group recaptcha-container">
        <div ref="recaptchaContainer" class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
        <div v-if="captchaError" class="captcha-error">請勾選「我不是機器人」</div>
      </div>

      <!-- 登入按鈕 -->
      <button class="login-btn" @click="login">登入</button>

<!-- 快速登入區塊 -->
<div class="quick-login">
  <p>快速登入：</p>
  <div class="quick-btn-container">
    <button class="quick-btn watcher" @click="quickLogin('Watcher')">Watcher</button>
    <button class="quick-btn product-manager" @click="quickLogin('ProductManager')">商品管理員</button>
    <button class="quick-btn account-manager" @click="quickLogin('AccountManager')">帳號管理員</button>
    <button class="quick-btn admin" @click="quickLogin('SuperAdmin')">SuperAdmin</button>
  </div>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { useUserStore } from '@/stores/user';
const SiteKey=import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY;

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();
const username = ref("");
const password = ref("");
const captchaError = ref(false);
const recaptchaContainer = ref(null);
const recaptchaLoaded = ref(false);

// 新增 reCAPTCHA 功能開關
const enableRecaptcha = ref(false);

// 從 localStorage 讀取開關狀態，確保頁面重載後狀態保持不變
onMounted(() => {
  const savedState = localStorage.getItem('adminRecaptchaEnabled');
  if (savedState !== null) {
    enableRecaptcha.value = savedState === 'true';
  }
});

// 處理 reCAPTCHA 切換開關
function handleRecaptchaToggle() {
  // 保存開關狀態到 localStorage
  localStorage.setItem('adminRecaptchaEnabled', enableRecaptcha.value);
  
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

// reCAPTCHA 網站金鑰 - 替換成你的 Site Key
const recaptchaSiteKey = SiteKey;

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
  // 如果 reCAPTCHA 未啟用，則不載入
  if (!enableRecaptcha.value) return;
  
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

async function login() {
  if (!username.value || !password.value) {
    Swal.fire({
      title: "請輸入帳號與密碼",
      icon: "warning",
    });
    return;
  }

  // 驗證 reCAPTCHA
  const recaptchaResponse = validateRecaptcha();
  if (!recaptchaResponse) {
    return; // 如果 reCAPTCHA 未通過，不繼續登入流程
  }

  try {
    // 根據 reCAPTCHA 狀態選擇不同的 API
    const loginUrl = enableRecaptcha.value 
      ? "/api/auth/admin/login" 
      : "/api/auth/admin/login/withoutReCaptcha";
      
    const response = await axios.post(loginUrl, {
      "username": username.value,
      "password": password.value,
      "recaptchaResponse": recaptchaResponse === true ? null : recaptchaResponse // 根據是否啟用 reCAPTCHA 傳遞不同的值
    });

    if (response.data.success) {
      // 解析JWT並設置Authorization頭部
      const decodedToken = jwtDecode(response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      
      // 先保存基本用戶資訊
      userStore.saveUserData(decodedToken.sub, decodedToken.userId, response.data.token, decodedToken.roles);
      
      // 獲取管理員的詳細資訊，包括頭像URL
      try {
        const profileResponse = await axios.get('/api/admin/profile');
        if (profileResponse.data && profileResponse.data.profilePhotoUrl) {
          // 更新頭像信息
          userStore.updateProfilePhoto(profileResponse.data.profilePhotoUrl);
          
          // 同步更新到localStorage
          localStorage.setItem('profilePhoto', profileResponse.data.profilePhotoUrl);
          
          console.log("成功獲取管理員頭像:", profileResponse.data.profilePhotoUrl);
        }
      } catch (profileError) {
        console.error("獲取管理員資料失敗:", profileError);
        // 即使獲取頭像失敗，登入流程仍然繼續
      }

      await Swal.fire({
        title: response.data.message,
        icon: "success",
      });

      // 重定向到儀表板
      router.push({ name: "Dashboard" });
    }
  } catch (error) {
    let errorMessage = error.response?.data?.message || "登入失敗，請稍後再試";
    Swal.fire({
      title: "錯誤: " + errorMessage,
      icon: "error",
    });
    
    // 登入失敗時重設 reCAPTCHA
    if (enableRecaptcha.value) {
      resetRecaptcha();
    }
  }
}
// 快速登入功能
function quickLogin(role) {
  switch(role) {
    case 'ProductManager':
      username.value = "我是商品管理員";
      password.value = "admin123";
      break;
    case 'AccountManager':
      username.value = "我是帳號管理員";
      password.value = "admin123";
      break;
    case 'SuperAdmin':
      username.value = "SuperAdmin";
      password.value = "admin123";
      break;
    case 'Watcher':
      username.value = "Watcher";
      password.value = "admin123";
      break;
    default:
      username.value = role;
      password.value = "admin123";
  }
  login();
}
</script>

<style scoped>
/* 背景設定 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('@/assets/AdminLogin.png') no-repeat center center;
  background-size: cover;
}

/* 放大登入框，並加上透明背景 */
.login-card {
  width: 480px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

/* 標題美化 */
.login-card h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

/* reCAPTCHA 開關樣式 */
.recaptcha-toggle-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 15px;
  gap: 8px;
  font-size: 14px;
  color: #555;
  position: absolute;
  top: 10px;
  right: 10px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #007bff;
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px #007bff;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* 表單輸入框 */
.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  font-size: 16px;
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

/* 登入按鈕 */
.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-btn:hover {
  background-color: #0056b3;
}

/* 快速登入區塊 */
.quick-login {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.quick-login p {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

/* 快速登入按鈕容器 */
.quick-btn-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

/* 快速登入按鈕 */
.quick-btn {
  padding: 8px 12px;
  font-size: 14px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  flex-grow: 1;
  max-width: calc(50% - 8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-btn:hover {
  transform: translateY(-2px);
}

.quick-btn:active {
  transform: translateY(0);
}

.quick-btn.watcher {
  background-color: #28a745;
}

.quick-btn.watcher:hover {
  background-color: #218838;
}

.quick-btn.product-manager {
  background-color: #17a2b8;
}

.quick-btn.product-manager:hover {
  background-color: #138496;
}

.quick-btn.account-manager {
  background-color: #ffc107;
  color: #212529;
}

.quick-btn.account-manager:hover {
  background-color: #e0a800;
}

.quick-btn.admin {
  background-color: #dc3545;
}

.quick-btn.admin:hover {
  background-color: #c82333;
}

/* 在較小屏幕上讓按鈕堆疊 */
@media (max-width: 480px) {
  .quick-btn {
    max-width: 100%;
  }
}

/* reCAPTCHA 相關樣式 */
.recaptcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.captcha-error {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}
</style>