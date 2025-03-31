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
          <th style="width: 90px">圖片</th>
          <th style="width: 150px">商品名稱</th>
          <th style="width: 150px">商品描述</th>
          <th style="width: 150px">上架/未上架</th>
          <th style="width: 150px">創建時間</th>
          <th style="width: 150px">更新時間</th>
          <th style="width: 230px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in products" :key="e.productId">
          <td>{{ e.productId }}</td>
          <td>
            <img
              v-if="e.primaryImageUrl"
              :src="
                e.primaryImageUrl.startsWith('http')
                  ? e.primaryImageUrl
                  : `${baseUrl}${e.primaryImageUrl}`
              "
              alt="商品圖片"
              class="product-image"
            />
            <span v-else>無圖片</span>
          </td>
          <td>{{ e.productName }}</td>
          <td>{{ e.description }}</td>
          <td>
            <span :class="e.active ? 'text-success' : 'text-warning'">
              {{ e.active ? "上架" : "未上架" }}
            </span>
          </td>
          <td>{{ formatDate(e.createdAt) }}</td>
          <td>{{ formatDate(e.updatedAt) }}</td>
          <td>
            <button
              class="btn btn-primary btn-sm me-1"
              @click="openEditModal(e)"
            >
              編輯
            </button>

            <button
              class="btn btn-info btn-sm me-1"
              @click="goToSkuManagement(e.productId)"
            >
              SKU管理
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
    :shopId="Number(shopId)"
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import ProductAddModal from "@/components/product.components/ProductAddModal.vue";
import ProductEditModal from "@/components/product.components/ProductEditModal.vue";
import defaultImage from "@/assets/default-image.png"; // 默认图片

const route = useRoute();
const router = useRouter();
const shopId = parseInt(route.params.shopId) || null;

const products = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedElement = ref(null);
const baseUrl = ref(import.meta.env.VITE_API_URL);

// 取得用戶資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;

// 日期格式化函數
const formatDate = (dateString) => {
  if (!dateString) return "未知";
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 獲取「我的商品」列表
const fetchProducts = async () => {
  try {
    if (!shopId || isNaN(shopId)) {
      console.error("無效的商店ID:", shopId);
      return;
    }

    console.log("正在請求的 shopId:", shopId);
    console.log("當前 userId:", userId);
    console.log("當前 token:", token);

    const response = await axios.get(`/api/products`, {
      params: {
        shopId: shopId,
        page: 0,
        size: 100, // 設定適當的分頁大小
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("API 回傳原始數據:", response);

    // 檢查是否為分頁格式的回傳結果
    if (response.data && response.data.content) {
      console.log("API 回傳的「我的商品」資料:", response.data.content);
      products.value = response.data.content;
    }
    // 保留原有的處理邏輯，以防 API 回傳格式不變
    else if (Array.isArray(response.data)) {
      console.log("API 回傳的「我的商品」資料:", response.data);
      products.value = response.data;
    } else if (response.data && Array.isArray(response.data.products)) {
      // 如果数据是嵌套在 products 字段中
      products.value = response.data.products;
    } else {
      console.error("回傳的數據格式不正確:", response.data);
      products.value = [];
    }

    if (products.value.length > 0) {
      console.log("商品數據詳細檢查:");
      products.value.forEach((item, index) => {
        console.log(`商品 ${index + 1}:`, {
          productId: item.productId,
          image: item.image, // 檢查這個值是否存在
          imageUrl: item.imageUrl, // 檢查這個值是否存在
          productName: item.productName,
        });
      });
    }

    // 打印最終賦值結果
    console.log("最終設置的 products 數據:", products.value);
  } catch (error) {
    console.error("完整錯誤信息:", error);
    console.error("錯誤響應:", error.response);

    Swal.fire({
      title: "載入失敗",
      text:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "載入商品列表時發生未知錯誤",
      icon: "error",
    });
  }
};

// 開啟編輯 Modal
const openEditModal = (e) => {
  selectedElement.value = { ...e }; // 複製物件，避免影響原資料
  showEditModal.value = true;
};

// 跳轉到 SKU 管理頁面
const goToSkuManagement = (productId) => {
  router.push(`/seller/shops/${shopId}/products/${productId}/skus`);
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
      const response = await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      text: error.response?.data?.message || "刪除商品失敗",
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
