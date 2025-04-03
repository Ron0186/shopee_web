<template>
  <div class="container mt-5">
    <div class="card p-4 shadow rounded-3">
      <div class="card-header bg-white border-0 pb-0">
        <h2 class="text-center mb-2">重設密碼</h2>
        <p class="text-muted text-center small" v-if="!success">請輸入新密碼</p>
      </div>
      
      <div class="card-body">
        <form v-if="!success" @submit.prevent="resetPassword">
          <div class="form-group mb-3">
            <label for="newPassword">
              新密碼
              <span class="password-info-icon" @click="togglePasswordPopover">
                <i class="bi bi-info-circle"></i>
              </span>
            </label>
            <div class="password-container">
              <input 
                v-model="newPassword" 
                :type="showPassword ? 'text' : 'password'" 
                class="form-input" 
                id="newPassword" 
                placeholder="請輸入符合要求的密碼"
                @input="checkPasswordStrength"
                @focus="handleFocus"
                @blur="handleBlur"
                required
              >
              <span class="eye-icon" @click.stop="togglePasswordVisibility('password')">
                <i v-if="showPassword" class="bi bi-eye"></i>
                <i v-else class="bi bi-eye-slash"></i>
              </span>
            </div>
            
            <!-- 密碼強度進度條 -->
            <div v-if="newPassword.length > 0" class="password-strength-meter">
              <div class="password-strength-bar" :style="{ width: passwordStrength.percentage + '%', backgroundColor: passwordStrength.color }"></div>
            </div>
            <div v-if="newPassword.length > 0" class="password-strength-text" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.text }}
            </div>
            
            <!-- 密碼要求 Popover -->
            <div class="password-popover" v-if="showPasswordPopover" @click.stop>
              <div class="popover-arrow"></div>
              <div class="popover-header">密碼要求</div>
              <div class="popover-body">
                <div class="requirement" :class="{ 'met': passwordChecks.hasLength }">
                  <span class="check-icon" :class="{ 'checked': passwordChecks.hasLength }">
                    <i v-if="passwordChecks.hasLength" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                  </span>
                  至少 8 個字
                </div>
                <div class="requirement" :class="{ 'met': passwordChecks.hasUppercase }">
                  <span class="check-icon" :class="{ 'checked': passwordChecks.hasUppercase }">
                    <i v-if="passwordChecks.hasUppercase" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                  </span>
                  至少 1 個大寫字母 (A-Z)
                </div>
                <div class="requirement" :class="{ 'met': passwordChecks.hasLowercase }">
                  <span class="check-icon" :class="{ 'checked': passwordChecks.hasLowercase }">
                    <i v-if="passwordChecks.hasLowercase" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                  </span>
                  至少 1 個小寫字母 (a-z)
                </div>
                <div class="requirement" :class="{ 'met': passwordChecks.hasNumber }">
                  <span class="check-icon" :class="{ 'checked': passwordChecks.hasNumber }">
                    <i v-if="passwordChecks.hasNumber" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                  </span>
                  至少 1 個數字 (0-9)
                </div>
                <div class="requirement" :class="{ 'met': passwordChecks.hasSpecial }">
                  <span class="check-icon" :class="{ 'checked': passwordChecks.hasSpecial }">
                    <i v-if="passwordChecks.hasSpecial" class="bi bi-check-circle-fill"></i>
                    <i v-else class="bi bi-circle"></i>
                  </span>
                  特殊符號 (!@#$%^&*) 可增強密碼強度 (非必要)
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label for="confirmPassword">確認新密碼</label>
            <div class="password-container">
              <input 
                v-model="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                class="form-input" 
                id="confirmPassword" 
                placeholder="請再次輸入密碼"
                required
              >
              <span class="eye-icon" @click.stop="togglePasswordVisibility('confirm')">
                <i v-if="showConfirmPassword" class="bi bi-eye"></i>
                <i v-else class="bi bi-eye-slash"></i>
              </span>
            </div>
            <p v-if="passwordMismatch" class="text-danger mt-1 small">
              <i class="bi bi-exclamation-circle"></i> 兩次輸入的密碼不符，請確認。
            </p>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            :disabled="loading || !newPassword || passwordMismatch || !token || !isPasswordValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            確認重設
          </button>
        </form>

        <div v-if="message || error" class="alert mt-4" :class="success ? 'alert-success' : 'alert-danger'">
          <i :class="success ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'" class="me-2"></i>
          {{ message || error }}
        </div>
        
        <button v-if="success" class="btn btn-success w-100 mt-3" @click="goToLogin">
          <i class="bi bi-box-arrow-in-right me-2"></i> 立刻登入
        </button>
      </div>
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
      success: false,
      showPassword: false,
      showConfirmPassword: false,
      showPasswordPopover: false,
      // 密碼相關檢查
      passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,}$/,
      passwordChecks: {
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
      },
      passwordStrength: {
        score: 0,
        percentage: 0,
        text: "",
        color: "#cccccc"
      }
    };
  },
  computed: {
    passwordMismatch() {
      if (this.confirmPassword === "") return false;
      return this.newPassword !== this.confirmPassword;
    },
    isPasswordValid() {
      return this.passwordChecks.hasLength && 
             this.passwordChecks.hasUppercase && 
             this.passwordChecks.hasLowercase && 
             this.passwordChecks.hasNumber;
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get("token");
    if (!this.token) {
      this.error = "無效的重設密碼連結";
    }
  },
  mounted() {
    // 在點擊其他地方時關閉密碼提示
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    // 移除事件監聽器
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    checkPasswordStrength() {
      const pwd = this.newPassword;
      
      // 重置檢查結果
      this.passwordChecks = {
        hasLength: pwd.length >= 8,
        hasUppercase: /[A-Z]/.test(pwd),
        hasLowercase: /[a-z]/.test(pwd),
        hasNumber: /[0-9]/.test(pwd),
        hasSpecial: /[!@#$%^&*]/.test(pwd)
      };
      
      // 快速檢查是否符合完整正則
      const meetsAllRequirements = this.passwordRegex.test(pwd);
      
      // 計算強度分數 (0-4)
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[!@#$%^&*]/.test(pwd)) score++;
      
      // 設定強度百分比、文字和顏色
      const percentage = pwd.length ? Math.min(Math.max(score, 1), 4) * 25 : 0;
      
      let text = "";
      let color = "#cccccc";
      
      if (pwd.length > 0) {
        if (score <= 2) {
          text = "弱";
          color = "#ff4d4d";
        } else if (score === 3) {
          text = "中";
          color = "#ffcc00";
        } else if (score >= 4) {
          text = "強";
          color = "#29cc29";
        }
      }
      
      this.passwordStrength = { score, percentage, text, color };
    },
    togglePasswordVisibility(field) {
      if (field === 'password') {
        this.showPassword = !this.showPassword;
      } else if (field === 'confirm') {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    togglePasswordPopover() {
      this.showPasswordPopover = !this.showPasswordPopover;
    },
    handleFocus() {
      this.showPasswordPopover = true;
    },
    handleBlur() {
      // 不做任何事，由點擊外部事件處理
    },
    handleOutsideClick(event) {
      // 如果點擊的不是密碼欄位、info圖標和密碼提示框本身，則關閉提示
      const passwordField = document.getElementById('newPassword');
      const infoIcon = document.querySelector('.password-info-icon');
      const popover = document.querySelector('.password-popover');
      
      if (this.showPasswordPopover && 
          event.target !== passwordField && 
          !event.target.closest('.password-info-icon') &&
          !event.target.closest('.password-popover')) {
        this.showPasswordPopover = false;
      }
    },
    async resetPassword() {
      if (!this.token || this.passwordMismatch || !this.isPasswordValid) return;

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
      this.$router.push("/user/login");
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

.password-container {
  position: relative;
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.eye-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
}

.password-strength-meter {
  height: 4px;
  background-color: #e9ecef;
  margin-top: 0.5rem;
  border-radius: 2px;
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.password-strength-text {
  font-size: 0.8rem;
  text-align: right;
  margin-top: 0.25rem;
}

.password-info-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #6c757d;
}

.password-popover {
  position: absolute;
  width: 280px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  top: 0;
  right: -300px;
}

.popover-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  transform: rotate(45deg);
  top: 15px;
  left: -5px;
  box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.05);
}

.popover-header {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  border-radius: 5px 5px 0 0;
}

.popover-body {
  padding: 8px 12px;
}

.requirement {
  margin: 8px 0;
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.requirement.met {
  color: #28a745;
}

.check-icon {
  display: inline-block;
  margin-right: 8px;
  width: 16px;
}

.check-icon.checked {
  color: #28a745;
}

.btn-primary {
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-primary:hover {
  background-color: #3a56d4;
  border-color: #3a56d4;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}
</style>