<template>
  <div v-if="isOpen" class="modal-backdrop">
    <div class="modal-content">
      <h4 class="modal-title">新增「我的商品」</h4>
      <form @submit.prevent="addProduct">
        <div class="mb-3">
          <label class="form-label">圖片</label>
          <input v-model="newProduct.image" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">商品名稱</label>
          <input v-model="newProduct.productName" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">商品描述</label>
          <input v-model="newProduct.description" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">上架/審核中</label>
          <input v-model="newProduct.active" class="form-control" />
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            取消
          </button>
          <button type="submit" class="btn btn-primary">新增</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close", "refresh"]);

const newProduct = ref({
  image: "",
  productName: "",
  description: "",
  active: "",
});

const addProduct = async () => {
  try {
    const response = await axios.post("/api/product", newProduct.value);
    console.log(response);
    // console.log(response.data);

    if (response.status >= 200 && response.status < 300) {
      await Swal.fire({
        title: "新增成功",
        icon: "success",
      });

      // 清空表單
      newProduct.value = {
        image: "",
        productName: "",
        description: "",
        active: "",
      };

      emit("refresh"); // 通知父元件重新獲取商品列表
      emit("close"); // 關閉 Modal
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
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
