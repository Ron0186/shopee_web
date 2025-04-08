<template>
    <div class="oauth-success">
      <div class="loading-spinner"></div>
      <p>處理您的登入... 請稍候</p>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { jwtDecode } from 'jwt-decode';
  import { useUserStore } from '@/stores/user';
  import axios from '@/plugins/axios';
  import Swal from 'sweetalert2';
  
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  
  onMounted(async () => {
    const token = route.query.token;
    
    if (token) {
      // 解析 token
      const decodedToken = jwtDecode(token);
      
      // 設定 axios 的 authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // 使用 Pinia store 保存用戶數據
      userStore.saveUserData(decodedToken.sub, decodedToken.userId, token, decodedToken.roles);
      userStore.reloadUserData();

      if (decodedToken.roles && decodedToken.roles.includes("SELLER")) {
        try {
          // 調用新增的 API 獲取商店 ID
          const shopResponse = await axios.get(
            `/api/user/${decodedToken.userId}/shop`
          );
          if (shopResponse.data && shopResponse.data.shopId) {
            // 將 shopId 轉換為字符串並更新到 UserStore
            userStore.updateShopId(shopResponse.data.shopId.toString());
            userStore.reloadUserData();
            console.log("成功獲取商店 ID:", shopResponse.data.shopId);
          }
        } catch (shopError) {
          console.error("獲取商店 ID 失敗:", shopError);
        }
      }
      
      // 顯示成功訊息
      Swal.fire({
        title: 'Google 登入成功!',
        text: '歡迎回來',
        icon: 'success',
        confirmButtonText: '開始購物'
      }).then((result) => {
        if (result.isConfirmed) {
          // 導向到商店頁面
          router.push('/shop');
        }
      });
    } else {
      // 處理錯誤案例
      Swal.fire({
        title: '登入錯誤',
        text: '無法獲取登入資訊',
        icon: 'error',
<<<<<<< HEAD
        confirmButtonText: '返回首頁'
      }).then(() => {
        router.push('/login');
=======
        confirmButtonText: '返回登入頁面'
      }).then(() => {
        router.push('/user/login');
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
      });
    }
  });
  </script>
  
  <style scoped>
  .oauth-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4285f4;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    color: #666;
    font-size: 1.2rem;
  }
  </style>