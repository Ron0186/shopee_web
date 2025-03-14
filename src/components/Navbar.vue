<template>
  <nav class="navbar">
    <!-- 漢堡選單按鈕 -->
    <button class="menu-btn btn" @click="toggleDrawer">☰</button>

    <!-- 回首頁 -->
    <h1 class="title">
      <router-link to="/">MyShop</router-link>
    </h1>

    <!-- 會員中心按鈕 -->
    <div class="nav-icons">
      <router-link to="/login">🔑 登入</router-link>
      <router-link to="/register">📝 註冊</router-link>
      <router-link to="/profile">👤 會員中心</router-link>
      <router-link to="/orders">📦 訂單</router-link>
      <router-link to="/cart">🛒 購物車</router-link>
    </div>
  </nav>

  <!-- 📌 漢堡選單 -->
  <div class="sidebar" :class="{ open: drawerOpen }">
    <button class="close-btn" @click="toggleDrawer">✖</button>
    <ul>
      <li><router-link to="/" @click="toggleDrawer">🏠 首頁</router-link></li>
      <li class="dropdown">
        <button @click="toggleCategory">🛍 商城分類 ▼</button>
        <ul v-if="categoryOpen">
          <li>
            <router-link to="/shop?category=clothing" @click="toggleDrawer"
              >👕 衣服</router-link
            >
          </li>
          <li>
            <router-link to="/shop?category=electronics" @click="toggleDrawer"
              >📱 電子產品</router-link
            >
          </li>
          <li>
            <router-link to="/shop?category=home" @click="toggleDrawer"
              >🏠 家用品</router-link
            >
          </li>
          <li>
            <router-link to="/shop?category=others" @click="toggleDrawer"
              >🔹 其他</router-link
            >
          </li>
        </ul>
      </li>
      <li>
        <router-link to="/discounts" @click="toggleDrawer"
          >💰 優惠專區</router-link
        >
      </li>
      <li>
        <router-link to="/notifications" @click="toggleDrawer"
          >🔔 通知</router-link
        >
      </li>
      <li>
        <router-link to="/support" @click="toggleDrawer"
          >📞 客服 & 幫助中心</router-link
        >
      </li>
      <li>
        <router-link to="/address" @click="toggleDrawer"
          >📍 地址管理</router-link
        >
      </li>
      <li>
        <router-link to="/payment-methods" @click="toggleDrawer"
          >💳 付款方式</router-link
        >
      </li>
      <li>
        <router-link to="/privacy" @click="toggleDrawer"
          >📜 隱私政策 & 使用者條款</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";

const drawerOpen = ref(false);
const categoryOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const toggleCategory = () => {
  categoryOpen.value = !categoryOpen.value;
};
</script>

<style scoped>
/* 📌 Navbar 樣式 */
.navbar {
  width: 100vw;
  /* ✅ 讓 Navbar 填滿畫面 */
  max-width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7e9d2;
  color: #000;
  padding: 0 20px;
  z-index: 1000;
  box-sizing: border-box;
}

.title > a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.menu-btn {
  background: #ff9b20;
}

/* 📌 會員中心 & 購物車 */
.nav-icons {
  display: flex;
  gap: 10px;
}

.nav-icons a {
  color: #000;
  text-decoration: none;
  font-size: 16px;
}

.nav-icons a:hover {
  text-decoration: underline;
}

/* 📌 漢堡選單 (側邊欄) */
.sidebar {
  position: fixed;
  left: -250px;
  top: 0;
  width: 250px;
  height: 100vh;
  background: #f7e9d2;
  color: #000;
  padding: 20px;
  transition: left 0.3s ease-in-out;
  box-shadow: 1px 1px 5px 5px #00000010;
  z-index: 200;
}

.sidebar.open {
  left: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  padding: 10px 0;
}

.sidebar ul li a {
  color: #000;
  text-decoration: none;
  display: block;
}

/* 📌 商城分類選單 */
.dropdown button {
  background: none;
  border: none;
  color: #000;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.dropdown ul {
  padding-left: 20px;
  display: none;
}

.dropdown ul li {
  padding: 5px 0;
}

.dropdown ul li a {
  font-size: 14px;
}

.dropdown.open ul {
  display: block;
}
</style>
