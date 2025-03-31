<template>
  <Teleport to="body">
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title">
              <i class="bi bi-person-plus-fill me-2 text-success"></i>新增使用者
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="insertUser">
              <div class="mb-3">
                <label class="form-label fw-bold">使用者名稱</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input 
                    v-model="newUser.username" 
                    type="text" 
                    class="form-control" 
                    placeholder="請輸入使用者名稱"
                    required
                  />
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">密碼</label>
                <div class="password-input-wrapper position-relative">
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-lock text-muted"></i>
                    </span>
                    <input 
                      v-model="newUser.password" 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      placeholder="請輸入密碼"
                      required
                      @focus="showPasswordTips = true"
                      @blur="handlePasswordBlur"
                    />
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="togglePasswordVisibility('password')"
                      @mousedown.prevent
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  
                  <!-- 浮動式密碼提示窗 (Popover) - 在右側顯示 -->
                  <div v-if="showPasswordTips && newUser.password" class="password-popover">
                    <div class="password-tips-popover bg-white p-3 rounded shadow-sm border">
                      <h6 class="fw-bold mb-2 small">
                        <i class="bi bi-shield-lock me-1"></i>密碼建議
                      </h6>
                      <ul class="mb-0 ps-3 small">
                        <li :class="{'text-success': password.length >= 8, 'text-muted': password.length < 8}">
                          <i :class="password.length >= 8 ? 'bi bi-check-circle' : 'bi bi-circle'"></i>
                          至少 8 個字元
                        </li>
                        <li :class="{'text-success': /[A-Z]/.test(password), 'text-muted': !/[A-Z]/.test(password)}">
                          <i :class="/[A-Z]/.test(password) ? 'bi bi-check-circle' : 'bi bi-circle'"></i>
                          至少 1 個大寫字母
                        </li>
                        <li :class="{'text-success': /\d/.test(password), 'text-muted': !/\d/.test(password)}">
                          <i :class="/\d/.test(password) ? 'bi bi-check-circle' : 'bi bi-circle'"></i>
                          至少 1 個數字
                        </li>
                        <li :class="{'text-success': /[^A-Za-z0-9]/.test(password), 'text-muted': !/[^A-Za-z0-9]/.test(password)}">
                          <i :class="/[^A-Za-z0-9]/.test(password) ? 'bi bi-check-circle' : 'bi bi-circle'"></i>
                          至少 1 個特殊符號
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="password-strength mt-2" v-if="newUser.password">
                  <div class="progress" style="height: 5px;">
                    <div 
                      class="progress-bar" 
                      :class="passwordStrengthClass" 
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted">密碼強度: {{ passwordStrengthText }}</small>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">確認密碼</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-lock-fill text-muted"></i>
                  </span>
                  <input 
                    v-model="confirmPassword" 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    placeholder="請再次輸入密碼"
                    required
                    :class="{'is-invalid': !passwordsMatch && confirmPassword}"
                  />
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="togglePasswordVisibility('confirm')"
                    @mousedown.prevent
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="!passwordsMatch && confirmPassword" class="text-danger mt-1 small">
                  <i class="bi bi-exclamation-circle me-1"></i>密碼不一致，請再確認
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-envelope text-muted"></i>
                  </span>
                  <input 
                    v-model="newUser.email" 
                    type="email" 
                    class="form-control" 
                    placeholder="請輸入Email地址"
                    required
                    :class="{ 'is-invalid': !isValidEmail && newUser.email }"
                    @input="validateEmail"
                  />
                </div>
                <div v-if="!isValidEmail && newUser.email" class="text-danger mt-1 small">
                  <i class="bi bi-exclamation-circle me-1"></i>請輸入有效的Email格式
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">電話</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-telephone text-muted"></i>
                  </span>
                  <input 
                    v-model="newUser.phone" 
                    type="tel" 
                    class="form-control" 
                    placeholder="請輸入電話號碼"
                    maxlength="10"
                    @input="validatePhoneNumber"
                    :class="{ 'is-invalid': !isValidPhone && newUser.phone }"
                  />
                </div>
                <div v-if="!isValidPhone && newUser.phone" class="text-danger mt-1 small">
                  <i class="bi bi-exclamation-circle me-1"></i>電話號碼須為10位數字
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light px-4" @click="closeModal">
                  <i class="bi bi-x me-1"></i>取消
                </button>
                <button 
                  type="submit" 
                  class="btn btn-success px-4"
                  :disabled="isSubmitting || 
                    (newUser.email && !isValidEmail) || 
                    (newUser.phone && !isValidPhone) ||
                    !passwordsMatch"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-plus me-1"></i>新增
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "insert"]);

const newUser = ref({
  username: "",
  password: "",
  email: "",
  phone: "",
});

const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPasswordTips = ref(false);
const isSubmitting = ref(false);
const isValidEmail = ref(true);
const isValidPhone = ref(true);

// 切換密碼顯示狀態
const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else if (field === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

// 處理密碼輸入框失焦事件
const handlePasswordBlur = () => {
  // 延遲關閉提示窗，避免點擊提示窗內容時立即關閉
  setTimeout(() => {
    showPasswordTips.value = false;
  }, 200);
};

// 檢查密碼是否一致
const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true; // 如果確認密碼為空，不顯示錯誤
  return newUser.value.password === confirmPassword.value;
});

// 用于简化访问密码值
const password = computed(() => newUser.value.password);

// 計算密碼強度
const passwordStrength = computed(() => {
  const password = newUser.value.password;
  if (!password) return 0;
  
  let strength = 0;
  // 長度檢查
  if (password.length >= 8) strength += 25;
  // 數字檢查
  if (/\d/.test(password)) strength += 25;
  // 大寫字母檢查
  if (/[A-Z]/.test(password)) strength += 25;
  // 特殊字符檢查
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  
  return strength;
});

// 密碼強度對應的樣式類
const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 25) return 'bg-danger';
  if (strength <= 50) return 'bg-warning';
  if (strength <= 75) return 'bg-info';
  return 'bg-success';
});

// 密碼強度文字描述
const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 25) return '弱';
  if (strength <= 50) return '中';
  if (strength <= 75) return '良好';
  return '強';
});

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  isValidEmail.value = emailRegex.test(newUser.value.email);
};

const validatePhoneNumber = () => {
  // 只允許數字，且自動移除非數字字符
  newUser.value.phone = newUser.value.phone.replace(/\D/g, '');
  // 驗證是否為10位數字
  isValidPhone.value = newUser.value.phone.length === 10 || newUser.value.phone.length === 0;
};

const closeModal = () => {
  // 重置表單和驗證狀態
  newUser.value = {
    username: "",
    password: "",
    email: "",
    phone: "",
  };
  confirmPassword.value = '';
  showPassword.value = false;
  showConfirmPassword.value = false;
  showPasswordTips.value = false;
  isValidEmail.value = true;
  isValidPhone.value = true;
  
  emit("close");
};

const insertUser = async () => {
  // 先進行格式驗證
  validateEmail();
  validatePhoneNumber();
  
  // 全面的前端驗證
  if (!newUser.value.username || 
      !newUser.value.password || 
      !confirmPassword.value ||
      !passwordsMatch.value ||
      !newUser.value.email || 
      !isValidEmail.value || 
      (newUser.value.phone && !isValidPhone.value)) {
    Swal.fire({
      title: "欄位不完整或格式錯誤",
      text: "請檢查所有必填欄位並確保格式正確",
      icon: "warning",
    });
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const response = await axios.post("/api/admin/user/any", newUser.value);
    if (response.data.success) {
      await Swal.fire({
        title: response.data.message || "使用者新增成功",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      // 重置表單
      newUser.value = {
        username: "",
        password: "",
        email: "",
        phone: "",
      };
      confirmPassword.value = '';
      
      emit("insert");
      closeModal();
    } else {
      Swal.fire({
        title: "新增失敗",
        text: response.data.message || "發生未知錯誤",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("新增使用者失敗:", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || "網路錯誤，請稍後再試",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-backdrop {
  z-index: 1040;
}

.modal-dialog {
  max-width: 500px;
}

.input-group-text {
  border-right: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #86b7fe;
}

.input-group .form-control:focus {
  border-left: 0;
}

.password-strength {
  font-size: 0.8rem;
}

.password-input-wrapper {
  position: relative;
}

.password-popover {
  position: absolute;
  left: 102%;
  top: 0;
  z-index: 1050;
  width: 250px;
}

.password-tips-popover {
  border-color: #dee2e6;
}

.password-tips-popover::before {
  content: '';
  position: absolute;
  top: 15px;
  left: -10px;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent #dee2e6 transparent transparent;
}

.password-tips-popover::after {
  content: '';
  position: absolute;
  top: 15px;
  left: -9px;
  border-width: 9px 9px 9px 0;
  border-style: solid;
  border-color: transparent white transparent transparent;
}

.password-tips-popover li {
  margin-bottom: 3px;
  line-height: 1.2;
}

.password-tips-popover i {
  margin-right: 3px;
  font-size: 0.75rem;
}
</style>