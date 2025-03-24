<template>
  <div>
    <!-- <AdminNavbar /> -->
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
  /* margin-left: 240px; */
  /* 讓內容不會被 Sidebar 擋住 */
  padding: 20px;
  /* width: calc(100% - 240px); */
  /* margin-top: 60px; */
  /* 避開固定 Navbar */
}
</style>
// Compare this snippet from src/components/admin/Sidebar.vue:
