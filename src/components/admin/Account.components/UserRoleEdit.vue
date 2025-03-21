<template>
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title text-center w-100">編輯使用者角色</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4 pt-0">
            <div v-if="user">
              <p><strong>使用者 ID：</strong> {{ user.userId }}</p>
              <p><strong>使用者名稱：</strong> {{ user.userName }}</p>
  
              <div class="form-group mt-3">
                <label class="form-label">使用者角色：</label>
                <div v-for="role in allAvailableRoles" :key="role.id" class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'role-' + role.id"
                    :value="role.roleName"
                    v-model="selectedRoles"
                  />
                  <label class="form-check-label" :for="'role-' + role.id">
                    {{ role.roleName }}
                  </label>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-muted">載入中...</p>
          </div>
          <div class="modal-footer border-top-0 p-4 pt-0">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary rounded-pill px-4 ms-2" @click="saveRoles">儲存</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, watch } from "vue";
  
  const props = defineProps({
  user: {
    type: Object,
    default: () => ({ userId: "", userName: "", roles: [] }), // 預設為空物件
  },
  isOpen: Boolean,
  allAvailableRoles: Array,
});
  
  const emit = defineEmits(["close", "save"]);
  
  const selectedRoles = ref([]);
  
  watch(
    () => props.user,
    (newUser) => {
      if (newUser) {
        selectedRoles.value = [...(newUser.roles || [])];
      }
    },
    { immediate: true }
  );
  
  const closeModal = () => {
    emit("close");
  };
  
  const saveRoles = () => {
    emit("save", { userId: props.user.userId, roles: selectedRoles.value });
    closeModal();
  };
  </script>
  
  <style scoped>
  /* 自訂 Bootstrap 風格 */
  .modal-content {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  /* 角色 Checkbox 美化 */
  .form-check-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .form-check-label {
    font-size: 16px;
    margin-left: 5px;
    cursor: pointer;
  }
  
  /* 背景模糊效果 */
  .modal-backdrop {
    backdrop-filter: blur(4px);
  }
  </style>
  