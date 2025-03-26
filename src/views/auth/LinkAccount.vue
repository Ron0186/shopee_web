<!-- LinkAccount.vue -->
<template>
    <div class="link-account">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>
  
      <div v-else-if="error" class="error-container">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF6B6B" stroke-width="2" />
            <path d="M15 9L9 15" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" />
            <path d="M9 9L15 15" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h2>發生錯誤</h2>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="btn-primary">返回登入頁面</button>
      </div>
  
      <div v-else class="content-container">
        <h1>連結帳號</h1>
        
        <div class="google-info">
          <div class="profile-image">
            <img :src="googleInfo.picture || 'https://via.placeholder.com/80'" alt="Google Profile" />
          </div>
          <p class="info-text">
           您的 Google 帳號 <strong>{{ googleInfo.email }}</strong> 與系統中的一個現有帳號使用相同的電子郵件。
           為避免重複帳號，您只能將此 Google 帳號綁定到現有帳號。
         </p>
        </div>
  
        <div class="account-info">
          <h2>現有帳號資訊</h2>
          <div class="info-card">
            <p><span>用戶名:</span> {{ existingAccount.username }}</p>
            <p><span>電子郵件:</span> {{ existingAccount.email }}</p>
            <p><span>電話:</span> {{ existingAccount.phone }}</p>
            <p><span>註冊時間:</span> {{ formatDate(existingAccount.createdAt) }}</p>
          </div>
        </div>
  
        <div class="options">
          <p class="question">您想要如何處理這個帳號？</p>
          
          <button @click="linkAccount" class="btn-primary">
            <span v-if="linking">處理中...</span>
            <span v-else>綁定到現有帳號</span>
          </button>
          
          <button @click="goToLogin" class="btn-text">
            返回登入頁面
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from '@/plugins/axios';
  import Swal from 'sweetalert2';
  
  export default {
    name: 'LinkAccount',
    data() {
      return {
        loading: true,
        error: null,
        googleInfo: null,
        existingAccount: null,
        token: null,
        linking: false
      };
    },
    created() {
      // 從 URL 獲取 token
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
  
      if (!this.token) {
        this.error = '找不到令牌。請重新登入。';
        this.loading = false;
        return;
      }
  
      this.fetchTokenInfo();
    },
    methods: {
      async fetchTokenInfo() {
        try {
          const response = await axios.get('/api/auth/token-info', {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          });
  
          if (response.data.success) {
            this.googleInfo = response.data.googleInfo;
            this.existingAccount = response.data.existingAccount;
          } else {
            this.error = response.data.message || '無法載入帳號資訊';
          }
        } catch (err) {
          console.error('Error fetching token info:', err);
          this.error = err.response?.data?.message || '發生錯誤，請稍後再試';
        } finally {
          this.loading = false;
        }
      },
      async linkAccount() {
        try {
          this.linking = true;
          const response = await axios.post('/api/auth/link-google-account', {}, {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          });
  
          if (response.data.success) {
            Swal.fire({
                title: '綁定成功！',
                text: '您的 Google 帳號已成功綁定到現有帳號，請重新使用 Google 登入',
                icon: 'success',
                confirmButtonText: '前往登入'
            }).then(() => {
                this.$router.push('/user/login');
            });
            } else {
            this.error = response.data.message || '無法綁定帳號';
          }
        } catch (err) {
          console.error('Error linking account:', err);
          this.error = err.response?.data?.message || '處理請求時發生錯誤';
        } finally {
          this.linking = false;
        }
      },
      createNewAccount() {
        // 導向到填寫更多資訊的頁面
        this.$router.push(`/fill-phone?token=${this.token}`);
      },
      goToLogin() {
        this.$router.push('/user/login');
      },
      formatDate(dateString) {
        if (!dateString) return '無資料';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('zh-TW', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
    }
  };
  </script>
  
  <style scoped>
  .link-account {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Noto Sans TC', sans-serif;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
    font-size: 1.8rem;
  }
  
  h2 {
    color: #555;
    margin-bottom: 1rem;
    font-size: 1.4rem;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-container {
    text-align: center;
    padding: 2rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-top: 2rem;
  }
  
  .error-icon {
    margin-bottom: 1rem;
  }
  
  .content-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .google-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .profile-image {
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 50%;
    margin-bottom: 1rem;
  }
  
  .profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .info-text {
    color: #555;
    line-height: 1.6;
  }
  
  .account-info {
    margin-bottom: 2rem;
  }
  
  .info-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .info-card p {
    margin: 0.5rem 0;
    color: #333;
  }
  
  .info-card p span {
    color: #777;
    display: inline-block;
    width: 90px;
  }
  
  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .question {
    text-align: center;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.8rem 1rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #2980b9;
  }
  
  .btn-secondary {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    padding: 0.8rem 1rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-secondary:hover {
    background-color: #f5f5f5;
  }
  
  .btn-text {
    background-color: transparent;
    color: #777;
    border: none;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .btn-text:hover {
    color: #333;
  }
  </style>