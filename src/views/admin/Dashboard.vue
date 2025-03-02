<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 定義變數
const userName = ref("訪客");
const userEmail = ref("未登入");
const isLoggedIn = ref(false);

const router = useRouter();

onMounted(() => {
  // 從 localStorage 取得使用者資訊
  const token = localStorage.getItem("jwtToken");
  if (token) {
    // 如果有 token，表示已登入
    userName.value = localStorage.getItem("userName") || "訪客";
    userEmail.value = localStorage.getItem("userEmail") || "未登入";
    isLoggedIn.value = true;
  } else {
    // 如果沒有 token，表示未登入
    isLoggedIn.value = false;
  }
});

// 登出方法
const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");

  isLoggedIn.value = false;

  router.push("/admin/login"); // 導向管理員登入頁面
};

// 導向登入頁面方法
const goToAdminLogin = () => {
  router.push("/admin/login");
};
</script>

<template>
  <main>
    <h1>首頁</h1>
    <div>
      <template v-if="isLoggedIn">
        <h2>歡迎, 管理員: {{ userName }}</h2>
        <h3>Email: {{ userEmail }}</h3>
        <button @click="logout">登出</button>
      </template>
      <template v-else>
        <button @click="goToAdminLogin">登入</button>
      </template>
    </div>
  </main>
</template>
