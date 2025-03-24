<template>
  <div class="container mt-4">
    <h2>我的商品</h2>
    <div>
      <button class="btn btn-success mb-3" @click="showAddModal = true">
        新增商品
      </button>
    </div>
    <table class="table table-bordered product-table">
      <thead>
        <tr>
          <th style="width: 50px">ID</th>
          <th style="width: 50px">圖片</th>
          <th style="width: 150px">商品名稱</th>
          <th style="width: 150px">商品描述</th>
          <th style="width: 150px">上架/審核中</th>
          <th style="width: 150px">創建時間</th>
          <th style="width: 150px">更新時間</th>
          <th style="width: 180px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in products" :key="e.productId">
          <td>{{ e.productId }}</td>
          <td>
            <img
              v-if="e.image"
              :src="e.image"
              alt="商品圖片"
              class="product-image"
            />
            <span v-else>無圖片</span>
          </td>
          <td>{{ e.productName }}</td>
          <td>{{ e.description }}</td>
          <td>
            <span :class="e.active ? 'text-success' : 'text-warning'">
              {{ e.active ? "上架" : "審核中" }}
            </span>
          </td>
          <td>{{ formatDate(e.createdAt) }}</td>
          <td>{{ formatDate(e.updatedAt) }}</td>
          <td>
            <button
              class="btn btn-primary btn-sm me-2"
              @click="openEditModal(e)"
            >
              編輯
            </button>

            <button
              class="btn btn-danger btn-sm"
              @click="deleteProduct(e.productId)"
            >
              刪除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- 新增商品 Modal -->
  <product-add-modal
    :isOpen="showAddModal"
    @close="showAddModal = false"
    @refresh="fetchProducts"
  />

  <!-- 編輯商品 Modal -->
  <product-edit-modal
    :isOpen="showEditModal"
    :theData="selectedElement"
    @close="showEditModal = false"
    @refresh="fetchProducts"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user.js"; // 引入 UserStore
// import ProductAddModal from "@/components/product.components/ProductAddModal.vue";
// import ProductEditModal from "@/components/product.components/ProductEditModal.vue";

const userStore = useUserStore(); // 取得用戶資訊
const products = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedElement = ref(null);

// 獲取「我的商品」列表
const fetchProducts = async () => {
  try {
    const userStore = useUserStore(); // 取得 store 實例
    const userId = userStore.userId; // 讀取 userId

    if (!userId) {
      console.error("用戶未登入或 userId 不存在");
      return;
    }

    const response = await axios.get(`/api/product/byUserId?userId=${userId}`);
    console.log("API 回傳的「我的商品」資料：", response.data);
    products.value = response.data;
  } catch (error) {
    console.error("載入商品失敗", error);
  }
};

// 開啟編輯 Modal
const openEditModal = (e) => {
  selectedElement.value = { ...e }; //複製物件，避免影響原資料
  showEditModal.value = true;
};

// 更新「我的商品」
const updateProduct = async (updatedData, imageFile) => {
  if (!updatedData || !updatedData.id) {
    Swal.fire({
      title: "錯誤",
      text: "無效的更新資料",
      icon: "error",
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify(updatedData)], { type: "application/json" })
    );

    // 如果有新圖片，則加入 FormData
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await axios.put(
      `/api/product/${updatedData.id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      console.log("更新成功，API 回傳的商品資料：", response.data);

      Swal.fire({
        title: "更新成功",
        icon: "success",
      });

      // 重新載入列表 (更新 UI)
      await fetchProducts();
      // 關閉 Modal
      showEditModal.value = false;
    } else {
      Swal.fire({
        title: "更新失敗",
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "無法更新商品",
      icon: "error",
    });
    console.error("錯誤", error);
  }
};

// 刪除「我的商品」
const deleteProduct = async (id) => {
  try {
    const result = await Swal.fire({
      title: `確定要刪除 ID:${id} 的商品嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`/api/product/${id}`);
      if (response.status >= 200 && response.status < 300) {
        await Swal.fire({
          title: "刪除成功",
          icon: "success",
        });

        // 重新載入「我的商品」列表
        await fetchProducts();
      }
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      icon: "error",
    });
  }
};

// 元件掛載時取得「我的商品」列表
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.product-table {
  table-layout: fixed;
  width: 100%;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
</style>
