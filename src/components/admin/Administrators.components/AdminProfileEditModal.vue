<template>
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">編輯管理員資訊</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveChanges">
            <div class="mb-3">
              <label class="form-label">名稱</label>
              <input v-model="editedAdmin.userName" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="editedAdmin.email" type="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">電話</label>
              <input v-model="editedAdmin.phone" type="text" class="form-control">
            </div>
            <div class="text-end">
              <button type="button" class="btn btn-secondary me-2" @click="closeModal">取消</button>
              <button type="submit" class="btn btn-primary">儲存變更</button>
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
  emits: ["close", "save"], // <== 加上這行，聲明自定義事件
  data() {
    return {
      editedAdmin: { ...this.admin }
    };
  },
  watch: {
    admin: {
      handler(newAdmin) {
        this.editedAdmin = { ...newAdmin };
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    saveChanges() {
      this.$emit("save", this.editedAdmin); // 發送 save 事件
    },
    closeModal() {
      this.$emit("close"); // 發送 close 事件
    }
  }
};
</script>


<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}
</style>
