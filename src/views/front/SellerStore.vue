<template>
  <div class="shop-container">
    <!-- 商店資訊 -->
    <SellerStoreInfo :shop="shop" :isOwner="isOwner" />

    <!-- 賣家專屬「我的商品」按鈕 -->
    <div v-if="isOwner" class="my-products-section">
      <button class="btn btn-my-products" @click="goToMyProducts">
        🛍️ 我的商品
      </button>
    </div>

    <!-- 分類選單 -->
    <nav class="shop-menu">
      <a href="#" class="active">回首頁</a>
      <a href="#">所有商品</a>
      <a href="#">男生衣著</a>
      <a href="#">女生衣著</a>
      <a href="#">配件 / 飾品</a>
    </nav>

    <!-- 商品區塊 - 搜尋商品跟上架商品-->
    <div class="product-section">
      <div class="section-header">
        <input
          type="text"
          class="search-bar"
          placeholder="🔍 搜尋商品..."
          v-model="searchQuery"
          @keyup.enter="searchProduct"
        />
        <button
          class="btn btn-add-product"
          v-if="isOwner"
          @click="goToMyProducts"
        >
          ➕ 上架商品
        </button>
      </div>

      <!-- 商品區塊 - 商品資訊相關，移除編輯&刪除按鈕 -->
      <div class="product-wrapper">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>載入商品中...</p>
        </div>

        <div v-else-if="products.length === 0" class="no-products">
          <p v-if="searchQuery">沒有符合「{{ searchQuery }}」的商品</p>
          <p v-else>商店目前沒有任何商品</p>
          <button
            v-if="isOwner"
            class="btn btn-add-first"
            @click="goToMyProducts"
          >
            立即上架第一個商品
          </button>
        </div>

        <div v-else class="product-list">
          <div
            class="product-card"
            v-for="product in products"
            :key="product.productId"
            @click="viewProductDetail(product.productId)"
          >
            <img
              :src="
                getImageUrl(
                  product.primaryImageUrl ||
                    (product.imageUrls && product.imageUrls[0])
                )
              "
              class="product-img"
              alt="商品圖片"
            />
            <div class="product-info">
              <p class="product-title">{{ product.productName }}</p>
              <p class="product-price">
                $ {{ formatPrice(product.lowestPrice) }}
              </p>
              <p class="product-categories" v-if="product.category1Name">
                {{ product.category1Name }} / {{ product.category2Name }}
              </p>
              <p class="product-rating">
                ⭐ {{ product.rating || "暫無評分" }} 已售出
                {{ product.soldCount || 0 }}
              </p>
              <p v-if="!isProductActive(product)" class="not-active">未上架</p>
            </div>
            <!-- 移除編輯和刪除按鈕 -->
          </div>
        </div>
      </div>

      <!-- 分頁控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          :disabled="currentPage === 0"
          @click="changePage(currentPage - 1)"
          class="btn page-btn prev"
        >
          上一頁
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage >= totalPages - 1"
          @click="changePage(currentPage + 1)"
          class="btn page-btn next"
        >
          下一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import SellerStoreInfo from "@/components/SellerStore/SellerStoreInfo.vue";
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 取得用戶資訊
const token = userStore.token;

// 狀態變數
const isOwner = ref(false);
const shop = ref({});
const products = ref([]);
const searchQuery = ref("");
const errorMessage = ref("");
const loading = ref(true);
const baseUrl = ref(import.meta.env.VITE_API_URL || "");
const defaultImage = "/src/assets/default-image.png"; // 預設商品圖片路徑

// 分頁控制
const currentPage = ref(0);
const pageSize = ref(12);
const totalPages = ref(0);

// 取得商店資訊
const fetchShopData = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}`);
    if (response.data.success && response.data.shopDTO) {
      shop.value = response.data.shopDTO;

      // 將商店 ID 存入 userStore (如果是店主)
      if (isOwner.value) {
        userStore.updateShopId(shopId);
      }
    } else {
      errorMessage.value = response.data.message || "商店資訊獲取失敗";
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      Swal.fire({
        title: "錯誤",
        text: "此商店不存在!",
        icon: "error",
        confirmButtonText: "確定",
      }).then(() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/shop");
        }
      });
    } else {
      errorMessage.value = "無法獲取商店資訊，請稍後再試";
    }
  }
};

// 檢查是否為商店擁有者
const checkOwner = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}/is-owner`);
    isOwner.value = response.data.isOwner;

    // 如果是店主，存儲 shopId
    if (isOwner.value) {
      userStore.updateShopId(shopId);
    }
  } catch (error) {
    console.error("檢查擁有者錯誤:", error);
    isOwner.value = false;
  }
};

// 獲取商店的所有商品 - 使用新的 API 端點
const fetchProducts = async () => {
  const shopId = route.params.shopId;
  loading.value = true;

  try {
    const res = await axios.get(`/api/products/public/shop/${shopId}`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        nameKeyword: searchQuery.value || undefined,
      },
    });

    if (res.data && res.data.content) {
      // 標準化數據，確保所有商品的active屬性為布爾值
      products.value = res.data.content.map((product) => {
        // 計算正確的上架狀態
        const normalizedActive =
          product.active === true ||
          (typeof product.active === "string" &&
            product.active.toLowerCase() === "true") ||
          product.isActive === true ||
          product.status === "ACTIVE";

        return {
          ...product,
          // 覆蓋原始的active屬性
          active: normalizedActive,
        };
      });

      totalPages.value = res.data.totalPages;
    } else {
      products.value = [];
      totalPages.value = 0;
    }
  } catch (error) {
    console.error("❌ 取得商品失敗：", error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 分頁控制
const changePage = (newPage) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    currentPage.value = newPage;
    fetchProducts();
  }
};

// 搜尋功能
const searchProduct = () => {
  currentPage.value = 0; // 重置為第一頁
  fetchProducts();
};

// 導航到「我的商品」頁面，並攜帶 shopId 作為路由參數
const goToMyProducts = () => {
  router.push(
    `/seller/shops/${shop.value.shopId || route.params.shopId}/products`
  );
};

// 查看商品詳情
const viewProductDetail = (productId) => {
  router.push(`/products/${productId}`);
};

// 移除了編輯商品和刪除商品的相關函數

// 格式化價格
const formatPrice = (price) => {
  if (!price && price !== 0) return "未定價";
  return typeof price === "number" ? price.toLocaleString("zh-TW") : price;
};

// 圖片處理
const getImageUrl = (url) => {
  if (!url) return defaultImage;
  return url.startsWith("http") ? url : `${baseUrl.value}${url}`;
};

// 監聽 shopId 變化
watch(
  () => route.params.shopId,
  async () => {
    loading.value = true;
    await fetchShopData();
    await checkOwner();
    await fetchProducts();
  }
);

// 監聽搜尋關鍵字變化
watch(searchQuery, (newVal, oldVal) => {
  if (newVal === "" && oldVal !== "") {
    // 當清空搜尋框時自動刷新商品列表
    fetchProducts();
  }
});

const isProductActive = (product) => {
  // 如果product為undefined或null，直接返回false
  if (!product) {
    return false;
  }

  return (
    product.active === true ||
    product.isActive === true ||
    product.status === "ACTIVE" ||
    (typeof product.active === "string" &&
      product.active.toLowerCase() === "true")
  );
};

// 組件掛載時請求商店資訊 & 檢查擁有者 & 獲取商品列表
onMounted(async () => {
  await fetchShopData();
  await checkOwner();
  await fetchProducts();
});
</script>

<style scoped>
/* 整體背景 */
.shop-container {
  background-color: #f7e9d2;
  padding: 20px;
  min-height: 100vh;
}

/* 選單 */
.shop-menu {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  border-bottom: 2px solid #ddd;
}

.shop-menu a {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
}

.shop-menu .active {
  color: #ff4757;
  border-bottom: 3px solid #ff4757;
}

/* 我的商品按鈕 */
.my-products-section {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.btn-my-products {
  background-color: #ff4757;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

/* 商品列表 */
.section-title {
  margin: 20px 0;
  font-size: 18px;
}

.product-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 修改為固定5列 */
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 2px 5px 15px rgba(0, 0, 0, 0.2);
}

.product-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 5px;
}

.product-title {
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 16px;
  color: #e84118;
  font-weight: bold;
  margin: 8px 0;
}

.product-categories {
  font-size: 12px;
  color: #666;
  margin: 5px 0;
}

.product-rating {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

/* 上架商品按鈕 */
.btn-add-product {
  background-color: #2ecc71;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* 移除了編輯 & 刪除商品按鈕的樣式 */

.section-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
}

.search-bar {
  flex-grow: 1;
  max-width: 1000px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

/* 載入動畫 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 無商品顯示 */
.no-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #777;
}

.btn-add-first {
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  margin-top: 15px;
  cursor: pointer;
}

/* 未上架標籤 */
.not-active {
  background-color: #f39c12;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
  margin-top: 5px;
}

/* 分頁控制 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.page-btn {
  padding: 8px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  color: #666;
}

/* 增加響應式設計，在較小的螢幕上減少列數 */
@media (max-width: 1200px) {
  .product-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-list {
    grid-template-columns: 1fr;
  }
}
</style>
