<template>
  <div class="container mt-4">
    <h2>管理管理員帳號</h2>
    <div class="d-flex justify-content-between mb-3">
      <div class="d-flex">
        <input v-model="searchQuery" class="form-control me-2" placeholder="搜尋管理員名稱">
        <select v-model="pageSize" class="form-select w-auto" @change="fetchAdmins(0)">
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
          <tr v-if="admins.length > 0" v-for="admin in admins" :key="admin.userId">
            <td>{{ admin.userId }}</td>
            <td>{{ admin.userName }}</td>
            <td>{{ admin.email }}</td>
            <td>{{ admin.phone }}</td>
            <td>{{ admin.roles.join(', ') }}</td>
            <td>
                <button class="btn btn-primary btn-sm" @click="openEditProfileModal(admin)">編輯資料</button>
              <button class="btn btn-warning btn-sm ms-2" @click="openEditRoleModal(admin)">編輯權限</button>
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
            <button class="page-link" @click="fetchAdmins(pageNumber - 1)">上一頁</button>
          </li>
          <li class="page-item disabled">
            <span class="page-link">第 {{ pageNumber + 1 }} 頁</span>
          </li>
          <li class="page-item" :class="{ disabled: !hasNextPage }">
            <button class="page-link" @click="fetchAdmins(pageNumber + 1)">下一頁</button>
          </li>
        </ul>
      </nav>
  
      <admin-role-edit-modal
        v-if="selectedAdmin"
        :admin="selectedAdmin"
        :isOpen="showModal"
        :allAvailableRoles="availableRoles"
        @close="showModal = false"
        @save="updateAdminRoles"
      />
  
      <admin-profile-edit-modal
        :isOpen="showProfileModal"
        :admin="selectedAdmin"
        @close="showProfileModal = false"
        @save="updateAdminInfo"
      />

      <admin-add-modal
  :isOpen="showAddModal"
  :roles="roleNames" 
  @close="showAddModal = false"
  @refresh="fetchAdmins"
  
/>
    </div>
  </template>
  
  <script>
  import axios from '@/plugins/axios';
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
          const response = await axios.get(`/api/admin/any`, {
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
          await axios.put(`/api/admin/role/${userId}`, { roles });
          this.fetchAdmins();
        } catch (error) {
          console.error("更新失敗", error);
          alert("更新失敗，請檢查後端 API 是否正常");
        }
        this.showModal = false;
      },
      async updateAdminInfo(updatedAdmin) {
        try {
          await axios.put(`/api/admin/profile/${updatedAdmin.userId}`, updatedAdmin);
          const index = this.admins.findIndex(admin => admin.userId === updatedAdmin.userId);
          if (index !== -1) {
            this.admins[index] = { ...updatedAdmin };
          }
          this.showProfileModal = false;
        } catch (error) {
          console.error("更新失敗", error);
          alert("更新失敗，請檢查後端 API 是否正常");
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
