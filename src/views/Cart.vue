<template>
  <div class="cart-container">
    <h1>🛒 購物車</h1>

    <!-- 購物車為空顯示 -->
    <div v-if="isLoading" class="loading">載入中...</div>
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <p>你的購物車是空的</p>
      <button class="continue-shopping" @click="$router.push('/shop')">
        繼續購物
      </button>
    </div>

    <!-- 購物車有商品時顯示 -->
    <div v-else>
      <table>
        <thead>
          <tr>
            <th width="40%">商品資訊</th>
            <th width="15%">規格</th>
            <th width="10%">單價</th>
            <th width="15%">數量</th>
            <th width="10%">小計</th>
            <th width="10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.cartId">
            <td class="product-info">
              <div class="product-image">
                <img :src="getImageUrl(item.image)" alt="商品圖片" @error="handleImageError" />
              </div>
              <div class="product-details">
                <div class="product-name">{{ item.name }}</div>
                <div class="shop-name">賣家: {{ item.shopName }}</div>
              </div>
            </td>
            <td class="specs">
              <div v-if="item.specInfo && Object.keys(item.specInfo).length > 0">
                <div v-for="(value, key) in item.specInfo" :key="key" class="spec-item">
                  {{ key }}: {{ value }}
                </div>
              </div>
              <div v-else class="no-specs">無規格</div>
            </td>
            <td>{{ item.price.toLocaleString() }} 元</td>
            <td>
              <div class="quantity-controls">
                <button @click="updateQuantity(item.cartId, item.quantity - 1)" :disabled="item.quantity <= 1"
                  class="quantity-btn">
                  ➖
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="updateQuantity(item.cartId, item.quantity + 1)" :disabled="item.quantity >= item.stock"
                  class="quantity-btn">
                  ➕
                </button>
              </div>
              <div v-if="item.stock <= 5" class="stock-warning">
                剩餘庫存: {{ item.stock }}
              </div>
            </td>
            <td>{{ (item.quantity * item.price).toLocaleString() }} 元</td>
            <td>
              <button @click="removeFromCart(item.cartId, item.skuId)" class="delete-btn">
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 總計及結帳按鈕 -->
      <div class="summary">
        <h3>總計：{{ totalPrice.toLocaleString() }} 元</h3>
        <button class="checkout-btn" @click="checkout">前往結帳</button>
      </div>
    </div>

    <!-- 錯誤訊息顯示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { useUserStore } from "@/stores/user";

// 基礎 URL
const baseUrl = ref(import.meta.env.VITE_API_URL || "");

const router = useRouter();
const userStore = useUserStore();

const cartItems = ref([]);
const userId = ref(userStore.userId);
const isLoading = ref(true);
const errorMessage = ref("");

const getImageUrl = (image) => {
  if (!image) return "/img/default-product.png";

  const imagePath = image.imagePath || image.path || image.url || image;
  if (!imagePath) return "/img/default-product.png";

  // 如果是完整 URL，直接返回
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }

  // 如果是相對路徑，加上基礎 URL
  if (typeof imagePath === "string" && baseUrl.value) {
    return `${baseUrl.value}${imagePath}`;
  }

  // 如果是本地圖片路徑，直接返回
  return imagePath;
};

const handleImageError = (event) => {
  if (!event.target.dataset.errorHandled) {
    console.error("圖片載入失敗:", event.target.src);
    event.target.src = "/img/default-product.png"; // 確保這個路徑正確
    event.target.dataset.errorHandled = "true"; // 標記已處理
  }
};

// 計算總價
const totalPrice = computed(() => {
  return cartItems.value.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
});

// 獲取購物車資料
const fetchCart = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.get(`/api/cart/${userId.value}`);
    cartItems.value = response.data;
    console.log("購物車資料:", cartItems.value);
  } catch (error) {
    console.error("獲取購物車資料失敗", error);

    // 根據後端的錯誤格式解析錯誤訊息
    if (error.response && error.response.data) {
      // 如果購物車是空的，不顯示錯誤，只設置空陣列
      if (error.response.data === "購物車內沒有商品") {
        cartItems.value = [];
      } else {
        errorMessage.value = error.response.data;
      }
    } else {
      errorMessage.value = "獲取購物車資料失敗，請稍後再試";
    }
  } finally {
    isLoading.value = false;
  }
};

// 更新商品數量
const updateQuantity = async (cartId, newQuantity) => {
  if (newQuantity < 1) {
    return; // 數量不能小於1，按鈕已經禁用，這是額外保護
  }

  const item = cartItems.value.find((item) => item.cartId === cartId);
  if (item && newQuantity > item.stock) {
    errorMessage.value = `庫存不足，僅剩 ${item.stock} 件`;
    return;
  }

  errorMessage.value = "";
  try {
    await axios.put(`/api/cart/${cartId}`, { quantity: newQuantity });
    await fetchCart(); // 重新獲取購物車資料
  } catch (error) {
    console.error("更新購物車失敗", error);
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data;
    } else {
      errorMessage.value = "更新購物車失敗，請稍後再試";
    }
  }
};

// 從購物車移除商品
const removeFromCart = async (cartId, skuId) => {
  errorMessage.value = "";
  try {
    // 使用正確的參數調用刪除API
    await axios.delete(`/api/cart/remove`, {
      params: { userId: userId.value, skuId: skuId },
    });
    await fetchCart(); // 重新獲取購物車資料
  } catch (error) {
    console.error("刪除失敗", error);
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data;
    } else {
      errorMessage.value = "刪除商品失敗，請稍後再試";
    }
  }
};

// 前往結帳
const checkout = () => {
  if (cartItems.value.length === 0) {
    errorMessage.value = "購物車為空，無法進行結帳";
    return;
  }
  router.push("/quick-checkout");
};

// 組件掛載時獲取購物車資料
onMounted(() => {
  if (userId.value) {
    fetchCart();
  } else {
    isLoading.value = false;
    errorMessage.value = "請先登入再查看購物車";
  }
});
</script>

<style scoped>
.cart-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading {
  text-align: center;
  padding: 30px;
  font-size: 18px;
  color: #666;
}

.empty-cart {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.continue-shopping {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.product-info {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 10px;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex-grow: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.shop-name {
  font-size: 12px;
  color: #666;
}

.specs {
  text-align: left;
}

.spec-item {
  background-color: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 4px;
  font-size: 12px;
}

.no-specs {
  color: #999;
  font-size: 12px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.quantity {
  margin: 0 10px;
  min-width: 30px;
}

.quantity-btn {
  background-color: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stock-warning {
  font-size: 12px;
  color: #e53935;
  margin-top: 5px;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.summary {
  margin-top: 30px;
  text-align: right;
  padding: 10px 0;
  border-top: 2px solid #ddd;
}

.checkout-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-btn:hover {
  background-color: #45a049;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
}
</style>
