<template>
    <nav class="navbar">
        <h1 class="title">後台管理系統</h1>
        <div class="navbar-right">
            <button class="icon-btn">🔔</button>
            <div class="dropdown">
                <button class="icon-btn">👤</button>
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
const router = useRouter();

const userStore=useUserStore();
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
