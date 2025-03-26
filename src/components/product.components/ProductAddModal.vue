<template>
  <div v-if="isOpen" class="modal-backdrop">
    <div class="modal-content">
      <h4 class="modal-title">新增「我的商品」</h4>
      <form @submit.prevent="addProduct">
        <div class="mb-3">
          <label class="form-label">圖片上傳</label>
          <input
            type="file"
            @change="handleFileUpload"
            class="form-control"
            accept="image/*"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">商品名稱</label>
          <input
            v-model="newProduct.productName"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">商品描述</label>
          <textarea
            v-model="newProduct.description"
            class="form-control"
            required
          ></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">商品分類(一級)</label>
          <select
            v-model="newProduct.category1Id"
            class="form-control"
            required
          >
            <option value="">請選擇一級分類</option>
            <!-- 這裡可以添加從後端獲取的分類選項 -->
            <option :value="1">分類1</option>
            <option :value="2">分類2</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">商品分類(二級)</label>
          <select
            v-model="newProduct.category2Id"
            class="form-control"
            required
          >
            <option value="">請選擇二級分類</option>
            <!-- 這裡可以添加從後端獲取的分類選項 -->
            <option :value="1">子分類1</option>
            <option :value="2">子分類2</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">是否上架</label>
          <select v-model="newProduct.active" class="form-control">
            <option :value="true">上架</option>
            <option :value="false">審核中</option>
          </select>
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
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  shopId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["close", "refresh"]);

const userStore = useUserStore();
const userId = userStore.userId;

// 表單數據
const newProduct = ref({
  shopId: props.shopId,
  category1Id: null,
  category2Id: null,
  productName: "",
  description: "",
  active: true,
});

const imageFile = ref(null);

// 處理文件上傳
const handleFileUpload = (event) => {
  imageFile.value = event.target.files[0];
};

// 新增商品
const addProduct = async () => {
  // 新增表單驗證
  if (!newProduct.value.productName) {
    Swal.fire({
      title: "錯誤",
      text: "請輸入商品名稱",
      icon: "error",
    });
    return;
  }

  if (!newProduct.value.description) {
    Swal.fire({
      title: "錯誤",
      text: "請輸入商品描述",
      icon: "error",
    });
    return;
  }

  if (!newProduct.value.category1Id) {
    Swal.fire({
      title: "錯誤",
      text: "請選擇一級分類",
      icon: "error",
    });
    return;
  }

  if (!newProduct.value.category2Id) {
    Swal.fire({
      title: "錯誤",
      text: "請選擇二級分類",
      icon: "error",
    });
    return;
  }

  // 从 userStore 获取 token
  const token = userStore.token || localStorage.getItem("token");

  // 如果没有 token，显示错误提示
  if (!token) {
    Swal.fire({
      title: "錯誤",
      text: "登錄信息已過期，請重新登錄",
      icon: "error",
    });
    return;
  }

  try {
    const formData = new FormData();

    // 確保所有數值參數都是數字類型
    formData.append("userId", Number(userId));
    formData.append("shopId", Number(props.shopId));
    formData.append("category1Id", Number(newProduct.value.category1Id));
    formData.append("category2Id", Number(newProduct.value.category2Id));

    // 字符串參數
    formData.append("productName", newProduct.value.productName);
    formData.append("description", newProduct.value.description);

    // 布爾值參數 (轉為字符串的 "true" 或 "false")
    formData.append("active", newProduct.value.active.toString());

    // 添加圖片文件
    if (imageFile.value) {
      formData.append("image", imageFile.value);
    } else {
      // 如果沒有選擇圖片，可能需要添加一個空文件或處理這種情況
      // 這裡取決於後端是否允許 image 參數為空
      const emptyBlob = new Blob([""], { type: "application/octet-stream" });
      formData.append("image", emptyBlob, "empty.jpg");
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.post("/api/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response:", response);

    if (response.status >= 200 && response.status < 300) {
      await Swal.fire({
        title: "新增成功",
        icon: "success",
      });

      // 重置表單
      newProduct.value = {
        shopId: props.shopId,
        category1Id: null,
        category2Id: null,
        productName: "",
        description: "",
        active: true,
      };
      imageFile.value = null;

      emit("refresh"); // 通知父元件重新獲取商品列表
      emit("close"); // 關閉 Modal
    } else {
      Swal.fire({
        title: "錯誤:" + response.data.message,
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Complete error object:", error);
    console.error("Error response:", error.response);
    console.error("Error request:", error.request);
    console.error("Error message:", error.message);

    Swal.fire({
      title: "錯誤",
      text:
        error.response?.data?.message ||
        error.message ||
        "請求失敗，請稍後再試",
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
