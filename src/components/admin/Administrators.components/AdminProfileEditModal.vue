<template>
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-light border-bottom">
          <h5 class="modal-title">
            <i class="fas fa-user-edit me-2 text-primary"></i>編輯管理員資訊
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
        </div>
        <div class="modal-body p-4">
          <!-- 顯示原始管理員資訊 -->
          <div class="original-info mb-4 p-3 bg-light rounded">
            <div class="d-flex align-items-center mb-2">
              <div class="admin-avatar me-3">
                {{ getInitials(admin.userName) }}
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ admin.userName }}</h6>
                <small class="text-muted">ID: {{ admin.userId || "未設定" }}</small>
              </div>
            </div>
            
            <div class="admin-details mt-3 border-top pt-3">
              <div class="row g-2">
                <div class="col-12 col-md-6">
                  <div class="admin-detail-item d-flex align-items-center">
                    <i class="fas fa-envelope text-muted me-2"></i>
                    <div>
                      <small class="text-muted d-block">Email:</small>
                      <span>{{ admin.email || '未設定' }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="admin-detail-item d-flex align-items-center">
                    <i class="fas fa-phone text-muted me-2"></i>
                    <div>
                      <small class="text-muted d-block">電話:</small>
                      <span>{{ admin.phone || '未設定' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="saveChanges">
            <div class="mb-3">
              <label class="form-label fw-bold">名稱</label>
              <div class="input-group">
                <span class="input-group-text bg-light">
                  <i class="fas fa-user text-muted"></i>
                </span>
                <input 
                  v-model="editedAdmin.userName" 
                  type="text" 
                  class="form-control" 
                  required
                  placeholder="請輸入管理員名稱"
                >
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Email</label>
              <div class="input-group">
                <span class="input-group-text bg-light">
                  <i class="fas fa-envelope text-muted"></i>
                </span>
                <input 
                  v-model="editedAdmin.email" 
                  type="email" 
                  class="form-control" 
                  required
                  placeholder="請輸入Email地址"
                  :class="{ 'is-invalid': !isValidEmail && editedAdmin.email }"
                  @input="validateEmail"
                >
              </div>
              <div v-if="!isValidEmail && editedAdmin.email" class="text-danger mt-1 small">
                <i class="fas fa-exclamation-circle me-1"></i>請輸入有效的Email格式
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">電話</label>
              <div class="input-group">
                <span class="input-group-text bg-light">
                  <i class="fas fa-phone text-muted"></i>
                </span>
                <input 
                  v-model="editedAdmin.phone" 
                  type="text" 
                  class="form-control"
                  placeholder="請輸入電話號碼"
                  maxlength="10"
                  @input="validatePhoneNumber"
                  :class="{ 'is-invalid': !isValidPhone && editedAdmin.phone }"
                >
              </div>
              <div v-if="!isValidPhone && editedAdmin.phone" class="text-danger mt-1 small">
                <i class="fas fa-exclamation-circle me-1"></i>電話號碼須為10位數字
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light px-4" @click="closeModal">
                <i class="fas fa-times me-1"></i>取消
              </button>
              <button type="submit" class="btn btn-primary px-4" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="fas fa-save me-1"></i>儲存變更
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
    admin: Object
  },
  emits: ["close", "save"],
  data() {
    return {
      editedAdmin: {},
      isSubmitting: false,
      isValidEmail: true,
      isValidPhone: true
    };
  },
  watch: {
    admin: {
      handler(newAdmin) {
        // 確保在開啓模態框時重新初始化編輯數據
        if (newAdmin) {
          this.editedAdmin = { ...newAdmin };
          // 重設驗證狀態
          this.isValidEmail = true;
          this.isValidPhone = true;
          
          // 初始驗證
          if (this.editedAdmin.email) this.validateEmail();
          if (this.editedAdmin.phone) this.validatePhoneNumber();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.isValidEmail = emailRegex.test(this.editedAdmin.email);
    },
    
    validatePhoneNumber() {
      // 只允許數字，且自動移除非數字字符
      this.editedAdmin.phone = this.editedAdmin.phone.replace(/\D/g, '');
      // 驗證是否為10位數字
      this.isValidPhone = this.editedAdmin.phone.length === 10 || this.editedAdmin.phone.length === 0;
    },
    
    saveChanges() {
      // 先進行格式驗證
      this.validateEmail();
      this.validatePhoneNumber();
      
      // 全面的前端驗證
      if (!this.editedAdmin.userName || !this.editedAdmin.email || !this.isValidEmail || !this.isValidPhone) {
        return;
      }
      
      this.isSubmitting = true;
      
      // 模擬網絡延遲
      setTimeout(() => {
        this.$emit("save", this.editedAdmin);
        this.isSubmitting = false;
      }, 500);
    },
    closeModal() {
      this.$emit("close");
    },
    getInitials(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    }
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

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.admin-detail-item {
  margin-bottom: 8px;
}

.admin-details {
  font-size: 14px;
}
</style>