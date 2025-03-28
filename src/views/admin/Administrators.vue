<template>
  <div class="admin-dashboard p-4">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0 font-weight-bold text-primary">管理員帳號管理</h5>
          <button class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-plus-lg me-1"></i> 新增管理員
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input 
                v-model="searchQuery" 
                class="form-control border-start-0" 
                placeholder="搜尋管理員名稱..."
                @input="onSearchInput"
              >
            </div>
          </div>
          <div class="col-md-2">
            <select v-model="pageSize" class="form-select" @change="fetchAdmins(0)">
              <option :value="10">每頁 10 筆</option>
              <option :value="20">每頁 20 筆</option>
              <option :value="50">每頁 50 筆</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover admin-table border">
<thead class="table-light">
  <tr>
    <th class="text-center sortable" style="width: 80px;" @click="toggleSort('userId')">
      ID
      <i v-if="sortField === 'userId'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-down-alt'
         ]">
      </i>
    </th>
    <th class="sortable" style="width: 150px;" @click="toggleSort('userName')">
      名稱
      <i v-if="sortField === 'userName'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt'
         ]">
      </i>
    </th>
    <th class="sortable" style="width: 250px;" @click="toggleSort('email')">
      Email
      <i v-if="sortField === 'email'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt'
         ]">
      </i>
    </th>
    <th class="sortable" style="width: 120px;" @click="toggleSort('phone')">
      電話
      <i v-if="sortField === 'phone'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt'
         ]">
      </i>
    </th>
    <th style="width: 150px;">角色</th>
    <th class="text-center" style="width: 210px;">操作</th>
  </tr>
</thead>
            <tbody>
              <tr v-if="admins.length > 0" v-for="admin in admins" :key="admin.userId">
                <td class="text-center">{{ admin.userId }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="admin-avatar me-2">
                      {{ getInitials(admin.userName) }}
                    </div>
                    {{ admin.userName }}
                  </div>
                </td>
                <td>{{ admin.email }}</td>
                <td>{{ admin.phone || '無' }}</td>
                <td>
                  <span 
                    v-for="(role, index) in admin.roles" 
                    :key="index" 
                    class="badge me-1 mb-1"
                    :class="getRoleBadgeClass(role)"
                  >
                    {{ role }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <button class="btn btn-outline-primary btn-sm" @click="openEditProfileModal(admin)" title="編輯資料">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-outline-info btn-sm" @click="openEditRoleModal(admin)" title="編輯權限">
                      <i class="bi bi-key"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteUser(admin.userId)" title="刪除用戶">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-else>
                <td colspan="6" class="text-center py-4">
                  <div class="empty-state">
                    <i class="bi bi-search fa-3x text-muted mb-3"></i>
                    <p>查無管理員資料</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="admins.length > 0" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pageNumber === 0 }">
              <button class="page-link" @click="fetchAdmins(0)" title="第一頁">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pageNumber === 0 }">
              <button class="page-link" @click="fetchAdmins(pageNumber - 1)">
                <i class="bi bi-chevron-left"></i> 上一頁
              </button>
            </li>
            <li class="page-item disabled">
              <span class="page-link">第 {{ pageNumber + 1 }} 頁</span>
            </li>
            <li class="page-item" :class="{ disabled: !hasNextPage }">
              <button class="page-link" @click="fetchAdmins(pageNumber + 1)">
                下一頁 <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- 載入中遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>

    <!-- Modals -->
    <admin-role-edit-modal 
      v-if="selectedAdmin" 
      :admin="selectedAdmin"
      :isOpen="showModal" 
      :allAvailableRoles="availableRoles"
      @close="showModal = false" 
      @save="updateAdminRoles" />

    <admin-profile-edit-modal 
      :isOpen="showProfileModal" 
      :admin="selectedAdmin"
      @close="showProfileModal = false" 
      @save="updateAdminInfo" />

    <admin-add-modal 
      :isOpen="showAddModal" 
      :roles="roleNames"
      @close="showAddModal = false" 
      @refresh="fetchAdmins" />
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import AdminRoleEditModal from '@/components/admin/Administrators.components/AdminRoleEditModal.vue';
import AdminProfileEditModal from '@/components/admin/Administrators.components/AdminProfileEditModal.vue';
import AdminAddModal from '@/components/admin/Administrators.components/AdminAddModal.vue';
import { debounce } from 'lodash';

export default {
  components: {
    AdminRoleEditModal,
    AdminProfileEditModal,
    AdminAddModal
  },
  computed: {
    roleNames() {
      return this.availableRoles.map(role => role.roleName);
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
    loading: false,
    tableLoading: false, // 添加表格加載狀態
    sortField: 'userId', // 添加：默認排序欄位
    sortDirection: 'asc', // 添加：默認排序方向
  };
},
  mounted() {
    this.fetchAdmins();
    this.fetchAdminRoles();
  },
  methods: {
    // 手動實現搜尋防抖
    onSearchInput(event) {
      // 取消之前的計時器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      
      // 設置新的計時器
      this.searchDebounceTimer = setTimeout(() => {
        this.pageNumber = 0;
        this.fetchAdmins();
      }, 300);
    },
    
    async fetchAdmins(page = 0) {
    this.tableLoading = true;
    
    try {
      const currentAdmins = [...this.admins];
      
      const response = await axios.get(`/api/admin/any/sa`, {
        params: {
          userName: this.searchQuery,
          roleName: "Admin",
          page: page,
          size: this.pageSize,
          sort: `${this.sortField},${this.sortDirection}` // 添加排序參數
        }
      });
      
      if (response.data && response.data.content) {
        const newAdmins = response.data.content.map(admin => ({
          ...admin,
          roles: admin.roles || []
        }));
        
        this.$nextTick(() => {
          this.admins = newAdmins;
          this.pageNumber = response.data.number;
          this.hasNextPage = !response.data.last;
        });
      } else {
        this.admins = currentAdmins;
        this.showErrorNotification("載入數據格式錯誤", "返回的數據格式不正確");
      }
    } catch (error) {
      this.showErrorNotification("載入管理員列表失敗", error);
    } finally {
      setTimeout(() => {
        this.tableLoading = false;
      }, 300);
    }
  },
    async fetchAdminRoles() {
      try {
        const response = await axios.get('/api/admin/role/all');
        this.availableRoles = response.data;
      } catch (error) {
        this.showErrorNotification("載入管理員角色失敗", error);
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
      this.loading = true;
      try {
        const response = await axios.put(`/api/admin/role/sa/${userId}`, { roles });

        if (response.data.success) {
          this.showSuccessNotification("角色更新成功", response.data.message || "使用者角色已成功更新");
          await this.fetchAdmins();
          this.showModal = false;
        } else {
          this.showErrorNotification("角色更新失敗", response.data.message || "發生未知錯誤");
        }
      } catch (error) {
        this.showErrorNotification("錯誤", error.response?.data?.message || "無法更新角色");
      } finally {
        this.loading = false;
      }
    },
    async updateAdminInfo(updatedAdmin) {
      this.loading = true;
      try {
        const response = await axios.put(`/api/admin/user/any/${updatedAdmin.userId}`, updatedAdmin);

        if (response.data.success) {
          this.showSuccessNotification("資料更新", response.data.message);
          await this.fetchAdmins(this.pageNumber);
        }
        this.showProfileModal = false;
      } catch (error) {
        this.showErrorNotification("錯誤", error.response.data.message);
      } finally {
        this.loading = false;
      }
    },
    async deleteUser(adminId) {
      try {
        const result = await Swal.fire({
          title: `確定要刪除 ID:${adminId} 的管理員嗎？`,
          text: "此操作不可逆，請謹慎確認",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "確定刪除",
          cancelButtonText: "取消",
        });

        if (result.isConfirmed) {
          this.loading = true;
          const response = await axios.delete(`/api/admin/user/any/${adminId}`);
          if (response.data.success) {
            this.showSuccessNotification("刪除成功", response.data.message);
            // 計算要回到哪一頁
            const newPage = this.admins.length === 1 && this.pageNumber > 0
              ? this.pageNumber - 1
              : this.pageNumber;

            this.fetchAdmins(newPage);
          }
        }
      } catch (error) {
        this.showErrorNotification("錯誤", error.response.data.message);
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.showAddModal = true;
    },
    // 通用的成功提示
    showSuccessNotification(title, message) {
      Swal.fire({
        title: title,
        text: message,
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    },
    // 通用的錯誤提示
    showErrorNotification(title, error) {
      console.error(title, error);
      Swal.fire({
        title: title,
        text: typeof error === 'string' ? error : error.message || "發生未知錯誤",
        icon: "error",
      });
    },
    // 獲取用戶名稱的首字母作為頭像
    getInitials(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },
    getRoleBadgeClass(role) {
    switch (role) {
      case 'ADMIN':
        return 'bg-primary text-white';
      case 'SUPER_ADMIN':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-dark';
    }
    },
    toggleSort(field) {
    if (this.sortField === field) {
      // 如果是當前欄位，切換排序方向
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      // 如果是新欄位，設為升序
      this.sortField = field;
      this.sortDirection = "asc";
    }
    
    // 回到第一頁並重新加載數據
    this.fetchAdmins(0);
  }
  }
};
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fc;
  min-height: 100vh;
}

.admin-table {
  table-layout: fixed;
  width: 100%;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  color: #6c757d;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
/* 添加排序相關樣式 */
.sortable {
  cursor: pointer;
  position: relative;
  user-select: none;
}

.sortable:hover {
  background-color: #f1f3f9;
}

.sortable i {
  font-size: 0.85em;
  vertical-align: middle;
}

/* 添加表格加載狀態相關樣式 */
.table-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.25rem;
}

.table-loading-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  color: #666;
}
</style>