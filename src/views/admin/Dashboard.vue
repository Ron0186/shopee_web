<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userName = ref("訪客");
const email = ref("未登入");
const isLoggedIn = ref(false); // 新增判斷是否登入的變數


onMounted(() => {
  const token = sessionStorage.getItem("token"); // 檢查 token
  if (token) {
    isLoggedIn.value = true;
    userName.value = sessionStorage.getItem("userName") || "訪客";
    email.value = sessionStorage.getItem("email") || "未登入";
  } else {
    isLoggedIn.value = false;
  }
});

// 登出方法
const logout = () => {
  isLoggedIn.value = false;
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("email")
  sessionStorage.removeItem("token");
  router.push("/admin/login");
};

// 導向登入頁面方法
const goToLogin = () => {
  router.push("/admin/login");
};
</script>

<template>
  <main>
    首頁
    <div>
      <template v-if="isLoggedIn">
        <h1>管理員:{{ userName }}</h1>
        <h1>Email: {{ email }}</h1>
        <button @click="logout">登出</button>
      </template>
      <template v-else>
        <button @click="goToLogin">登入</button>
      </template>
    </div>
  </main>
</template>