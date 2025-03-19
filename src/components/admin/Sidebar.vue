<script setup>
import { useRouter } from "vue-router";

const router = useRouter(); // Vue Router 實例

const logout = () => {
  console.log("已登出");
  router.push("/"); // 跳轉到首頁
};
</script>

<template>
  <div class="sidebar">
    <h1 class="title">後台管理系統</h1>
    <router-link to="/admin/dashboard">📊 儀表板</router-link>
    <router-link to="/admin/orders">📦 訂單管理</router-link>
    <router-link to="/admin/orders/all">📜 所有訂單</router-link>
    <router-link to="/admin/orders/pending">⏳ 待處理訂單</router-link>
    <router-link to="/admin/orders/cancelled">❌ 取消/退貨</router-link>
    <router-link to="/admin/products">🛒 商品管理</router-link>
    <router-link to="/admin/products/categories">📑 商品分類</router-link>
    <router-link to="/admin/products/tags">🔖 商品標籤</router-link>
    <router-link to="/admin/account">👥 會員管理</router-link>
    <router-link to="/admin/users/customers">🙍‍♂️ 客戶管理</router-link>
    <router-link to="/admin/shop/review">🛍 商店申請管理</router-link>
    <router-link to="/admin/coupons">🎟️ 優惠券管理</router-link>
    <router-link to="/admin/analytics">📊 數據分析</router-link>
    <router-link to="/admin/analytics/sales">📈 銷售報告</router-link>
    <router-link to="/admin/analytics/user-behavior"
      >👥 用戶行為分析</router-link
    >
    <router-link to="/admin/settings">⚙️ 系統設定</router-link>
    <router-link to="/admin/settings/admins">🔧 管理員帳號</router-link>
    <router-link to="/admin/settings/platform">🛠 平台設定</router-link>
    <router-link to="/admin/profile">個人資料</router-link>
    <router-link to="/admin/settings">設定</router-link>
    <button @click="logout" class="btn btn-secondary">登出</button>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 220px;
  height: 100vh;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  gap: 4px;
  overflow-y: auto;
}

.title {
  font-size: 26px;
  font-weight: 600;
}

.sidebar a {
  color: white;
  text-decoration: none;
  padding: 12px;
  display: block;
  border-radius: 5px;
  font-size: 16px;
}

.sidebar a:hover {
  background: #1a252f;
}
</style>
