<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";

const users = ref([]);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = 10;

const fetchUsers = async (page = 0) => {
  console.log(`/api/auth/test?page=${page}&size=${pageSize}`);
  try {
    const response = await axios.get(`/api/auth/test?page=${page}&size=${pageSize}`);
    users.value = response.data.content;  // `content` 是 `Page<T>` 的資料
      console.log(response.data);
    totalPages.value = response.data.totalPages;
    currentPage.value = page; // 記錄當前頁數
  } catch (error) {
    console.error("獲取使用者時發生錯誤:", error);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    fetchUsers(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    fetchUsers(currentPage.value - 1);
  }
};

onMounted(() => fetchUsers(0));
</script>

<template>
  <div class="container">
    <h2 class="mt-4">使用者列表</h2>
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>使用者名稱</th>
          <th>Email</th>
          <th>電話</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分頁按鈕 -->
    <div class="d-flex justify-content-center mt-3">
      <button class="btn btn-primary me-2" @click="prevPage" :disabled="currentPage === 0">上一頁</button>
      <span>第 {{ currentPage + 1 }} 頁 / 共 {{ totalPages }} 頁</span>
      <button class="btn btn-primary ms-2" @click="nextPage" :disabled="currentPage === totalPages - 1">下一頁</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
}
</style>
