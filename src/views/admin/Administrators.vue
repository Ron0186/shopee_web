<template>
  <div class="container mt-4">
    <h2>管理管理員帳號</h2>
    <div class="d-flex justify-content-between mb-3">
      <div class="d-flex">
        <input v-model="searchQuery" class="form-control me-2"
          placeholder="搜尋管理員名稱">
        <select v-model="pageSize" class="form-select w-auto"
          @change="fetchAdmins(0)">
          <option :value="10">10 筆</option>
          <option :value="20">20 筆</option>
          <option :value="50">50 筆</option>
        </select>
      </div>
      <button class="btn btn-success" @click="openAddModal">新增管理員</button>
    </div>


    <table class="table table-bordered admin-table">
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
        <tr v-if="admins.length > 0" v-for="admin in admins"
          :key="admin.userId">
          <td>{{ admin.userId }}</td>
          <td>{{ admin.userName }}</td>
          <td>{{ admin.email }}</td>
          <td>{{ admin.phone }}</td>
          <td>{{ admin.roles.join(', ') }}</td>
          <td>
            <button class="btn btn-primary btn-sm"
              @click="openEditProfileModal(admin)">編輯資料</button>
            <button class="btn btn-warning btn-sm ms-2"
              @click="openEditRoleModal(admin)">編輯權限</button>
            <<<<<<< HEAD <button class="btn btn-danger btn-sm ms-2"
              @click="deleteUser(admin.userId)">刪除用戶</button>
              =======
              >>>>>>> 73dca5e19dd3f967da844617a114e84cfaa3edbf
          </td>
        </tr>
        <tr v-else>
          <td colspan="6" class="text-center">查無資料</td>
        </tr>
      </tbody>
    </table>

    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pageNumber === 0 }">
          <button class="page-link"
            @click="fetchAdmins(pageNumber - 1)">上一頁</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">第 {{ pageNumber + 1 }} 頁</span>
        </li>
        <li class="page-item" :class="{ disabled: !hasNextPage }">
          <button class="page-link"
            @click="fetchAdmins(pageNumber + 1)">下一頁</button>
        </li>
      </ul>
    </nav>


    <admin-role-edit-modal v-if="selectedAdmin" :admin="selectedAdmin"
      :isOpen="showModal" :allAvailableRoles="availableRoles"
      @close="showModal = false" @save="updateAdminRoles" />

    <admin-profile-edit-modal :isOpen="showProfileModal" :admin="selectedAdmin"
      @close="showProfileModal = false" @save="updateAdminInfo" />

    <admin-add-modal :isOpen="showAddModal" :roles="roleNames"
      @close="showAddModal = false" @refresh="fetchAdmins" />
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import AdminRoleEditModal from '@/components/admin/Administrators.components/AdminRoleEditModal.vue';
import AdminProfileEditModal from '@/components/admin/Administrators.components/AdminProfileEditModal.vue';
import AdminAddModal from '@/components/admin/Administrators.components/AdminAddModal.vue';

export default {
  components: {
    AdminRoleEditModal,
    AdminProfileEditModal,
    AdminAddModal
  },
  computed: {
    roleNames() {
      return this.availableRoles.map(role => role.roleName); // 提取 roleName
    }
  },
  data() {
    return {
      admins: [],
      searchQuery: '',
      pageNumber: 0,
      pageSize: 20,
      hasNextPage: false,
      selectedAdmin: null,
      showModal: false,
      availableRoles: [],
      showProfileModal: false,
      showAddModal: false,

    };
  },
  mounted() {
    this.fetchAdmins();
    this.fetchAdminRoles();
  },
  methods: {
    async fetchAdmins(page = 0) {
      try {
        const response = await axios.get(`/api/admin/any/sa`, {
          params: {
            userName: this.searchQuery,
            roleName: "Admin",
            page: page,
            size: this.pageSize
          }
        });
        console.log("API 回傳的管理員資料：", response.data);
        this.admins = response.data.content.map(admin => ({
          ...admin,
          roles: admin.roles || []
        }));
        this.pageNumber = response.data.number;
        this.hasNextPage = !response.data.last;
      } catch (error) {
        console.error("載入管理員列表失敗", error);
      }
    },
    async fetchAdminRoles() {
      try {
        const response = await axios.get('/api/admin/role/all');
        this.availableRoles = response.data;
      } catch (error) {
        console.error("載入管理員角色失敗", error);
      }
    },
    openEditRoleModal(admin) {
      this.selectedAdmin = { ...admin };
      this.showModal = true;
    },
    openEditProfileModal(admin) {
      this.selectedAdmin = { ...admin };
      this.showProfileModal = true;
    },
    async updateAdminRoles({ userId, roles }) {
      try {
        const response = await axios.put(`/api/admin/role/sa/${userId}`, { roles });

        if (response.data.success) {
          console.log("更新成功，顯示成功訊息");

          Swal.fire({
            title: "角色更新成功",
            icon: "success",
            text: response.data.message || "使用者角色已成功更新", // 防止 message 為 undefined
          });
          // 更新 UI
          await this.fetchAdmins();
          // 只有成功時才關閉 Modal
          this.showModal = false;
        } else {
          console.log("進入 else 區塊，顯示失敗訊息");
          Swal.fire({
            title: "角色更新失敗",
            text: response.data.message || "發生未知錯誤",
            icon: "error",
          });
        }
      } catch (error) {
        console.log("進入 else 區塊，顯示失敗訊息");
        Swal.fire({
          title: "錯誤",
          text: error.response?.data?.message || "無法更新角色",
          icon: "error",
        });
      }
    },
    async updateAdminInfo(updatedAdmin) {
      try {
        const response = await axios.put(`/api/admin/user/any/${updatedAdmin.userId}`, updatedAdmin);

        if (response.data.success) {
          await Swal.fire({
            title: response.data.message,
            icon: "success",
          });

          await this.fetchAdmins(this.pageNumber);
        }
        this.showProfileModal = false;
      } catch (error) {
        Swal.fire({
          title: "錯誤:" + error.response.data.message,
          icon: "error",
        });
      }
    },
    async deleteUser(adminId) {
      try {
        const result = await Swal.fire({
          title: `確定要刪除 ID:${adminId} 的管理員嗎？`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "確定刪除",
          cancelButtonText: "取消",
        });

        if (result.isConfirmed) {
          const response = await axios.delete(`/api/admin/user/any/${adminId}`);
          if (response.data.success) {
            await Swal.fire({
              title: response.data.message,
              icon: "success",
            });
            // 計算要回到哪一頁：
            // - 如果這一頁只剩 1 筆資料，且當前頁數 > 0，則回到上一頁
            // - 否則維持當前頁數
            const newPage = this.admins.length === 1 && this.pageNumber > 0
              ? this.pageNumber - 1
              : this.pageNumber;

            // 重新載入管理員列表
            this.fetchAdmins(newPage);
          }
        }
      } catch (error) {
        Swal.fire({
          title: "錯誤:" + error.response.data.message,
          icon: "error",
        });
      }
    },
    openAddModal() {
      this.showAddModal = true;
    },
  },
  watch: {
    searchQuery() {
      this.pageNumber = 0;
      this.fetchAdmins();
    }
  }
};
</script>

<style scoped>
.admin-table {
  table-layout: fixed;
  width: 100%;
}
</style>
