<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>個人資料</h1>
      <p>更新您的帳戶資訊</p>
    </div>

    <div class="profile-cards-container">
      <!-- 基本資訊卡片 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>基本資訊</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="username">使用者名稱</label>
              <input 
                type="text" 
                id="username" 
                v-model="profileData.userName" 
                required
                placeholder="請輸入使用者名稱"
                class="form-control"
              />
              <div v-if="validationErrors.userName" class="text-danger small mt-1">
                {{ validationErrors.userName }}
              </div>
            </div>

            <div class="form-group">
              <label for="email">電子郵件</label>
              <input 
                type="email" 
                id="email" 
                v-model="profileData.email" 
                required
                placeholder="請輸入電子郵件"
                class="form-control"
              />
              <div v-if="validationErrors.email" class="text-danger small mt-1">
                {{ validationErrors.email }}
              </div>
            </div>

            <div class="form-group">
              <label for="phone">電話</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="profileData.phone" 
                placeholder="請輸入電話號碼"
                pattern="[0-9]{10}" 
                maxlength="10"
                title="請輸入10位數字的手機號碼"
                class="form-control"
              />
              <small class="form-text text-muted">請輸入10位數字的手機號碼 (例如：0912345678)</small>
              <div v-if="validationErrors.phone" class="text-danger small mt-1">
                {{ validationErrors.phone }}
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <i class="bi bi-save"></i> 儲存變更
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 修改密碼卡片 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>修改密碼</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label for="current-password">目前密碼</label>
              <div class="input-group">
                <input 
                  :type="showCurrentPassword ? 'text' : 'password'" 
                  id="current-password" 
                  v-model="passwordData.currentPassword" 
                  required
                  placeholder="請輸入目前密碼"
                  class="form-control"
                />
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" @click="togglePasswordVisibility('current')">
                    <i v-if="showCurrentPassword" class="bi bi-eye"></i>
                    <i v-else class="bi bi-eye-slash"></i>
                  </button>
                </div>
              </div>
              <div v-if="validationErrors.currentPassword" class="text-danger small mt-1">
                {{ validationErrors.currentPassword }}
              </div>
            </div>

            <div class="form-group">
              <label for="new-password" class="d-flex align-items-center">
                新密碼
                <button type="button" class="btn btn-link p-0 ml-1" @click="togglePasswordPopover">
                  <i class="bi bi-info-circle"></i>
                </button>
              </label>
              <div class="input-group">
                <input 
                  :type="showNewPassword ? 'text' : 'password'" 
                  id="new-password" 
                  v-model="passwordData.newPassword" 
                  required
                  @input="handlePasswordInput"
                  @focus="handleFocus"
                  @blur="handleBlur"
                  placeholder="請輸入新密碼"
                  class="form-control"
                />
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" @click="togglePasswordVisibility('new')">
                    <i v-if="showNewPassword" class="bi bi-eye"></i>
                    <i v-else class="bi bi-eye-slash"></i>
                  </button>
                </div>
              </div>
              
              <!-- Bootstrap Popover (使用定位策略確保可見) -->
              <div class="password-requirements-popover position-fixed" id="password-popover" style="display: none;">
                <div class="arrow"></div>
                <h3 class="popover-header">密碼要求</h3>
                <div class="popover-body">
                  <div class="requirement" :class="{ 'text-success': passwordChecks.hasLength }">
                    <i v-if="passwordChecks.hasLength" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                    <span class="ms-2">至少 8 個字</span>
                  </div>
                  <div class="requirement" :class="{ 'text-success': passwordChecks.hasUppercase }">
                    <i v-if="passwordChecks.hasUppercase" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                    <span class="ms-2">至少 1 個大寫字母 (A-Z)</span>
                  </div>
                  <div class="requirement" :class="{ 'text-success': passwordChecks.hasLowercase }">
                    <i v-if="passwordChecks.hasLowercase" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                    <span class="ms-2">至少 1 個小寫字母 (a-z)</span>
                  </div>
                  <div class="requirement" :class="{ 'text-success': passwordChecks.hasNumber }">
                    <i v-if="passwordChecks.hasNumber" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                    <span class="ms-2">至少 1 個數字 (0-9)</span>
                  </div>
                  <div class="requirement" :class="{ 'text-success': passwordChecks.hasSpecial }">
                    <i v-if="passwordChecks.hasSpecial" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                    <span class="ms-2">特殊符號 (!@#$%^&*) 可增強密碼強度 (非必要)</span>
                  </div>
                </div>
              </div>
              
              <!-- 密碼強度進度條 -->
              <div v-if="passwordData.newPassword.length > 0" class="progress mt-2" style="height: 5px;">
                <div class="progress-bar" :class="getProgressBarClass()" :style="{ width: passwordStrength.percentage + '%' }"></div>
              </div>
              <div v-if="passwordData.newPassword.length > 0" class="password-strength-text small text-right mt-1" :class="getStrengthTextClass()">
                {{ passwordStrength.text }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password">確認新密碼</label>
              <div class="input-group">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  id="confirm-password" 
                  v-model="passwordData.confirmPassword" 
                  required
                  placeholder="請再次輸入新密碼"
                  class="form-control"
                />
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" @click="togglePasswordVisibility('confirm')">
                    <i v-if="showConfirmPassword" class="bi bi-eye"></i>
                    <i v-else class="bi bi-eye-slash"></i>
                  </button>
                </div>
              </div>
              <div v-if="passwordMismatch" class="text-danger small mt-1">
                密碼不一致
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isPasswordValid">
                <i class="bi bi-key"></i> 更新密碼
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/user';
import Swal from 'sweetalert2';
import axios from '@/plugins/axios';

const userStore = useUserStore();
const isSubmitting = ref(false);
const validationErrors = reactive({});

// 個人資料表單數據
const profileData = reactive({
  userId: '',
  userName: '',
  email: '',
  phone: ''
});

// 密碼表單數據
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密碼可見性
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// 密碼 Popover 顯示狀態
const showPasswordPopover = ref(false);
const timeoutId = ref(null);
const isInputting = ref(false);
const lastInputTime = ref(0);

// 獲取密碼強度顏色類
function getProgressBarClass() {
  if (passwordStrength.score <= 2) return 'bg-danger';
  if (passwordStrength.score === 3) return 'bg-warning';
  return 'bg-success';
}

// 獲取密碼強度文字顏色類
function getStrengthTextClass() {
  if (passwordStrength.score <= 2) return 'text-danger';
  if (passwordStrength.score === 3) return 'text-warning';
  return 'text-success';
}

// 切換 Popover 顯示
// 切換 Popover 顯示
function togglePasswordPopover() {
  const popover = document.getElementById('password-popover');
  if (popover) {
    // 切換顯示狀態
    if (popover.style.display === 'none') {
      popover.style.display = 'block';
      
      // 取得輸入框位置
      const inputElement = document.getElementById('new-password');
      if (inputElement) {
        const rect = inputElement.getBoundingClientRect();
        
        // 使用position: fixed的絕對座標 (相對於視窗)
        if (window.innerWidth <= 768) {
          // 小屏幕設備：在輸入框下方
          popover.style.top = (rect.bottom + 10) + 'px';
          popover.style.left = rect.left + 'px';
        } else {
          // 大屏幕設備：在輸入框右側
          popover.style.top = rect.top + 'px';
          popover.style.left = (rect.right + 15) + 'px';
        }
      }
    } else {
      popover.style.display = 'none';
    }
  }
  
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
}

// 處理輸入框獲得焦點
function handleFocus() {
  // 只有當用戶已經開始輸入內容時才顯示 Popover
  if (passwordData.newPassword.length > 0) {
    const popover = document.getElementById('password-popover');
    if (popover) {
      popover.style.display = 'block';
      
      // 取得輸入框位置
      const inputElement = document.getElementById('new-password');
      if (inputElement) {
        const rect = inputElement.getBoundingClientRect();
        
        // 使用position: fixed的絕對座標 (相對於視窗)
        if (window.innerWidth <= 768) {
          // 小屏幕設備：在輸入框下方
          popover.style.top = (rect.bottom + 10) + 'px';
          popover.style.left = rect.left + 'px';
        } else {
          // 大屏幕設備：在輸入框右側
          popover.style.top = rect.top + 'px';
          popover.style.left = (rect.right + 15) + 'px';
        }
      }
    }
  }
}

// 處理密碼輸入框失去焦點
function handleBlur() {
  // 延遲隱藏 Popover，避免如果用戶點擊 Popover 內容時就隱藏了
  timeoutId.value = setTimeout(() => {
    const popover = document.getElementById('password-popover');
    if (popover) {
      popover.style.display = 'none';
    }
  }, 200);
  
  isInputting.value = false;
}

// 點擊文檔其他區域時隱藏 Popover
function setupClickOutsideListener() {
  document.addEventListener('click', (event) => {
    // 如果點擊的不是密碼輸入框、Popover 或資訊圖標
    const isClickedOutside = !event.target.closest('#new-password') && 
                            !event.target.closest('#password-popover') && 
                            !event.target.closest('.btn-link');
    
    const popover = document.getElementById('password-popover');
    if (isClickedOutside && popover && popover.style.display === 'block') {
      popover.style.display = 'none';
      isInputting.value = false;
    }
  });
}

// 切換密碼可見性
function togglePasswordVisibility(field) {
  if (field === 'current') {
    showCurrentPassword.value = !showCurrentPassword.value;
  } else if (field === 'new') {
    showNewPassword.value = !showNewPassword.value;
  } else if (field === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}

// 檢查密碼是否匹配
const passwordMismatch = computed(() => {
  if (passwordData.confirmPassword === "") return false;
  return passwordData.newPassword !== passwordData.confirmPassword;
});

// 密碼檢查
const passwordChecks = reactive({
  hasLength: false,      // 至少8個字
  hasUppercase: false,   // 至少1個大寫字母
  hasLowercase: false,   // 至少1個小寫字母
  hasNumber: false,      // 至少1個數字
  hasSpecial: false      // 至少1個特殊符號 (非必要)
});

// 密碼強度
const passwordStrength = reactive({
  score: 0,        // 0-4 的分數
  percentage: 0,   // 0-100% 進度條
  text: "",        // 強度文字描述
  color: "#cccccc" // 強度顏色
});

// 計算密碼是否有效 (必須符合實際要求)
const isPasswordValid = computed(() => {
  return passwordChecks.hasLength && 
         passwordChecks.hasUppercase && 
         passwordChecks.hasLowercase && 
         passwordChecks.hasNumber &&
         !passwordMismatch.value &&
         passwordData.confirmPassword !== "";
});

// 密碼正則表達式
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// 處理密碼輸入事件
function handlePasswordInput() {
  // 先執行密碼強度檢查
  checkPasswordStrength();
  
  // 當用戶輸入時顯示 Popover
  const popover = document.getElementById('password-popover');
  if (popover) {
    // 顯示popover
    popover.style.display = 'block';
    
    // 計算位置
    const inputElement = document.getElementById('new-password');
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      
      // 使用position: fixed的絕對座標 (相對於視窗)
      if (window.innerWidth <= 768) {
        // 小屏幕設備：在輸入框下方
        popover.style.top = (rect.bottom + 10) + 'px';
        popover.style.left = rect.left + 'px';
      } else {
        // 大屏幕設備：在輸入框右側
        popover.style.top = rect.top + 'px';
        popover.style.left = (rect.right + 15) + 'px';
      }
    }
  }
  
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
      const popover = document.getElementById('password-popover');
      if (popover) {
        popover.style.display = 'none';
      }
      isInputting.value = false;
    }
  }, 3000);
}

// 檢查密碼強度
function checkPasswordStrength() {
  const pwd = passwordData.newPassword;
  
  // 重置檢查結果
  passwordChecks.hasLength = pwd.length >= 8;
  passwordChecks.hasUppercase = /[A-Z]/.test(pwd);
  passwordChecks.hasLowercase = /[a-z]/.test(pwd);
  passwordChecks.hasNumber = /[0-9]/.test(pwd);
  passwordChecks.hasSpecial = /[!@#$%^&*]/.test(pwd);
  
  // 計算強度分數 (0-4)
  let score = 0;
  if (pwd.length >= 6) score++;
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
  
  passwordStrength.score = score;
  passwordStrength.percentage = percentage;
  passwordStrength.text = text;
  passwordStrength.color = color;
}

// 監聽輸入的電話號碼，只保留數字
watch(() => profileData.phone, (newValue) => {
  if (newValue) {
    profileData.phone = newValue.replace(/\D/g, '').slice(0, 10);
  }
});

// 處理窗口大小變化，調整popover位置
function handleResize() {
  const popover = document.getElementById('password-popover');
  if (popover && popover.style.display === 'block') {
    const inputElement = document.getElementById('new-password');
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      
      // 使用position: fixed的絕對座標 (相對於視窗)
      if (window.innerWidth <= 768) {
        // 小屏幕設備：在輸入框下方
        popover.style.top = (rect.bottom + 10) + 'px';
        popover.style.left = rect.left + 'px';
      } else {
        // 大屏幕設備：在輸入框右側
        popover.style.top = rect.top + 'px';
        popover.style.left = (rect.right + 15) + 'px';
      }
    }
  }
}

// 當組件掛載時載入用戶資料並設置Bootstrap相關功能
onMounted(async () => {
  // 添加窗口大小變化監聽
  window.addEventListener('resize', handleResize);
  try {
    // 發送 API 請求獲取當前管理員資料
    const response = await axios.get('/api/admin/profile');
    
    // 更新表單數據
    profileData.userId = response.data.userId;
    profileData.userName = response.data.userName;
    profileData.email = response.data.email;
    profileData.phone = response.data.phone || '';
    
    // 更新 localStorage (若有需要)
    localStorage.setItem('username', profileData.userName);
    localStorage.setItem('userId', profileData.userId);
    localStorage.setItem('email', profileData.email);
    if (profileData.phone) {
      localStorage.setItem('phone', profileData.phone);
    }
    
    // 更新 userStore (若有需要)
    if (userStore.userData) {
      userStore.updateUserData({
        ...userStore.userData,
        username: profileData.userName,
        userId: profileData.userId,
        email: profileData.email,
        phone: profileData.phone
      });
    }
  } catch (error) {
    console.error('載入用戶資料失敗:', error);
    Swal.fire({
      icon: 'error',
      title: '載入失敗',
      text: '無法載入用戶資料，請重新整理頁面',
    });
  }
  
  // 設置點擊外部關閉 Popover
  setupClickOutsideListener();
  
  // 初始化 Bootstrap 的 tooltip（如果需要）
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
});

// 驗證表單輸入
function validateProfileForm() {
  validationErrors.userName = '';
  validationErrors.email = '';
  validationErrors.phone = '';
  
  let isValid = true;
  
  // 用戶名驗證 (6-20字)
  if (!profileData.userName || profileData.userName.length < 6 || profileData.userName.length > 20) {
    validationErrors.userName = '名稱長度需介於6-20字';
    isValid = false;
  }
  
  // Email 驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!profileData.email || !emailRegex.test(profileData.email)) {
    validationErrors.email = '請輸入有效的電子郵件';
    isValid = false;
  }
  
  // 電話驗證 (台灣格式)
  const phoneRegex = /^09\d{8}$/;
  if (profileData.phone && !phoneRegex.test(profileData.phone)) {
    validationErrors.phone = '請輸入有效的台灣手機號碼';
    isValid = false;
  }
  
  return isValid;
}

// 更新個人資料
async function updateProfile() {
  if (isSubmitting.value) return;
  
  // 驗證表單
  if (!validateProfileForm()) {
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    // 發送 API 請求
    const response = await axios.put('/api/admin/profile', {
      userName: profileData.userName,
      email: profileData.email,
      phone: profileData.phone
    });
    
    if (response.data.success) {
      // 更新 localStorage
      localStorage.setItem('username', profileData.userName);
      localStorage.setItem('email', profileData.email);
      if (profileData.phone) {
        localStorage.setItem('phone', profileData.phone);
      } else {
        localStorage.removeItem('phone');
      }
      
      // 更新 userStore (如果需要)
      if (userStore.userData) {
        userStore.updateUserData({
          ...userStore.userData,
          username: profileData.userName,
          email: profileData.email,
          phone: profileData.phone
        });
      }
      
      Swal.fire({
        icon: 'success',
        title: '更新成功',
        text: '您的個人資料已成功更新',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '更新失敗',
        text: response.data.message || '無法更新個人資料'
      });
    }
  } catch (error) {
    console.error('更新個人資料失敗:', error);
    Swal.fire({
      icon: 'error',
      title: '更新失敗',
      text: error.response?.data?.message || '無法更新個人資料，請稍後再試'
    });
  } finally {
    isSubmitting.value = false;
  }
}

// 更新密碼
async function updatePassword() {
  if (isSubmitting.value || !isPasswordValid.value) return;
  
  validationErrors.currentPassword = '';
  validationErrors.newPassword = '';
  
  try {
    isSubmitting.value = true;
    
    // 發送 API 請求
    const response = await axios.put('/api/admin/profile/password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (response.data.success) {
      // 清空密碼表單
      passwordData.currentPassword = '';
      passwordData.newPassword = '';
      passwordData.confirmPassword = '';
      
      Swal.fire({
        icon: 'success',
        title: '密碼已更新',
        text: '您的密碼已成功更新',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '更新失敗',
        text: response.data.message || '無法更新密碼'
      });
    }
  } catch (error) {
    console.error('更新密碼失敗:', error);
    
    // 處理特定錯誤
    if (error.response?.status === 401) {
      validationErrors.currentPassword = '當前密碼不正確';
    } else {
      Swal.fire({
        icon: 'error',
        title: '更新失敗',
        text: error.response?.data?.message || '無法更新密碼，請稍後再試'
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  padding-top: 80px; /* 添加頂部內邊距，確保內容不被固定的 navbar 遮擋 */
}

.profile-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 16px;
}

.profile-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.profile-header p {
  color: #666;
  margin: 0;
}

/* 布局容器 - 用於左右兩欄佈局 */
.profile-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
  flex: 1;
  min-width: 300px;
}

.card-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.card-body {
  padding: 24px 20px;
}

.form-group {
  position: relative;
  margin-bottom: 20px;
}

.password-requirements-popover {
  width: 240px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  border: 1px solid #e0e0e0;
}

.password-requirements-popover .arrow {
  position: absolute;
  top: 20px;
  left: -8px; /* 將箭頭指向左側 */
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  background: white;
  border-left: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.password-requirements-popover .popover-header {
  padding: 8px 10px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0;
}

.password-requirements-popover .popover-body {
  padding: 10px;
}

.requirement {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.requirement i {
  margin-right: 5px;
  width: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.ml-1 {
  margin-left: 0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

/* 密碼強度文字 */
.password-strength-text {
  font-size: 12px;
}

  /* 響應式設計調整 */
@media (max-width: 768px) {
  .profile-cards-container {
    flex-direction: column;
  }
  
  .profile-card {
    width: 100%;
    min-width: 100%;
  }
  
  .password-requirements-popover {
    left: 0;
    right: auto;
    top: 40px; /* 放在輸入框下方 */
    width: 100%;
    max-width: 100%;
  }
  
  .password-requirements-popover .arrow {
    top: -7px;
    right: auto;
    left: 20px;
    border-right: none;
    border-top: none;
    border-left: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>