<template>
  <Teleport to="body">
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title">
              <i class="bi bi-key me-2 text-info"></i>編輯使用者權限
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
          </div>
          <div class="modal-body p-4">
            <div v-if="user">
              <div class="user-info mb-4 p-3 bg-light rounded">
                <div class="d-flex align-items-center mb-2">
                  <div class="user-avatar me-3">
                    {{ getInitials(user.userName) }}
                  </div>
                  <div>
                    <h6 class="mb-0 fw-bold">{{ user.userName }}</h6>
                    <small class="text-muted">ID: {{ user.userId }}</small>
                  </div>
                </div>
              </div>

              <h6 class="fw-bold mb-3">
                <i class="bi bi-person-gear me-2"></i>使用者角色設定
              </h6>
              
              <div class="alert alert-info small mb-3">
                <i class="bi bi-info-circle me-2"></i>角色決定使用者在系統中的權限範圍，請謹慎設定。
              </div>
              
              <div class="role-list border rounded p-3">
                <div 
                  v-for="role in allAvailableRoles" 
                  :key="role.id" 
                  class="role-item mb-3 p-2 rounded"
                  :class="{ 'bg-light': selectedRoles.includes(role.roleName) }"
                >
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'role-' + role.id"
                      :value="role.roleName"
                      v-model="selectedRoles"
                      :disabled="role.roleName === 'USER'"
                    />
                    <label class="form-check-label d-flex justify-content-between align-items-center" :for="'role-' + role.id">
                      <span>
                        <i 
                          :class="getRoleIcon(role.roleName)" 
                          class="me-2"
                        ></i>
                        <strong>{{ role.roleName }}</strong>
                        <span v-if="role.roleName === 'USER'" class="ms-2 text-danger small">(必選)</span>
                      </span>
                      <span 
                        class="badge me-1"
                        :class="getRoleBadgeClass(role.roleName)"
                      >
                        {{ getRoleDescription(role.roleName) }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
              <p class="mt-2 text-muted">載入使用者資料...</p>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light px-4" @click="closeModal">
                <i class="bi bi-x me-1"></i>取消
              </button>
              <button 
                type="button" 
                class="btn btn-info px-4 text-white"
                @click="saveRoles"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-save me-1"></i>儲存變更
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from "vue";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ userId: "", userName: "", roles: [] }),
  },
  isOpen: Boolean,
  allAvailableRoles: Array,
});

const emit = defineEmits(["close", "save"]);

const selectedRoles = ref([]);
const isSubmitting = ref(false);

// 確保 USER 角色始終被選中
const ensureUserRole = () => {
  if (!selectedRoles.value.includes('USER')) {
    selectedRoles.value.push('USER');
  }
};

watch(
  () => props.user,
  (newUser) => {
    if (newUser && newUser.roles) {
      selectedRoles.value = [...(newUser.roles || [])];
      ensureUserRole();
    } else {
      selectedRoles.value = ['USER'];
    }
  },
  { immediate: true, deep: true }
);

// 監聽選擇的角色變化，確保 USER 角色始終存在
watch(
  selectedRoles,
  () => {
    ensureUserRole();
  },
  { deep: true }
);

const closeModal = () => {
  emit("close");
};

const saveRoles = () => {
  isSubmitting.value = true;
  
  // 模擬網絡延遲
  setTimeout(() => {
    emit("save", { 
      userId: props.user.userId, 
      roles: selectedRoles.value 
    });
    isSubmitting.value = false;
  }, 500);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'USER':
      return 'bg-secondary text-white';
    case 'SELLER':
      return 'bg-success text-white';
    case 'ADMIN':
      return 'bg-primary text-white';
    case 'SUPER_ADMIN':
      return 'bg-danger text-white';
    default:
      return 'bg-light text-dark';
  }
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'USER':
      return 'bi bi-person text-secondary';
    case 'SELLER':
      return 'bi bi-shop text-success';
    case 'ADMIN':
      return 'bi bi-person-fill-lock text-primary';
    case 'SUPER_ADMIN':
      return 'bi bi-shield-lock text-danger';
    default:
      return 'bi bi-person-badge';
  }
};

const getRoleDescription = (role) => {
  switch (role) {
    case 'USER':
      return '一般會員';
    case 'SELLER':
      return '商家會員';
    case 'ADMIN':
      return '管理員';
    case 'SUPER_ADMIN':
      return '超級管理員';
    default:
      return role;
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

.role-list {
  max-height: 300px;
  overflow-y: auto;
}

.role-item {
  transition: background-color 0.2s;
}

.role-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.form-check-input:checked {
  background-color: #4e73df;
  border-color: #4e73df;
}

.form-check-label {
  cursor: pointer;
  width: 100%;
}
</style>