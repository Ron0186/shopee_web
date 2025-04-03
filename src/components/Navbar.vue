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
      <router-link to="/user/login" v-if="!userStore.username">🔑
        登入</router-link>
      <router-link to="/user/register" v-if="!userStore.username">📝
        註冊</router-link>
<<<<<<< HEAD
      <router-link to="/shop/apply" v-if="userStore.token && !userStore.roles.includes('SELLER')">📝
        我要當賣家!!</router-link>
      <router-link to="/profile">👤 會員中心</router-link>
      <router-link v-if="userStore.username" :to="userStore.isSeller ? '/seller/orders' : '/user/orders'">
        📦 訂單管理
=======


      <!-- 新增賣家中心按鈕 -->
      <router-link :to="'/store/' + userStore.shopId" v-if="
        userStore.token &&
        userStore.isSeller &&
        userStore.shopId &&
        userStore.shopId !== 'undefined'
      ">
        🏪 賣家中心
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
      </router-link>

      <!-- ✅ 訂單管理 + 通知角標 -->
      <router-link v-if="userStore.username"
        :to="userStore.isSeller ? '/seller/orders' : '/user/orders'"
        class="position-relative">
        📦 訂單管理
        <!-- 賣家：待處理訂單通知 -->
        <span v-if="userStore.isSeller && pendingCount > 0"
          class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
          {{ pendingCount }}
        </span>

        <!-- 買家：配送中通知 -->
        <span v-if="userStore.isUser && shippedCount > 0"
          class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
          {{ shippedCount }}
        </span> 
      </router-link>

      <router-link to="/submitReview">📝 評價商品</router-link>
      <router-link v-if="userStore.isSeller" to="/seller-setting">⚙️
        賣家設定</router-link>
      <router-link v-if="userStore.isSeller" to="/revenue">⚙️
        營收表現</router-link>
      <router-link to="/cart">🛒 購物車</router-link>

      <!-- 使用者名稱下拉選單 -->
      <div v-if="userStore.username" class="user-dropdown">
        <button class="username-btn" @click="toggleUserMenu">
           {{ userStore.username }} <span class="dropdown-icon">▼</span>
        </button>
        <div class="user-dropdown-content" v-if="userMenuOpen">
          <router-link to="/memberCenter" @click="userMenuOpen = false">👤 會員中心</router-link>
          <router-link to="/shop/apply" 
        v-if="userStore.token && !userStore.roles.includes('SELLER')" @click="userMenuOpen = false">📝
        申請成為賣家</router-link>
          <div @click="logout" class="dropdown-item">登出</div>
        </div>
      </div>

      <span v-if="userStore.username" @click="logoutToAdmin"
        class="logout-link admin-logout">
        <a class="fa-solid fa-arrow-right-from-bracket"></a> 🔐 前往後台
      </span>
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
            <router-link to="/shop?category=clothing" @click="toggleDrawer">👕
              衣服</router-link>
          </li>
          <li>
            <router-link to="/shop?category=electronics" @click="toggleDrawer">📱 電子產品</router-link>
          </li>
          <li>
            <router-link to="/shop?category=home" @click="toggleDrawer">🏠
              家用品</router-link>
          </li>
          <li>
            <router-link to="/shop?category=others" @click="toggleDrawer">🔹
              其他</router-link>
          </li>
        </ul>
      </li>
      <li>
        <router-link to="/discounts" @click="toggleDrawer">💰 優惠專區</router-link>
      </li>
      <li>
        <router-link to="/notifications" @click="toggleDrawer">🔔
          通知</router-link>
      </li>
      <li>
<<<<<<< HEAD
        <router-link to="/customerService" @click="toggleDrawer">📞 客服 &
=======
        <router-link to="/helpCenter" @click="toggleDrawer">📞 客服 &
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
          幫助中心</router-link>
      </li>
      <li>
        <router-link to="/address" @click="toggleDrawer">📍 地址管理</router-link>
      </li>
      <li>
        <router-link to="/payment-methods" @click="toggleDrawer">💳
          付款方式</router-link>
      </li>
      <li>
        <router-link to="/privacy" @click="toggleDrawer">📜 隱私政策 &
          使用者條款</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";
import router from "@/router/index";
import axios from "@/plugins/axios";

const userStore = useUserStore();
const drawerOpen = ref(false);
const categoryOpen = ref(false);
const userMenuOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const toggleCategory = () => {
  categoryOpen.value = !categoryOpen.value;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

// 點擊其他地方關閉使用者選單
const handleClickOutside = (event) => {
  const userDropdown = document.querySelector('.user-dropdown');
  if (userDropdown && !userDropdown.contains(event.target) && userMenuOpen.value) {
    userMenuOpen.value = false;
  }
};

// 監聽全局點擊事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (userStore.token) {
    fetchNotificationCount(); // 回傳通知列
  }
});

// 清理事件監聽器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const pendingCount = ref(0); // 賣家通知數
const shippedCount = ref(0); // 買家通知數

// ✅ 通知角標查詢
const fetchNotificationCount = async () => {
  if (!userStore.token) return;

  try {
    if (userStore.isSeller) {
      const res = await axios.get(
        `/api/orders/notification/pending-count/seller`
      );
      pendingCount.value = res.data;
    } else if (userStore.isUser) {
      const res = await axios.get(
        `/api/orders/notification/shipped-count/user`
      );
      shippedCount.value = res.data;
    }
  } catch (err) {
    console.error("🔴 無法取得訂單通知數量", err);
  }
};

// ✅ 登出功能
async function logout() {
  axios.defaults.headers.common["Authorization"] = ``;
  userStore.clearUserData();
  userMenuOpen.value = false; // 關閉下拉選單
  const response = await Swal.fire({
    title: "您已成功登出",
    icon: "success",
    confirmButtonText: "OK",
  });
  if (response.isConfirmed) {
    router.push("/shop");
  }
}

// ✅ 登出並跳轉至後台登入頁
async function logoutToAdmin() {
  axios.defaults.headers.common["Authorization"] = ``;
  userStore.clearUserData();
  userMenuOpen.value = false; // 關閉下拉選單
  const response = await Swal.fire({
    title: "已登出前台",
    text: "正在前往後台登入頁面",
    icon: "success",
    confirmButtonText: "OK",
  });
  if (response.isConfirmed) {
    window.location.href = "/admin/login";
  }
}

// 當通知元件點擊時，導向相應聊天室頁面
const handleNotificationClick = (chatRoomId) => {
  console.log("即將導向聊天室：", chatRoomId);
  router.push(`/chat/${chatRoomId}`);
};
</script>

<style scoped>
/* 📌 Navbar 樣式 */
.navbar {
  width: 100vw;
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

.title>a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.menu-btn {
  background: #ff9b20;
}

.nav-icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.nav-icons a {
  color: #000;
  text-decoration: none;
  font-size: 16px;
}

.nav-icons a:hover {
  text-decoration: underline;
}

/* 使用者下拉選單樣式 */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.username-btn {
  background-color: #f7e9d2;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dropdown-icon {
  font-size: 10px;
}

.user-dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1001;
  border-radius: 4px;
  margin-top: 5px;
}

.user-dropdown-content a,
.user-dropdown-content .dropdown-item {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-size: 14px;
  border-bottom: 1px solid #f1f1f1;
}

.user-dropdown-content a:hover,
.user-dropdown-content .dropdown-item:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}

.user-dropdown-content .dropdown-item:last-child {
  border-bottom: none;
}

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

.logout-link {
  color: #000;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
}

.logout-link:hover {
  text-decoration: underline;
}

/* 後台登入按鈕樣式 */
.admin-logout {
  margin-left: 10px;
  font-weight: 500;
  color: #2c3e50;
}

.admin-link {
  cursor: pointer;
  color: #2c3e50;
  font-weight: 500;
}

.admin-link:hover {
  text-decoration: underline;
}

.badge {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  margin-left: 4px;
  font-size: 12px;
}
</style>