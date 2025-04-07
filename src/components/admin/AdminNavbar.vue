<template>
  <nav class="admin-navbar">
    <div class="navbar-left">
      <h1 class="navbar-title">後台管理系統</h1>
    </div>
    <div class="navbar-right">
      <button @click="logoutToFrontend" class="frontend-btn">
        <i class="fas fa-home"></i>
        <span>前往前台</span>
      </button>
      
      <div class="user-dropdown" ref="dropdownRef">
        <button class="user-btn" @click="toggleDropdown">
          <div class="user-avatar">
            <img 
              :src="userProfilePhoto" 
              alt="Admin" 
              class="avatar-img"
              @error="handleImageError" 
            />
          </div>
          <div class="user-info">
            <div class="user-name">{{ username }}</div>
            <div class="user-role">ID: {{ userId }}</div>
          </div>
          <i class="fas dropdown-icon" :class="dropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
        
        <div class="dropdown-menu" :class="{ 'show': dropdownOpen }">
          <router-link to="/admin/profile" class="dropdown-item" @click="closeDropdown">
            <i class="fas fa-id-card"></i>
            <span>個人資料</span>
          </router-link>
          <router-link to="/admin/settings" class="dropdown-item" @click="closeDropdown">
            <i class="fas fa-cog"></i>
            <span>帳號設定</span>
          </router-link>
          <div class="dropdown-divider"></div>
          <button @click="logout" class="dropdown-item logout-item">
            <i class="fas fa-sign-out-alt"></i>
            <span>登出系統</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import Swal from 'sweetalert2';
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const username = ref('');
const userId = ref('');
const dropdownOpen = ref(false);
const dropdownRef = ref(null);
const defaultImage = ref('/uploads/AdminDefault.png');
const useDefaultImage = ref(false);

// 計算屬性：獲取用戶頭像的完整URL
const userProfilePhoto = computed(() => {
  if (useDefaultImage.value) {
    return defaultImage.value;
  }
  
  // 優先使用 store 中的 getProfilePhoto computed
  if (userStore.getProfilePhoto) {
    // 檢查 getProfilePhoto 是否返回預設頭像，如果是，則使用管理員專用預設頭像
    const storePhoto = userStore.getProfilePhoto;
    if (storePhoto.includes('default.jpg')) {
      return defaultImage.value;
    }
    return storePhoto;
  }
  
  // 否則從 profilePhoto 構建 URL
  const profilePhoto = userStore.profilePhoto || localStorage.getItem('profilePhoto');
  if (!profilePhoto) {
    return defaultImage.value;
  }
  
  // 如果已經是完整 URL，則直接返回
  if (profilePhoto.startsWith('http')) {
    return profilePhoto;
  }
  
  // 否則加上 API URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
  return `${baseUrl}${profilePhoto}`;
});

// 處理圖片載入錯誤
function handleImageError() {
  useDefaultImage.value = true;
}

// 在組件掛載時從 localStorage 獲取用戶資訊
onMounted(() => {
  // 嘗試從 localStorage 獲取資訊
  const storedUsername = localStorage.getItem('username');
  const storedUserId = localStorage.getItem('userId');
  
  // 如果有資料，則設置到響應式變數中
  if (storedUsername) username.value = storedUsername;
  if (storedUserId) userId.value = storedUserId;
  
  // 優先使用 userStore 中的數據（如果有）
  if (userStore.username) username.value = userStore.username;
  if (userStore.userId) userId.value = userStore.userId;

  // 添加全局點擊事件監聽器
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // 移除事件監聽器
  document.removeEventListener('click', handleClickOutside);
});

// 切換下拉菜單狀態
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// 關閉下拉菜單
const closeDropdown = () => {
  dropdownOpen.value = false;
};

// 處理點擊外部元素關閉下拉菜單
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

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

// 登出並跳轉到前台登入頁的函數
async function logoutToFrontend() {
  // 清除 pinia userStore
  userStore.clearUserData();
  
  await Swal.fire({
    title: "已登出後台",
    text: "正在前往前台登入頁面",
    icon: "success",
    confirmButtonText: "OK",
  });
  
  // 跳轉到前台登入頁
  window.location.href = "/user/login";
}
</script>

<style scoped>
.admin-navbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2c3e50;
  color: white;
  padding: 0 25px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  border-bottom: 2px solid #3498db; /* 添加底部邊框作為分隔 */
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 前往前台按鈕 */
.frontend-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(52, 152, 219, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.frontend-btn:hover {
  background-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.frontend-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 用戶下拉菜單 */
.user-dropdown {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f1f1f1;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 5px;
  transition: transform 0.2s;
}

/* 下拉菜單 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 6px;
  width: 200px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: none;
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 14px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f7f9fc;
}

.dropdown-item i {
  font-size: 14px;
  width: 16px;
  text-align: center;
  color: #666;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
}

.logout-item {
  color: #e74c3c;
}

.logout-item i {
  color: #e74c3c;
}

.logout-item:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .admin-navbar {
    padding: 0 15px;
  }
  
  .navbar-title {
    font-size: 16px;
  }
  
  .frontend-btn span {
    display: none;
  }
  
  .frontend-btn {
    padding: 8px;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
  
  .user-info {
    display: none;
  }
  
  .user-btn {
    padding: 6px;
  }
  
  .dropdown-icon {
    display: none;
  }
}
</style>