<template>
    <div class="container mt-5">
      <div class="card p-4 shadow">
        <h2 class="text-center mb-3">重設密碼</h2>
        <p class="text-muted text-center" v-if="!success">請輸入新密碼</p>
        
        <form v-if="!success" @submit.prevent="resetPassword">
          <div class="mb-3">
            <label for="newPassword" class="form-label">新密碼</label>
            <input v-model="newPassword" type="password" class="form-control" id="newPassword" required>
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">確認新密碼</label>
            <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword" required>
            <p v-if="passwordMismatch" class="text-danger mt-1">兩次輸入的密碼不符，請確認。</p>
          </div>
          <button 
            type="submit" 
            class="btn btn-success w-100" 
            :disabled="loading || !newPassword || passwordMismatch || !token"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            確認重設
          </button>
        </form>
  
        <p v-if="message" class="mt-3 text-center text-success">{{ message }}</p>
        <p v-if="error" class="mt-3 text-center text-danger">{{ error }}</p>
        <button v-if="success" class="btn btn-primary w-100 mt-3" @click="goToLogin">
        立刻登入
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "@/plugins/axios";
  
  export default {
    data() {
      return {
        token: "",
        newPassword: "",
        confirmPassword: "",
        loading: false,
        message: "",
        error: "",
        success: false
      };
    },
    computed: {
      passwordMismatch() {
        return this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword;
      }
    },
    created() {
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get("token");
      if (!this.token) {
        this.error = "無效的重設密碼連結";
      }
    },
    methods: {
      async resetPassword() {
        if (!this.token || this.passwordMismatch) return;
  
        this.loading = true;
        this.message = "";
        this.error = "";
  
        try {
          const response = await axios.post("/api/auth/reset-password", {
            token: this.token,
            newPassword: this.newPassword
          });
  
          if (response.data.success) {
            this.success = true;
            this.message = response.data.message || "密碼重設成功！請重新登入。";
          } else {
            this.error = response.data.message || "重設失敗，請稍後再試";
          }
        } catch (err) {
          this.error = err.response?.data?.message || "重設失敗，請稍後再試";
        } finally {
          this.loading = false;
        }
      },
      goToLogin() {
      this.$router.push("/user/login"); // 假設你的登入頁路徑為 `/login`
        }
    }
  };
  
  </script>
  
  <style scoped>
  .container {
    max-width: 400px;
  }
  </style>
  