<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userName = ref("訪客");
const userEmail = ref("未登入");
const isLoggedIn = ref(false); // 新增判斷是否登入的變數

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

  userName.value = "訪客";
  userEmail.value = "未登入";
  isLoggedIn.value = false;

  router.push("/");
};

// 導向登入頁面方法
const goToLogin = () => {
  router.push("/user/login");
};
</script>

<template>
  <main>
    首頁
    <div>
      <template v-if="isLoggedIn">
        <h1>歡迎, 會員:{{ userName }}</h1>
        <h1>Email: {{ userEmail }}</h1>
        <button @click="logout">登出</button>
      </template>
      <template v-else>
        <button @click="goToLogin">登入</button>
      </template>
    </div>
  </main>
</template>