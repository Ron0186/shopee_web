<template>
  <div class="layout">
    <!-- 📌 Navbar -->
    <Navbar @toggleDrawer="toggleLeftDrawer" />

    <!-- 📌 側邊選單 -->
    <!-- <div class="sidebar" :class="{ open: leftDrawerOpen }">
      <button class="close-btn" @click="toggleLeftDrawer">✖</button>
      <ul>
        <li>
          <router-link to="/" @click="toggleLeftDrawer">🏠 首頁</router-link>
        </li>
        <li>
          <router-link to="/shop" @click="toggleLeftDrawer">🛍 商店</router-link>
        </li>
        <li>
          <router-link to="/cart" @click="toggleLeftDrawer"
            >🛒 購物車</router-link
          >
        </li>
      </ul>
    </div> -->

    <!-- 📌 主要內容 -->
    <main class="content">
      <router-view />
    </main>

    <!-- 📌 Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
