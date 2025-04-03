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

      <!-- 商品區塊  都是商品資訊相關 是商店擁有者的話你會看到編輯&刪除-->
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
              :src="
                product.primaryImageUrl
                  ? product.primaryImageUrl.startsWith('http')
                    ? product.primaryImageUrl
                    : `${baseUrl}${product.primaryImageUrl}`
                  : defaultImage
              "
              class="product-img"
              alt="商品圖片"
            />
            <div class="product-info">
              <p class="product-title">{{ product.productName }}</p>
              <p
                class="product-price"
                v-if="product.minPrice === product.maxPrice"
              >
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
              <button
                class="btn btn-edit"
                @click="editProduct(product.productId)"
              >
                ✏️ 編輯
              </button>
              <button
                class="btn btn-delete"
                @click="confirmDeleteProduct(product.productId)"
              >
                🗑️ 刪除
              </button>
            </div>
          </div>
        </div>
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
  } catch (error) {
    console.error("檢查擁有者錯誤:", error);
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

      // 處理每個商品，確保有價格信息
      products.value = products.value.map((product) => {
        // 如果沒有minPrice或maxPrice，從skuList中獲取
        if (
          (!product.minPrice || !product.maxPrice) &&
          product.skuList &&
          product.skuList.length > 0
        ) {
          const prices = product.skuList.map((sku) => sku.price);
          if (prices.length > 0) {
            product.minPrice = Math.min(...prices);
            product.maxPrice = Math.max(...prices);
          }
        }
        return product;
      });
    } else if (Array.isArray(response.data)) {
      products.value = response.data;
      // 處理同上...
    } else if (response.data && Array.isArray(response.data.products)) {
      products.value = response.data.products;
      // 處理同上...
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
  console.log("加入購物車:", data);
  // 實現加入購物車的邏輯
};

// 處理立即購買
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
