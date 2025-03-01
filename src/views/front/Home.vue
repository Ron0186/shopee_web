<script setup>
import { ref, onMounted } from "vue";

const userName = ref("訪客");
const userEmail = ref("未登入");

onMounted(() => {
  // 從 localStorage 取得使用者資訊
  userName.value = localStorage.getItem("userName") || "訪客";
  userEmail.value = localStorage.getItem("userEmail") || "未登入";
});
</script>

<template>
  <main>
    首頁
    <div>
      <h1>歡迎, {{ userName }}</h1>
      <p>Email: {{ userEmail }}</p>
    </div>
  </main>
</template>
