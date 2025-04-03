<template>
  <div class="shop-container">
    <!-- 📌 主要內容區域 -->
    <main class="main-content">
      <h1>🛒 商品商城</h1>

      <!-- 📌 搜尋欄 -->
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="搜尋商品..." />
        <button @click="searchProduct">🔍 搜尋</button>
      </div>

      <!-- 📌 商品列表 -->
      <div class="products-grid">
        <div
          class="product-card"
          v-for="product in filteredProducts"
          :key="product.productId"
        >
          <img
            :src="getImageUrl(product.imageUrls[0])"
            :alt="product.productName"
          />
          <h3>{{ product.productName }}</h3>
          <p>💰 {{ product.lowestPrice }} 元</p>
          <p>👤 賣家：{{ product.sellerName }}</p>
          <button @click="addToCart(product)">🛒 加入購物車</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import imagePath from "@/assets/image.png";
// 🔹 假資料 (可改成 API 取得)
const products = ref([]);
const searchQuery = ref("");

// ✅ 從後端 API 抓商品資料
const fetchProducts = async () => {
  try {
    const res = await axios.get("http://localhost:8081/api/products/public");
    products.value = res.data;
  } catch (error) {
    console.error("❌ 取得商品失敗：", error);
  }
};

// 🔍 依據搜尋關鍵字篩選商品
const filteredProducts = computed(() => {
  return products.value.filter((product) =>
    product.productName.includes(searchQuery.value)
  );
});

// 🛒 加入購物車
const addToCart = (product) => {
  alert(`${product.productName} 已加入購物車！`);
};

// 🔍 執行搜尋
const searchProduct = () => {
  alert(`搜尋商品：${searchQuery.value}`);
};

// 圖片處理
const getImageUrl = (url) => {
  return url.startsWith("http") ? url : `http://localhost:8080/uploads/${url}`;
};

// 🔁 初始化時呼叫
onMounted(fetchProducts);
</script>

<style>
/* ✅ 讓主要內容區域填滿剩餘空間 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0;
  /* ✅ 移除 margin */
  padding: 0;
  /* ✅ 確保不影響 */
  box-sizing: border-box;
}

.shop-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1400px;
  padding: 20px;
  box-sizing: border-box;
}

.navbar,
.footer {
  width: 100%;
  /* ✅ 讓它們完全填滿 */
  margin: 0;
  /* ✅ 確保不會有左右空白 */
  padding: 0;
  /* ✅ 確保內邊距不影響 */
  box-sizing: border-box;
}

/* 🎯 搜尋欄 */
.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar button {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 5px;
}

/* 🎯 商品網格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 🎯 商品卡片 */
.product-card {
  max-width: 250px;
  /* 確保商品卡片不會變得過大 */
  width: 100%;
  overflow: hidden;
}

.product-card:hover {
  transform: scale(1.05);
}

.product-card img {
  width: 100%;
  height: 180px;
  /* 調整圖片大小，讓商品更明顯 */
  object-fit: cover;
  border-radius: 5px;
}

.product-card h3 {
  font-size: 20px;
  margin: 10px 0;
  font-weight: bold;
}

.product-card p {
  font-size: 16px;
  color: #444;
  margin-bottom: 10px;
}

/* 🎯 購物按鈕 */
.product-card button {
  background: #ff6f61;
  color: white;
  padding: 10px 15px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease-in-out;
}

.product-card button:hover {
  background: #e05b50;
}
</style>
