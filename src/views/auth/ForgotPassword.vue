<template>
    <div class="container mt-5">
      <div class="card p-4 shadow">
        <h2 class="text-center mb-3">忘記密碼?</h2>
        <p class="text-muted text-center" v-if="!success">請輸入您的 Email 以重設密碼</p>
  
        <!-- 當 success 為 false 時才顯示輸入框 -->
        <form @submit.prevent="submitEmail">
          <div class="mb-3" v-if="!success">
            <label for="email" class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control" id="email" required>
          </div>
          <button type="submit" class="btn btn-primary w-100" :disabled="loading" v-if="!success">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            送出
          </button>
        </form>
  
        <!-- 顯示成功或錯誤訊息 -->
        <p v-if="message" class="mt-3 text-center text-success">{{ message }}</p>
        <p v-if="error" class="mt-3 text-center text-danger">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "@/plugins/axios";
  
  export default {
    data() {
      return {
        email: "",
        loading: false,
        message: "",
        error: "",
        success: false // 追蹤是否成功送出請求
      };
    },
    methods: {
      async submitEmail() {
        this.loading = true;
        this.message = "";
        this.error = "";
  
        try {
          const response = await axios.post(`/api/auth/forgot-password`, { email: this.email });
          
          // 確保正確取得 success 及 message
          if (response.data?.success) {
            this.success = true; // 隱藏 Email 輸入框
            this.message = response.data.message; // 只取 message，不取整個 DTO
          } else {
            this.error = "發送請求失敗，請稍後再試";
          }
        } catch (err) {
          this.error = err.response?.data?.message || "發送失敗，請稍後再試";
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 400px;
  }
  </style>
  