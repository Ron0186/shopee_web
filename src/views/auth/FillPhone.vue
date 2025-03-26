<template>
    <div class="fill-phone-container">
      <h2>完成您的 Google 註冊</h2>
      <p>請提供以下資訊以完成您的註冊流程</p>
      
      <form @submit.prevent="completeRegistration">
        <div class="form-group">
          <label for="password">建立密碼</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="輸入密碼"
          />
          <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="確認您的密碼"
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