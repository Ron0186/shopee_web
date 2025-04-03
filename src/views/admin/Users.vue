<template>
  <div class="admin-dashboard p-4">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0 font-weight-bold text-primary">管理使用者帳號</h5>
          <button class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-person-plus-fill me-1"></i> 新增會員
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
                v-model="searchName" 
                class="form-control border-start-0" 
                placeholder="搜尋使用者名稱..."
                @input="searchUsers"
              >
            </div>
          </div>
          <div class="col-md-2">
            <select v-model="pageSize" class="form-select" @change="handlePageSizeChange">
              <option :value="10">每頁 10 筆</option>
              <option :value="20">每頁 20 筆</option>
              <option :value="50">每頁 50 筆</option>
            </select>
          </div>
        </div>

        <div class="table-container position-relative">
          <!-- 表格加載指示器 -->
          <div v-if="tableLoading" class="table-overlay">
            <div class="table-loading-indicator">
              <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
              <span class="ms-2">載入中...</span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover user-table border">
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
    <th class="sortable" style="width: 220px;" @click="toggleSort('email')">
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
    <th class="sortable" style="width: 120px;" @click="toggleSort('status')">
      帳號狀態
      <i v-if="sortField === 'status'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt'
         ]">
      </i>
    </th>
    <th class="sortable" style="width: 120px;" @click="toggleSort('shopIsActive')">
      商店狀態
      <i v-if="sortField === 'shopIsActive'" 
         :class="[
           'bi ms-1', 
           sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up-alt'
         ]">
      </i>
    </th>
    <th style="width: 150px;">角色</th>
    <th class="text-center" style="width: 210px;">操作</th>
  </tr>
</thead>
<tbody>
  <tr v-if="users.length > 0" v-for="user in users" :key="user.userId">
    <td class="text-center">{{ user.userId }}</td>
    <td>
      <div class="d-flex align-items-center">
        <div class="user-avatar me-2">
          {{ getInitials(user.userName) }}
        </div>
        {{ user.userName }}
      </div>
    </td>
    <td>{{ user.email }}</td>
    <td>{{ user.phone || '無' }}</td>
    <td>
      <span :class="getStatusBadgeClass(user.status)">
        <i :class="getStatusIconClass(user.status)"></i>
        {{ getStatusText(user.status) }}
      </span>
    </td>
    <td>
      <span v-if="user.shopIsActive === true" class="badge bg-success">
        <i class="bi bi-check-circle-fill me-1"></i> 已啟用
      </span>
      <span v-else-if="user.shopIsActive === false" class="badge bg-danger">
        <i class="bi bi-x-circle-fill me-1"></i> 已停用
      </span>
      <span v-else class="badge bg-warning text-dark">
        <i class="bi bi-exclamation-triangle me-1"></i> 無商店
      </span>
    </td>
    <td>
      <span 
        v-for="(role, index) in user.roles" 
        :key="index" 
        class="badge me-1 mb-1"
        :class="getRoleBadgeClass(role)"
      >
        {{ role }}
      </span>
    </td>
    <td class="text-center">
      <div class="btn-group">
        <button class="btn btn-outline-primary btn-sm" @click="openEditModal(user)" title="編輯資料">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-outline-info btn-sm" @click="openModal(user)" title="編輯權限">
          <i class="bi bi-key"></i>
        </button>
        <button 
          class="btn btn-sm" 
          :class="user.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'"
          @click="toggleUserStatus(user)" 
          :title="user.status === 'ACTIVE' ? '禁用帳號' : '啟用帳號'">
          <i :class="user.status === 'ACTIVE' ? 'bi bi-slash-circle' : 'bi bi-check-circle'"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="deleteUser(user.userId)" title="刪除用戶">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
  <tr v-else>
    <td colspan="8" class="text-center py-4">
      <div class="empty-state">
        <i class="bi bi-search fa-3x text-muted mb-3"></i>
        <p>查無使用者資料</p>
      </div>
    </td>
  </tr>
</tbody>
            </table>
          </div>
        </div>

        <nav v-if="users.length > 0" class="mt-4">
  <ul class="pagination justify-content-center">
    <!-- 第一頁按鈕 -->
    <li class="page-item" :class="{ disabled: currentPage === 0 }">
      <button class="page-link" @click="fetchUsers(0)" title="第一頁">
        <i class="bi bi-chevron-double-left"></i>
      </button>
    </li>
    
    <!-- 上一頁按鈕 -->
    <li class="page-item" :class="{ disabled: currentPage === 0 }">
      <button class="page-link" @click="prevPage">
        <i class="bi bi-chevron-left"></i>
      </button>
    </li>
    
    <!-- 頁碼按鈕 -->
    <template v-for="index in getPageNumbers()" :key="index">
      <li class="page-item" :class="{ active: currentPage === index }">
        <button class="page-link" @click="fetchUsers(index)">
          {{ index + 1 }}
        </button>
      </li>
    </template>
    
    <!-- 下一頁按鈕 -->
    <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
      <button class="page-link" @click="nextPage">
        <i class="bi bi-chevron-right"></i>
      </button>
    </li>
    
    <!-- 最後一頁按鈕 -->
    <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
      <button class="page-link" @click="fetchUsers(totalPages - 1)" title="最後一頁">
        <i class="bi bi-chevron-double-right"></i>
      </button>
    </li>
  </ul>
</nav>
      </div>
    </div>

    <!-- 載入中遮罩(全局) -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>

    <!-- Modals -->
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
import { ref, onMounted, watch } from "vue";
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
const loading = ref(false);
const tableLoading = ref(false);
const searchDebounceTimer = ref(null);
const sortField = ref("userId"); // 預設排序欄位
const sortDirection = ref("asc"); // 預設排序方向 asc 或 desc

const availableRoles = ref([
  { id: 'USER', roleName: 'USER' },
  { id: 'SELLER', roleName: 'SELLER' },
]);

const openModal = (user) => {
  if (!user) return;
  selectedUser.value = { ...user }; // 使用淺拷貝避免直接修改原數據
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};

const handleSaveRoles = async (updatedUserData) => {
  loading.value = true;
  try {
    const response = await axios.put(`/api/admin/role/${updatedUserData.userId}`, {
      roles: updatedUserData.roles
    });

    if (response.data.success) {
      showSuccessNotification("角色更新成功", response.data.message || "使用者角色已成功更新");
      await fetchUsers(currentPage.value);
      closeModal();
    } else {
      showErrorNotification("角色更新失敗", response.data.message || "發生未知錯誤");
    }
  } catch (error) {
    showErrorNotification("錯誤", error.response?.data?.message || "無法更新角色");
  } finally {
    loading.value = false;
  }
};
// 在 data 中添加
const maxDisplayedPages = ref(5); // 最多顯示的頁碼數量

// 添加頁碼計算方法
const getPageNumbers = () => {
  if (totalPages.value <= 1) return [];
  
  // 如果總頁數小於等於最大顯示頁碼數，則顯示所有頁碼
  if (totalPages.value <= maxDisplayedPages.value) {
    return Array.from({ length: totalPages.value }, (_, i) => i);
  }
  
  // 計算起始和結束頁碼
  let start = Math.max(0, currentPage.value - Math.floor(maxDisplayedPages.value / 2));
  let end = Math.min(totalPages.value - 1, start + maxDisplayedPages.value - 1);
  
  // 如果結束頁碼已經接近總頁數，則調整起始頁碼
  if (end >= totalPages.value - 1) {
    start = Math.max(0, totalPages.value - maxDisplayedPages.value);
  }
  
  // 如果起始頁碼已經是 0，則調整結束頁碼
  if (start === 0) {
    end = Math.min(totalPages.value - 1, maxDisplayedPages.value - 1);
  }
  
  // 生成頁碼陣列
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const fetchUsers = async (page = 0, name = searchName.value) => {
  tableLoading.value = true;
  try {
    const response = await axios.get(`/api/admin/any`, {
      params: {
        userName: name,
        roleName: "USER",
        page: page,
        size: pageSize.value,
        sort: `${sortField.value},${sortDirection.value}` // 添加排序參數
      }
    });
    
    // 確保 users 屬性存在
    if (response.data && response.data.content) {
      users.value = response.data.content;
      totalPages.value = response.data.totalPages;
      currentPage.value = page;
    } else {
      showErrorNotification("資料錯誤", "無法獲取使用者資料");
    }
  } catch (error) {
    console.error("獲取使用者時發生錯誤:", error);
    showErrorNotification("載入失敗", error.response?.data?.message || "無法載入使用者列表");
  } finally {
    setTimeout(() => {
      tableLoading.value = false;
    }, 300);
  }
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    // 如果點擊的是當前排序欄位，則切換排序方向
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // 如果點擊的是新欄位，則設定為新欄位並使用預設升序
    sortField.value = field;
    sortDirection.value = "asc";
  }
  
  // 重新獲取數據
  fetchUsers(currentPage.value);
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
  searchName.value = "";
  fetchUsers(0);
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

// 搜尋使用者，加入防抖動
const searchUsers = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    fetchUsers(0, searchName.value);
  }, 300);
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
  loading.value = true;
  try {
    const response = await axios.put(
      `/api/admin/user/any/${editedUser.userId}`,
      editedUser
    );
    if (response.data.success) {
      showSuccessNotification("資料更新", response.data.message || "使用者資料已成功更新");
      await fetchUsers(currentPage.value);
    }
    closeEditModal();
  } catch (error) {
    showErrorNotification("錯誤", error.response?.data?.message || "無法更新使用者資料");
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await Swal.fire({
      title: `確定要刪除 ID:${userId} 的使用者嗎？`,
      text: "此操作不可逆，請謹慎確認",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      loading.value = true;
      const response = await axios.delete(`/api/admin/user/any/${userId}`);
      if (response.data.success) {
        showSuccessNotification("刪除成功", response.data.message || "使用者已成功刪除");
        
        // 計算要回到哪一頁
        const newPage = users.value.length === 1 && currentPage.value > 0
          ? currentPage.value - 1
          : currentPage.value;

        fetchUsers(newPage);
      }
    }
  } catch (error) {
    showErrorNotification("錯誤", error.response?.data?.message || "無法刪除使用者");
  } finally {
    loading.value = false;
  }
};

// 獲取名稱縮寫作為頭像
const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// 獲取角色徽章的樣式類
const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'USER':
      return 'bg-secondary text-white';
    case 'SELLER':
      return 'bg-success text-white';
    case 'ADMIN':
      return 'bg-primary text-white';
    case 'SUPER_ADMIN':
      return 'bg-danger text-white';
    default:
      return 'bg-light text-dark';
  }
};

// 通用的成功提示
const showSuccessNotification = (title, message) => {
  Swal.fire({
    title: title,
    text: message,
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false
  });
};

// 通用的錯誤提示
const showErrorNotification = (title, error) => {
  console.error(title, error);
  Swal.fire({
    title: title,
    text: typeof error === 'string' ? error : error.message || "發生未知錯誤",
    icon: "error",
  });
};

// 處理用戶狀態相關方法
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'badge bg-success';
    case 'BANNED':
      return 'badge bg-danger';
    default:
      return 'badge bg-secondary';
  }
};

const getStatusIconClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bi bi-person-check-fill me-1';
    case 'BANNED':
      return 'bi bi-person-x-fill me-1';
    default:
      return 'bi bi-question-circle-fill me-1';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '正常';
    case 'BANNED':
      return '已禁用';
    default:
      return '未知狀態';
  }
};

// 切換用戶狀態
const toggleUserStatus = async (user) => {
  try {
    const result = await Swal.fire({
      title: user.status === 'ACTIVE' 
        ? `確定要禁用 ${user.userName} 的帳號嗎？` 
        : `確定要啟用 ${user.userName} 的帳號嗎？`,
      text: user.status === 'ACTIVE' 
        ? "禁用後，該用戶將無法登入系統" 
        : "啟用後，該用戶將可以正常登入系統",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: user.status === 'ACTIVE' ? "#d33" : "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: user.status === 'ACTIVE' ? "確定禁用" : "確定啟用",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      loading.value = true;
      const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      const response = await axios.put(`/api/admin/user/status/${user.userId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        showSuccessNotification(
          user.status === 'ACTIVE' ? "帳號已禁用" : "帳號已啟用", 
          response.data.message || (user.status === 'ACTIVE' ? "使用者帳號已成功禁用" : "使用者帳號已成功啟用")
        );
        await fetchUsers(currentPage.value);
      } else {
        showErrorNotification("操作失敗", response.data.message || "無法更新使用者狀態");
      }
    }
  } catch (error) {
    showErrorNotification("錯誤", error.response?.data?.message || "無法更新使用者狀態");
  } finally {
    loading.value = false;
  }
};

// 頁面載入時獲取資料
onMounted(() => {
  fetchUsers(0);
});

// 監視分頁大小變化
watch(pageSize, () => {
  fetchUsers(0);
});
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fc;
  min-height: 100vh;
}

.user-table {
  table-layout: fixed;
  width: 100%;
}

.user-avatar {
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

.table-container {
  min-height: 200px;
}

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

/* 在現有樣式底部添加 */
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
</style>