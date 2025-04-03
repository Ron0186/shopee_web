<template>
    <nav class="navbar">
        <h1 class="title">後台管理系統</h1>
        <div class="navbar-right">
            <button class="icon-btn">🔔</button>
            <button @click="logoutToFrontend" class="frontend-btn">
                <i class="fas fa-home"></i> 前往前台
            </button>
            <div class="dropdown">
                <button class="user-btn">
                    <span class="user-info">{{ username }} (id:{{ userId }})</span>
                    <span class="user-icon">👤</span>
                </button>
                <div class="dropdown-content">
                    <router-link to="/admin/profile">個人資料</router-link>
                    <router-link to="/admin/settings">設定</router-link>
                    <button @click="logout">登出</button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import Swal from 'sweetalert2';
import { useRouter } from "vue-router";
import { ref, onMounted } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const username = ref('');
const userId = ref('');

// 在組件掛載時從 localStorage 獲取用戶資訊
onMounted(() => {
    // 嘗試從 localStorage 獲取資訊
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    
    // 如果有資料，則設置到響應式變數中
    if (storedUsername) username.value = storedUsername;
    if (storedUserId) userId.value = storedUserId;
    
    // 如果 localStorage 中沒有資料，但 userStore 中有，則使用 userStore 中的數據
    if ((!storedUsername || !storedUserId) && userStore.userData) {
        if (!storedUsername && userStore.userData.username) {
            username.value = userStore.userData.username;
        }
        if (!storedUserId && userStore.userData.userId) {
            userId.value = userStore.userData.userId;
        }
    }
});

async function logout() {
    // 清除 pinia userStore
    userStore.clearUserData();
    
    // 清除 localStorage 中的用戶資訊
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
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
    
    // 清除 localStorage 中的用戶資訊
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
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
/* 🔹 固定 Navbar 在頂部 */
.navbar {
    width: calc(100% - 240px);
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #2c3e50;
    color: white;
    padding: 0 20px;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 240px;
    right: 0;
    z-index: 1001;
}

/* Sidebar 收合時的 Navbar 調整 */
.sidebar-collapsed .navbar {
    width: calc(100% - 60px);
    left: 60px;
}

/* 標題樣式 */
.title {
    font-size: 20px;
}

/* 右側內容 */
.navbar-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* 按鈕樣式 */
.icon-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

/* 使用者按鈕樣式 */
.user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    color: white;
    cursor: pointer;
    padding: 6px 12px;
    transition: all 0.3s ease;
}

.user-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-info {
    font-size: 14px;
    font-weight: 500;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.user-icon {
    font-size: 18px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    padding: 4px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 前往前台按鈕樣式 */
.frontend-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.frontend-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.frontend-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 下拉選單 */
.dropdown {
    position: relative;
}

.dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background: white;
    color: black;
    min-width: 150px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1002;
    border-radius: 5px;
    padding: 10px;
}

/* 下拉選單內容 */
.dropdown-content a,
.dropdown-content button {
    display: block;
    padding: 8px 10px;
    text-decoration: none;
    color: black;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
}

/* 下拉選單 hover 效果 */
.dropdown-content a:hover,
.dropdown-content button:hover {
    background: #f1f1f1;
}

/* 滑鼠懸停時顯示選單 */
.dropdown:hover .dropdown-content {
    display: block;
}
</style>