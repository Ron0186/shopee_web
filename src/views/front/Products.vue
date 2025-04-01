<template>
  <div class="container mt-4">
    <h2>我的商品</h2>
    <div class="d-flex justify-content-between mb-3">
      <button class="btn btn-success" @click="showAddModal = true">
        新增商品
      </button>
      <div class="btn-group">
        <button
          class="btn"
          :class="{
            'btn-primary': viewMode === 'table',
            'btn-outline-primary': viewMode !== 'table',
          }"
          @click="viewMode = 'table'"
        >
          <i class="bi bi-list-ul"></i> 表格視圖
        </button>
        <button
          class="btn"
          :class="{
            'btn-primary': viewMode === 'card',
            'btn-outline-primary': viewMode !== 'card',
          }"
          @click="viewMode = 'card'"
        >
          <i class="bi bi-grid-3x3-gap"></i> 卡片視圖
        </button>
      </div>
    </div>

    <!-- 狀態切換標籤 -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'all' }"
          href="#"
          @click.prevent="setActiveTab('all')"
        >
          全部
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'active' }"
          href="#"
          @click.prevent="setActiveTab('active')"
        >
          架上商品 ({{ getTabCount("active") }})
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'deleted' }"
          href="#"
          @click.prevent="setActiveTab('deleted')"
        >
          違規/刪除 ({{ getTabCount("deleted") }})
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'reviewing' }"
          href="#"
          @click.prevent="setActiveTab('reviewing')"
        >
          審核中 ({{ getTabCount("reviewing") }})
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'inactive' }"
          href="#"
          @click.prevent="setActiveTab('inactive')"
        >
          未上架/尚未刊登 ({{ getTabCount("inactive") }})
        </a>
      </li>
    </ul>

    <!-- 搜尋和過濾 -->
    <div class="row mb-3">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="搜尋商品名稱、商品ID"
            v-model="searchKeyword"
            @keyup.enter="searchProducts"
          />
          <button
            class="btn btn-outline-primary"
            type="button"
            @click="searchProducts"
          >
            <i class="bi bi-search"></i> 搜尋
          </button>
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="resetSearch"
          >
            重設
          </button>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex justify-content-end">
          <span class="my-auto me-2">商品數量上限1000</span>
          <span class="badge bg-info"
            >{{ filteredProducts.length }} 件商品</span
          >
        </div>
      </div>
    </div>

    <!-- 表格視圖 -->
    <div v-if="viewMode === 'table'" class="product-table-view">
      <table class="table table-bordered product-table">
        <thead>
          <tr>
            <th style="width: 50px">ID</th>
            <th style="width: 90px">圖片</th>
            <th style="width: 150px">商品名稱</th>
            <th style="width: 100px">價格</th>
            <th style="width: 80px">商品數量</th>
            <th style="width: 130px">商品內容優化</th>
            <th style="width: 90px">上架狀態</th>
            <th style="width: 120px">更新時間</th>
            <th style="width: 230px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filteredProducts" :key="e.productId">
            <td>{{ e.productId }}</td>
            <td>
              <img
                v-if="e.primaryImageUrl"
                :src="getImageUrl(e)"
                alt="商品圖片"
                class="product-image"
              />
              <span v-else>無圖片</span>
            </td>
            <td>{{ e.productName }}</td>
            <td>
              <span v-if="e.minPrice === e.maxPrice">NT${{ e.minPrice }}</span>
              <span v-else>NT${{ e.minPrice }} - NT${{ e.maxPrice }}</span>
            </td>
            <td>{{ e.totalStock || 0 }}</td>
            <td>
              <span
                v-if="e.needsOptimization"
                class="badge bg-warning text-dark"
                >需要修改</span
              >
            </td>
            <td>
              <span :class="getStatusClass(e)">
                {{ getStatusText(e) }}
              </span>
            </td>
            <td>{{ formatDate(e.updatedAt) }}</td>
            <td>
              <div class="btn-group">
                <button
                  class="btn btn-primary btn-sm"
                  @click="openEditModal(e)"
                >
                  編輯
                </button>

                <button
                  class="btn btn-info btn-sm"
                  @click="goToSkuManagement(e.productId)"
                >
                  SKU管理
                </button>

                <div class="btn-group">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    更多
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="toggleActive(e)"
                      >
                        {{ e.active ? "下架" : "上架" }}
                      </a>
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="goToPromotionPage(e.productId)"
                      >
                        付費推廣
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item text-danger"
                        href="#"
                        @click.prevent="deleteProduct(e.productId)"
                      >
                        刪除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 卡片視圖 -->
    <div v-else-if="viewMode === 'card'" class="product-card-view">
      <div class="row">
        <div
          v-for="e in filteredProducts"
          :key="e.productId"
          class="col-md-4 col-sm-6 mb-4"
        >
          <div class="card h-100">
            <div class="position-relative">
              <img
                :src="getImageUrl(e)"
                class="card-img-top"
                alt="商品圖片"
                style="height: 200px; object-fit: cover"
              />
              <div v-if="!e.active" class="product-status-overlay">
                <span class="lock-icon">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <span class="status-text">{{ getStatusText(e) }}</span>
                <button
                  v-if="getStatusText(e) === '未上架/尚未刊登'"
                  class="btn btn-sm btn-light mt-2"
                  @click="toggleActive(e)"
                >
                  上架
                </button>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ e.productName }}</h5>
              <p class="card-text text-danger">
                <span v-if="e.minPrice === e.maxPrice"
                  >NT${{ e.minPrice }}</span
                >
                <span v-else>NT${{ e.minPrice }} - NT${{ e.maxPrice }}</span>
              </p>
              <div class="d-flex justify-content-between mb-2">
                <span>商品數量：{{ e.totalStock || 0 }}</span>
                <div>
                  <i class="bi bi-eye me-1"></i>{{ e.viewCount || 0 }}
                  <i class="bi bi-heart ms-2 me-1"></i
                  >{{ e.favoriteCount || 0 }}
                </div>
              </div>
              <div v-if="e.needsOptimization" class="mb-2">
                <span class="badge bg-warning text-dark">需要修改</span>
              </div>
            </div>
            <div
              class="card-footer bg-transparent d-flex justify-content-between"
            >
              <button class="btn btn-sm btn-primary" @click="openEditModal(e)">
                <i class="bi bi-pencil"></i> 編輯
              </button>
              <button
                class="btn btn-sm btn-info"
                @click="goToSkuManagement(e.productId)"
              >
                <i class="bi bi-grid"></i> SKU
              </button>
              <div class="dropdown">
                <button
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="toggleActive(e)"
                    >
                      {{ e.active ? "下架" : "上架" }}
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="goToPromotionPage(e.productId)"
                    >
                      付費推廣
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="deleteProduct(e.productId)"
                    >
                      刪除
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁控制 -->
    <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 0 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage - 1)"
            >上一頁</a
          >
        </li>
        <li
          v-for="page in displayPageNumbers"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page - 1 }"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{
            page
          }}</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages - 1 }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage + 1)"
            >下一頁</a
          >
        </li>
      </ul>
    </nav>

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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import ProductAddModal from "@/components/product.components/ProductAddModal.vue";
import ProductEditModal from "@/components/product.components/ProductEditModal.vue";

const route = useRoute();
const router = useRouter();
const shopId = parseInt(route.params.shopId) || null;

// 視圖狀態
const viewMode = ref("table"); // 'table' 或 'card'

// 過濾狀態
const activeTab = ref("all");
const searchKeyword = ref("");

// 分頁狀態
const currentPage = ref(0);
const pageSize = ref(10);
const totalItems = ref(0);
const totalPages = ref(1);

// 商品狀態
const products = ref([]);
const filteredProducts = computed(() => {
  let filtered = [...products.value];

  // 按照標籤過濾
  if (activeTab.value !== "all") {
    filtered = filtered.filter((product) => {
      if (activeTab.value === "active")
        return product.active && !product.isDeleted;
      if (activeTab.value === "deleted") return product.isDeleted;
      if (activeTab.value === "reviewing")
        return !product.reviewStatus && !product.isDeleted;
      if (activeTab.value === "inactive")
        return !product.active && product.reviewStatus && !product.isDeleted;
      return true;
    });
  }

  // 按關鍵字搜尋
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.productName?.toLowerCase().includes(keyword) ||
        product.productId?.toString().includes(keyword)
    );
  }

  return filtered;
});

// 模態框狀態
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedElement = ref(null);

// 基本設定
const baseUrl = ref(import.meta.env.VITE_API_URL);

// 取得用戶資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;

// 取得標籤計數
const getTabCount = (tab) => {
  if (tab === "active") {
    return products.value.filter((p) => p.active && !p.isDeleted).length;
  } else if (tab === "deleted") {
    return products.value.filter((p) => p.isDeleted).length;
  } else if (tab === "reviewing") {
    return products.value.filter((p) => !p.reviewStatus && !p.isDeleted).length;
  } else if (tab === "inactive") {
    return products.value.filter(
      (p) => !p.active && p.reviewStatus && !p.isDeleted
    ).length;
  }
  return 0;
};

// 設定活動標籤
const setActiveTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 0;
  fetchProducts();
};

// 搜尋商品
const searchProducts = () => {
  currentPage.value = 0;
  fetchProducts();
};

// 重設搜尋
const resetSearch = () => {
  searchKeyword.value = "";
  fetchProducts();
};

// 換頁
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
};

// 計算顯示的頁碼
const displayPageNumbers = computed(() => {
  const maxDisplay = 5;
  const pages = [];
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxDisplay / 2) + 1
  );
  let endPage = Math.min(totalPages.value, startPage + maxDisplay - 1);

  if (endPage - startPage + 1 < maxDisplay) {
    startPage = Math.max(1, endPage - maxDisplay + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 獲取商品狀態文字
const getStatusText = (product) => {
  if (product.isDeleted) return "違規/刪除";
  if (!product.reviewStatus) return "審核中";
  if (!product.active) return "未上架/尚未刊登";
  return "架上商品";
};

// 獲取商品狀態樣式類
const getStatusClass = (product) => {
  const status = getStatusText(product);
  if (status === "架上商品") return "text-success";
  if (status === "未上架/尚未刊登") return "text-warning";
  if (status === "審核中") return "text-info";
  if (status === "違規/刪除") return "text-danger";
  return "";
};

// 取得圖片 URL
const getImageUrl = (product) => {
  if (!product) return null;

  if (product.primaryImageUrl) {
    return product.primaryImageUrl.startsWith("http")
      ? product.primaryImageUrl
      : `${baseUrl.value}${product.primaryImageUrl}`;
  }

  if (product.image) {
    return product.image.startsWith("http")
      ? product.image
      : `${baseUrl.value}${product.image}`;
  }

  if (product.productImages && product.productImages.length > 0) {
    const primaryImage = product.productImages.find((img) => img.isPrimary);
    if (primaryImage) {
      const imagePath = primaryImage.imagePath;
      return imagePath.startsWith("http")
        ? imagePath
        : `${baseUrl.value}${imagePath}`;
    }

    const imagePath = product.productImages[0].imagePath;
    return imagePath.startsWith("http")
      ? imagePath
      : `${baseUrl.value}${imagePath}`;
  }

  return "/assets/default-image.png";
};

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
    console.log("當前頁碼:", currentPage.value);
    console.log("每頁大小:", pageSize.value);

    // 構建查詢參數
    const params = {
      shopId: shopId,
      page: currentPage.value,
      size: pageSize.value,
    };

    // 根據標籤進行過濾
    if (activeTab.value !== "all") {
      if (activeTab.value === "active") {
        params.active = true;
      } else if (activeTab.value === "inactive") {
        params.active = false;
      } else if (activeTab.value === "reviewing") {
        params.reviewStatus = false;
      } else if (activeTab.value === "deleted") {
        params.isDeleted = true;
      }
    }

    // 關鍵字搜尋
    if (searchKeyword.value.trim()) {
      params.nameKeyword = searchKeyword.value.trim();
    }

    const response = await axios.get(`/api/products`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("API 回傳原始數據:", response);

    // 檢查是否為分頁格式的回傳結果
    if (response.data && response.data.content) {
      console.log("API 回傳的「我的商品」資料:", response.data.content);
      products.value = response.data.content;
      totalItems.value = response.data.totalElements || 0;
      totalPages.value = response.data.totalPages || 1;
    }
    // 保留原有的處理邏輯，以防 API 回傳格式不變
    else if (Array.isArray(response.data)) {
      console.log("API 回傳的「我的商品」資料:", response.data);
      products.value = response.data;
      totalItems.value = response.data.length;
      totalPages.value = 1;
    } else if (response.data && Array.isArray(response.data.products)) {
      products.value = response.data.products;
      totalItems.value = response.data.products.length;
      totalPages.value = 1;
    } else {
      console.error("回傳的數據格式不正確:", response.data);
      products.value = [];
      totalItems.value = 0;
      totalPages.value = 1;
    }

    // 對商品數據進行二次處理
    processProductData();
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

// 處理商品數據 (添加價格範圍、數量等資訊)
const processProductData = async () => {
  // 處理每個商品
  for (const product of products.value) {
    // 如果沒有庫存資訊，獲取 SKU 數據
    if (product.totalStock === undefined) {
      try {
        const skuResponse = await axios.get(
          `/api/products/${product.productId}/skus`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (skuResponse.data && Array.isArray(skuResponse.data)) {
          const skus = skuResponse.data;

          // 計算商品總庫存
          product.totalStock = skus.reduce(
            (sum, sku) => sum + (sku.stock || 0),
            0
          );

          // 計算價格範圍
          if (skus.length > 0) {
            const prices = skus.map((sku) => sku.price || 0);
            product.minPrice = Math.min(...prices);
            product.maxPrice = Math.max(...prices);
          } else {
            product.minPrice = 0;
            product.maxPrice = 0;
          }
        }
      } catch (error) {
        console.error(`獲取商品 ${product.productId} 的 SKU 資訊失敗:`, error);
        product.totalStock = 0;
        product.minPrice = 0;
        product.maxPrice = 0;
      }
    }

    // 隨機添加一些優化需求(僅示例)
    product.needsOptimization = Math.random() < 0.3;
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

// 跳轉到付費推廣頁面
const goToPromotionPage = (productId) => {
  router.push(`/seller/shops/${shopId}/products/${productId}/promotion`);
};

// 切換商品上下架狀態
const toggleActive = async (product) => {
  try {
    const newActive = !product.active;
    const actionText = newActive ? "上架" : "下架";

    // 確認操作
    const result = await Swal.fire({
      title: `確定要${actionText}此商品嗎？`,
      text: `商品將被${actionText}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `確定${actionText}`,
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      const response = await axios.put(
        `/api/products/${product.productId}`,
        { active: newActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status >= 200 && response.status < 300) {
        await Swal.fire({
          title: `${actionText}成功`,
          icon: "success",
          timer: 1500,
        });

        // 更新本地數據
        product.active = newActive;

        // 重新載入商品列表
        await fetchProducts();
      }
    }
  } catch (error) {
    Swal.fire({
      title: "操作失敗",
      text: error.response?.data?.message || "更改商品狀態失敗",
      icon: "error",
    });
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
      const response = await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status >= 200 && response.status < 300) {
        await Swal.fire({
          title: "刪除成功",
          icon: "success",
          timer: 1500,
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
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}

.product-status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.lock-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.status-text {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.nav-tabs .nav-link {
  color: #495057;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: #0d6efd;
}

/* 卡片視圖樣式 */
.product-card-view .card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card-view .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card-view .card-img-top {
  transition: filter 0.3s;
}

/* 確保 Bootstrap 圖標的正確對齊 */
.bi {
  vertical-align: -0.125em;
  display: inline-block;
}
</style>
