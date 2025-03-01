<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // 導頁功能

const router = useRouter();
const userName = ref("訪客");
const userEmail = ref("未登入");

onMounted(() => {
  // 從 localStorage 取得使用者資訊
  userName.value = localStorage.getItem("userName") || "訪客";
  userEmail.value = localStorage.getItem("userEmail") || "未登入";
});

// 登出方法
const logout = () => {
  localStorage.removeItem("jwtToken");  // 清除 JWT Token
  localStorage.removeItem("userEmail"); // 清除 Email
  localStorage.removeItem("userName");  // 清除使用者名稱

  userName.value = "訪客";
  userEmail.value = "未登入";

  router.push("/user/login"); // 導向登入頁面
};
</script>

<template>
  <main>
    首頁
    <div>
      <h1>歡迎, 會員:{{ userName }}</h1>
      <h1>Email: {{ userEmail }}</h1>
      <button @click="logout">登出</button>
    </div>
  </main>
</template>
