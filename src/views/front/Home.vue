<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("訪客");
const isLoggedIn = ref(false); // 新增判斷是否登入的變數


onMounted(() => {
  const token = sessionStorage.getItem("token"); // 檢查 token
  if (token) {
    isLoggedIn.value = true;
    username.value = sessionStorage.getItem("username") || "訪客";
  } else {
    isLoggedIn.value = false;
  }
});

// 登出方法
const logout = () => {
  isLoggedIn.value = false;
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("token");
  router.push("/");
};

// 導向登入頁面方法
const goToLogin = () => {
  router.push("/user/login");
};

const goToRegister = () => {
  router.push("/user/register");
};
</script>

<template>
  <main>
    首頁
    <div>
      <template v-if="isLoggedIn">
        <h1>歡迎, 會員:{{ username }}</h1>
        <button @click="logout">登出</button>
      </template>
      <template v-else>
        <button @click="goToLogin">登入</button>
        <button @click="goToRegister">註冊</button>
      </template>
    </div>
  </main>
</template>