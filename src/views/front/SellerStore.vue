<template>
    <div class="shop-container">
      <!-- 商店資訊 -->
      <div class="shop-header">
        <div class="shop-info">
          <img :src="shop.logo" class="shop-logo" alt="商店 Logo">
          <div class="shop-details">
            <h2 class="shop-name">{{ shop.name }}</h2>
            <div class="shop-actions">
              <button class="btn btn-chat">💬 聊聊</button>
            </div>
          </div>
        </div>
        <div class="shop-stats">
          <p>商品數量：{{ shop.products }}</p>
          <p>加入時間：{{ shop.joined }}</p>
        </div>
        <!-- 編輯賣場資訊按鈕 -->
        <button class="btn btn-edit-shop">⚙️ 編輯賣場資訊</button>
      </div>
  
      <!-- 分類選單 -->
      <nav class="shop-menu">
        <a href="#" class="active">回首頁</a>
        <a href="#">所有商品</a>
        <a href="#">男生衣著</a>
        <a href="#">女生衣著</a>
        <a href="#">配件 / 飾品</a>
      </nav>
  
      <!-- 商品區塊 -->
      <div class="product-section">
        <div class="section-header">
          <h3 class="section-title">推薦商品</h3>
          <!-- 上架商品按鈕 -->
          <button class="btn btn-add-product">➕ 上架商品</button>
        </div>
        <div class="product-wrapper">
          <div class="product-list">
            <div class="product-card" v-for="product in products" :key="product.id">
              <img :src="product.image" class="product-img" alt="商品圖片">
              <div class="product-info">
                <p class="product-title">{{ product.name }}</p>
                <p class="product-price">$ {{ product.price }}</p>
                <p class="product-rating">⭐ {{ product.rating }} 已售出 {{ product.sold }}</p>
              </div>
              <!-- 編輯 & 刪除商品按鈕 -->
              <div class="product-actions">
                <button class="btn btn-edit">✏️ 編輯</button>
                <button class="btn btn-delete">🗑️ 刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";
  
  const shop = ref(null);
  const errorMessage = ref("");
  const route = useRoute();
  
  // 根據 shopId 取得商店資訊
  const fetchShopData = async () => {
    const shopId = route.params.shopId; // 取得 URL 中的 shopId
    try {
      const response = await axios.get(`/api/shop/${shopId}`);
      if (response.data.success) {
        shop.value = response.data.shopDTO;
      } else {
        errorMessage.value = response.data.message;
      }
    } catch (error) {
      errorMessage.value = "無法獲取商店資訊，請稍後再試";
    }
  };
  
  // 監聽 `shopId` 變化，當用戶切換商店時自動請求新數據
  watch(() => route.params.shopId, fetchShopData);
  
  // 組件掛載時請求商店資訊
  onMounted(fetchShopData);
   // 假商品列表
   const products = ref([
    { id: 1, name: "大寬牛仔褲", price: 454, rating: 4.7, sold: 67, image: "https://via.placeholder.com/150" },
    { id: 2, name: "水洗牛仔褲", price: 449, rating: 3.0, sold: 6, image: "https://via.placeholder.com/150" },
    { id: 3, name: "迷彩長褲", price: 479, rating: 4.8, sold: 23, image: "https://via.placeholder.com/150" },
    { id: 4, name: "復古皮帶", price: 281, rating: 4.8, sold: 50, image: "https://via.placeholder.com/150" },
    { id: 5, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" },
    { id: 6, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" },
    { id: 1, name: "大寬牛仔褲", price: 454, rating: 4.7, sold: 67, image: "https://via.placeholder.com/150" },
    { id: 2, name: "水洗牛仔褲", price: 449, rating: 3.0, sold: 6, image: "https://via.placeholder.com/150" },
    { id: 3, name: "迷彩長褲", price: 479, rating: 4.8, sold: 23, image: "https://via.placeholder.com/150" },
    { id: 4, name: "復古皮帶", price: 281, rating: 4.8, sold: 50, image: "https://via.placeholder.com/150" },
    { id: 5, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" },
    { id: 6, name: "拼接工裝褲", price: 473, rating: 5.0, sold: 12, image: "https://via.placeholder.com/150" }
  ]);
  </script>
  


  
  <style scoped>
  /* 整體背景 */
  .shop-container {
    background-color: #f7e9d2;
    padding: 20px;
  }
  
  /* 商店資訊 */
  .shop-header {
  background: linear-gradient(90deg, #8d6e63, #a1887f);
  color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
  
  .shop-info {
    display: flex;
    align-items: center;
  }
  
  .shop-logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 15px;
  }
  
  .shop-name {
    font-size: 24px;
    font-weight: bold;
  }
  
  .shop-meta {
    font-size: 14px;
  }
  
  .shop-actions .btn {
    margin-right: 10px;
    padding: 8px 12px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
  }
  
  .btn-follow {
    background-color: #ff6b81;
    color: white;
  }
  
  .btn-chat {
    background-color: #f1c40f;
    color: black;
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
  max-width: 1600px; /* 增加區塊寬度 */
  margin: 0 auto;
  padding: 0 20px;
}

/* 商品列表 */
.product-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6 欄 */
  gap: 25px; /* 增加間距 */
}

/* 商品卡片 */
.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  
  /* 調整寬高，讓商品變大 */
  width: 100%; /* 讓商品卡片自適應網格 */
  max-width: 220px; /* 增加最大寬度 */
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

  /* 編輯賣場資訊按鈕 */
.btn-edit-shop {
  background-color: #3498db;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-edit-shop:hover {
  background-color: #2980b9;
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

.btn-add-product:hover {
  background-color: #27ae60;
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

.btn-edit:hover {
  background-color: #d4ac0d;
}

.btn-delete:hover {
  background-color: #c0392b;
}

/* 商品區塊標題與按鈕 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
  </style>
  