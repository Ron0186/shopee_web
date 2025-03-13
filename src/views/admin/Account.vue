<template>
  <div class="user-list">
    <h1>Users</h1>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchUsers">Retry</button>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
        </tr>
        <tr v-if="users.length === 0">
            <td colspan="4">No users found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  const adminToken = sessionStorage.getItem("adminToken");
  try {
    const response = await axios.get('http://localhost:8081/api/users', {
      headers: {
        Authorization: `Bearer ${adminToken}`, // 將 token 放入 Authorization 標頭
      },
    });
    users.value = response.data;
  } catch (err) {
    error.value = 'Failed to fetch users. Please check your network connection and try again.';
    console.error(err); // 記錄詳細錯誤到控制台
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers); // 元件掛載後立即 fetching data
</script>

<style scoped>
.user-list {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  font-style: italic;
  color: #888;
}

.error {
  text-align: center;
  color: red;
  margin-bottom: 20px;
}
.error button{
    margin-top: 10px;
    padding: 5px 15px;
    background-color: #0d6efd;
    color: #fff;
    border-color: #0d6efd;
    border-radius: 0.3rem;
    cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}
</style>