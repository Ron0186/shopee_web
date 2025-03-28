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
                >
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
                >
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light px-4" @click="closeModal">
                <i class="fas fa-times me-1"></i>取消
              </button>
              <button type="submit" class="btn btn-primary px-4">
                <i class="fas fa-save me-1"></i>儲存變更
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
      editedAdmin: {}
    };
  },
  watch: {
    admin: {
      handler(newAdmin) {
        // 確保在開啓模態框時重新初始化編輯數據
        if (newAdmin) {
          this.editedAdmin = { ...newAdmin };
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    saveChanges() {
      // 簡單的前端驗證
      if (!this.editedAdmin.userName || !this.editedAdmin.email) {
        return;
      }
      this.$emit("save", this.editedAdmin);
    },
    closeModal() {
      this.$emit("close");
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
</style>