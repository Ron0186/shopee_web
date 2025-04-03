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

    <!-- 商品區塊  這是搜尋商品跟上架商品-->
    <div class="product-section">
      <div class="section-header">
<<<<<<< HEAD
        <input type="text" class="search-bar" placeholder="🔍 搜尋商品..." />
        <button class="btn btn-add-product" v-if="isOwner">➕ 上架商品</button>
=======
        <input type="text" class="search-bar" placeholder="🔍 搜尋商品..." v-model="searchQuery" @input="filterProducts" />
        <button class="btn btn-add-product" v-if="isOwner" @click="goToMyProducts">
          ➕ 上架商品
        </button>
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
      </div>

      <!-- 商品區塊  都是商品資訊相關 是商店擁有者的話你會看到編輯&刪除-->
      <div class="product-wrapper">
<<<<<<< HEAD
        <div class="product-list">
          <div
            class="product-card"
            v-for="product in products"
            :key="product.id"
          >
            <img :src="product.image" class="product-img" alt="商品圖片" />
            <div class="product-info">
              <p class="product-title">{{ product.name }}</p>
              <p class="product-price">$ {{ product.price }}</p>
              <p class="product-rating">
                ⭐ {{ product.rating }} 已售出 {{ product.sold }}
              </p>
            </div>
            <div class="product-actions">
              <button class="btn btn-edit" v-if="isOwner">✏️ 編輯</button>
              <button class="btn btn-delete" v-if="isOwner">🗑️ 刪除</button>
=======
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>載入商品中...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="no-products">
          <p v-if="searchQuery">沒有符合「{{ searchQuery }}」的商品</p>
          <p v-else>商店目前沒有任何商品</p>
          <button v-if="isOwner" class="btn btn-add-first" @click="goToMyProducts">
            立即上架第一個商品
          </button>
        </div>

        <div v-else class="product-list">
          <div class="product-card" v-for="product in filteredProducts" :key="product.productId"
            @click="viewProductDetail(product.productId)">
            <img :src="product.primaryImageUrl
              ? product.primaryImageUrl.startsWith('http')
                ? product.primaryImageUrl
                : `${baseUrl}${product.primaryImageUrl}`
              : defaultImage
              " class="product-img" alt="商品圖片" />
            <div class="product-info">
              <p class="product-title">{{ product.productName }}</p>
              <p class="product-price" v-if="product.minPrice === product.maxPrice">
                $ {{ formatPrice(product.minPrice) }}
              </p>
              <p class="product-price" v-else>
                $ {{ formatPrice(product.minPrice) }} -
                {{ formatPrice(product.maxPrice) }}
              </p>
              <p class="product-rating">
                ⭐ {{ product.rating || "暫無評分" }} 已售出
                {{ product.soldCount || 0 }}
              </p>
              <p v-if="!product.active" class="not-active">未上架</p>
            </div>
            <div class="product-actions" v-if="isOwner" @click.stop>
              <button class="btn btn-edit" @click="editProduct(product.productId)">
                ✏️ 編輯
              </button>
              <button class="btn btn-delete" @click="confirmDeleteProduct(product.productId)">
                🗑️ 刪除
              </button>
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
            </div>
          </div>
        </div>
      </div>
    </div>
<<<<<<< HEAD
=======

    <!-- 商品詳情彈窗 -->
    <ProductDetail v-model:visible="showProductDetail" :productId="selectedProductId" @close="handleProductModalClose"
      @add-to-cart="handleAddToCart" @buy-now="handleBuyNow" />
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
  </div>
</template>

<script setup>
import SellerStoreInfo from "@/components/SellerStore/SellerStoreInfo.vue";
<<<<<<< HEAD
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/plugins/axios";

const route = useRoute();
const router = useRouter();

const isOwner = ref(false);
const shop = ref({});
const errorMessage = ref("");
=======
import ProductDetail from "@/components/product.components/ProductDetail.vue";
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

const isOwner = ref(false);
const shop = ref({});
const products = ref([]);
const searchQuery = ref("");
const errorMessage = ref("");
const loading = ref(true);
const baseUrl = ref(import.meta.env.VITE_API_URL);
const defaultImage = "/src/assets/default-image.png"; // 預設商品圖片路徑

// 商品詳情彈窗相關
const showProductDetail = ref(false);
const selectedProductId = ref(null);

// 根據搜尋條件過濾商品
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;

  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    (product) =>
      product.productName.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
  );
});
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5

// 取得商店資訊
const fetchShopData = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}`);
    if (response.data.success && response.data.shopDTO) {
      shop.value = response.data.shopDTO;
    } else {
      errorMessage.value = response.data.message || "商店資訊獲取失敗";
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
<<<<<<< HEAD
      alert("此商店不存在!!");
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/shop");
      }
=======
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
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
    } else {
      errorMessage.value = "無法獲取商店資訊，請稍後再試";
    }
  }
};

<<<<<<< HEAD
=======
// 檢查是否為商店擁有者
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
const checkOwner = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}/is-owner`);
    isOwner.value = response.data.isOwner;
  } catch (error) {
    console.error("檢查擁有者錯誤:", error);
<<<<<<< HEAD
  }
};

// 導航到我的商品頁面，並攜帶 shopId 作為路由參數
const goToMyProducts = () => {
  router.push(`/my-products/${shop.value.shopId}`);
=======
    isOwner.value = false;
  }
};

// 獲取商店的所有商品
const fetchProducts = async () => {
  const shopId = route.params.shopId;
  loading.value = true;

  try {
    const response = await axios.get(`/api/products`, {
      params: {
        shopId: shopId,
        page: 0,
        size: 100,
      },
    });

    if (response.data && response.data.content) {
      products.value = response.data.content;
    } else if (Array.isArray(response.data)) {
      products.value = response.data;
    } else if (response.data && Array.isArray(response.data.products)) {
      products.value = response.data.products;
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error("獲取商品失敗:", error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜尋功能
const filterProducts = () => {
  // 使用 computed 屬性自動更新，這裡可以放其他邏輯
};

// 導航到「我的商品」頁面，並攜帶 shopId 作為路由參數
const goToMyProducts = () => {
  router.push(
    `/seller/shops/${shop.value.shopId || route.params.shopId}/products`
  );
};

// 查看商品詳情
const viewProductDetail = (productId) => {
  // 使用彈窗顯示商品詳情
  selectedProductId.value = productId;
  showProductDetail.value = true;
};

// 處理商品彈窗關閉
const handleProductModalClose = () => {
  showProductDetail.value = false;
};

// 處理加入購物車
const handleAddToCart = (data) => {
  console.log('加入購物車:', data);
  // 實現加入購物車的邏輯
};

// 處理立即購買
const handleBuyNow = (data) => {
  console.log('立即購買:', data);
  // 實現立即購買的邏輯，例如跳轉到結帳頁面
  router.push({
    path: '/checkout',
    query: {
      productId: data.productId,
      quantity: data.quantity
    }
  });
};

// 編輯商品
const editProduct = (productId) => {
  router.push(
    `/seller/shops/${shop.value.shopId || route.params.shopId}/products`
  );
};

// 確認刪除商品
const confirmDeleteProduct = async (productId) => {
  try {
    const result = await Swal.fire({
      title: "確定要刪除該商品嗎？",
      text: "刪除後將無法恢復!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      await deleteProduct(productId);
    }
  } catch (error) {
    console.error("刪除確認錯誤:", error);
  }
};

// 刪除商品
const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status >= 200 && response.status < 300) {
      await Swal.fire({
        title: "刪除成功",
        icon: "success",
      });

      // 重新載入商品列表
      await fetchProducts();
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除商品失敗",
      icon: "error",
    });
  }
};

// 格式化價格
const formatPrice = (price) => {
  if (!price && price !== 0) return "未定價";
  return price.toLocaleString("zh-TW");
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
};

// 監聽 shopId 變化
watch(
  () => route.params.shopId,
  async () => {
<<<<<<< HEAD
    await fetchShopData();
    await checkOwner();
  }
);

// 組件掛載時請求商店資訊 & 檢查擁有者
onMounted(async () => {
  await fetchShopData();
  await checkOwner();
});

// 商品列表
const products = ref([
  {
    id: 1,
    name: "大寬牛仔褲",
    price: 454,
    rating: 4.7,
    sold: 67,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "水洗牛仔褲",
    price: 449,
    rating: 3.0,
    sold: 6,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "迷彩長褲",
    price: 479,
    rating: 4.8,
    sold: 23,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "復古皮帶",
    price: 281,
    rating: 4.8,
    sold: 50,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "拼接工裝褲",
    price: 473,
    rating: 5.0,
    sold: 12,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "拼接工裝褲",
    price: 473,
    rating: 5.0,
    sold: 12,
    image: "https://via.placeholder.com/150",
  },
]);
=======
    loading.value = true;
    await fetchShopData();
    await checkOwner();
    await fetchProducts();
  }
);

// 組件掛載時請求商店資訊 & 檢查擁有者 & 獲取商品列表
onMounted(async () => {
  await fetchShopData();
  await checkOwner();
  await fetchProducts();
});
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
</script>

<style scoped>
/* 整體背景 */
.shop-container {
  background-color: #f7e9d2;
  padding: 20px;
<<<<<<< HEAD
=======
  min-height: 100vh;
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
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

<<<<<<< HEAD
=======
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

>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
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
<<<<<<< HEAD
  grid-template-columns: repeat(6, 1fr);
=======
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
<<<<<<< HEAD
  width: 100%;
  max-width: 220px;
}

.product-img {
  width: 100%;
  border-radius: 5px;
}

.product-title {
  font-size: 14px;
  color: #333;
=======
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
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
}

.product-price {
  font-size: 16px;
  color: #e84118;
  font-weight: bold;
<<<<<<< HEAD
=======
  margin: 8px 0;
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
}

.product-rating {
  font-size: 12px;
  color: #666;
<<<<<<< HEAD
=======
  margin-bottom: 10px;
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
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
<<<<<<< HEAD
=======

>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
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
<<<<<<< HEAD
  justify-content: center; /* 讓搜尋欄置中 */
=======
  justify-content: center;
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
<<<<<<< HEAD
}

.search-bar {
  flex-grow: 1;
  max-width: 1000px; /* 控制最大寬度 */
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}
</style>
=======
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
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
