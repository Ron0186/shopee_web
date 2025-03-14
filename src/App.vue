<script setup>
import { RouterLink, RouterView } from "vue-router";
// import HelloWorld from "./components/HelloWorld.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
</script>

<template>
  <RouterView />
</template>

<style scoped>
/* 確保 Footer 佔滿寬度 */
.footer {
  width: 100%;
}
</style>
