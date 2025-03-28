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
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-lock text-muted"></i>
                  </span>
                  <input 
                    v-model="newUser.password" 
                    type="password" 
                    class="form-control" 
                    placeholder="請輸入密碼"
                    required
                  />
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
                  />
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
                  />
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light px-4" @click="closeModal">
                  <i class="bi bi-x me-1"></i>取消
                </button>
                <button 
                  type="submit" 
                  class="btn btn-success px-4"
                  :disabled="isSubmitting"
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

const isSubmitting = ref(false);

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

const closeModal = () => {
  emit("close");
};

const insertUser = async () => {
  // 表單驗證
  if (!newUser.value.username || !newUser.value.password || !newUser.value.email) {
    Swal.fire({
      title: "欄位不完整",
      text: "請填寫所有必填欄位",
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
</style>