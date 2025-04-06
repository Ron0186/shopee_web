<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";

const router = useRouter(); // Vue Router 實例
const userStore = useUserStore();
async function logout() {
  // 清除 pinia userStore
  userStore.clearUserData();

  await Swal.fire({
    title: "登出成功",
    icon: "success",
  });
  // 跳轉到登入頁
  router.push({ name: "AdminLogin" });
}
</script>

<template>
  <div class="sidebar">
    <h1 class="title">後台管理系統</h1>
    <router-link to="/admin/dashboard">📊 儀表板</router-link>
    <router-link to="/admin/orders">📦 訂單管理</router-link>
    <router-link to="/admin/reviews"> 評價管理</router-link>
    <router-link to="/admin/integrated-management">🛒 付款/物流</router-link>
    <router-link to="/admin/category-management">📑 商品分類</router-link>
    <router-link to="/admin/products/tags">🔖 商品標籤</router-link>
    <router-link to="/admin/users">👥 會員管理</router-link>
    <router-link
      to="/admin/administrators"
      v-if="userStore.roles.includes('SUPER_ADMIN')"
      >👥 管理員管理</router-link
    >
    <router-link to="/admin/product-review">👔 商品管理</router-link>
    <router-link to="/admin/shop/review">🛍 商店申請管理</router-link>
    <router-link to="/coupon/adminCouponManager">🎟️ 優惠券管理</router-link>
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
