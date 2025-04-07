<template>
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-light border-bottom">
          <h5 class="modal-title">
            <i class="bi bi-key me-2 text-info"></i>編輯管理員權限
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
        </div>
        <div class="modal-body p-4">
          <div class="user-info mb-4 p-3 bg-light rounded">
            <div class="d-flex align-items-center mb-2">
              <div class="admin-avatar me-3">
                {{ getInitials(admin.userName) }}
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ admin.userName }}</h6>
                <small class="text-muted">ID: {{ admin.userId }}</small>
              </div>
            </div>
            <div class="text-muted small">
              <div><i class="bi bi-envelope me-2"></i>{{ admin.email }}</div>
              <div v-if="admin.phone"><i class="bi bi-telephone me-2"></i>{{ admin.phone }}</div>
            </div>
          </div>

          <h6 class="fw-bold mb-3">
            <i class="bi bi-person-gear me-2"></i>管理員角色設定
          </h6>
          
          <div class="role-selection">
            <div class="alert alert-info small mb-3">
              <i class="bi bi-info-circle me-2"></i>請注意：「基礎管理員」角色是必選項，不可取消。
              <div v-if="admin && admin.roles" class="mt-2">
                當前角色: 
                <span v-for="(role, index) in admin.roles" :key="index" class="badge bg-secondary me-1">
                  {{ getRoleDisplayName(role) }}
                </span>
              </div>
            </div>
            
            <div class="role-list border rounded p-3">
              <!-- ADMIN 角色 - 預設選中且禁用 -->
              <div class="role-item mb-3 p-2 bg-light rounded">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="role-ADMIN" 
                    value="ADMIN" 
                    checked
                    disabled
                  >
                  <label class="form-check-label d-flex justify-content-between align-items-center" for="role-ADMIN">
                    <span>
                      <i class="bi bi-person-fill-lock me-2 text-primary"></i><strong>基礎管理員</strong>
                    </span>
                    <span class="badge bg-primary text-white">基礎管理員權限 (必選)</span>
                  </label>
                </div>
              </div>
              
              <!-- PRODUCT_MANAGER 角色 - 可選 -->
              <div class="role-item mb-3 p-2 rounded" :class="{ 'bg-light-hover': !isProductManager, 'bg-light': isProductManager }">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="role-PRODUCT_MANAGER" 
                    value="PRODUCT_MANAGER" 
                    v-model="selectedRoles"
                  >
                  <label class="form-check-label d-flex justify-content-between align-items-center" for="role-PRODUCT_MANAGER">
                    <span>
                      <i class="bi bi-box-seam me-2 text-success"></i><strong>商品管理員</strong>
                    </span>
                    <span class="badge bg-success text-white">商品管理員權限</span>
                  </label>
                </div>
              </div>
              
              <!-- ACCOUNT_MANAGER 角色 - 可選 -->
              <div class="role-item mb-3 p-2 rounded" :class="{ 'bg-light-hover': !isAccountManager, 'bg-light': isAccountManager }">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="role-ACCOUNT_MANAGER" 
                    value="ACCOUNT_MANAGER" 
                    v-model="selectedRoles"
                  >
                  <label class="form-check-label d-flex justify-content-between align-items-center" for="role-ACCOUNT_MANAGER">
                    <span>
                      <i class="bi bi-person-badge me-2 text-warning"></i><strong>帳號管理員</strong>
                    </span>
                    <span class="badge bg-warning text-dark">帳號管理員權限</span>
                  </label>
                </div>
              </div>
              
              <!-- SUPER_ADMIN 角色 - 可選 -->
              <div class="role-item mb-3 p-2 rounded" :class="{ 'bg-light-hover': !isSuperAdmin, 'bg-light': isSuperAdmin }">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="role-SUPER_ADMIN" 
                    value="SUPER_ADMIN" 
                    v-model="selectedRoles"
                  >
                  <label class="form-check-label d-flex justify-content-between align-items-center" for="role-SUPER_ADMIN">
                    <span>
                      <i class="bi bi-shield-lock me-2 text-danger"></i><strong>超級管理員</strong>
                    </span>
                    <span class="badge bg-danger text-white">超級管理員權限</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light px-4" @click="closeModal">
              <i class="bi bi-x me-1"></i>取消
            </button>
            <button 
              type="button" 
              class="btn btn-info px-4 text-white"
              @click="saveRoles"
            >
              <i class="bi bi-save me-1"></i>儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
    admin: Object,
    allAvailableRoles: Array
  },
  emits: ["close", "save"],
  data() {
    return {
      selectedRoles: []
    };
  },
  computed: {
    isSuperAdmin() {
      return this.selectedRoles.includes('SUPER_ADMIN');
    },
    isProductManager() {
      return this.selectedRoles.includes('PRODUCT_MANAGER');
    },
    isAccountManager() {
      return this.selectedRoles.includes('ACCOUNT_MANAGER');
    },
    // 過濾只保留需要的角色
    filteredRoles() {
      return this.allAvailableRoles.filter(role => 
        ['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER', 'ACCOUNT_MANAGER'].includes(role.roleName)
      );
    }
  },
  watch: {
    admin: {
      handler(newAdmin) {
        if (newAdmin && newAdmin.roles) {
          console.log("現有角色:", newAdmin.roles);
          
          // 初始化選中的角色 (不包括 ADMIN，因為它已經通過 UI 強制選中)
          this.selectedRoles = [];
          
          // 檢查每個角色是否存在
          if (newAdmin.roles.includes('SUPER_ADMIN')) {
            this.selectedRoles.push('SUPER_ADMIN');
          }
          if (newAdmin.roles.includes('PRODUCT_MANAGER')) {
            this.selectedRoles.push('PRODUCT_MANAGER');
          }
          if (newAdmin.roles.includes('ACCOUNT_MANAGER')) {
            this.selectedRoles.push('ACCOUNT_MANAGER');
          }
        } else {
          this.selectedRoles = [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    saveRoles() {
      // 確保 ADMIN 角色始終被選中
      const rolesToSave = ['ADMIN', ...this.selectedRoles.filter(role => role !== 'ADMIN')];
      
      this.$emit("save", {
        userId: this.admin.userId,
        roles: rolesToSave
      });
    },
    getInitials(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },
    getRoleDisplayName(role) {
      switch (role) {
        case 'ADMIN':
          return '基礎管理員';
        case 'PRODUCT_MANAGER':
          return '商品管理員';
        case 'ACCOUNT_MANAGER':
          return '帳號管理員';
        case 'SUPER_ADMIN':
          return '超級管理員';
        default:
          return role; // 如果是未知角色，顯示原始角色名稱
      }
    }
  }
};
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-backdrop {
  z-index: 1040;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.role-list {
  max-height: 300px;
  overflow-y: auto;
}

.role-item {
  transition: background-color 0.2s;
}

.bg-light-hover:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.form-check-input:checked {
  background-color: #4e73df;
  border-color: #4e73df;
}

.form-check-input:disabled:checked {
  opacity: 0.7;
}
</style>