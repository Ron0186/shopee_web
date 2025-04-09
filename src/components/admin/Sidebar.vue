<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";
import { ref, computed, onMounted, watch } from "vue";

const router = useRouter(); // Vue Router 實例
const userStore = useUserStore();

// 控制折疊狀態
const expandedSections = ref({
  analytics: false,
  products: false,
  users: false,
  settings: false,
  dashboard: false,
  orders: false,
  coupons: false,
});

// 檢查當前路由是否匹配
const isRouteActive = (route) => {
  return router.currentRoute.value.path === route;
};

// 檢查當前 section 是否是活動的
const isSectionActive = computed(() => {
  const path = router.currentRoute.value.path;

  return {
    dashboard: path.includes("/admin/profile"),
    orders:
      path.includes("/admin/orders") ||
      path.includes("/admin/integrated-management"),
    products:
      path.includes("/admin/product-review") ||
      path.includes("/admin/category-management") ||
      path.includes("/admin/shop/review") ||
      path.includes("/admin/reviews"),
    users:
      path.includes("/admin/users") || path.includes("/admin/administrators"),
    coupons: path.includes("/coupon/adminCouponManager"),
    analytics: path.includes("/admin/analytics"),
    settings: path.includes("/admin/settings"),
  };
});

// 根據當前路由自動展開相應的 section
onMounted(() => {
  updateExpandedSectionsBasedOnRoute();
});

watch(
  () => router.currentRoute.value.path,
  () => {
    updateExpandedSectionsBasedOnRoute();
  }
);

// 根據當前路由自動更新展開狀態
function updateExpandedSectionsBasedOnRoute() {
  for (const [section, isActive] of Object.entries(isSectionActive.value)) {
    if (isActive) {
      expandedSections.value[section] = true;
    }
  }
}

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// 檢查用戶是否有特定權限
const hasPermission = (role) => {
  return (
    userStore.roles.includes(role) || userStore.roles.includes("SUPER_ADMIN")
  );
};

// 檢查用戶是否有一組權限中的任一權限
const hasAnyPermission = (roles) => {
  return (
    roles.some((role) => userStore.roles.includes(role)) ||
    userStore.roles.includes("SUPER_ADMIN")
  );
};

// 判斷是否應顯示用戶管理區塊
const showUsersSection = computed(() => {
  return hasAnyPermission(["ACCOUNT_MANAGER"]);
});

// 判斷是否應顯示產品管理區塊
const showProductsSection = computed(() => {
  return hasAnyPermission(["PRODUCT_MANAGER"]);
});

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

// 從 Navbar 移植的前往前台功能
async function logoutToFrontend() {
  const response = await Swal.fire({
    title: "已登出後台",
    text: "正在前往前台登入頁面",
    icon: "success",
    confirmButtonText: "OK",
  });

  if (response.isConfirmed) {
    // 清除 pinia userStore
    userStore.clearUserData();
    // 跳轉到前台登入頁
    window.location.href = "/user/login";
  }
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 儀表板/個人資料折疊區 -->
      <div class="section">
        <div
          class="section-header"
          @click="toggleSection('dashboard')"
          :class="{ 'active-section': isSectionActive.dashboard }"
        >
          <div class="header-content">
            <i class="bi bi-speedometer2"></i>
            <span>儀表板管理</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.dashboard
                ? 'bi-chevron-down'
                : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.dashboard">
          <router-link
            to="/admin/profile"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/profile') }"
          >
            <i class="bi bi-person-badge"></i>
            <span>個人資料</span>
          </router-link>
        </div>
      </div>

      <!-- 訂單管理與物流支付系統折疊區 -->
      <div class="section">
        <div
          class="section-header"
          @click="toggleSection('orders')"
          :class="{ 'active-section': isSectionActive.orders }"
        >
          <div class="header-content">
            <i class="bi bi-cart"></i>
            <span>訂單與物流管理</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.orders ? 'bi-chevron-down' : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.orders">
          <router-link
            to="/admin/orders"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/orders') }"
          >
            <i class="bi bi-cart"></i>
            <span>訂單管理</span>
          </router-link>
          <router-link
            to="/admin/integrated-management"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/integrated-management') }"
          >
            <i class="bi bi-truck"></i>
            <span>物流/支付系統</span>
          </router-link>
        </div>
      </div>

      <!-- 產品管理折疊區 -->
      <div class="section">
        <div class="section-header" @click="toggleSection('products')">
          <div class="header-content">
            <i class="bi bi-box"></i>
            <span>產品管理</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.products ? 'bi-chevron-down' : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.products">
          <router-link
            to="/admin/product-review"
            class="nav-subitem"
            v-if="hasPermission('PRODUCT_MANAGER')"
            :class="{ active: isRouteActive('/admin/product-review') }"
          >
            <i class="bi bi-clipboard-check"></i>
            <span>商品審核</span>
          </router-link>
          <router-link
            to="/admin/category-management"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/category-management') }"
          >
            <i class="bi bi-tags"></i>
            <span>商品分類</span>
          </router-link>
          <router-link
            to="/admin/shop/review"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/shop/review') }"
          >
            <i class="bi bi-shop"></i>
            <span>商店申請審核</span>
          </router-link>
          <router-link
            to="/admin/reviews"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/reviews') }"
          >
            <i class="bi bi-star"></i>
            <span>評價管理</span>
          </router-link>
        </div>
      </div>

      <!-- 用戶管理折疊區 (只有 ACCOUNT_MANAGER 或 SUPER_ADMIN 可見) -->
      <div class="section" v-if="showUsersSection">
        <div
          class="section-header"
          @click="toggleSection('users')"
          :class="{ 'active-section': isSectionActive.users }"
        >
          <div class="header-content">
            <i class="bi bi-people"></i>
            <span>用戶管理</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.users ? 'bi-chevron-down' : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.users">
          <router-link
            to="/admin/users"
            class="nav-subitem"
            v-if="hasPermission('ACCOUNT_MANAGER')"
            :class="{ active: isRouteActive('/admin/users') }"
          >
            <i class="bi bi-person"></i>
            <span>會員管理</span>
          </router-link>
          <router-link
            to="/admin/administrators"
            class="nav-subitem"
            :class="{ active: isRouteActive('/admin/administrators') }"
            v-if="userStore.roles.includes('SUPER_ADMIN')"
          >
            <i class="bi bi-person-badge-fill"></i>
            <span>管理員管理</span>
          </router-link>
        </div>
      </div>

      <!-- 優惠券下拉選單 -->
      <div class="section">
        <div
          class="section-header"
          @click="toggleSection('coupons')"
          :class="{ 'active-section': isSectionActive.coupons }"
        >
          <div class="header-content">
            <i class="bi bi-ticket"></i>
            <span>優惠券</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.coupons ? 'bi-chevron-down' : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.coupons">
          <router-link
            to="/coupon/adminCouponManager"
            class="nav-subitem"
            :class="{ active: isRouteActive('/coupon/adminCouponManager') }"
          >
            <i class="bi bi-ticket"></i>
            <span>優惠券管理</span>
          </router-link>
        </div>
      </div>

      <!-- 數據分析折疊區 -->
      <div class="section">
        <div
          class="section-header"
          @click="toggleSection('analytics')"
          :class="{ 'active-section': isSectionActive.analytics }"
        >
          <div class="header-content">
            <i class="bi bi-graph-up"></i>
            <span>數據分析</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.analytics
                ? 'bi-chevron-down'
                : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.analytics">
          <router-link
            to="/admin/analytics/user-analytics"
            class="nav-subitem"
            :class="{
              active: isRouteActive('/admin/analytics/user-analytics'),
            }"
          >
            <i class="bi bi-people"></i>
            <span>用戶分析</span>
          </router-link>
        </div>
      </div>

      <!-- 設定折疊區 -->
      <div class="section">
        <div
          class="section-header"
          @click="toggleSection('settings')"
          :class="{ 'active-section': isSectionActive.settings }"
        >
          <div class="header-content">
            <i class="bi bi-gear"></i>
            <span>系統設定</span>
          </div>
          <i
            class="bi"
            :class="
              expandedSections.settings ? 'bi-chevron-down' : 'bi-chevron-right'
            "
          ></i>
        </div>
        <div class="section-content" v-show="expandedSections.settings">
          <router-link to="/admin/settings" class="nav-subitem">
            <i class="bi bi-sliders"></i>
            <span>一般設定</span>
          </router-link>
          <router-link to="/admin/settings/platform" class="nav-subitem">
            <i class="bi bi-tools"></i>
            <span>平台設定</span>
          </router-link>
        </div>
      </div>

      <!-- 新增: 從 Navbar 移植的前往前台按鈕 -->
      <button @click="logoutToFrontend" class="frontend-btn">
        <i class="icon fas fa-home"></i>
        <span>前往前台</span>
      </button>

      <!-- 登出按鈕 -->
      <button @click="logout" class="logout-btn">
        <i class="bi bi-box-arrow-right"></i>
        <span>登出系統</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 260px;
  height: 100vh;
  background: linear-gradient(to bottom, #2c3e50, #1a252f);
  color: white;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.sidebar-content {
  padding: 15px 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 10px;
}

.nav-item,
.nav-subitem {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  font-size: 14px;
  margin: 2px 0;
  /* text-align: left; */
}

.nav-subitem {
  gap: 6px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  font-size: 14px;
  margin: 2px 0;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.15);
  margin-bottom: 2px;
}

/* 活動的 section header 樣式 */
.section-header.active-section {
  background: rgba(52, 152, 219, 0.25);
  color: white;
  font-weight: 500;
  border-left: 4px solid #3498db;
  padding-left: 11px; /* 15px - 4px border */
}

.header-content {
  display: flex;
  align-items: center;
  justify-items: flex-start;
  gap: 6px;
}

.nav-item:hover,
.section-header:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active,
.nav-subitem.active {
  background: rgba(52, 152, 219, 0.25);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-item.active::before,
.nav-subitem.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #3498db;
  border-radius: 0 3px 3px 0;
}

.section {
  margin: 5px 0;
}

.section-content {
  display: flex;
  flex-direction: column;
  padding-left: 15px;
  gap: 2px;
}

.nav-subitem {
  padding: 10px 15px;
  margin-left: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.nav-subitem:hover {
  background: rgba(255, 255, 255, 0.07);
  color: white;
}

.icon {
  margin-right: 12px;
  width: 18px;
  text-align: center;
  font-size: 14px;
  opacity: 0.9;
}

/* 前往前台按鈕樣式 - 整合進 Sidebar */
/* 前往前台按鈕樣式 - 整合進 Sidebar，使用橘色 */
.frontend-btn {
  margin-top: 10px;
  background: rgba(243, 156, 18, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
  font-weight: 500;
}

.frontend-btn:hover {
  background: rgba(243, 156, 18, 0.3);
  color: white;
}

.frontend-btn:active {
  transform: translateY(1px);
}

/* 登出按鈕 */
.logout-btn {
  margin-top: 10px;
  background: rgba(231, 76, 60, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
  gap: 6px;
}
.logout-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  color: white;
}

/* 自定義滾動條 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .sidebar {
    min-width: 70px;
    overflow: visible;
  }

  .sidebar-content {
    padding: 15px 5px;
  }

  .nav-item span,
  .section-header .header-content span,
  .nav-subitem span,
  .logout-btn span,
  .frontend-btn span {
    display: none;
  }

  .icon {
    margin-right: 0;
    font-size: 18px;
  }

  .nav-item,
  .logout-btn,
  .frontend-btn {
    justify-content: center;
    padding: 15px 0;
  }

  .section-header {
    justify-content: center;
    padding: 15px 0;
  }

  /* 活動的 section header 在小螢幕時的樣式調整 */
  .section-header.active-section {
    padding-left: 0;
    border-left: none;
    border-bottom: 3px solid #3498db;
  }

  .section-header .fas {
    display: none;
  }

  .section-content {
    position: absolute;
    left: 70px;
    top: 0;
    background: #2c3e50;
    border-radius: 0 6px 6px 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.2);
    min-width: 180px;
    padding: 10px;
    z-index: 20;
  }

  .section-header:hover + .section-content,
  .section-content:hover {
    display: flex !important;
  }

  .section-content .nav-subitem {
    margin-left: 0;
    text-align: left;
  }

  .section-content .nav-subitem span {
    display: block;
  }
}
</style>
