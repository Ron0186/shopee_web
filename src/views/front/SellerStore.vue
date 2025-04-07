<template>
  <div class="shop-container">
    <SellerStoreInfo :shop="shop" :isOwner="isOwner" />

    <div v-if="isOwner" class="my-products-section">
  <div class="buttons-container">
    <button class="btn-my-products" @click="goToMyProducts">
      <span class="icon">🛍️</span> 我的商品
    </button>
    <button class="btn-my-products" @click="goToMyCampaign">
      <span class="icon">📣</span> 我的行銷活動
    </button>
  </div>
</div>
 <!-- 非店主顯示活動列表 -->
 <ShopCampaigns v-if="!isOwner" :shopId="shop.shopId || route.params.shopId" />
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
        <div class="search-container">
          <input
            type="text"
            class="search-bar"
            placeholder="搜尋商品..."
            v-model="searchQuery"
            @keyup.enter="searchProduct"
          />
          <span class="search-icon">🔍</span>
        </div>
        <button class="btn-add-product" v-if="isOwner" @click="goToMyProducts">
          <span class="icon">➕</span> 上架商品
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
          <button v-if="isOwner" class="btn-add-first" @click="goToMyProducts">
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
            <div class="image-container">
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
              <div class="product-badge" v-if="!isProductActive(product)">
                未上架
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ product.productName }}</h3>
              <p class="product-price">
                $ {{ formatPrice(product.lowestPrice) }}
              </p>
              <p class="product-categories" v-if="product.category1Name">
                {{ product.category1Name }} / {{ product.category2Name }}
              </p>
              <div class="product-meta">
                <span class="product-rating">
                  <span class="rating-icon">⭐</span>
                  <span>{{ product.rating || "暫無評分" }}</span>
                </span>
                <span class="sold-count"
                  >已售出 {{ product.soldCount || 0 }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          :disabled="currentPage === 0"
          @click="changePage(currentPage - 1)"
          class="page-btn prev"
        >
          <span class="page-icon">◀</span> 上一頁
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage >= totalPages - 1"
          @click="changePage(currentPage + 1)"
          class="page-btn next"
        >
          下一頁 <span class="page-icon">▶</span>
        </button>
      </div>
    </div>

    <!-- 商品詳情彈窗 -->
    <ProductDetail
      v-model:visible="showProductDetail"
      :productId="selectedProductId"
      @close="handleProductModalClose"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />
  </div>
</template>

<script setup>
import SellerStoreInfo from "@/components/SellerStore/SellerStoreInfo.vue";
import ProductDetail from "@/components/product.components/ProductDetail.vue";
import { ref, onMounted, watch, computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import ShopCampaigns from "@/components/campaign/ShopCampaigns.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
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
// 商品詳情彈窗相關
const showProductDetail = ref(false);
const selectedProductId = ref(null);
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

    // 如果是店主，存儲 shopId
    if (isOwner.value) {
      userStore.updateShopId(shopId);
    }
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

// 獲取商店的所有商品 - 使用新的 API 端點
const fetchProducts = async () => {
  const shopId = route.params.shopId;
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
    // products.value = response.data.content || []; 先保留

// ⭐ 每筆商品抓一次評價統計
// for (const product of products.value) {
  // fetchReviewSummary(product.productId);
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
  router.push(`/seller/shops/${shop.value.shopId}/products`);
};



const goToMyCampaign = () => {
  router.push(
    `/seller/shops/${shop.value.shopId || route.params.shopId}/campaigns`
  );
};

const viewProductDetail = (productId) => {
  // router.push(`/products/${productId}`); ///////////
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
  console.log("加入購物車:", data);
  // 實現加入購物車的邏輯
};

// 處理立即購買
const handleBuyNow = async (data) => {
  try {
    // 檢查用戶是否已登錄
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "請先登錄",
        text: "您需要先登錄才能進行購買",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "前往登錄",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem("redirectAfterLogin", window.location.href);
          window.location.href = "/login";
        }
      });
      return;
    }

    const { productId, quantity } = data;

    // 獲取產品資訊
    const product = products.value.find((p) => p.productId === productId);
    if (!product) {
      throw new Error("商品不存在");
    }

    const price = product.minPrice;
    // 確保金額大於0
    if (!price || price <= 0) {
      Swal.fire({
        title: "錯誤",
        text: "商品價格無效，無法完成購買",
        icon: "error",
        confirmButtonText: "確定",
      });
      return;
    }

    const amount = quantity * price; // 計算實際金額

    Swal.fire({
      title: "訂單建立中",
      text: "請稍候...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const orderRequest = {
      productId: productId,
      quantity: quantity,
      amount: amount,
      price: price,
      productName: product.productName,
    };

    // 確保添加正確的認證頭
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("發送訂單數據:", orderRequest);
    console.log("使用的認證頭:", headers);

    const response = await axios.post(
      "/api/payment/orders/actions/create",
      orderRequest,
      {
        headers,
      }
    );

    // 成功建立訂單後，從response中取得訂單ID
    if (
      response.data &&
      (response.data.orderId ||
        (response.data.data && response.data.data.orderId))
    ) {
      // 兼容兩種可能的回應格式
      const orderId = response.data.orderId || response.data.data.orderId;

      // 獲取支付表單
      const redirectResponse = await axios.get(
        `/api/payment/redirect/${orderId}`,
        {
          headers,
          responseType: "json",
        }
      );

      if (redirectResponse.data && redirectResponse.data.formHtml) {
        // 創建一個臨時div來插入HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = redirectResponse.data.formHtml;

        const form = tempDiv.querySelector("form");
        if (form) {
          document.body.appendChild(form);
          Swal.close();
          form.submit();
        } else {
          throw new Error("未找到支付表單");
        }
      } else if (redirectResponse.data && redirectResponse.data.redirectUrl) {
        // 如果有重定向URL，直接跳轉
        Swal.close();
        window.location.href = redirectResponse.data.redirectUrl;
      } else {
        throw new Error("未獲得付款重定向信息");
      }
    } else {
      throw new Error("訂單創建失敗");
    }
  } catch (error) {
    console.error("下單失敗:", error);
    Swal.close();

    // 檢查是否是認證錯誤
    if (error.response && error.response.status === 401) {
      Swal.fire({
        title: "登錄已過期",
        text: "請重新登錄後再試",
        icon: "warning",
        confirmButtonText: "前往登錄",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "/login";
      });
    } else {
      Swal.fire({
        title: "錯誤",
        text: error.response?.data?.message || "下單失敗，請稍後再試",
        icon: "error",
        confirmButtonText: "確定",
      });
    }
  }
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "未定價";
  return typeof price === "number" ? price.toLocaleString("zh-TW") : price;
};

// 修改 getImageUrl 函數
const getImageUrl = (path) => {
  // 記錄原始路徑以便調試
  console.log('getImageUrl 收到的原始路徑:', path);
  
  if (!path) {
    console.log('路徑為空，使用預設圖片');
    return '/src/assets/default-campaign.png';
  }
  
  // 如果路徑已經是完整 URL，則直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('使用完整 URL:', path);
    return path;
  }
  
  // 確保路徑以 / 開頭
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  console.log('正規化後的路徑:', normalizedPath);
  
  // 添加時間戳參數以防止緩存問題
  const timestamp = new Date().getTime();
  const fullPath = `${import.meta.env.VITE_API_URL}${normalizedPath}?t=${timestamp}`;
  console.log('最終完整 URL:', fullPath);
  
  return fullPath;
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

onMounted(async () => {
  await fetchShopData();
  await checkOwner();
  await fetchProducts();
});
</script>

<style scoped>
/* 整體背景 */
.shop-container {
  background-color: #f9fafb;
  padding: 24px;
  min-height: 100vh;
  font-family: "Noto Sans TC", sans-serif;
  color: #333;
}

/* 選單 */
.shop-menu {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  border-radius: 16px;
  padding: 8px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.shop-menu a {
  padding: 16px 28px;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  margin: 0;
  border-radius: 10px;
  font-size: 15px;
}

.shop-menu a:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.06);
}

.shop-menu .active {
  color: #ff6b6b;
  font-weight: 600;
  background-color: rgba(255, 107, 107, 0.08);
}

.shop-menu .active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background-color: #ff6b6b;
  border-radius: 3px;
}

/* 我的商品按鈕 */
.my-products-section {
  display: flex;
  justify-content: center;
  margin: 28px 0;
}

.btn-my-products {
  background-color: #ff6b6b;
  color: white;
  padding: 14px 32px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(255, 107, 107, 0.25);
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-my-products:hover {
  transform: translateY(-3px);
  background-color: #ff5252;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.35);
}

.btn-my-products .icon {
  font-size: 18px;
}

/* 商品列表 */
.product-section {
  max-width: 1600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.product-wrapper {
  margin: 30px auto;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 28px;
}

.product-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  transform: translateY(0);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.08);
  border-color: #e8e8e8;
}

.image-container {
  position: relative;
  overflow: hidden;
  height: 240px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.product-card:hover .product-img {
  transform: scale(1.08);
}

.product-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background-color: rgba(255, 152, 0, 0.95);
  color: white;
  padding: 8px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.product-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 500;
  height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.4;
}

.product-price {
  font-size: 22px;
  color: #ff6b6b;
  font-weight: 700;
  margin: 10px 0;
}

.product-categories {
  font-size: 13px;
  color: #888;
  margin: 10px 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  font-size: 13px;
  color: #777;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}


.rating-icon {
  color: #ffc107;
}

.sold-count {
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

/* 搜尋區域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
  width: 100%;
}

.search-container {
  position: relative;
  flex-grow: 1;
  max-width: 1000px;
}

.search-bar {
  width: 100%;
  padding: 18px 24px 18px 56px;
  border: 1px solid #eaeaea;
  border-radius: 50px;
  font-size: 16px;
  transition: all 0.4s ease;
  background-color: #f9fafb;
  color: #555;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.search-bar:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
  background-color: white;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 18px;
  pointer-events: none;
}

.btn-add-product {
  background-color: #4bb543;
  color: white;
  padding: 16px 28px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(75, 181, 67, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.btn-add-product:hover {
  background-color: #429e3a;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(75, 181, 67, 0.3);
}

.btn-add-product .icon {
  font-size: 18px;
}

/* 載入動畫 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320px;
}

.spinner {
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 5px solid #ff6b6b;
  width: 56px;
  height: 56px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
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
  height: 320px;
  color: #888;
  text-align: center;
  padding: 24px;
}

.no-products p {
  font-size: 20px;
  margin-bottom: 24px;
  color: #666;
}

.btn-add-first {
  background-color: #3498db;
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.3);
  font-size: 15px;
}

.btn-add-first:hover {
  background-color: #2980b9;
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(52, 152, 219, 0.4);
}

/* 分頁控制 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 48px;
  padding: 12px 0;
}

.page-btn {
  padding: 14px 28px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  margin: 0 14px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 6px 18px rgba(255, 107, 107, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.page-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(255, 107, 107, 0.3);
}

.page-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  box-shadow: none;
}

.page-icon {
  font-size: 12px;
}

.page-info {
  font-size: 16px;
  color: #555;
  font-weight: 500;
  background: #f8f9fa;
  padding: 12px 28px;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* 增加響應式設計 */
@media (max-width: 1600px) {
  .product-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .product-section {
    padding: 32px;
  }
}

@media (max-width: 1600px) {
  .product-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .product-section {
    padding: 32px;
  }
}

@media (max-width: 1200px) {
  .product-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .shop-menu a {
    padding: 14px 24px;
    font-size: 14px;
  }

  .product-section {
    padding: 28px;
    border-radius: 16px;
  }

  .image-container {
    height: 220px;
  }
}

@media (max-width: 992px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .shop-menu {
    flex-wrap: wrap;
    justify-content: center;
    padding: 6px;
  }

  .shop-menu a {
    padding: 12px 18px;
    margin: 4px;
    font-size: 14px;
  }

  .shop-container {
    padding: 16px;
  }

  .product-section {
    padding: 24px;
  }

  .btn-my-products,
  .btn-add-product {
    padding: 12px 24px;
    font-size: 14px;
  }

  .search-bar {
    padding: 16px 20px 16px 50px;
    font-size: 15px;
  }

  .search-icon {
    left: 20px;
  }

  .product-title {
    font-size: 15px;
    height: 40px;
  }

  .product-price {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .search-container {
    width: 100%;
  }

  .btn-add-product {
    width: 100%;
    justify-content: center;
  }

  .product-section {
    padding: 20px;
    border-radius: 14px;
  }

  .shop-menu {
    margin: 24px 0;
    padding: 4px;
  }

  .shop-menu a {
    padding: 10px 14px;
    font-size: 13px;
    margin: 3px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 36px;
  }

  .page-btn {
    padding: 12px 20px;
    font-size: 14px;
    margin: 0 10px;
  }

  .page-info {
    padding: 10px 20px;
    font-size: 14px;
  }

  .my-products-section {
    margin: 20px 0;
  }

  .btn-my-products {
    width: 100%;
    justify-content: center;
  }

  .product-wrapper {
    margin: 20px auto;
  }

  .no-products p {
    font-size: 18px;
  }

  .btn-add-first {
    width: 100%;
    padding: 14px 24px;
  }
}

@media (max-width: 480px) {
  .product-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .shop-menu a {
    font-size: 12px;
    padding: 8px 12px;
    margin: 2px;
  }

  .product-section {
    padding: 16px;
    border-radius: 12px;
  }

  .image-container {
    height: 200px;
  }

  .shop-container {
    padding: 12px;
  }

  .btn-my-products,
  .btn-add-product,
  .btn-add-first {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    font-size: 14px;
  }

  .product-info {
    padding: 16px;
  }

  .product-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .product-price {
    font-size: 18px;
    margin: 8px 0;
  }

  .product-categories {
    font-size: 12px;
    margin: 8px 0;
  }

  .product-meta {
    font-size: 12px;
    margin-top: 10px;
  }

  .search-bar {
    padding: 14px 16px 14px 44px;
    font-size: 14px;
  }

  .search-icon {
    left: 16px;
    font-size: 16px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 20px;
  }

  .product-badge {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .page-btn {
    padding: 10px 16px;
    font-size: 13px;
    margin: 0 8px;
  }

  .page-info {
    padding: 8px 16px;
    font-size: 13px;
  }

  .loading-spinner {
    height: 280px;
  }

  .spinner {
    width: 48px;
    height: 48px;
  }

  .no-products {
    height: 260px;
    padding: 20px;
  }

  .no-products p {
    font-size: 16px;
    margin-bottom: 20px;
  }
}

/* 增強視覺效果 */
.product-card {
  will-change: transform;
  backface-visibility: hidden;
}

.product-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.product-card:hover::after {
  opacity: 1;
}

.shop-menu a::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #ff6b6b;
  transition: all 0.3s ease;
  transform: translateX(-50%);
  opacity: 0;
}

.shop-menu a:hover::before {
  width: 30px;
  opacity: 0.6;
}

.shop-menu .active::before {
  opacity: 0;
}

/* 改善動畫效果 */
.btn-my-products,
.btn-add-product,
.btn-add-first,
.page-btn {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.product-card {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.search-bar {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 交互反饋增強 */
.btn-my-products:active,
.btn-add-product:active,
.btn-add-first:active,
.page-btn:active:not(:disabled) {
  transform: translateY(0);
  transition: all 0.1s;
}

.search-bar:focus {
  transition: all 0.25s;
}

/* 微妙陰影與深度 */
.product-section {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 1px rgba(0, 0, 0, 0.025);
}

.shop-menu {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04), 0 2px 2px rgba(0, 0, 0, 0.02);
}

.product-card {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03), 0 2px 3px rgba(0, 0, 0, 0.01);
}

.buttons-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

@media (max-width: 768px) {
  .buttons-container {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
