<template>
<<<<<<< HEAD
    <div class="fill-phone-container">
      <h2>完成您的 Google 註冊</h2>
      <p>請提供以下資訊以完成您的註冊流程</p>
      
      <form @submit.prevent="completeRegistration">
        <div class="form-group">
          <label for="password">建立密碼</label>
          <input 
            type="password" 
=======
  <div class="fill-phone-container">
    <h2>完成您的 Google 註冊</h2>
    <p>請提供以下資訊以完成您的註冊流程</p>
    
    <form @submit.prevent="completeRegistration">
      <div class="form-group">
        <label for="password">
          建立密碼
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
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
            id="password" 
            v-model="password" 
            required 
            placeholder="輸入密碼"
<<<<<<< HEAD
          />
          <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <input 
            type="password" 
=======
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
        
        <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">確認密碼</label>
        <div class="password-container">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'" 
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="確認您的密碼"
<<<<<<< HEAD
          />
          <small v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</small>
        </div>
        
        <div class="form-group">
          <label for="phone">電話號碼</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="phone" 
            required 
            placeholder="輸入您的電話號碼"
          />
          <small v-if="phoneError" class="error-message">{{ phoneError }}</small>
        </div>
        
        <button type="submit" :disabled="isSubmitting || hasErrors">
          {{ isSubmitting ? '處理中...' : '完成註冊' }}
        </button>
        
        <div v-if="serverError" class="server-error">
          {{ serverError }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import axios from '@/plugins/axios';
  import { useUserStore } from "@/stores/user";
  import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

  const userStore = useUserStore();
  
  export default {
    name: 'FillPhonePage',
    
    setup() {
      const router = useRouter();
      const route = useRoute();
      
      const token = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const phone = ref('');
      const isSubmitting = ref(false);
      const serverError = ref('');
      
      // 錯誤訊息
      const passwordError = computed(() => {
        if (!password.value) return '';
        if (password.value.length < 6 || password.value.length > 12) 
          return '密碼長度需介於6-12個字符';
        if (!/[A-Z]/.test(password.value)) 
          return '密碼需包含至少一個大寫字母';
        return '';
      });
      
      const confirmPasswordError = computed(() => {
        if (!confirmPassword.value) return '';
        if (password.value !== confirmPassword.value) 
          return '兩次輸入的密碼不一致';
        return '';
      });
      
      const phoneError = computed(() => {
        if (!phone.value) return '';
        if (!/^09\d{8}$/.test(phone.value)) 
          return '請輸入正確的台灣手機號碼格式 (09xxxxxxxx)';
        return '';
      });
      
      const hasErrors = computed(() => {
        return !!passwordError.value || !!confirmPasswordError.value || !!phoneError.value;
      });
      
      onMounted(() => {
        // 從 URL 參數中獲取 token
        token.value = route.query.token;
        if (!token.value) {
          router.push('/login');
        }
      });
      
      const completeRegistration = async () => {
        if (hasErrors.value) return;
        
        isSubmitting.value = true;
        serverError.value = '';
        
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/complete-google-signup`,
            {
              token: token.value,
              password: password.value,
              phone: phone.value
            }
          );
          
          if (response.data && response.data.success) {
            // 解析 token
  const decodedToken = jwtDecode(response.data.token);
  
  // 設定 axios 的 authorization header
  axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  
  // 使用 Pinia store 保存用戶數據
  userStore.saveUserData(decodedToken.sub, decodedToken.userId, response.data.token, decodedToken.roles);
  userStore.reloadUserData();
  
            // 顯示成功訊息
            Swal.fire({
                title: 'Google 登入成功!',
                text: '歡迎來到我們的網站',
                icon: 'success',
                confirmButtonText: '開始購物'
            }).then((result) => {
                if (result.isConfirmed) {
                // 導向到商店頁面
                router.push('/shop');
                }
            });
          } else {
            serverError.value = response.data.message || '註冊失敗，請重試。';
          }
        } catch (error) {
          console.error('註冊錯誤:', error);
          if (error.response && error.response.data) {
            serverError.value = error.response.data.message || '註冊失敗，請重試。';
          } else {
            serverError.value = '網路錯誤，請稍後重試。';
          }
        } finally {
          isSubmitting.value = false;
        }
      };
      
      return {
        password,
        confirmPassword,
        phone,
        passwordError,
        confirmPasswordError,
        phoneError,
        hasErrors,
        isSubmitting,
        serverError,
        completeRegistration
      };
    }
  }
  </script>
  
  <style scoped>
  .fill-phone-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  p {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    width: 100%;
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    margin-top: 1rem;
  }
  
  button:disabled {
    background-color: #a0c3ff;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #d32f2f;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
  }
  
  .server-error {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #ffebee;
    color: #d32f2f;
    border-radius: 4px;
    text-align: center;
  }
  </style>
=======
            class="form-input"
          />
          <span class="eye-icon" @click="togglePasswordVisibility('confirm')">
            <i v-if="showConfirmPassword" class="bi bi-eye"></i>
            <i v-else class="bi bi-eye-slash"></i>
          </span>
        </div>
        <small v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</small>
      </div>
      
      <div class="form-group">
  <label for="phone">電話號碼</label>
  <input 
    type="tel" 
    id="phone" 
    v-model="phone" 
    required 
    placeholder="輸入您的電話號碼"
    class="form-input"
    @input="handlePhoneInput"
    maxlength="10"
  />
  <small v-if="phoneError" class="error-message">{{ phoneError }}</small>
</div>
      
      <button type="submit" :disabled="isSubmitting || hasErrors" class="submit-button">
        <i v-if="isSubmitting" class="bi bi-arrow-repeat spin"></i>
        <i v-else class="bi bi-check-circle"></i>
        {{ isSubmitting ? '處理中...' : '完成註冊' }}
      </button>
      
      <div v-if="serverError" class="server-error">
        <i class="bi bi-exclamation-triangle"></i> {{ serverError }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/plugins/axios';
import { useUserStore } from "@/stores/user";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const phone = ref('');
const isSubmitting = ref(false);
const serverError = ref('');

// 密碼可見性
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 密碼 Popover 顯示狀態
const showPasswordPopover = ref(false);
const timeoutId = ref(null);
const isInputting = ref(false);
const lastInputTime = ref(0);

// 密碼檢查狀態
const passwordChecks = ref({
  hasLength: false,      // 至少8個字
  hasUppercase: false,   // 至少1個大寫字母
  hasLowercase: false,   // 至少1個小寫字母
  hasNumber: false,      // 至少1個數字
  hasSpecial: false      // 至少1個特殊符號 (非必要)
});

// 密碼強度
const passwordStrength = ref({
  score: 0,        // 0-2 的分數
  percentage: 0,   // 0-100% 進度條
  text: "",        // 強度文字描述
  color: "#cccccc" // 強度顏色
});

// 切換 Popover 顯示
function togglePasswordPopover() {
  showPasswordPopover.value = !showPasswordPopover.value;
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
}

function handlePhoneInput(event) {
  // 只允許數字輸入
  const input = event.target.value.replace(/\D/g, '');
  
  // 限制最大長度為10位數
  if (input.length > 10) {
    phone.value = input.slice(0, 10);
  } else {
    phone.value = input;
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

// 處理密碼輸入事件
function handlePasswordInput() {
  // 檢查密碼要求
  checkPasswordRequirements();
  
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

// 密碼正則表達式
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// 檢查密碼要求
function checkPasswordRequirements() {
  const pwd = password.value;
  
  // 更新密碼檢查狀態
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
  
  // 設定顏色和文字
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

// 錯誤訊息
const passwordError = computed(() => {
  if (!password.value) return '';
  if (password.value.length < 8) 
    return '密碼長度需至少8個字符';
  if (!/[A-Z]/.test(password.value)) 
    return '密碼需包含至少一個大寫字母';
  if (!/[a-z]/.test(password.value)) 
    return '密碼需包含至少一個小寫字母';
  if (!/[0-9]/.test(password.value)) 
    return '密碼需包含至少一個數字';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return '';
  if (password.value !== confirmPassword.value) 
    return '兩次輸入的密碼不一致';
  return '';
});

const phoneError = computed(() => {
  if (!phone.value) return '';
  if (!/^09\d{8}$/.test(phone.value)) 
    return '請輸入正確的台灣手機號碼格式 (09xxxxxxxx)';
  return '';
});

const hasErrors = computed(() => {
  return !!passwordError.value || !!confirmPasswordError.value || !!phoneError.value;
});

onMounted(() => {
  // 從 URL 參數中獲取 token
  token.value = route.query.token;
  if (!token.value) {
    router.push('/login');
  }
  
  // 設置點擊外部區域隱藏 Popover
  setupClickOutsideListener();
});

// 監聽密碼變化
watch(password, () => {
  checkPasswordRequirements();
});

const completeRegistration = async () => {
  if (hasErrors.value) return;
  
  isSubmitting.value = true;
  serverError.value = '';
  
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/complete-google-signup`,
      {
        token: token.value,
        password: password.value,
        phone: phone.value
      }
    );
    
    if (response.data && response.data.success) {
      // 解析 token
      const decodedToken = jwtDecode(response.data.token);
      
      // 設定 axios 的 authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      
      // 使用 Pinia store 保存用戶數據
      userStore.saveUserData(decodedToken.sub, decodedToken.userId, response.data.token, decodedToken.roles);
      userStore.reloadUserData();
      
      // 顯示成功訊息
      Swal.fire({
        title: 'Google 登入成功!',
        text: '歡迎來到我們的網站',
        icon: 'success',
        confirmButtonText: '開始購物'
      }).then((result) => {
        if (result.isConfirmed) {
          // 導向到商店頁面
          router.push('/shop');
        }
      });
    } else {
      serverError.value = response.data.message || '註冊失敗，請重試。';
    }
  } catch (error) {
    console.error('註冊錯誤:', error);
    if (error.response && error.response.data) {
      serverError.value = error.response.data.message || '註冊失敗，請重試。';
    } else {
      serverError.value = '網路錯誤，請稍後重試。';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
:root {
  --primary-color: #4285f4; /* Google 藍色 */
  --primary-hover: #3367d6;
  --error-color: #d32f2f;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --text-color: #333;
  --text-light: #666;
  --border-color: #ddd;
  --bg-color: #f9f9f9;
  --card-bg: #fff;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --input-radius: 4px;
}

.fill-phone-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  background-color: var(--card-bg);
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

p {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--input-radius);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  outline: none;
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
  margin-bottom: 8px;
  text-align: right;
}

/* 密碼容器相關樣式 */
.password-container {
  position: relative;
  width: 100%;
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
  width: 30px;
  height: 30px;
  color: var(--text-light);
  transition: color 0.2s;
}

.eye-icon:hover {
  color: var(--primary-color);
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
  font-size: 16px;
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

/* 按鈕樣式 */
.submit-button {
  width: 100%;
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  background-color: #3367d6;
}

.submit-button:disabled {
  background-color: #a0c3ff;
  cursor: not-allowed;
}

/* 轉圈動畫 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 錯誤提示 */
.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.server-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  color: var(--error-color);
  border-radius: var(--input-radius);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fill-phone-container {
    margin: 1rem;
    padding: 1.5rem;
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
}
</style>
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
