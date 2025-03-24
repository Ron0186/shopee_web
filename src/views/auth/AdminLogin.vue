<template>
    <div class="login-container">
      <div class="login-card">
        <h2>管理員登入</h2>
        
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
  
        <!-- 登入按鈕 -->
        <button class="login-btn" @click="login">登入</button>
  
        <!-- 快速登入區塊 -->
        <div class="quick-login">
          <p>快速登入：</p>
          <button class="quick-btn watcher" @click="quickLogin('Watcher')">Watcher</button>
          <button class="quick-btn admin" @click="quickLogin('SuperAdmin')">SuperAdmin</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from '@/plugins/axios';
  import Swal from 'sweetalert2';
  import { useRouter } from 'vue-router';
  import { jwtDecode } from 'jwt-decode';
  import { useUserStore } from '@/stores/user';
  const userStore= useUserStore();
  
  const router = useRouter();
  const username = ref("");
  const password = ref("");
  
  async function login() {
    if (!username.value || !password.value) {
      Swal.fire({
        title: "請輸入帳號與密碼",
        icon: "warning",
      });
      return;
    }
  
    try {
      const response = await axios.post("/api/auth/admin/login", {
        "username": username.value,
        "password": password.value
      });
  
      if (response.data.success) {
        await Swal.fire({
          title: response.data.message,
          icon: "success",
        });
  
        const decodedToken = jwtDecode(response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        console.log(decodedToken.sub);
        console.log(decodedToken.userId);
        console.log(response.data.token);
        console.log(decodedToken.roles);
        userStore.saveUserData(decodedToken.sub, decodedToken.userId, response.data.token, decodedToken.roles);
        
        router.push({ name: "Dashboard" });
      }
    } catch (error) {
      let errorMessage = error.response?.data?.message || "登入失敗，請稍後再試";
      Swal.fire({
        title: "錯誤: " + errorMessage,
        icon: "error",
      });
    }
  }
  
  // 快速登入功能
  function quickLogin(role) {
    username.value = role;
    password.value = "admin123";
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
  }
  
  /* 標題美化 */
  .login-card h2 {
    margin-bottom: 20px;
    font-size: 24px;
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
    margin-top: 15px;
  }
  
  .quick-login p {
    margin-bottom: 10px;
    font-size: 14px;
    color: #666;
  }
  
  /* 快速登入按鈕 */
  .quick-btn {
    padding: 10px 15px;
    font-size: 16px;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
    margin: 5px;
  }
  
  .quick-btn.watcher {
    background-color: #28a745;
  }
  
  .quick-btn.watcher:hover {
    background-color: #218838;
  }
  
  .quick-btn.admin {
    background-color: #dc3545;
  }
  
  .quick-btn.admin:hover {
    background-color: #c82333;
  }
  </style>
  