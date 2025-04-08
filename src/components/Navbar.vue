<template>
  <nav class="navbar">
    <!-- 漢堡選單按鈕 -->
    <button class="menu-btn btn" @click="toggleDrawer">☰</button>

    <!-- 回首頁 -->
    <h1 class="title" style="margin: 0; position: relative; text-align: center; display: flex; align-items: center; justify-content: center;">
  <router-link to="/shop" style="color: #404040; text-decoration: none; font-weight: 700; font-size: 1.8rem; letter-spacing: 1px; transition: all 0.3s ease; display: flex; align-items: center; padding: 0.2rem 0.6rem; border-radius: 8px;">
    <!-- 直接內嵌SVG以確保它能顯示並控制大小 -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="width: 65px; height: 65px; margin-right: 15px;">


<!-- 購物車主體 -->
      <path d="M20 30 L35 30 L50 75 L85 75 L95 40 L40 40" fill="none" stroke="#ff9b20" stroke-width="8" stroke-linejoin="round" />
      
      <!-- 購物車輪子 -->
      <circle cx="45" cy="90" r="10" fill="#ffad4d" stroke="#ff9b20" stroke-width="3" />
      <circle cx="45" cy="90" r="4" fill="#ff9b20" />
      
      <circle cx="80" cy="90" r="10" fill="#ffad4d" stroke="#ff9b20" stroke-width="3" />
      <circle cx="80" cy="90" r="4" fill="#ff9b20" />
      
      <!-- 購物車中的物品 -->
      <rect x="55" y="45" width="15" height="20" rx="2" fill="#ffad4d" />
      <rect x="65" y="50" width="10" height="15" rx="2" fill="#ffad4d" />
      
      <!-- 閃亮效果 -->
      <circle cx="85" cy="45" r="5" fill="white" opacity="0.7" />
    </svg>
    購了沒
  </router-link>
</h1>

    <!-- 會員中心按鈕 -->
    <div class="nav-icons">
      <router-link to="/shop" class="nav-link">
        <span class="nav-icon">👕</span>
        <span class="nav-text">商品總覽</span>
      </router-link>

      <router-link :to="{ name: 'ShopListPage' }" class="nav-link">
        <span class="nav-icon">🏬</span>
        <span class="nav-text">商店總覽</span>
      </router-link>
      <!-- 主要導航按鈕 - 精簡了導航選項 -->
      <router-link to="/cart" class="nav-link">
        <span class="nav-icon">🛒</span>
        <span class="nav-text">購物車</span>
      </router-link>

      <!-- 使用者名稱下拉選單 (優化頭像) -->
      <div v-if="userStore.username" class="user-dropdown">
        <button class="username-btn" @click="toggleUserMenu">
          <img
            :src="userStore.getProfilePhoto"
            class="user-avatar"
            alt="用戶頭像"
          />
          <span class="username-text">{{ userStore.username }}</span>
          <span class="dropdown-icon" :class="{ rotate: userMenuOpen }">▼</span>
        </button>
        <div class="user-dropdown-content" v-if="userMenuOpen">
          <router-link
            to="/memberCenter"
            @click="userMenuOpen = false"
            class="dropdown-item"
          >
            <img
              :src="userStore.getProfilePhoto"
              class="menu-avatar"
              alt="用戶頭像"
            />
            <span>會員中心</span>
          </router-link>

          <!-- 📦 訂單管理 + 通知角標 -->
          <router-link
            v-if="userStore.username"
            :to="userStore.isSeller ? '/seller/orders' : '/user/orders'"
            class="dropdown-item position-relative"
            @click="userMenuOpen = false"
          >
            <span class="dropdown-icon-left">📦</span>
            <span>訂單管理</span>
            <!-- 賣家：待處理訂單通知 -->
            <span
              v-if="userStore.isSeller && pendingCount > 0"
              class="badge bg-danger rounded-pill notification-badge"
            >
              {{ pendingCount }}
            </span>
            <!-- 買家：配送中通知 -->
            <span
              v-if="userStore.isUser && shippedCount > 0"
              class="badge bg-danger rounded-pill notification-badge"
            >
              {{ shippedCount }}
            </span>
          </router-link>

          <!-- 賣家專屬選項群組 -->
          <div v-if="userStore.isSeller" class="dropdown-group">
            <div class="dropdown-group-title">賣家功能</div>
            <router-link
              :to="'/store/' + userStore.shopId"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              <span class="dropdown-icon-left">🏪</span>
              <span>賣家中心</span>
            </router-link>
            <router-link
              to="/seller-setting"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              <span class="dropdown-icon-left">⚙️</span>
              <span>賣家設定</span>
            </router-link>
            <router-link
              to="/revenue"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              <span class="dropdown-icon-left">📊</span>
              <span>營收表現</span>
            </router-link>
            <router-link
              to="/seller/coupon/apply"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              <span class="dropdown-icon-left">🎟️</span>
              <span>優惠券申請</span>
            </router-link>
          </div>

          <!-- 一般功能選項 -->
          <router-link
            to="/submitReview"
            class="dropdown-item"
            @click="userMenuOpen = false"
          >
            <span class="dropdown-icon-left">📝</span>
            <span>評價商品</span>
          </router-link>

          <router-link
            to="/shop/apply"
            v-if="userStore.token && !userStore.roles.includes('SELLER')"
            class="dropdown-item"
            @click="userMenuOpen = false"
          >
            <span class="dropdown-icon-left">🈸</span>
            <span>申請成為賣家</span>
          </router-link>

          <div @click="logout" class="dropdown-item">
            <span class="dropdown-icon-left">🚪</span>
            <span>登出</span>
          </div>
        </div>
      </div>

      <!-- 未登入用戶顯示登入/註冊按鈕 -->
      <div v-if="!userStore.username" class="auth-buttons">
        <router-link to="/user/login" class="btn login-btn">
          <span>🔑 登入</span>
        </router-link>
        <router-link to="/user/register" class="btn register-btn">
          <span>📝 註冊</span>
        </router-link>
      </div>
    </div>
  </nav>

  <!-- 📌 漢堡選單 -->
  <div class="sidebar" :class="{ open: drawerOpen }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">MyShop</h2>
      <button class="close-btn" @click="toggleDrawer">✖</button>
    </div>

    <ul class="sidebar-menu">
      <li v-if="userStore.username" class="sidebar-user-info">
        <img
          :src="userStore.getProfilePhoto"
          class="sidebar-avatar"
          alt="用戶頭像"
        />
        <span>{{ userStore.username }}</span>
      </li>

      <li class="sidebar-item">
        <router-link to="/" @click="toggleDrawer" class="sidebar-link">
          <span class="sidebar-icon">🏠</span>
          <span>首頁</span>
        </router-link>
      </li>

      <li class="sidebar-item dropdown">
        <button @click="toggleCategory" class="sidebar-link dropdown-toggle">
          <span class="sidebar-icon">🛍</span>
          <span>商城分類</span>
          <span class="dropdown-arrow" :class="{ rotate: categoryOpen }"
            >▼</span
          >
        </button>
        <ul v-if="categoryOpen" class="dropdown-menu">
          <li class="dropdown-item">
            <router-link
              to="/shop?category=clothing"
              @click="toggleDrawer"
              class="category-link"
            >
              <span class="category-icon">👕</span>
              <span>衣服</span>
            </router-link>
          </li>
          <li class="dropdown-item">
            <router-link
              to="/shop?category=electronics"
              @click="toggleDrawer"
              class="category-link"
            >
              <span class="category-icon">📱</span>
              <span>電子產品</span>
            </router-link>
          </li>
          <li class="dropdown-item">
            <router-link
              to="/shop?category=home"
              @click="toggleDrawer"
              class="category-link"
            >
              <span class="category-icon">🏠</span>
              <span>家用品</span>
            </router-link>
          </li>
          <li class="dropdown-item">
            <router-link
              to="/shop?category=others"
              @click="toggleDrawer"
              class="category-link"
            >
              <span class="category-icon">🔹</span>
              <span>其他</span>
            </router-link>
          </li>
        </ul>
      </li>

      <li class="sidebar-item">
        <router-link to="/discounts" @click="toggleDrawer" class="sidebar-link">
          <span class="sidebar-icon">💰</span>
          <span>優惠專區</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link
          to="/notifications"
          @click="toggleDrawer"
          class="sidebar-link"
        >
          <span class="sidebar-icon">🔔</span>
          <span>通知</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link
          to="/helpCenter"
          @click="toggleDrawer"
          class="sidebar-link"
        >
          <span class="sidebar-icon">📞</span>
          <span>客服 & 幫助中心</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link to="/address" @click="toggleDrawer" class="sidebar-link">
          <span class="sidebar-icon">📍</span>
          <span>地址管理</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link
          to="/payment-methods"
          @click="toggleDrawer"
          class="sidebar-link"
        >
          <span class="sidebar-icon">💳</span>
          <span>付款方式</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link to="/privacy" @click="toggleDrawer" class="sidebar-link">
          <span class="sidebar-icon">📜</span>
          <span>隱私政策 & 使用者條款</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <router-link
          :to="{ name: 'ShopListPage' }"
          @click="toggleDrawer"
          class="sidebar-link shop-list-link"
        >
          <span class="sidebar-icon">🏬</span>
          <span>查看商店列表</span>
        </router-link>
      </li>

      <li class="sidebar-item">
        <div @click="logoutToAdmin" class="sidebar-link admin-link">
          <span class="sidebar-icon">🔐</span>
          <span>後台入口</span>
        </div>
      </li>
    </ul>
  </div>

  <!-- 背景遮罩，點擊時關閉側邊欄 -->
  <div v-if="drawerOpen" class="sidebar-backdrop" @click="toggleDrawer"></div>
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

  // 打開側邊欄時鎖定背景滾動
  if (drawerOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const toggleCategory = () => {
  categoryOpen.value = !categoryOpen.value;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

// 點擊其他地方關閉使用者選單
const handleClickOutside = (event) => {
  const userDropdown = document.querySelector(".user-dropdown");
  if (
    userDropdown &&
    !userDropdown.contains(event.target) &&
    userMenuOpen.value
  ) {
    userMenuOpen.value = false;
  }
};

// 監聽全局點擊事件
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  if (userStore.token) {
    fetchNotificationCount(); // 回傳通知列
  }

  // 添加ESC鍵監聽，按ESC關閉側邊欄
  document.addEventListener("keydown", handleKeyDown);
});

// 清理事件監聽器
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
  document.body.style.overflow = ""; // 恢復滾動
});

// 處理ESC鍵關閉側邊欄
const handleKeyDown = (e) => {
  if (e.key === "Escape" && drawerOpen.value) {
    toggleDrawer();
  }
};

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
  userStore.logout();
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
</script>

<style scoped>
/* ===== 基本樣式 ===== */
* {
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* ===== Navbar 樣式 ===== */
.navbar {
  width: 100%;
  max-width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7e9d2;
  color: #000;
  padding: 0 1.25rem;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
}

.title {
  margin: 0;
  position: relative;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem; /* 增大字體 */

}

.title > a {
  color: #404040;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.6rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.title > a:hover {
  transform: scale(1.05);
  color: #ff9b20;
}
.title svg {
  margin-right: 8px !important; /* 將間距從15px減少到8px */
  vertical-align: middle !important;
}

.title > a:hover .site-logo {
  transform: scale(1.1) rotate(-5deg);
}
.menu-btn {
  padding: 0.4rem 0.7rem;
  background: #ff9b20;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background: #e88c17;
}

.nav-icons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #000;
  text-decoration: none;
  font-size: 1rem;
  gap: 0.3rem;
  position: relative;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(255, 155, 32, 0.1);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.2rem;
}

/* ===== 使用者下拉選單樣式 ===== */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.username-btn {
  background-color: transparent;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.7rem;
  color: #000000;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color 0.2s;
}

.username-btn:hover {
  background-color: rgba(255, 155, 32, 0.1);
}

.dropdown-icon {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: auto;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.user-dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  min-width: 200px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  border-radius: 6px;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  overflow: hidden;
  transform-origin: top right;
  animation: dropdownFade 0.2s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-dropdown-content .dropdown-item {
  color: black;
  padding: 0.75rem 1rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.user-dropdown-content .dropdown-item:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.dropdown-group {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 0.3rem 0;
  margin: 0.3rem 0;
}

.dropdown-group-title {
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.dropdown-icon-left {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

/* ===== 登入註冊按鈕 ===== */
.auth-buttons {
  display: flex;
}

.login-btn,
.register-btn {
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  min-width: 5rem;
}

.login-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  background-color: #ff9b20;
  color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(255, 155, 32, 0.3);
  min-width: 6rem;
}

.login-btn:hover {
  background-color: #f08c11;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 155, 32, 0.4);
}
/* 隱藏註冊按鈕 */
.register-btn {
  display: none;
}

.register-btn:hover {
  background-color: #f08c11;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 155, 32, 0.4);
}

/* ===== 後台入口按鈕 ===== */
.admin-link {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-weight: 500;
  gap: 0.3rem;
  transition: all 0.2s;
}

.admin-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* ===== 通知徽章 ===== */
.notification-badge {
  position: absolute;
  top: 0;
  right: 0.8rem;
  background-color: #ff3b30;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
}

/* ===== 頭像樣式 ===== */
.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff9b20;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.menu-avatar {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ff9b20;
}

.sidebar-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff9b20;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* ===== 側邊欄樣式 ===== */
.sidebar {
  position: fixed;
  left: -280px;
  top: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  color: #000;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  overflow-y: auto;
}

.sidebar.open {
  left: 0;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  animation: backdropFade 0.3s ease;
}

@keyframes backdropFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #eee;
}

.sidebar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ff9b20;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.sidebar-menu {
  list-style: none;
  padding: 0.8rem 0;
  margin: 0;
}

.sidebar-user-info {
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  gap: 0.8rem;
}

.sidebar-item {
  padding: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  gap: 0.7rem;
}

.sidebar-link:hover {
  background-color: #f7f7f7;
}

.sidebar-icon {
  font-size: 1.2rem;
  width: 1.5rem;
  display: flex;
  justify-content: center;
}

.dropdown-menu {
  list-style: none;
  padding: 0.2rem 0;
  margin: 0;
  background-color: #f9f9f9;
}

.dropdown-toggle {
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.category-link {
  display: flex;
  align-items: center;
  padding: 0.7rem 1.2rem 0.7rem 3.4rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  gap: 0.5rem;
}

.category-link:hover {
  background-color: #f0f0f0;
}

.shop-list-link {
  margin-top: 0.8rem;
  color: #ff9b20;
  font-weight: 500;
}

.category-icon {
  font-size: 1rem;
}

/* ===== 響應式設計 ===== */
@media (max-width: 768px) {
  .navbar {
    padding: 0 0.8rem;
  }

  .nav-text,
  .admin-text,
  .username-text {
    display: none;
  }

  .user-avatar {
    width: 2.2rem;
    height: 2.2rem;
  }

  .nav-icons {
    gap: 0.5rem;
  }

  .username-btn {
    padding: 0.4rem;
  }

  .login-btn,
  .register-btn {
    padding: 0.5rem 0.8rem;
  }

  .sidebar {
    width: 260px;
    left: -260px;
  }
}

@media (min-width: 992px) {
  .navbar {
    padding: 0 2rem;
  }
  .title > a {
    font-size: 1.4rem;
  }
  
  .site-logo {
    width: 28px;
    height: 28px;
  }
}
</style>
