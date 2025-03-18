<script setup>
import { RouterLink, RouterView } from "vue-router";
// import HelloWorld from "./components/HelloWorld.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
</script>

<template>
  <div class="d-flex flex-column">
    <Navbar></Navbar>
    <main class="flex-grow-1">
      <RouterView></RouterView>
    </main>
    <Footer class="footer"></Footer>
  </div>
</template>

<style scoped>
/* 確保 Footer 佔滿寬度 */
.footer {
  width: 100%;
}
/* 修改main背景色 3/18修改 */
main {
  width: 100vw;
  box-sizing: border-box;
  max-width: 100%;
  background-color: #fcf6ed; /* 這裡設置 main 的背景顏色 */
  /* 其他樣式... */
}
</style>
