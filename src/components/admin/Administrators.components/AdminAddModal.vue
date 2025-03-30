<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title">
              <i class="bi bi-person-plus-fill me-2 text-success"></i>新增管理員
            </h5>
            <button type="button" class="btn-close" @click="close" aria-label="關閉"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="addAdmin">
              <div class="mb-3">
                <label class="form-label fw-bold">名稱</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input 
                    v-model="newAdmin.userName" 
                    class="form-control" 
                    placeholder="請輸入管理員名稱"
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
                      v-model="newAdmin.password" 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      placeholder="請輸入安全密碼"
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
                  <div v-if="showPasswordTips && newAdmin.password" class="password-popover">
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
                <div class="password-strength mt-2" v-if="newAdmin.password">
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
                    v-model="newAdmin.email" 
                    type="email" 
                    class="form-control" 
                    placeholder="請輸入Email地址"
                    required
                    :class="{ 'is-invalid': !isValidEmail && newAdmin.email }"
                    @input="validateEmail"
                  />
                </div>
                <div v-if="!isValidEmail && newAdmin.email" class="text-danger mt-1 small">
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
                    v-model="newAdmin.phone" 
                    class="form-control" 
                    placeholder="請輸入電話號碼"
                    maxlength="10"
                    @input="validatePhoneNumber"
                    :class="{ 'is-invalid': !isValidPhone && newAdmin.phone }"
                  />
                </div>
                <div v-if="!isValidPhone && newAdmin.phone" class="text-danger mt-1 small">
                  <i class="bi bi-exclamation-circle me-1"></i>電話號碼須為10位數字
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">角色</label>
                <div class="alert alert-info small mb-3">
                  <i class="bi bi-info-circle me-2"></i>請注意：「ADMIN」角色是必選項，不可取消。
                </div>
                
                <div class="role-selector border rounded p-3 bg-light">
                  <!-- ADMIN 角色 - 預設選中且禁用 -->
                  <div class="role-item d-flex align-items-center mb-3 p-2 bg-white rounded">
                    <div class="form-check flex-grow-1">
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        id="role-ADMIN" 
                        value="ADMIN" 
                        v-model="newAdmin.roles"
                        disabled
                      />
                      <label class="form-check-label me-2" for="role-ADMIN">
                        <i class="bi bi-person-fill-lock me-2 text-primary"></i><strong>ADMIN</strong>
                      </label>
                    </div>
                    <span class="badge bg-primary text-white">基礎管理員權限 (必選)</span>
                  </div>
                  
                  <!-- SUPER_ADMIN 角色 - 可選 -->
                  <div class="role-item d-flex align-items-center mb-3 p-2 rounded" 
                    :class="{ 'bg-white-hover': !isSuperAdmin, 'bg-white': isSuperAdmin }">
                    <div class="form-check flex-grow-1">
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        id="role-SUPER_ADMIN" 
                        value="SUPER_ADMIN" 
                        v-model="newAdmin.roles"
                      />
                      <label class="form-check-label me-2" for="role-SUPER_ADMIN">
                        <i class="bi bi-shield-lock me-2 text-danger"></i><strong>SUPER_ADMIN</strong>
                      </label>
                    </div>
                    <span class="badge bg-danger text-white">超級管理員權限</span>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light px-4" @click="close">
                  <i class="bi bi-x me-1"></i>取消
                </button>
                <button 
                  type="submit" 
                  class="btn btn-success px-4"
                  :disabled="isSubmitting || 
                    (newAdmin.email && !isValidEmail) || 
                    (newAdmin.phone && !isValidPhone) || 
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
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';

// 正確定義 props 和 emits
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  roles: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close', 'refresh']);

const newAdmin = ref({
  userName: '',
  email: '',
  phone: '',
  password: '',
  roles: ['ADMIN'] // 預設選中 ADMIN 角色
});

const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPasswordTips = ref(false);
const isPasswordFocused = ref(false);
const isValidEmail = ref(true);
const isValidPhone = ref(true);
const isSubmitting = ref(false);

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

// 用于简化访问密码值
const password = computed(() => newAdmin.value.password);

// 檢查密碼是否一致
const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true; // 如果確認密碼為空，不顯示錯誤
  return newAdmin.value.password === confirmPassword.value;
});

// 保持 ADMIN 角色始終存在
watch(() => newAdmin.value.roles, (newRoles) => {
  if (!newRoles.includes('ADMIN')) {
    newAdmin.value.roles.push('ADMIN');
  }
}, { deep: true });

// 計算是否選中了超級管理員角色
const isSuperAdmin = computed(() => {
  return newAdmin.value.roles.includes('SUPER_ADMIN');
});

// 驗證 Email 格式
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  isValidEmail.value = emailRegex.test(newAdmin.value.email);
};

// 驗證電話號碼格式
const validatePhoneNumber = () => {
  // 只允許數字，且自動移除非數字字符
  newAdmin.value.phone = newAdmin.value.phone.replace(/\D/g, '');
  // 驗證是否為10位數字
  isValidPhone.value = newAdmin.value.phone.length === 10 || newAdmin.value.phone.length === 0;
};

// 計算密碼強度
const passwordStrength = computed(() => {
  const password = newAdmin.value.password;
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

// 確保初始化時 ADMIN 角色已選中
onMounted(() => {
  if (!newAdmin.value.roles.includes('ADMIN')) {
    newAdmin.value.roles.push('ADMIN');
  }
});

const addAdmin = async () => {
  // 進行格式驗證
  validateEmail();
  validatePhoneNumber();
  
  // 檢查驗證結果
  if ((newAdmin.value.email && !isValidEmail.value) || 
      (newAdmin.value.phone && !isValidPhone.value) ||
      !passwordsMatch.value) {
    return;
  }
  
  // 確保 ADMIN 角色始終被選中
  if (!newAdmin.value.roles.includes('ADMIN')) {
    newAdmin.value.roles.push('ADMIN');
  }
  
  isSubmitting.value = true;
  
  try {
    const response = await axios.post('/api/admin/any', newAdmin.value);

    if (response.data.success) {
      await Swal.fire({
        title: response.data.message || "新增管理員成功",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // 清空表單
      newAdmin.value = {
        userName: '',
        email: '',
        phone: '',
        password: '',
        roles: ['ADMIN'] // 保持 ADMIN 預設選中
      };
      confirmPassword.value = '';

      emit('refresh'); // 通知父元件重新獲取管理員列表
      emit('close'); // 關閉 Modal
    } else {
      Swal.fire({
        title: "新增失敗",
        text: response.data.message || "發生未知錯誤",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("新增管理員失敗", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || "網路錯誤，請稍後再試",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  // 重置表單
  newAdmin.value = {
    userName: '',
    email: '',
    phone: '',
    password: '',
    roles: ['ADMIN']
  };
  confirmPassword.value = '';
  showPassword.value = false;
  showConfirmPassword.value = false;
  showPasswordTips.value = false;
  isValidEmail.value = true;
  isValidPhone.value = true;
  
  emit('close');
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

.role-selector {
  max-height: 200px;
  overflow-y: auto;
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

.bg-white-hover:hover {
  background-color: #f8f9fa;
}

.form-check-input:disabled:checked {
  opacity: 0.7;
}

.role-item {
  transition: background-color 0.2s;
}

.form-check-label {
  cursor: pointer;
}
</style>