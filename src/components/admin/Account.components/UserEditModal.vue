<template>
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title text-center w-100">編輯使用者</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4 pt-0">
            <div class="form-group mb-3">
              <label class="form-label">使用者名稱</label>
              <input type="text" v-model="editedUser.userName" class="form-control rounded-pill border-0 bg-light" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Email</label>
              <input type="email" v-model="editedUser.email" class="form-control rounded-pill border-0 bg-light" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">電話</label>
              <input type="tel" v-model="editedUser.phone" class="form-control rounded-pill border-0 bg-light" />
            </div>
          </div>
          <div class="modal-footer border-top-0 p-4 pt-0">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary rounded-pill px-4 ms-2" @click="saveChanges">儲存</button>
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
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const editedUser = ref({ ...props.user });

watch(
  () => props.user,
  (newValue) => {
    editedUser.value = { ...newValue };
  }
);

const closeModal = () => {
  emit("close");
};

const saveChanges = () => {
  emit("save", editedUser.value);
  closeModal();
};
</script>

<style scoped>
/* 可選：額外的自訂樣式 */
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}
</style>