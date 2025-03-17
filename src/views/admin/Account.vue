<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import PageSizeSelector from "@/components/admin/Account.components/PageSizeSelector.vue";
import UserEditModal from "@/components/admin/Account.components/UserEditModal.vue";
import Swal from "sweetalert2";

const users = ref([]);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);
//Modal相關
const editModalOpen = ref(false);
const selectedUser = ref(null);
//搜尋欄位相關
const searchName = ref("");
//搜尋方法
const fetchUsers = async (page = 0,name = "") => {
  try {
    const response = await axios.get(`/api/admin/user/any?page=${page}&size=${pageSize.value}&username=${name}`);
    users.value = response.data.content;
    totalPages.value = response.data.totalPages;
    currentPage.value = page;
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

const searchUsers = () => { // 新增搜尋方法
  fetchUsers(0, searchName.value);
}

const handlePageSizeChange = (newValue) => {
  pageSize.value = newValue;
  currentPage.value = 0;
  fetchUsers(0);
};

const openEditModal = (user) => {
  selectedUser.value = { ...user };
  editModalOpen.value = true;
};

const closeEditModal = () => {
  editModalOpen.value = false;
  selectedUser.value = null;
};

const saveUserChanges = async (editedUser) => {
  try {
    // 1. 呼叫 API 更新使用者資訊
    const response = await axios.put(`/api/admin/user/any/${editedUser.userId}`, editedUser);

    // 2. 獲取 API 回應的更新後的使用者資訊
    const updatedUser = response.data.userDTO;

    // 3. 更新本地 users 陣列
    const index = users.value.findIndex((user) => user.userId === updatedUser.userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }

    if(response.data.success){
          await Swal.fire({
          title: response.data.message,
          icon: "success",
      });
    }

    // 4. 關閉 Modal
    closeEditModal();
  } catch (error) {
    Swal.fire({
        title: "錯誤:"+error.response.data.message,
        icon: "error",
    });
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await Swal.fire({
      title: `確定要使用者id為:${userId}的使用者嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`/api/admin/user/any/${userId}`);
      if(response.data.success){
          await Swal.fire({
          title: response.data.message,
          icon: "success",
      });
      if (users.value.length === 1 && currentPage.value > 0) {
  fetchUsers(currentPage.value - 1); // 導向上一頁
} else {
  fetchUsers(currentPage.value); // 重新獲取當前頁面資料
}
      }else{
        Swal.fire({
        title: "錯誤:"+response.data.message,
        icon: "error",
        });
      }
    }
  } catch (error) {
    Swal.fire({
        title: "錯誤:"+error.response.data.message,
        icon: "error",
    });
  }
};
</script>

<template>
  <div class="container">
    <h2 class="mt-4">使用者列表</h2>
    <div class="mb-3">
  <input
    type="text"
    class="form-control"
    placeholder="搜尋使用者名稱"
    v-model="searchName"
    @input="searchUsers"
  />
</div>
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>使用者名稱</th>
          <th>Email</th>
          <th>電話</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>
            <button @click="openEditModal(user)" class="btn btn-primary">編輯</button>
            <button @click="deleteUser(user.userId)" class="btn btn-danger">刪除</button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="5" class="text-center">查無資料</td>
        </tr>
      </tbody>
    </table>

    <PageSizeSelector v-model="pageSize" @update:modelValue="handlePageSizeChange" />

    <div class="d-flex justify-content-center mt-3">
      <button class="btn btn-primary me-2" @click="prevPage" :disabled="currentPage === 0">上一頁</button>
      <span>第 {{ currentPage + 1 }} 頁 / 共 {{ totalPages }} 頁</span>
      <button class="btn btn-primary ms-2" @click="nextPage" :disabled="currentPage === totalPages - 1">下一頁</button>
    </div>

    <UserEditModal :user="selectedUser" :isOpen="editModalOpen" @close="closeEditModal" @save="saveUserChanges" v-if="editModalOpen" />
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
}
</style>