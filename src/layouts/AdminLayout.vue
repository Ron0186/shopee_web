<template>
  <div class="admin-layout">
    <AdminNavbar class="admin-navbar" />
    <div class="admin-container">
      <Sidebar class="admin-sidebar" />
      <main class="admin-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminNavbar from "@/components/admin/AdminNavbar.vue";
import Sidebar from "@/components/admin/Sidebar.vue";
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-container {
  display: flex;
  flex: 1;
  margin-top: 60px; /* 導航欄高度 */
}

.admin-sidebar {
  position: fixed;
  top: 60px; /* 與導航欄高度一致 */
  left: 0;
  bottom: 0;
  z-index: 90;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.admin-content {
  flex: 1;
  margin-left: 260px; /* 與側邊欄寬度一致 */
  min-width: 0; /* 防止內容溢出 */
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

.content-wrapper {
  padding: 25px;
  height: 100%;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .admin-content {
    margin-left: 70px; /* 與折疊後的側邊欄寬度一致 */
  }
}

/* 針對打印的樣式 */
@media print {
  .admin-navbar, .admin-sidebar {
    display: none;
  }
  
  .admin-content {
    margin-left: 0;
    padding: 0;
  }
}
</style>