<template>
  <div class="container mt-4">
    <h2>管理使用者帳號</h2>
    <div class="d-flex justify-content-between mb-3">
      <div class="d-flex">
      <input v-model="searchName" class="form-control me-2" placeholder="搜尋使用者名稱" @input="searchUsers">
      <select v-model="pageSize" class="form-select w-auto" @change="handlePageSizeChange">
        <option :value="10">10 筆</option>
        <option :value="20">20 筆</option>
        <option :value="50">50 筆</option>
      </select>
      <button class="btn btn-success" @click="openAddModal">新增會員</button>
    </div>
    </div>

    
    <table class="table table-bordered user-table">
      <thead>
        <tr>
          <th style="width: 50px;">ID</th>
          <th style="width: 150px;">名稱</th>
          <th style="width: 250px;">Email</th>
          <th style="width: 120px;">電話</th>
          <th style="width: 150px;">角色</th>
          <th style="width: 180px;">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length > 0" v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.roles.join(', ') }}</td>
          <td>
            <button class="btn btn-primary btn-sm" @click="openEditModal(user)">編輯資料</button>
            <button class="btn btn-warning btn-sm ms-2" @click="openModal(user)">編輯權限</button>
            <button class="btn btn-danger btn-sm ms-2" @click="deleteUser(user.userId)">刪除用戶</button>
          </td>
        </tr>
        <tr v-else>
          <td colspan="5" class="text-center">查無資料</td>
        </tr>
      </tbody>
    </table>

    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 0 }">
          <button class="page-link" @click="prevPage">上一頁</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">第 {{ currentPage + 1 }} 頁 / 共 {{ totalPages }} 頁</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
          <button class="page-link" @click="nextPage">下一頁</button>
        </li>
      </ul>
    </nav>

    <UserEditModal
      :user="selectedUser"
      :isOpen="editModalOpen"
      @close="closeEditModal"
      @save="saveUserChanges"
      v-if="editModalOpen"
    />
    <UserAddModal
      :isOpen="addModalOpen"
      @close="closeAddModal"
      @insert="handleInsertUser"
      v-if="addModalOpen"
    />
    <UserRoleEdit
  v-if="isModalOpen"
  :is-open="isModalOpen"
  :user="selectedUser || {}"
  :all-available-roles="availableRoles"
  @close="closeModal"
  @save="handleSaveRoles"
/>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import UserEditModal from "@/components/admin/Account.components/UserEditModal.vue";
import UserAddModal from "@/components/admin/Account.components/UserAddModal.vue";
import UserRoleEdit from "@/components/admin/Account.components/UserRoleEdit.vue";
import Swal from "sweetalert2";

const users = ref([]);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);
const editModalOpen = ref(false);
const selectedUser = ref(null);
const addModalOpen = ref(false);
const searchName = ref("");
const isModalOpen = ref(false);
const availableRoles=ref([
  { id: 'User', roleName: 'User' },
  { id: 'SELLER', roleName: 'SELLER' },
]);

const openModal = (user) => {
  if (!user) return; // 確保 user 不為 null
  selectedUser.value = user;
  isModalOpen.value = true;
};

// 關閉 Modal 的方法
const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null; // 清空選中的使用者
};
// 處理保存角色事件的方法
const handleSaveRoles = async (updatedUserData) => {
  try {
    const response = await axios.put(`/api/admin/role/${updatedUserData.userId}`, {
      roles: updatedUserData.roles
    });

    await fetchUsers(currentPage.value);

    if (response.data.success) {
      Swal.fire({
        title: "角色更新成功",
        icon: "success",
      });

      // 更新前端的使用者資料
      const userIndex = users.value.findIndex(u => u.userId === updatedUserData.userId);
      if (userIndex !== -1) {
        users.value[userIndex] = { ...users.value[userIndex], roles: updatedUserData.roles };
      }
    } else {
      Swal.fire({
        title: "角色更新失敗",
        text: response.data.message,
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "無法更新角色",
      icon: "error",
    });
  }
};

const fetchUsers = async (page = 0, name = "") => {
  try {
    const response = await axios.get(`/api/admin/any`, {
            params: {
              userName: name,
              roleName: "User",
              page: page,
              size: pageSize.value
            }
          });
    users.value = response.data.content;
    console.log(users.value)
    console.log(response.data.content)
    totalPages.value = response.data.totalPages;
    currentPage.value = page;
  } catch (error) {
    console.error("獲取使用者時發生錯誤:", error);
  }
};

const openAddModal = () => {
  addModalOpen.value = true;
};

const closeAddModal = () => {
  addModalOpen.value = false;
};

const handleInsertUser = () => {
    fetchUsers(0);
    closeAddModal();
};

const handlePageSizeChange = () => {
  searchName.value = ""; // 清空搜尋欄位
  fetchUsers(0); // 重新載入使用者列表，從第一頁開始
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

const searchUsers = () => {
  fetchUsers(0, searchName.value);
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
    const response = await axios.put(
      `/api/admin/user/any/${editedUser.userId}`,
      editedUser
    );

    const updatedUser = response.data.userDTO;
    const index = users.value.findIndex(
      (user) => user.userId === updatedUser.userId
    );
    if (index !== -1) {
      users.value[index] = updatedUser;
    }

    if (response.data.success) {
      await Swal.fire({
        title: response.data.message,
        icon: "success",
      });
    }

    closeEditModal();
  } catch (error) {
    Swal.fire({
      title: "錯誤:" + error.response.data.message,
      icon: "error",
    });
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await Swal.fire({
      title: `確定要刪除 ID:${userId} 的使用者嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`/api/admin/user/any/${userId}`);
      if (response.data.success) {
        await Swal.fire({
          title: response.data.message,
          icon: "success",
        });
        fetchUsers(users.value.length === 1 && currentPage.value > 0 ? currentPage.value - 1 : currentPage.value);
      }
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤:" + error.response.data.message,
      icon: "error",
    });
  }
};
</script>

<style scoped>
.user-table {
  table-layout: fixed;
  width: 100%;
}
</style>