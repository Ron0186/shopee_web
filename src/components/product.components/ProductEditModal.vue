<template>
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">編輯「我的商品」資訊</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveChanges">
            <div class="mb-3">
              <label class="form-label">圖片</label>
              <input
                v-model="editedTheData.image"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">商品名稱</label>
              <input
                v-model="editedTheData.productName"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">商品描述</label>
              <input
                v-model="editedTheData.description"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">上架/審核中</label>
              <input
                v-model="editedTheData.active"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="text-end">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="closeModal"
              >
                取消
              </button>
              <button type="submit" class="btn btn-primary">儲存變更</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

const props = defineProps({
  isOpen: Boolean,
  theData: Object,
});

const emit = defineEmits(["close", "save"]);

const editedTheData = ref({ ...props.theData });

watch(
  () => props.theData,
  (newData) => {
    editedTheData.value = { ...newData };
  },
  { deep: true, immediate: true }
);

const saveChanges = () => {
  emit("save", editedTheData.value);
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}
</style>
