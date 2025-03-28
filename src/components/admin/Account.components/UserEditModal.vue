<template>
  <Teleport to="body">
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2 text-primary"></i>編輯使用者資料
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
          </div>
          <div class="modal-body p-4">
            <div class="user-info mb-4 p-3 bg-light rounded">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  {{ getInitials(editedUser.userName) }}
                </div>
                <div>
                  <p class="mb-0 text-muted small">使用者 ID: {{ editedUser.userId }}</p>
                  <h6 class="mb-0 fw-bold">{{ editedUser.userName }}</h6>
                </div>
              </div>
            </div>
            
            <form @submit.prevent="saveChanges">
              <div class="mb-3">
                <label class="form-label fw-bold">使用者名稱</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input 
                    v-model="editedUser.userName" 
                    type="text" 
                    class="form-control" 
                    placeholder="請輸入使用者名稱"
                    required
                  />
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-envelope text-muted"></i>
                  </span>
                  <input 
                    v-model="editedUser.email" 
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
                    v-model="editedUser.phone" 
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
                  class="btn btn-primary px-4"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-save me-1"></i>儲存
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
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const editedUser = ref({ ...props.user });
const isSubmitting = ref(false);

watch(
  () => props.user,
  (newValue) => {
    if (newValue) {
      editedUser.value = { ...newValue };
    }
  },
  { deep: true }
);

const closeModal = () => {
  emit("close");
};

const saveChanges = () => {
  // 表單驗證
  if (!editedUser.value.userName || !editedUser.value.email) {
    return;
  }
  
  isSubmitting.value = true;
  
  // 模擬網絡延遲
  setTimeout(() => {
    emit("save", editedUser.value);
    isSubmitting.value = false;
  }, 500);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
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

.user-avatar {
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
</style>