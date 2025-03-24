<template>
  <div class="shop-container">
    <!-- 商店資訊 -->
    <SellerStoreInfo :shop="shop" :isOwner="isOwner" />

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
        <input type="text" class="search-bar" placeholder="🔍 搜尋商品...">
        <button class="btn btn-add-product" v-if="isOwner">➕ 上架商品</button>
      </div>






      <!-- 商品區塊  都是商品資訊相關 是商店擁有者的話你會看到編輯&刪除-->
      <div class="product-wrapper">
        <div class="product-list">
          <div class="product-card" v-for="product in products" :key="product.id">
            <img :src="product.image" class="product-img" alt="商品圖片">
            <div class="product-info">
              <p class="product-title">{{ product.name }}</p>
              <p class="product-price">$ {{ product.price }}</p>
              <p class="product-rating">⭐ {{ product.rating }} 已售出 {{ product.sold }}</p>
            </div>
            <div class="product-actions">
              <button class="btn btn-edit" v-if="isOwner">✏️ 編輯</button>
              <button class="btn btn-delete" v-if="isOwner">🗑️ 刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SellerStoreInfo from "@/components/SellerStore/SellerStoreInfo.vue";
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/plugins/axios";

const route = useRoute();
const router = useRouter();

const isOwner = ref(false);
const shop = ref({});
const errorMessage = ref("");

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
      alert("此商店不存在!!");
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/shop");
      }
    } else {
      errorMessage.value = "無法獲取商店資訊，請稍後再試";
    }
  }
};

const checkOwner = async () => {
  const shopId = route.params.shopId;
  try {
    const response = await axios.get(`/api/shop/${shopId}/is-owner`);
    isOwner.value = response.data.isOwner;
  } catch (error) {
    console.error("檢查擁有者錯誤:", error);
  }
};

// 監聽 shopId 變化
watch(
  () => route.params.shopId,
  async () => {
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
  { id: 1, name: "大寬牛仔褲", price: 454, rating: 4.7, sold: 67, image: "https://via.placeholder.com/150" },
  { id: 2, name: "水洗牛仔褲", price: 449, rating: 3.0, sold: 6, image: "https://via.placeholder.com/150" },
  { id: 3, name: "迷彩長褲", price: 479, rating: 4.8, sold: 23, image: "https://via.placeholder.com/150" },
  { id: 4, name: "復古皮帶", price: 281, rating: 4.8, sold: 50, image: "https://via.placeholder.com/150" },
  { id: 5, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" },
  { id: 5, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" }
]);
</script>

<style scoped>
/* 整體背景 */
.shop-container {
  background-color: #f7e9d2;
  padding: 20px;
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
  grid-template-columns: repeat(6, 1fr);
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
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
}

.product-price {
  font-size: 16px;
  color: #e84118;
  font-weight: bold;
}

.product-rating {
  font-size: 12px;
  color: #666;
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
  justify-content: center; /* 讓搜尋欄置中 */
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
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