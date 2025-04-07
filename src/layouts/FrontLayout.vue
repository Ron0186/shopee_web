<template>
  <div class="layout" :class="{ 'layout-ready': isReady }">
    <!-- 📌 Navbar -->
    <Navbar />

    <!-- 📌 主要內容 -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 📌 Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

const isReady = ref(false);

onMounted(async () => {
  // 使用 nextTick 確保 DOM 完全渲染後再添加 ready 狀態
  await nextTick();
  
  // 延遲一小段時間以確保所有子組件都已經渲染完成
  setTimeout(() => {
    isReady.value = true;
  }, 50);
});
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  transition: all 0.3s ease;
}

/* 添加 ready 狀態的樣式，確保寬度計算正確 */
.layout-ready {
  width: 100%;
  max-width: 100%;
}

.content {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  transition: all 0.3s ease;
  position: relative;
}

/* 添加淡入淡出過渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 增加響應式內容間距 */
@media (min-width: 768px) {
  .content {
    padding: 1.5rem;
  }
}

@media (min-width: 992px) {
  .content {
    padding: 2rem;
  }
}
</style>