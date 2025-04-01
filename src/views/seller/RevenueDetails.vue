<template>
    <div class="dashboard">
      <h1>賣家後台總覽</h1>
  
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  
      <!-- 🛑 尚未開店 -->
      <div v-if="!hasShop">
        <p class="info">該用戶尚未建立商店。</p>
        <a class="apply-link" @click="navigateToApplyShop">✨ 現在就開店吧！</a>
      </div>
  
      <!-- ✅ 已建立商店才顯示 -->
      <div v-else>
        <div class="section">
          <div class="section detail" @click="navigateToProductPage">
            <h2>🛍 商品總覽</h2>
          </div>
  
          <div class="section detail" @click="navigateToOrderPage">
            <h2>📦 訂單管理</h2>
          </div>
  
          <div class="section detail" @click="navigateToSumarryPage">
            <h2>📒 營收概覽</h2>
          </div>
  
          <div class="section detail" @click="navigateToReviewPage">
            <h2>🌟 收到評論：{{ reviewData.length }}</h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";
  import { jwtDecode } from "jwt-decode";
  
  interface JwtPayload {
    userId: number;
    shopId?: number;
  }
  
  const router = useRouter();
  const userId = ref<number | null>(null);
  const shopId = ref<number | null>(null);
  
  const hasShop = ref(true);
  const reviewData = ref<any[]>([]);
  const errorMessage = ref("");
  
  // 👉 導航方法
  const navigateToApplyShop = () => router.push("/shop/apply");
  const navigateToProductPage = () => shopId.value && router.push(`/seller/shops/${shopId.value}/products`);
  const navigateToOrderPage = () => router.push("/seller/orders");
  const navigateToSumarryPage = () => router.push("/revenueSummary");
  const navigateToReviewPage = () => router.push("/review-details");
  
  onMounted(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      errorMessage.value = "請先登入以查看賣家資訊。";
      return;
    }
  
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      userId.value = decoded.userId;
  
      // 取得商店資訊
      const shopRes = await axios.get(`http://localhost:8081/api/shop/user/${userId.value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const shop = shopRes.data;
  
      if (!shop || !shop.shopId) {
        hasShop.value = false;
        return; // ✅ 停止執行其餘請求
      }
  
      hasShop.value = true;
      shopId.value = shop.shopId;
  
      // 取得評論資料
      const reviewRes = await axios.get(`http://localhost:8081/api/review/shop/${shopId.value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reviewData.value = reviewRes.data;
    } catch (error: any) {
      console.error("❌ 錯誤：", error);
      errorMessage.value = error.response?.data?.message || "資料取得失敗，請稍後再試。";
    }
  });
  </script>
  
  <style scoped>
  .dashboard {
    max-width: 600px;
    margin: auto;
    padding: 30px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 0 10px #ccc;
  }
  
  .section {
    background: white;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 6px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .detail:hover {
    background-color: #f0f0f0;
    cursor: pointer;
  }
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
  
  .error {
    color: red;
    text-align: center;
  }
  
  .info {
    text-align: center;
    color: #555;
    margin-top: 20px;
  }
  
  .apply-link {
    display: block;
    text-align: center;
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .apply-link:hover {
    color: #0056b3;
  }
  </style>
  