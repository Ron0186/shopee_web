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
          @requestCounts="provideCounts"
          ref="appControls"
        />
        
        <!-- 搜尋功能 -->
        <ApplicationSearch 
          @search="handleSearch"
          ref="searchComponent"
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
                <template v-if="applications.length > 0">
                  <ApplicationItem 
                    v-for="app in applications"
                    :key="app.applicationId" 
                    :app="app"
                    :countManager="countManager" 
                    @approve="approveApplication"
                    @reject="rejectApplication"
                    @update-counts="updateApplicationCounts"
                  />
                </template>
                <tr v-else>
                  <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-inbox fa-3x text-muted mb-3"></i>
                      <p>{{ searchPerformed ? '查無符合搜尋條件的申請' : '查無待審核申請' }}</p>
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
                <template v-if="applications.length > 0">
                  <ApprovedApplicationItem 
                    v-for="app in applications"
                    :key="app.applicationId" 
                    :app="app" 
                  />
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-check-circle fa-3x text-muted mb-3"></i>
                      <p>{{ searchPerformed ? '查無符合搜尋條件的申請' : '查無已核准申請' }}</p>
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
                <template v-if="applications.length > 0">
                  <RejectedApplicationItem 
                    v-for="app in applications"
                    :key="app.applicationId" 
                    :app="app"
                    :countManager="countManager"
                    @approve="approveApplication"
                    @update-counts="updateApplicationCounts"
                  />
                </template>
                <tr v-else>
                  <td colspan="11" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-x-circle fa-3x text-muted mb-3"></i>
                      <p>{{ searchPerformed ? '查無符合搜尋條件的申請' : '查無已拒絕申請' }}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 分頁控制 -->
          <PaginationControls
            v-if="totalItems > 0"
            :current-page="currentPage"
            :page-size="pageSize"
            :total-items="totalItems"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
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
import RejectedApplicationItem from "@/components/admin/ShopApplication.components/RejectedApplicationItem.vue";
import ApprovedApplicationItem from "@/components/admin/ShopApplication.components/ApprovedApplicationItem.vue";
import ApplicationSearch from "@/components/admin/ShopApplication.components/ApplicationSearch.vue";
import PaginationControls from "@/components/admin/ShopApplication.components/PaginationControls.vue";

export default {
  components: {
    ApplicationControls,
    ApplicationItem,
    RejectedApplicationItem,
    ApprovedApplicationItem,
    ApplicationSearch,
    PaginationControls
  },
  data() {
    return {
      applications: [], // 統一使用一個數組存儲當前顯示的申請
      adminId: null,
      showPending: true,
      showApproved: false,
      showRejected: false,
      isLoading: false,
      globalLoading: false,
      
      // 分頁相關
      currentPage: 0,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      
      // 計數相關
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      
      // 搜索相關
      searchParams: null,
      searchPerformed: false,
      
      // 計數管理對象
      countManager: null
    };
  },
  methods: {
    updateNavBadgeCount() {
      // 更新頂部導航欄的徽章
      const navBadgeElement = document.querySelector('.badge.bg-danger');
      if (navBadgeElement) {
        if (this.pendingCount > 0) {
          navBadgeElement.textContent = this.pendingCount;
          navBadgeElement.style.display = '';
        } else {
          navBadgeElement.style.display = 'none';
        }
      }
      
      // 同時更新整個應用中的其他地方
      if (window.$shopApp) {
        window.$shopApp.pendingCount = this.pendingCount;
      }
      
      // 也可以使用事件通知其他元件
      this.$root.$emit('update-shop-badge', this.pendingCount);
    },
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
    async handleSearch(params) {
      this.searchParams = params;
      this.currentPage = params.page || 0;
      this.pageSize = params.size || 10;
      
      await this.fetchApplications();
      this.searchPerformed = true;
    },
    async handlePageChange(page) {
      this.currentPage = page;
      await this.fetchApplications();
    },
    async fetchApplications() {
  this.isLoading = true;
  
  try {
    // 如果有搜索參數，使用搜索 API
    if (this.searchParams) {
      const params = {
        ...this.searchParams,
        page: this.currentPage,
        size: this.pageSize
      };
      
      // 如果通過頁簽切換，更新 status 參數
      if (this.showPending) params.status = "PENDING";
      else if (this.showApproved) params.status = "APPROVED";
      else if (this.showRejected) params.status = "REJECTED";
      
      // 將 applicationTime 替換為 createdAt（如果存在）
      if (params.sortBy === "applicationTime") {
        params.sortBy = "createdAt";
      }
      
      const response = await axios.get("/api/shop/application/search", { params });
      
      this.applications = response.data.content;
      this.totalItems = response.data.totalItems;
      this.totalPages = response.data.totalPages;
      this.currentPage = response.data.currentPage;
      
      // 更新計數
      if (response.data.counts) {
        this.pendingCount = response.data.counts.pending || 0;
        this.approvedCount = response.data.counts.approved || 0;
        this.rejectedCount = response.data.counts.rejected || 0;
        // 更新 ApplicationControls 組件的計數
        this.updateCountsDisplayFromData();
      }
    } 
    // 如果沒有搜索參數，使用原有 API
    else {
      let response;
      if (this.showPending) {
        response = await axios.get("/api/shop/application/pending");
        this.applications = response.data;
        this.pendingCount = response.data.length;
      } else if (this.showApproved) {
        response = await axios.get("/api/shop/application/approved");
        this.applications = response.data;
        this.approvedCount = response.data.length;
      } else if (this.showRejected) {
        response = await axios.get("/api/shop/application/rejected");
        this.applications = response.data;
        this.rejectedCount = response.data.length;
      }
      
      this.totalItems = this.applications.length;
      this.totalPages = 1;
      this.currentPage = 0;
      
      // 更新 ApplicationControls 組件的計數
      this.updateCountsDisplayFromData();
    }
  } catch (error) {
    this.showError("載入申請失敗：" + (error.response?.data.message || error.message));
    console.error("載入申請錯誤詳情:", error);
    this.applications = [];
    this.totalItems = 0;
    this.totalPages = 0;
  } finally {
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }
},
    updateCountsFromResponse(data) {
      // 假設 API 回傳包含各狀態的計數
      if (data.counts) {
        this.pendingCount = data.counts.pending || 0;
        this.approvedCount = data.counts.approved || 0;
        this.rejectedCount = data.counts.rejected || 0;
      }
    },
    async approveApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return Promise.reject("未找到管理員 ID");
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

      if (!isConfirmed) {
        return Promise.reject("使用者取消操作");
      }

      this.globalLoading = true;
      try {
        const response = await axios.post(
          `/api/shop/application/approve/${applicationId}?adminId=${this.adminId}`
        );
        
        this.showSuccess("核准成功", response.data.message || "申請已成功核准!");
        
        // 重新加載當前頁面數據
        await this.fetchApplications();
        
        // 如果是從已拒絕列表批准的，更新計數
        if (this.showRejected) {
          this.pendingCount++;
          this.rejectedCount--;
        }
        
        return Promise.resolve(true);
      } catch (error) {
        this.showError("操作失敗：" + (error.response?.data.message || error.message));
        return Promise.reject(error);
      } finally {
        this.globalLoading = false;
      }
    },
    async rejectApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return Promise.reject("未找到管理員 ID");
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

      if (!text) {
        return Promise.reject("未輸入拒絕原因");
      }

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

      if (!isConfirmed) {
        return Promise.reject("使用者取消操作");
      }

      this.globalLoading = true;
      try {
        const response = await axios.post(
          `/api/shop/application/reject/${applicationId}?adminId=${this.adminId}&comment=${encodeURIComponent(text)}`
        );
        
        this.showSuccess("已拒絕", response.data.message || "申請已被拒絕");
        
        // 重新加載當前頁面數據
        await this.fetchApplications();
        
        return Promise.resolve(true);
      } catch (error) {
        this.showError("操作失敗：" + (error.response?.data.message || error.message));
        return Promise.reject(error);
      } finally {
        this.globalLoading = false;
      }
    },
    updateCountsFromData() {
      // 計算計數（適用於搜索頁面載入後）
      this.pendingCount = this.showPending ? this.applications.length : this.pendingCount;
      this.approvedCount = this.showApproved ? this.applications.length : this.approvedCount;
      this.rejectedCount = this.showRejected ? this.applications.length : this.rejectedCount;
    },
    updateCountsDisplayFromData() {
      // 更新顯示的計數
      if (this.$refs.appControls) {
        this.$refs.appControls.updateCounts({
          pending: this.pendingCount,
          approved: this.approvedCount,
          rejected: this.rejectedCount
        });
      }
    },
    provideCounts() {
      // 提供計數給子組件
      this.updateCountsDisplayFromData();
    },
    updateApplicationCounts(countData) {
      // 將計數更新轉發給 ApplicationControls 組件
      if (this.$refs.appControls) {
        this.$refs.appControls.updateCounts(countData);
      }
      
      // 同時更新本地計數
      if (countData.type === 'pending') {
        this.pendingCount += countData.amount;
      } else if (countData.type === 'approved') {
        this.approvedCount += countData.amount;
      } else if (countData.type === 'rejected') {
        this.rejectedCount += countData.amount;
      }
      
      // 確保計數不為負
      this.pendingCount = Math.max(0, this.pendingCount);
      this.approvedCount = Math.max(0, this.approvedCount);
      this.rejectedCount = Math.max(0, this.rejectedCount);
      
      // 更新導航欄徽章
      this.updateNavBadgeCount();
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
      
      // 重置搜索參數
      if (this.$refs.searchComponent) {
        this.$refs.searchComponent.resetFilters();
      } else {
        this.searchParams = null;
        this.searchPerformed = false;
      }
      
      // 重置分頁
      this.currentPage = 0;
      
      // 獲取新數據
      this.fetchApplications();
    }
  },
  created() {
    // 創建計數管理者對象
    this.countManager = {
      updateCount: (type, amount) => {
        this.updateApplicationCounts({ type, amount });
      }
    };
  },
  mounted() {
    this.adminId = this.getAdminId();
    this.fetchApplications();
    
    // 設置定時器定期更新計數（例如每5分鐘）
    this.countUpdateTimer = setInterval(() => {
      if (!this.searchPerformed) {
        // 如果沒有正在搜索，則獲取最新計數
        axios.get("/api/shop/application/counts")
          .then(response => {
            if (response.data) {
              this.pendingCount = response.data.pending || 0;
              this.approvedCount = response.data.approved || 0;
              this.rejectedCount = response.data.rejected || 0;
              this.updateCountsDisplayFromData();
              this.updateNavBadgeCount();
            }
          })
          .catch(error => {
            console.warn("無法自動更新申請計數:", error);
          });
      }
    }, 300000); // 5分鐘 = 300000毫秒
  },
  beforeDestroy() {
    // 清理定時器
    if (this.countUpdateTimer) {
      clearInterval(this.countUpdateTimer);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  /* background-color: #f8f9fc; */
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