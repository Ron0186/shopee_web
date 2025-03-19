<template>
    <div class="login-container">
      <h3>會員註冊</h3>
      <form @submit.prevent="register" class="login-form">
        <div class="form-group">
          <label for="username">使用者名稱</label>
          <input
            type="text"
            id="username"
            placeholder="6-20個字"
            v-model="username"
            required
            minlength="6"
            maxlength="20"
            pattern="[a-zA-Z0-9]+"
            title="請輸入6到20個字元的英數字組合"
          />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            type="password"
            id="password"
            placeholder="6-12個字，包含1個大寫字母"
            v-model="password"
            required
            minlength="6"
            maxlength="12"
            pattern="^(?=.*[A-Z]).{6,12}$"
            title="請輸入6到12個字元，且至少包含一個大寫英文字母"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="phone">手機號碼</label>
          <input type="tel" id="phone" v-model="phone" required  pattern="[0-9]+" title="請輸入數字"/>
        </div>
        <div class="form-group">
          <button type="submit">立即註冊</button>
        </div>
        <div class="form-links">
          <router-link to="/user/login">已有帳戶？ 立即登入</router-link>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import axios from "@/plugins/axios";
  import { ref } from "vue";
  import Swal from "sweetalert2";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  const username = ref(""); // 初始化為空字符串
  const password = ref(""); // 初始化為空字符串
  const email = ref(""); // 初始化為空字符串
  const phone = ref(""); // 初始化為空字符串
  
  async function register() {
      const data = {
          username: username.value,
          password: password.value,
          email: email.value,
          phone: phone.value,
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
                  // 通常 400 表示客戶端錯誤，可能是資料格式不正確
                  errorMessage = data.message || "請求格式錯誤或資料不完整";
              } else if (status === 409) {
                // 409 Conflict 通常表示資源衝突，例如使用者名稱已存在
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
    }
  }
  </script>
  
  <style scoped>
  /* 直接複製 LoginPage.vue 的樣式 */
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: var(--container-bg-color); /* 使用變數 */
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .form-group button {
    background-color: #ff9b20;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }
  
  .form-group button:hover {
    background-color: #e7840b;
  }
  
  .form-links {
    margin-top: 5px;
    text-align: left;
  }
  
  .form-links a {
    color: #06c;
    text-decoration: none;
    font-size: 14px;
  }
  
  .form-links a:hover {
    text-decoration: underline;
  }
  </style>