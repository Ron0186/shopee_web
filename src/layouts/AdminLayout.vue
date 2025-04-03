<template>
  <div>
    <!-- <AdminNavbar /> -->
    <AdminNavbar></AdminNavbar>
    <div class="admin-container">
      <Sidebar />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminNavbar from "@/components/admin/AdminNavbar.vue";
import Sidebar from "@/components/admin/Sidebar.vue";
</script>

<style scoped>
.admin-container {
  display: flex;

}

.content {
  padding: 25px;
  /* 保留內容區域的內邊距 */
  flex-grow: 1;
  /* 讓 content 填滿剩餘寬度 */
  overflow-y: auto;
  /* 如果 content 內容過長，允許垂直滾動 */

  /* 可能需要 min-width: 0; 防止在 flex 佈局中內容溢出導致父容器變寬 */
  min-width: 0;
}
</style>
// Compare this snippet from src/components/admin/Sidebar.vue:
