<template>
  <div class="container mt-4">
    <h2>我的商品</h2>
    <div class="d-flex justify-content-between mb-3">
      <button class="btn btn-success" @click="openAddModal">新增商品</button>
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
          :class="{ active: activeTab === 'inactive' }"
          href="#"
          @click.prevent="setActiveTab('inactive')"
        >
          未上架 ({{ getTabCount("inactive") }})
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
            <th style="width: 120px">商品狀態</th>
            <th style="width: 120px">更新時間</th>
            <th style="width: 200px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.productId">
            <td>{{ product.productId }}</td>
            <td>
              <img
                v-if="product.primaryImageUrl"
                :src="getImageUrl(product)"
                alt="商品圖片"
                class="product-image"
              />
              <span v-else>無圖片</span>
            </td>
            <td>{{ product.productName }}</td>
            <td>
              <span v-if="product.minPrice === product.maxPrice"
                >NT${{ product.minPrice }}</span
              >
              <span v-else
                >NT${{ product.minPrice }} - NT${{ product.maxPrice }}</span
              >
            </td>
            <td>{{ product.totalStock || 0 }}</td>
            <td>
              <span
                :class="getStatusClass(product)"
                class="product-status"
                :data-status="product.active"
              >
                {{ getStatusText(product) }}
              </span>
            </td>
            <td>{{ formatDate(product.updatedAt) }}</td>
            <td>
              <div class="d-flex">
                <button
                  class="btn btn-primary btn-sm me-1"
                  @click="openEditModal(product)"
                >
                  編輯
                </button>

                <button
                  class="btn btn-info btn-sm me-1"
                  @click="goToSkuManagement(product.productId)"
                >
                  SKU管理
                </button>

                <div class="dropdown">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm dropdown-toggle"
                    id="'dropdownBtn-' + product.productId"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    更多
                  </button>
                  <ul
                    class="dropdown-menu"
                    aria-labelledby="'dropdownBtn-' + product.productId"
                  >
                    <li>
                      <a
                        class="dropdown-item toggle-active-item"
                        href="#"
                        @click.prevent="toggleActive(product)"
                      >
                        {{ product.active ? "下架" : "上架" }}
                      </a>
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="goToPromotionPage(product.productId)"
                      >
                        付費推廣
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item text-danger"
                        href="#"
                        @click.prevent="deleteProduct(product.productId)"
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
          v-for="product in filteredProducts"
          :key="product.productId"
          class="col-md-4 col-sm-6 mb-4"
        >
          <div class="card h-100">
            <div class="position-relative">
              <img
                :src="getImageUrl(product)"
                class="card-img-top"
                alt="商品圖片"
                style="height: 200px; object-fit: cover"
              />
              <div v-if="!product.active" class="product-status-overlay">
                <span class="lock-icon">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <span class="status-text">{{ getStatusText(product) }}</span>
                <button
                  v-if="getStatusText(product) === '未上架'"
                  class="btn btn-sm btn-light mt-2"
                  @click="toggleActive(product)"
                >
                  上架
                </button>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title text-truncate">
                {{ product.productName }}
              </h5>
              <p class="card-text text-danger">
                <span v-if="product.minPrice === product.maxPrice"
                  >NT${{ product.minPrice }}</span
                >
                <span v-else
                  >NT${{ product.minPrice }} - NT${{ product.maxPrice }}</span
                >
              </p>
              <div class="d-flex justify-content-between mb-2">
                <span>商品數量：{{ product.totalStock || 0 }}</span>
                <div>
                  <i class="bi bi-eye me-1"></i>{{ product.viewCount || 0 }}
                  <i class="bi bi-heart ms-2 me-1"></i
                  >{{ product.favoriteCount || 0 }}
                </div>
              </div>
              <div class="mb-2">
                <span :class="getStatusClass(product)">{{
                  getStatusText(product)
                }}</span>
              </div>
            </div>
            <div
              class="card-footer bg-transparent d-flex justify-content-between"
            >
              <button
                class="btn btn-sm btn-primary"
                @click="openEditModal(product)"
              >
                <i class="bi bi-pencil"></i> 編輯
              </button>
              <button
                class="btn btn-sm btn-info"
                @click="goToSkuManagement(product.productId)"
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
                      class="dropdown-item toggle-active-item"
                      href="#"
                      @click.prevent="toggleActive(product)"
                    >
                      {{ product.active ? "下架" : "上架" }}
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="goToPromotionPage(product.productId)"
                    >
                      付費推廣
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="deleteProduct(product.productId)"
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

    <!-- 商品 Modal -->
    <IntegratedProductModal
      :isOpen="showProductModal"
      :productData="currentProduct"
      :isEdit="isEditMode"
      @close="showProductModal = false"
      @refresh="fetchProducts"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios2";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import IntegratedProductModal from "@/components/product.components/IntegratedProductModal.vue";

const route = useRoute();
const router = useRouter();
const shopId = parseInt(route.params.shopId) || null;

// 整合後的模態框狀態
const showProductModal = ref(false);
const currentProduct = ref(null);
const isEditMode = ref(false);

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
      if (activeTab.value === "inactive")
        return !product.active && !product.isDeleted;
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
  } else if (tab === "inactive") {
    return products.value.filter((p) => !p.active && !p.isDeleted).length;
  }
  return 0;
};

// 設定活動標籤
const setActiveTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 0;
  fetchProductsAndInitDropdowns();
};

// 搜尋商品
const searchProducts = () => {
  currentPage.value = 0;
  fetchProductsAndInitDropdowns();
};

// 換頁
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchProductsAndInitDropdowns();
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
  if (!product.active) return "未上架";
  return "架上商品";
};

// 獲取商品狀態樣式類
const getStatusClass = (product) => {
  const status = getStatusText(product);
  if (status === "架上商品") return "text-success";
  if (status === "未上架") return "text-warning";
  if (status === "違規/刪除") return "text-danger";
  return "";
};

// 取得圖片 URL
const getImageUrl = (product) => {
  if (!product) return "/assets/default-image.png";

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

    // 构建查询参数
    const params = {
      shopId: shopId,
      page: currentPage.value,
      size: pageSize.value,
    };

    // 根据标签进行过滤
    if (activeTab.value !== "all") {
      if (activeTab.value === "active") {
        params.active = true;
      } else if (activeTab.value === "inactive") {
        params.active = false;
      } else if (activeTab.value === "deleted") {
        params.isDeleted = true;
      }
    }

    // 关键字搜索
    if (searchKeyword.value.trim()) {
      params.nameKeyword = searchKeyword.value.trim();
    }

    const response = await axios.get(`/api/products`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    // 处理返回的数据
    if (response.data && response.data.content) {
      products.value = response.data.content;
      totalItems.value = response.data.totalElements || 0;
      totalPages.value = response.data.totalPages || 1;
    } else if (Array.isArray(response.data)) {
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

    // 在这里处理商品数据，不使用await
    processBatchProductData().catch((err) =>
      console.error("处理批量数据失败:", err)
    );
  } catch (error) {
    console.error("載入失敗:", error);
    // 简化错误处理，不使用async/await弹窗
    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "載入商品列表時發生未知錯誤",
      icon: "error",
    });
  }
};

// 批量處理商品數據 (優化API請求)
const processBatchProductData = async () => {
  // 找出需要獲取SKU的商品ID列表
  const productsNeedingSku = products.value.filter(
    (product) => product.totalStock === undefined
  );

  if (productsNeedingSku.length === 0) return;

  try {
    // 假設這裡有一個批量獲取SKU的API
    // 如果沒有，可以使用Promise.all並行請求多個SKU
    const skuPromises = productsNeedingSku.map((product) =>
      axios.get(`/api/products/${product.productId}/skus`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    const skuResponses = await Promise.all(skuPromises);

    // 處理每個商品的SKU數據
    for (let i = 0; i < productsNeedingSku.length; i++) {
      const product = productsNeedingSku[i];
      const skuResponse = skuResponses[i];

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
    }

    // 不再需要「需要修改」標籤
  } catch (error) {
    console.error("批量獲取商品SKU失敗:", error);
    // 設定默認值
    productsNeedingSku.forEach((product) => {
      product.totalStock = 0;
      product.minPrice = 0;
      product.maxPrice = 0;
    });
  }
};

// 開啟新增 Modal
const openAddModal = () => {
  currentProduct.value = null;
  isEditMode.value = false;
  showProductModal.value = true;
};

// 開啟編輯 Modal
const openEditModal = (product) => {
  currentProduct.value = { ...product }; // 複製物件，避免影響原資料
  isEditMode.value = true;
  showProductModal.value = true;
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
    const productId = product.productId;
    const newActive = !product.active;
    const actionText = newActive ? "上架" : "下架";

    // 顯示加載狀態，但不使用 await，避免阻塞
    Swal.fire({
      title: "處理中...",
      text: `正在${actionText}商品`,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append("active", String(newActive));

    // 使用 try-catch 包裝網絡請求，確保出錯時能正確處理
    const response = await axios.put(`/api/products/${productId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });

    // 關閉加載提示
    Swal.close();

    // 只有成功後才更新 UI
    if (response.status >= 200 && response.status < 300) {
      // 先更新本地狀態
      const foundProduct = products.value.find(
        (p) => p.productId === productId
      );
      if (foundProduct) {
        foundProduct.active = newActive;
      }

      // 顯示成功消息
      Swal.fire({
        title: `${actionText}成功`,
        icon: "success",
        timer: 1500,
      });

      // 注意：不要使用 await，讓它在背景執行
      // 僅在必要時重新載入頁面，避免不必要的頁面刷新
      setTimeout(() => {
        fetchProducts().then(() => {
          // 確保 DOM 已更新後再初始化下拉菜單
          nextTick(() => {
            setTimeout(initializeDropdowns, 200);
          });
        });
      }, 1600); // 略長於 Swal 的 timer，確保提示消失後再刷新
    }
  } catch (error) {
    console.error("更改商品狀態錯誤:", error);

    // 關閉加載提示
    Swal.close();

    // 顯示錯誤消息
    Swal.fire({
      title: "操作失敗",
      text:
        error.response?.data?.message || error.message || "更改商品狀態失敗",
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
        await fetchProductsAndInitDropdowns();
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

// 初始化 Bootstrap 下拉選單
const initializeDropdowns = () => {
  nextTick(() => {
    try {
      // 确保DOM已更新且Bootstrap已加载
      setTimeout(() => {
        if (window.bootstrap && window.bootstrap.Dropdown) {
          // 获取所有下拉菜单触发元素
          const dropdownTriggerList =
            document.querySelectorAll(".dropdown-toggle");
          console.log("找到下拉菜单元素：", dropdownTriggerList.length);

          // 为每个下拉菜单创建实例
          dropdownTriggerList.forEach((el) => {
            new window.bootstrap.Dropdown(el);
          });

          console.log("下拉菜单初始化完成");
        } else {
          console.warn("Bootstrap JavaScript对象不可用，尝试手动加载");
          // 手动加载Bootstrap
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js";
          script.onload = () => {
            console.log("Bootstrap手动加载完成，重新初始化下拉菜单");
            initializeDropdowns();
          };
          document.body.appendChild(script);
        }
      }, 300); // 稍微延迟确保DOM和Bootstrap都已加载
    } catch (error) {
      console.error("初始化下拉菜单时出错：", error);
    }
  });
};

// 元件掛載時取得「我的商品」列表
onMounted(() => {
  fetchProducts().then(() => {
    // 延迟一点时间确保DOM完全渲染
    setTimeout(() => {
      initializeDropdowns();
    }, 100);
  });
});

// 每次數據更新後重新初始化下拉選單
// 确保以下函数在表格数据更新后调用
const fetchProductsAndInitDropdowns = async () => {
  try {
    await fetchProducts();
    // 确保DOM更新完成
    await nextTick();
    // 使用setTimeout给Vue一点额外时间更新DOM
    setTimeout(() => {
      initializeDropdowns();
    }, 200);
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
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