<template>
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">編輯「我的商品」資訊</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateProduct">
            <div class="mb-3">
              <label class="form-label">商品圖片</label>
              <input
                type="file"
                @change="handleFileUpload"
                class="form-control"
                accept="image/*"
              />
              <div v-if="editedTheData.image" class="mt-2">
                <img
                  :src="editedTheData.image"
                  alt="目前商品圖片"
                  class="img-thumbnail"
                  style="max-width: 200px"
                />
              </div>
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
              <textarea
                v-model="editedTheData.description"
                class="form-control"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">上架狀態</label>
              <select
                v-model="editedTheData.active"
                class="form-control"
                required
              >
                <option :value="true">上架</option>
                <option :value="false">審核中</option>
              </select>
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
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  theData: Object,
});

const emit = defineEmits(["close", "refresh"]);

const userStore = useUserStore();
const token = userStore.token;

const editedTheData = ref({ ...props.theData });
const imageFile = ref(null);

// 监听传入的数据变化
watch(
  () => props.theData,
  (newData) => {
    editedTheData.value = { ...newData };
  },
  { deep: true, immediate: true }
);

// 处理文件上传
const handleFileUpload = (event) => {
  imageFile.value = event.target.files[0];
};

// 更新商品
const updateProduct = async () => {
  try {
    const formData = new FormData();

    // 添加文本数据
    formData.append("productName", editedTheData.value.productName);
    formData.append("description", editedTheData.value.description);
    formData.append("active", editedTheData.value.active);

    // 添加图片文件（如果有）
    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }

    const response = await axios.put(
      `/api/product/${editedTheData.value.productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      await Swal.fire({
        title: "更新成功",
        icon: "success",
      });

      // 重置图片文件
      imageFile.value = null;

      // 通知父组件刷新列表
      emit("refresh");

      // 关闭模态框
      emit("close");
    } else {
      Swal.fire({
        title: "錯誤:" + response.data.message,
        icon: "error",
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      title:
        "錯誤:" + (error.response?.data?.message || "請求失敗，請稍後再試"),
      icon: "error",
    });
  }
};

const closeModal = () => {
  // 重置图片文件
  imageFile.value = null;
  emit("close");
};
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-dialog {
  z-index: 1050;
}
</style>
