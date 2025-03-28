<template>
  <div class="admin-dashboard p-4">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0 font-weight-bold text-primary">
            <i class="bi bi-shop me-2"></i>商店申請審核
          </h5>
        </div>
      </div>
      
      <div class="card-body">
        <!-- 過濾選項 -->
        <ApplicationControls 
          :showPending="showPending" 
          :showApproved="showApproved"
          :showRejected="showRejected"
          @updateView="updateView" 
        />
        
        <!-- 表格容器 -->
        <div class="table-container position-relative mt-3">
          <!-- 表格加載指示器 -->
          <div v-if="isLoading" class="table-overlay">
            <div class="table-loading-indicator">
              <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
              <span class="ms-2">載入中...</span>
            </div>
          </div>

          <!-- 待審核申請表格 -->
          <div class="table-responsive" v-if="showPending">
            <table class="table table-hover border">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 80px;">申請 ID</th>
                  <th scope="col" style="width: 80px;">用戶 ID</th>
                  <th scope="col" style="width: 120px;">用戶名稱</th>
                  <th scope="col" style="width: 150px;">商店名稱</th>
                  <th scope="col" style="width: 120px;">商店分類</th>
                  <th scope="col" style="width: 200px;">商店簡介</th>
                  <th scope="col" style="width: 150px;">申請時間</th>
                  <th scope="col" style="width: 120px;" class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="pendingApplications.length > 0">
                  <ApplicationItem 
                    v-for="app in pendingApplications"
                    :key="app.applicationId" 
                    :app="app" 
                    @approve="approveApplication"
                    @reject="rejectApplication" 
                  />
                </template>
                <tr v-else>
                  <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-inbox fa-3x text-muted mb-3"></i>
                      <p>查無待審核申請</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 已核准申請表格 -->
          <div class="table-responsive" v-if="showApproved">
            <table class="table table-hover border">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 60px;">申請 ID</th>
                  <th scope="col" style="width: 60px;">用戶 ID</th>
                  <th scope="col" style="width: 100px;">用戶名稱</th>
                  <th scope="col" style="width: 130px;">商店名稱</th>
                  <th scope="col" style="width: 100px;">商店分類</th>
                  <th scope="col" style="width: 150px;">商店簡介</th>
                  <th scope="col" style="width: 120px;">申請時間</th>
                  <th scope="col" style="width: 80px;">審核人</th>
                  <th scope="col" style="width: 120px;">審核時間</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="approvedApplications.length > 0">
                  <ApprovedApplicationItem 
                    v-for="app in approvedApplications"
                    :key="app.applicationId" 
                    :app="app" 
                  />
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-check-circle fa-3x text-muted mb-3"></i>
                      <p>查無已核准申請</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 已拒絕申請表格 -->
          <div class="table-responsive" v-if="showRejected">
            <table class="table table-hover border">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 60px;">申請 ID</th>
                  <th scope="col" style="width: 60px;">用戶 ID</th>
                  <th scope="col" style="width: 100px;">用戶名稱</th>
                  <th scope="col" style="width: 130px;">商店名稱</th>
                  <th scope="col" style="width: 100px;">商店分類</th>
                  <th scope="col" style="width: 150px;">商店簡介</th>
                  <th scope="col" style="width: 120px;">申請時間</th>
                  <th scope="col" style="width: 80px;">審核人</th>
                  <th scope="col" style="width: 150px;">拒絕原因</th>
                  <th scope="col" style="width: 120px;">審核時間</th>
                  <th scope="col" style="width: 80px;" class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="rejectedApplications.length > 0">
                  <RejectedApplicationItem 
                    v-for="app in rejectedApplications"
                    :key="app.applicationId" 
                    :app="app"
                    @approve="approveApplication" 
                  />
                </template>
                <tr v-else>
                  <td colspan="11" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-x-circle fa-3x text-muted mb-3"></i>
                      <p>查無已拒絕申請</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中遮罩 -->
    <div v-if="globalLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import ApplicationControls from "@/components/admin/ShopApplication.components/ApplicationControls.vue";
import ApplicationItem from "@/components/admin/ShopApplication.components/ApplicationItem.vue";
import RejectedApplicationItem from "./RejectedApplicationItem.vue";
import ApprovedApplicationItem from "./ApprovedApplicationItem.vue";

export default {
  components: {
    ApplicationControls,
    ApplicationItem,
    RejectedApplicationItem,
    ApprovedApplicationItem
  },
  data() {
    return {
      pendingApplications: [],
      approvedApplications: [],
      rejectedApplications: [],
      adminId: null,
      showPending: true,
      showApproved: false,
      showRejected: false,
      isLoading: false,
      globalLoading: false
    };
  },
  methods: {
    getAdminId() {
      const adminIdStr = localStorage.getItem("userId");
      if (!adminIdStr) {
        console.warn("未找到 userId，請確認是否正確存入 localStorage");
        return null;
      }
      const adminId = parseInt(adminIdStr, 10);
      if (isNaN(adminId)) {
        console.error("userId 轉換失敗:", adminIdStr);
        return null;
      }
      return adminId;
    },
    async fetchApplications() {
      if (!this.showPending) return; // 避免不必要請求
      
      this.isLoading = true;
      try {
        const response = await axios.get("/api/shop/application/pending");
        this.pendingApplications = response.data;
      } catch (error) {
        this.showError("載入待審核申請失敗：" + (error.response?.data.message || error.message));
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      }
    },
    async fetchApprovedApplications() {
      if (!this.showApproved) return; // 避免不必要請求
      
      this.isLoading = true;
      try {
        const response = await axios.get("/api/shop/application/approved");
        this.approvedApplications = response.data;
      } catch (error) {
        this.showError("載入已核准申請失敗：" + (error.response?.data.message || error.message));
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      }
    },
    async fetchRejectedApplications() {
      if (!this.showRejected) return; // 避免不必要請求
      
      this.isLoading = true;
      try {
        const response = await axios.get("/api/shop/application/rejected");
        this.rejectedApplications = response.data;
      } catch (error) {
        this.showError("載入已拒絕申請失敗：" + (error.response?.data.message || error.message));
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      }
    },
    async approveApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }

      const {
        isConfirmed
      } = await Swal.fire({
        title: "確認通過？",
        text: "此操作將核准此商店申請，確認繼續？",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "確認核准",
        cancelButtonText: "取消",
      });

      if (isConfirmed) {
        this.globalLoading = true;
        try {
          const response = await axios.post(
            `/api/shop/application/approve/${applicationId}?adminId=${this.adminId}`
          );
          
          this.showSuccess("核准成功", response.data.message || "申請已成功核准!");
          
          // 刷新所有列表
          await this.refreshAllLists();
        } catch (error) {
          this.showError("操作失敗：" + (error.response?.data.message || error.message));
        } finally {
          this.globalLoading = false;
        }
      }
    },
    async rejectApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }

      const {
        value: text
      } = await Swal.fire({
        title: '拒絕申請',
        input: "textarea",
        inputLabel: "拒絕原因",
        inputPlaceholder: "請輸入拒絕原因...",
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "下一步",
        cancelButtonText: "取消",
        inputValidator: (value) => {
          if (!value) {
            return '請輸入拒絕原因';
          }
        }
      });

      if (text) {
        const { isConfirmed } = await Swal.fire({
          title: '確認拒絕？',
          html: `<div class="text-start">
                  <p><strong>拒絕原因:</strong></p>
                  <p class="bg-light p-2 rounded">${text}</p>
                  <p class="text-danger">此操作將拒絕此商店申請，確認繼續？</p>
                </div>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '確認拒絕',
          cancelButtonText: '返回修改'
        });

        if (isConfirmed) {
          this.globalLoading = true;
          try {
            const response = await axios.post(
              `/api/shop/application/reject/${applicationId}?adminId=${this.adminId}&comment=${encodeURIComponent(text)}`
            );
            
            this.showSuccess("已拒絕", response.data.message || "申請已被拒絕");
            
            // 刷新所有列表
            await this.refreshAllLists();
          } catch (error) {
            this.showError("操作失敗：" + (error.response?.data.message || error.message));
          } finally {
            this.globalLoading = false;
          }
        }
      }
    },
    async refreshAllLists() {
      // 不管當前顯示哪個列表，都刷新所有數據
      if (this.showPending) {
        await this.fetchApplications();
      }
      
      if (this.showApproved) {
        await this.fetchApprovedApplications();
      }
      
      if (this.showRejected) {
        await this.fetchRejectedApplications();
      }
    },
    showError(message) {
      Swal.fire({
        icon: "error",
        title: "錯誤",
        text: message,
        confirmButtonText: "確定"
      });
    },
    showSuccess(title, message) {
      Swal.fire({
        icon: "success",
        title: title,
        text: message,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    },
    updateView(view) {
      this.showPending = view === "pending";
      this.showApproved = view === "approved";
      this.showRejected = view === "rejected";
      
      if (this.showPending) {
        this.fetchApplications();
      } else if (this.showApproved) {
        this.fetchApprovedApplications();
      } else if (this.showRejected) {
        this.fetchRejectedApplications();
      }
    },
  },
  mounted() {
    this.adminId = this.getAdminId();
    this.fetchApplications();
  },
};
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fc;
  min-height: 100vh;
}

.table-container {
  min-height: 400px;
  position: relative;
  border-radius: 0.25rem;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  table-layout: fixed;
  width: 100%;
}

.table th,
.table td {
  padding: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>