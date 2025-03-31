<template>
  <div class="container mt-5">
    <div class="card p-4 shadow rounded-3">
      <div class="card-header bg-white border-0">
        <h2 class="text-center mb-2">忘記密碼?</h2>
        <p class="text-muted text-center small" v-if="!success">請輸入您的 Email 以重設密碼</p>
      </div>
      
      <div class="card-body">
        <!-- 當 success 為 false 時才顯示輸入框 -->
        <form @submit.prevent="submitEmail" v-if="!success">
          <div class="form-group mb-4">
            <label for="email" class="form-label">電子郵件</label>
            <div class="input-container">
              <span class="input-icon">
                <i class="bi bi-envelope"></i>
              </span>
              <input 
                v-model="email" 
                type="email" 
                class="form-input" 
                id="email" 
                placeholder="請輸入您的電子郵件地址"
                required
              >
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            :disabled="loading || !isValidEmail"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            寄送重設連結
          </button>
        </form>
        
        <!-- 成功狀態顯示 -->
        <div v-if="success" class="text-center">
          <div class="success-icon mb-3">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <p class="success-message">{{ message }}</p>
          <p class="text-muted small mb-4">請檢查您的收件匣，並點擊郵件中的連結以重設密碼</p>
          
          <!-- 分隔線 -->
          <div class="divider">
            <span>或</span>
          </div>
          
          <button class="btn btn-outline-secondary w-100 mt-3" @click="resetForm">
            <i class="bi bi-arrow-counterclockwise me-2"></i>重新輸入
          </button>
        </div>
        
        <!-- 錯誤訊息 -->
        <div v-if="error && !success" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>
      </div>
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
      success: false
    };
  },
  computed: {
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    }
  },
  methods: {
    async submitEmail() {
      if (!this.isValidEmail) return;
      
      this.loading = true;
      this.message = "";
      this.error = "";

      try {
        const response = await axios.post(`/api/auth/forgot-password`, { email: this.email });
        
        // 確保正確取得 success 及 message
        if (response.data?.success) {
          this.success = true;
          this.message = response.data.message || "重設密碼連結已發送至您的電子郵件";
        } else {
          this.error = response.data?.message || "發送請求失敗，請稍後再試";
        }
      } catch (err) {
        this.error = err.response?.data?.message || "發送失敗，請稍後再試";
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.email = "";
      this.success = false;
      this.message = "";
      this.error = "";
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 450px;
}

.card {
  border: none;
  transition: all 0.3s;
}

.form-group {
  margin-bottom: 1rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.btn-primary {
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-primary:hover {
  background-color: #3a56d4;
  border-color: #3a56d4;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.success-icon {
  font-size: 3rem;
  color: #28a745;
}

.success-message {
  font-weight: 500;
  font-size: 1.1rem;
  color: #28a745;
}

/* 分隔線 */
.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e9ecef;
}

.divider span {
  position: relative;
  background-color: #fff;
  padding: 0 10px;
  color: #6c757d;
  font-size: 14px;
}
</style>