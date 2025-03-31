<!-- src/components/GoogleLoginButton.vue -->
<template>
    <div class="google-login-container">
      <button 
        type="button" 
        class="google-login-button" 
        @click.stop.prevent="initiateGoogleLogin"
      >
        <img src="@/assets/google-icon.svg" alt="Google 圖標" />
        <span>使用 Google 帳號登入</span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  import axios from '@/plugins/axios';
  
  const router = useRouter();
  
  function initiateGoogleLogin() {
    // 重定向到後端的 OAuth2 登入端點
    const apiUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  }
  </script>
  
  <style scoped>
  .google-login-container {
    margin: 15px 0;
    width: 100%;
  }
  
  .google-login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px 15px;
    background-color: white;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #3c4043;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .google-login-button:hover {
    background-color: #f8f9fa;
  }
  
  .google-login-button img {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }
  </style>