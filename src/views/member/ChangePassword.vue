<template>
    <div class="container">
      <h2>變更密碼</h2>
      <form @submit.prevent="handleChangePassword">
        <div>
          <label>舊密碼：</label>
          <div class="input-group">
  <input :type="showCurrentPassword ? 'text' : 'password'" placeholder="請輸入舊密碼" v-model="currentPassword" required />
  <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="eye-icon" @click="showCurrentPassword = !showCurrentPassword"></i>
</div>
        </div>
  
        <div>
          <label>新密碼：</label>
          <div class="input-group">
  <input :type="showNewPassword ? 'text' : 'password'" placeholder="請輸入新密碼" v-model="newPassword" required />
  <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="eye-icon" @click="showNewPassword = !showNewPassword"></i>
</div>
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
  
          <!-- 密碼強度條 -->
          <div v-if="newPassword.length > 0" class="password-strength-meter mt-2">
            <div class="password-strength-bar" :style="{ width: passwordStrength.percentage + '%', backgroundColor: passwordStrength.color }"></div>
          </div>
          <div v-if="newPassword.length > 0" class="password-strength-text text-sm mt-1" :style="{ color: passwordStrength.color }">
            強度：{{ passwordStrength.text }}
          </div>
        </div>
  
        <div>
          <label>確認新密碼：</label>
          <div class="input-group">
  <input :type="showConfirmPassword ? 'text' : 'password'" placeholder="再次輸入新密碼" v-model="confirmPassword" required />
  <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="eye-icon" @click="showConfirmPassword = !showConfirmPassword"></i>
</div>
        </div>
  
        <button type="submit">確認變更</button>
        <button type="button" @click="cancel">取消</button>
        <p v-if="message" class="message">{{ message }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import axios from 'axios';
  import { jwtDecode } from 'jwt-decode';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  
  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const message = ref('');
  const passwordError = ref('');
  const passwordStrength = ref({ score: 0, percentage: 0, text: '', color: '#ccc' });
  
  const showCurrentPassword = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);
  
  // 🔍 圖示引入
  const showIcon = new URL('@/assets/show.png', import.meta.url).href;
  const hideIcon = new URL('@/assets/hide.png', import.meta.url).href;
  
  const token = localStorage.getItem('token');
  const userId = jwtDecode(token).userId;
  const router = useRouter();
  const userStore = useUserStore();
  
  watch(newPassword, (val) => {
    evaluatePasswordStrength(val);
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    passwordError.value = pattern.test(val) ? '' : '密碼需至少8碼，包含大小寫英文與數字';
  });
  
  function evaluatePasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
  
    const percentage = pwd.length ? Math.min(Math.max(score, 1), 4) * 25 : 0;
  
    let text = '';
    let color = '#ccc';
  
    if (pwd.length > 0) {
      if (score <= 2) {
        text = '弱';
        color = '#ff4d4d';
      } else if (score === 3) {
        text = '中';
        color = '#ffcc00';
      } else if (score >= 4) {
        text = '強';
        color = '#29cc29';
      }
    }
  
    passwordStrength.value = { score, percentage, text, color };
  }
  
  function handleNewPasswordInput() {
    evaluatePasswordStrength(newPassword.value);
  }
  
  async function handleChangePassword() {
    message.value = '';
  
    if (passwordError.value) {
      message.value = '❗密碼格式不符合要求';
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      message.value = '❗新密碼與確認密碼不一致';
      return;
    }
  
    try {
      await axios.put(`http://localhost:8081/api/user/${userId}/change-password`, {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      message.value = '✅ 密碼變更成功，將自動登出...';
      localStorage.removeItem('token');
      sessionStorage.clear();
      userStore.clearUserData();
      setTimeout(() => router.push('/user/login'), 3000);
    } catch (error) {
      console.error('密碼變更失敗：', error);
      message.value = error.response?.data || '變更失敗，請稍後再試';
    }
  }
  
  function cancel() {
    router.push('/memberCenter');
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 420px;
    margin: auto;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  label {
    font-weight: bold;
    display: block;
    margin-bottom: 4px;
  }
  
  .input-group {
    position: relative;
  }
  
  input {
    width: 100%;
    padding: 10px;
    padding-right: 40px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .eye-icon {
    position: absolute;
    top: 50%;
    right: 10px;
    width: 22px;
    height: 22px;
    transform: translateY(-50%);
    cursor: pointer;
  }
  
  button {
    display: inline-block;
    padding: 15px 25px;
    font-size: 24px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #fff;
    background-color: #04AA6D;
    border: none;
    border-radius: 15px;
    box-shadow: 0 9px #999;
}

button:hover {
    background-color: #3e8e41
}

button:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}
  
  .error {
    color: red;
    font-size: 14px;
    margin-top: -5px;
    margin-bottom: 10px;
  }
  
  .message {
    margin-top: 10px;
    color: red;
    text-align: center;
  }
  
  .password-strength-meter {
    height: 6px;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .password-strength-bar {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .password-strength-text {
    font-size: 13px;
    text-align: right;
    margin-top: 4px;
  }
  </style>
  