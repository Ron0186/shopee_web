<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar></Navbar>
    <main class="flex-grow-1">
      <RouterView></RouterView>
    </main>
    <Footer class="mt-auto"></Footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import Navbar from './views/Navbar.vue';
import Footer from './views/Footer.vue';
</script>

<style scoped>
/* 確保 Footer 佔滿寬度 */
.footer {
  width: 100%;
}
</style>