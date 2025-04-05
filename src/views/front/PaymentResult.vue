<template>
  <div class="result-container">
    <h2>💰 付款結果</h2>
    <p>訂單已送出，系統將自動為您導回商店...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // ✅ 如果是從主頁 window.open 出來的付款頁
  if (window.opener) {
    // 👉 通知主頁導回 /shop
    window.opener.location.href = "/shop";

    // 👉 自己關閉
    window.close();
  } else {
    // ✅ 如果直接開這頁就自動跳轉
    setTimeout(() => {
      window.location.href = "/shop";
    }, 3000);
  }
});
</script>

<style scoped>
.result-container {
  max-width: 600px;
  margin: 80px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: "Noto Sans TC", sans-serif;
  color: #333;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #44bd32;
}

p {
  font-size: 16px;
  color: #666;
}
</style>
