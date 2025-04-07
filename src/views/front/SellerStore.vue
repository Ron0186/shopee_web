<template>
  <div class="shop-container">
    <SellerStoreInfo :shop="shop" :isOwner="isOwner" />

    <div v-if="isOwner" class="my-products-section">
      <button class="btn btn-my-products" @click="goToMyProducts">
        🛍️ 我的商品
      </button>
    </div>

    <nav class="shop-menu">
      <a href="#" class="active">回首頁</a>
      <a href="#">所有商品</a>
      <a href="#">男生衣著</a>
      <a href="#">女生衣著</a>
      <a href="#">配件 / 飾品</a>
    </nav>

    <div class="product-section">
      <div class="section-header">
        <input
          type="text"
          class="search-bar"
          placeholder="🔍 搜尋商品..."
          v-model="searchQuery"
          @input="filterProducts"
        />
        <button
          class="btn btn-add-product"
          v-if="isOwner"
          @click="goToMyProducts"
        >
          ➕ 上架商品
        </button>
      </div>

      <div class="product-wrapper">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>載入商品中...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="no-products">
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
            v-for="product in filteredProducts"
            :key="product.productId"
            @click="viewProductDetail(product.productId)"
          >
            <img
              :src="product.primaryImageUrl?.startsWith('http') ? product.primaryImageUrl : baseUrl + product.primaryImageUrl"
              class="product-img"
              alt="商品圖片"
            />
            <div class="product-info">
              <p class="product-title">{{ product.productName }}</p>
              <p class="product-price" v-if="product.minPrice === product.maxPrice">
                $ {{ formatPrice(product.minPrice) }}
              </p>
              <p class="product-price" v-else>
                $ {{ formatPrice(product.minPrice) }} - {{ formatPrice(product.maxPrice) }}
              </p>
              <p class="product-rating">
                ⭐ {{ reviewSummaries[product.productId]?.averageRating?.toFixed(1) || "0.0" }}
                （{{ reviewSummaries[product.productId]?.reviewCount || 0 }} 則評論）
              </p>
              <p v-if="!product.active" class="not-active">未上架</p>
            </div>
            <div class="product-actions" v-if="isOwner" @click.stop>
              <button class="btn btn-edit" @click="editProduct(product.productId)">✏️ 編輯</button>
              <button class="btn btn-delete" @click="confirmDeleteProduct(product.productId)">🗑️ 刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SellerStoreInfo from "@/components/SellerStore/SellerStoreInfo.vue";
import { ref, onMounted, watch, computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const token = userStore.token;

const isOwner = ref(false);
const shop = ref({});
const products = ref([]);
const searchQuery = ref("");
const errorMessage = ref("");
const loading = ref(true);
const baseUrl = ref(import.meta.env.VITE_API_URL);
const defaultImage = "/src/assets/default-image.png";

// ⭐ 新增：用來存每個商品的星等和留言數
const reviewSummaries = reactive({});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter((product) =>
    product.productName.toLowerCase().includes(query)
  );
});

const fetchShopData = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}`);
    shop.value = response.data.shopDTO;
  } catch (error) {
    console.error("商店資料載入失敗", error);
  }
};

const checkOwner = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}/is-owner`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    isOwner.value = response.data.isOwner;
  } catch (error) {
    console.error("檢查商店擁有者錯誤", error);
  }
};

// ⭐ 新增：根據 productId 抓 review summary
const fetchReviewSummary = async (productId) => {
  try {
    const res = await axios.get(`/api/review/summary/product/${productId}`);
    reviewSummaries[productId] = res.data;
  } catch (error) {
    console.error(`取得商品 ${productId} 評價失敗`, error);
    reviewSummaries[productId] = { averageRating: 0, reviewCount: 0 };
  }
};

const fetchProducts = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/products`, {
      params: { shopId },
    });
    products.value = response.data.content || [];

    // ⭐ 每筆商品抓一次評價統計
    for (const product of products.value) {
      fetchReviewSummary(product.productId);
    }
  } catch (error) {
    console.error("商品載入失敗", error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const goToMyProducts = () => {
  router.push(`/seller/shops/${shop.value.shopId}/products`);
};

const viewProductDetail = (productId) => {
  router.push(`/products/${productId}`);
};

const editProduct = (productId) => {
  router.push(`/seller/shops/${shop.value.shopId}/products`);
};

const confirmDeleteProduct = async (productId) => {
  const result = await Swal.fire({
    title: "確定刪除該商品？",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "刪除",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProducts();
      Swal.fire("刪除成功", "", "success");
    } catch (err) {
      Swal.fire("刪除失敗", "", "error");
    }
  }
};

const formatPrice = (price) => {
  return price?.toLocaleString("zh-TW") || "未定價";
};

watch(() => route.params.shopId, async () => {
  loading.value = true;
  await fetchShopData();
  await checkOwner();
  await fetchProducts();
});

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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

/* 編輯 & 刪除商品按鈕 */
.product-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.btn-edit {
  background-color: #f1c40f;
  color: black;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

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
</style>
