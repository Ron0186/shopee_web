<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">會員註冊</h2>
      <form @submit.prevent="register" class="register-form">
        <div class="demo-button-container">
          <button type="button" @click="fillDemoData" class="demo-button">
            <i class="bi bi-magic"></i> 一鍵帶入
          </button>
        </div>
        
        <div class="form-group">
          <label for="username">使用者名稱</label>
          <input
            type="text"
            id="username"
            placeholder="請輸入6-20個字的使用者名稱"
            v-model="username"
            class="form-input"
          />
          <div v-if="username && username.length < 6" class="input-error">
            使用者名稱至少需要6個字
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">
            密碼
            <span 
              class="password-info-icon" 
              @click="togglePasswordPopover"
            >
              <i class="bi bi-info-circle"></i>
            </span>
          </label>
          <div class="password-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="請輸入符合要求的密碼"
              v-model="password"
              @input="handlePasswordInput"
              @focus="handleFocus"
              @blur="handleBlur"
              class="form-input"
            />
            <span class="eye-icon" @click="togglePasswordVisibility('password')">
              <i v-if="showPassword" class="bi bi-eye"></i>
              <i v-else class="bi bi-eye-slash"></i>
            </span>
          </div>
          
          <!-- 密碼強度進度條 -->
          <div v-if="password.length > 0" class="password-strength-meter">
            <div class="password-strength-bar" :style="{ width: passwordStrength.percentage + '%', backgroundColor: passwordStrength.color }"></div>
          </div>
          <div v-if="password.length > 0" class="password-strength-text" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.text }}
          </div>
          
          <!-- 密碼要求 Popover -->
          <div class="password-popover" v-if="showPasswordPopover">
            <div class="popover-arrow"></div>
            <div class="popover-header">密碼要求</div>
            <div class="popover-body">
              <div class="requirement" :class="{ 'met': passwordChecks.hasLength }">
                <span class="check-icon" :class="{ 'checked': passwordChecks.hasLength }">
                  <i v-if="passwordChecks.hasLength" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                至少 8 個字
              </div>
              <div class="requirement" :class="{ 'met': passwordChecks.hasUppercase }">
                <span class="check-icon" :class="{ 'checked': passwordChecks.hasUppercase }">
                  <i v-if="passwordChecks.hasUppercase" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                至少 1 個大寫字母 (A-Z)
              </div>
              <div class="requirement" :class="{ 'met': passwordChecks.hasLowercase }">
                <span class="check-icon" :class="{ 'checked': passwordChecks.hasLowercase }">
                  <i v-if="passwordChecks.hasLowercase" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                至少 1 個小寫字母 (a-z)
              </div>
              <div class="requirement" :class="{ 'met': passwordChecks.hasNumber }">
                <span class="check-icon" :class="{ 'checked': passwordChecks.hasNumber }">
                  <i v-if="passwordChecks.hasNumber" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                至少 1 個數字 (0-9)
              </div>
              <div class="requirement" :class="{ 'met': passwordChecks.hasSpecial }">
                <span class="check-icon" :class="{ 'checked': passwordChecks.hasSpecial }">
                  <i v-if="passwordChecks.hasSpecial" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                特殊符號 (!@#$%^&*) 可增強密碼強度 (非必要)
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <div class="password-container">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              placeholder="請再次輸入密碼"
              v-model="confirmPassword"
              class="form-input"
            />
            <span class="eye-icon" @click="togglePasswordVisibility('confirm')">
              <i v-if="showConfirmPassword" class="bi bi-eye"></i>
              <i v-else class="bi bi-eye-slash"></i>
            </span>
          </div>
          <div v-if="passwordMismatch" class="input-error">
            密碼不一致
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group form-col">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="your@email.com" 
              class="form-input"
            />
          </div>
          
          <div class="form-group form-col">
            <label for="phone">手機號碼</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="phone" 
              placeholder="09xxxxxxxx"
              pattern="[0-9]+" 
              title="請輸入數字"
              class="form-input"
            />
          </div>
        </div>

        <!-- reCAPTCHA v2 勾選框 -->
        <div class="form-group recaptcha-container">
          <div ref="recaptchaContainer" class="g-recaptcha"></div>
          <div v-if="captchaError" class="captcha-error">請勾選「我不是機器人」</div>
        </div>
        
        <!-- 使用內聯樣式確保按鈕始終有樣式 -->
        <div class="register-button-container">
          <button 
            type="submit" 
            :disabled="!isFormValid" 
            :style="{
              backgroundColor: isFormValid ? '#ff9b20' : '#cccccc',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }"
          >
            <i class="bi bi-person-plus"></i> 立即註冊
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
        
        <div class="form-links">
          <router-link to="/user/login" class="login-link">
            <i class="bi bi-box-arrow-in-right"></i> 已有帳戶？立即登入
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from "@/plugins/axios";
import { ref, onMounted, nextTick, watch, computed } from "vue";
import Swal from "sweetalert2";
import { useRouter, useRoute } from "vue-router";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton.vue"; // 引入 Google 登入按鈕

const router = useRouter();
const route = useRoute();
const username = ref(""); 
const password = ref(""); 
const confirmPassword = ref("");
const email = ref(""); 
const phone = ref(""); 
const captchaError = ref(false);
const recaptchaContainer = ref(null);
const recaptchaLoaded = ref(false);

// 密碼可見性
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 密碼 Popover 顯示狀態
const showPasswordPopover = ref(false);
const timeoutId = ref(null);
const isInputting = ref(false);
const lastInputTime = ref(0);

// 一鍵帶入示範資料
function fillDemoData() {
  username.value = "DemoUser123";
  password.value = "DemoPass123";
  confirmPassword.value = "DemoPass123";
  email.value = "demo@example.com";
  phone.value = "0912345678";
  
  // 觸發密碼強度檢查
  checkPasswordStrength();
  
  // 使用 nextTick 確保 DOM 更新後再重新驗證表單
  nextTick(() => {
    // 確保按鈕狀態正確更新
    console.log("表單有效性:", isFormValid.value);
  });
}

// 切換 Popover 顯示
function togglePasswordPopover() {
  showPasswordPopover.value = !showPasswordPopover.value;
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
}

// 處理輸入框獲得焦點
function handleFocus() {
  // 只有當用戶已經開始輸入內容時才顯示 Popover
  if (password.value.length > 0) {
    showPasswordPopover.value = true;
  }
}

// 處理密碼輸入框失去焦點
function handleBlur() {
  // 立即隱藏 Popover
  showPasswordPopover.value = false;
  isInputting.value = false;
  
  // 清除任何現有的計時器
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
}

// 點擊文檔其他區域時隱藏 Popover
function setupClickOutsideListener() {
  document.addEventListener('click', (event) => {
    // 如果點擊的不是密碼輸入框、Popover 或資訊圖標
    const isClickedOutside = !event.target.closest('#password') && 
                            !event.target.closest('.password-popover') && 
                            !event.target.closest('.password-info-icon');
    
    if (isClickedOutside && showPasswordPopover.value) {
      showPasswordPopover.value = false;
      isInputting.value = false;
    }
  });
}

// 切換密碼可見性
function togglePasswordVisibility(field) {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else if (field === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}

// 檢查密碼是否匹配
const passwordMismatch = computed(() => {
  if (confirmPassword.value === "") return false;
  return password.value !== confirmPassword.value;
});

// 密碼檢查
const passwordChecks = ref({
  hasLength: false,      // 至少8個字
  hasUppercase: false,   // 至少1個大寫字母
  hasLowercase: false,   // 至少1個小寫字母
  hasNumber: false,      // 至少1個數字
  hasSpecial: false      // 至少1個特殊符號 (非必要)
});

// 密碼強度
const passwordStrength = ref({
  score: 0,        // 0-4 的分數
  percentage: 0,   // 0-100% 進度條
  text: "",  // 強度文字描述
  color: "#cccccc" // 強度顏色
});

// 計算密碼是否有效 (必須符合實際要求)
const isPasswordValid = computed(() => {
  return passwordChecks.value.hasLength && 
         passwordChecks.value.hasUppercase && 
         passwordChecks.value.hasLowercase && 
         passwordChecks.value.hasNumber;
});

// 表單整體有效性
const isFormValid = computed(() => {
  return isPasswordValid.value && 
         !passwordMismatch.value && 
         confirmPassword.value !== "" &&
         username.value.length >= 6;
});

// 密碼正則表達式
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// 處理密碼輸入事件
function handlePasswordInput() {
  // 先執行原來的密碼強度檢查
  checkPasswordStrength();
  
  // 當用戶輸入時顯示 Popover
  showPasswordPopover.value = true;
  
  // 標記用戶正在輸入
  isInputting.value = true;
  lastInputTime.value = Date.now();
  
  // 3秒後如果沒有新的輸入，則隱藏 Popover
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
  
  timeoutId.value = setTimeout(() => {
    // 檢查最後輸入時間，如果超過3秒沒有新輸入則隱藏
    if (Date.now() - lastInputTime.value > 3000) {
      showPasswordPopover.value = false;
      isInputting.value = false;
    }
  }, 3000);
}

// 檢查密碼強度
function checkPasswordStrength() {
  const pwd = password.value;
  
  // 重置檢查結果
  passwordChecks.value = {
    hasLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*]/.test(pwd)
  };
  
  // 快速檢查是否符合完整正則
  const meetsAllRequirements = passwordRegex.test(pwd);
  
  // 計算強度分數 (0-4)
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  
  // 設定強度百分比、文字和顏色
  const percentage = pwd.length ? Math.min(Math.max(score, 1), 4) * 25 : 0;
  
  let text = "";
  let color = "#cccccc";
  
  if (pwd.length > 0) {
    if (score <= 2) {
      text = "弱";
      color = "#ff4d4d";
    } else if (score === 3) {
      text = "中";
      color = "#ffcc00";
    } else if (score >= 4) {
      text = "強";
      color = "#29cc29";
    }
  }
  
  passwordStrength.value = { score, percentage, text, color };
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

watch(phone, (newValue) => {
  // 只保留數字，並限制最大長度為10
  phone.value = newValue.replace(/\D/g, '').slice(0, 10);
});

// 組件掛載後
onMounted(async () => {
  await initializeRecaptcha();
  setupClickOutsideListener();
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

async function register() {
  // 檢查密碼是否符合基本要求
  if (!isPasswordValid.value) {
    Swal.fire({
      title: "密碼不符合要求",
      text: "請確保密碼至少8個字，並包含大小寫字母和數字",
      icon: "warning",
    });
    return;
  }
  
  // 檢查密碼是否一致
  if (passwordMismatch.value) {
    Swal.fire({
      title: "密碼不一致",
      text: "兩次輸入的密碼不一致，請重新確認",
      icon: "warning",
    });
    return;
  }

  // 驗證 reCAPTCHA
  const recaptchaResponse = validateRecaptcha();
  if (!recaptchaResponse) {
    return; // 如果 reCAPTCHA 未通過，不繼續註冊流程
  }

  const data = {
    username: username.value,
    password: password.value,
    email: email.value,
    phone: phone.value,
    recaptchaResponse: recaptchaResponse // 將 reCAPTCHA 回應傳送到後端
  };

  axios.defaults.headers.common["Authorization"] = ``; // 清除之前的 Authorization header
  try {
    const response = await axios.post("/api/auth/register", data);
    if (response.data.success) {
      Swal.fire({
        title: response.data.message,
        icon: "success",
      });

      // 導向登入頁面
      router.push({
        name: "UserLogin", // 改為 Login
      });
    }
  } catch (error) {
    let errorMessage = "註冊失敗，請稍後再試";

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        errorMessage = data.message || "請求格式錯誤或資料不完整";
      } else if (status === 409) {
        errorMessage = data.message || "使用者名稱或電子郵件已存在";
      } else if (status === 401) {
        errorMessage = data.message || "帳號或密碼錯誤";
      } else if (status === 403) {
        errorMessage = data.message || "您沒有權限執行此操作";
      } else if (status === 404) {
        errorMessage = data.message || "找不到資源";
      } else if (status >= 500) {
        errorMessage = data.message || "伺服器發生錯誤";
      } else {
        errorMessage = `註冊失敗，錯誤碼：${status}`;
      }
    } else if (error.request) {
      errorMessage = "網路連線異常，請檢查您的網路";
    } else {
      errorMessage = "發生未知的錯誤";
    }

    Swal.fire({
      title: "錯誤: " + errorMessage,
      icon: "error",
    });
    
    // 註冊失敗時重設 reCAPTCHA
    resetRecaptcha();
  }
}
</script>

<style scoped>
:root {
  --primary-color: #ff9b20; /* 橙色 */
  --primary-hover: #e7840b; /* 深橙色 */
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 30px;
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--primary-color);
  font-weight: 600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* DEMO按鈕 */
.demo-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.demo-button {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: var(--input-radius);
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.demo-button:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.demo-button i {
  font-size: 14px;
}

/* 表單元素 */
.form-group {
  margin-bottom: 0;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: var(--input-radius);
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 155, 32, 0.1);
  outline: none;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

/* 表單排列 */
.form-row {
  display: flex;
  gap: 20px;
}

.form-col {
  flex: 1;
}

/* 錯誤提示 */
.input-error {
  color: var(--error-color);
  font-size: 13px;
  margin-top: 5px;
}

/* 密碼強度相關樣式 */
.password-strength-meter {
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin: 8px 0 4px;
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  width: 0;
  transition: width 0.3s, background-color 0.3s;
}

.password-strength-text {
  font-size: 12px;
  margin-bottom: 0;
  text-align: right;
}

/* 密碼要求 Popover 樣式 */
.password-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-left: 5px;
  cursor: pointer;
  color: var(--text-light);
  transition: color 0.2s;
}

.password-info-icon:hover {
  color: var(--primary-color);
}

.password-popover {
  position: absolute;
  top: 0;
  left: 105%; /* 放在輸入框右側 */
  width: 250px; /* 固定寬度 */
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border: 1px solid var(--border-color);
  animation: fadeIn 0.2s ease-in-out;
  max-height: 300px;
  overflow-y: auto;
}

.popover-arrow {
  position: absolute;
  top: 15px;
  left: -8px;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
  background: white;
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.popover-header {
  padding: 10px 15px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  background-color: #f8f9fa;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.popover-body {
  padding: 15px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.requirement {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: var(--text-light);
  font-size: 13px;
}

.requirement.met {
  color: var(--success-color);
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.check-icon i {
  transition: all 0.2s ease;
}

.check-icon.checked i {
  color: var(--success-color);
}

.check-icon:not(.checked) i {
  color: #ccc;
}

/* 密碼容器相關樣式 */
.password-container {
  position: relative;
  width: 100%;
}

.password-container input {
  width: 100%;
  padding-right: 45px; /* 為眼睛圖標預留空間 */
}

.eye-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  color: var(--text-light);
  transition: color 0.2s;
}

.eye-icon:hover {
  color: var(--primary-color);
}

/* 註冊按鈕容器 */
.register-button-container {
  width: 100%;
  margin-top: 10px;
}

/* 連結樣式 */
.form-links {
  margin-top: 15px;
  text-align: center;
}

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.2s;
}

.login-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* reCAPTCHA 相關樣式 */
.recaptcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.captcha-error {
  color: var(--error-color);
  font-size: 13px;
  margin-top: 5px;
}

/* 分隔線 */
.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
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
  margin-bottom: 10px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .password-popover {
    left: 0;
    top: 100%;
    width: 100%;
    margin-top: 10px;
  }
  
  .popover-arrow {
    top: -8px;
    left: 20px;
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    border-bottom: none;
  }
  
  .register-card {
    padding: 20px;
  }
}
</style>