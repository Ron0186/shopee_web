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
        <!-- 標籤控制 -->
        <div class="application-controls mb-4">
          <div class="btn-group">
            <button
              class="btn px-4"
              :class="[showApproved ? 'btn-success' : 'btn-outline-success']"
              @click="updateView('approved')"
            >
              <i class="bi bi-check-circle me-1"></i>
              已核准
            </button>
            <button
              class="btn px-4"
              :class="[showPending ? 'btn-primary' : 'btn-outline-primary']"
              @click="updateView('pending')"
            >
              <i class="bi bi-hourglass-split me-1"></i>
              待審核
              <span v-if="pendingCount > 0" class="badge bg-danger ms-1">{{ pendingCount }}</span>
            </button>
            <button
              class="btn px-4"
              :class="[showRejected ? 'btn-danger' : 'btn-outline-danger']"
              @click="updateView('rejected')"
            >
              <i class="bi bi-x-circle me-1"></i>
              已拒絕
            </button>
          </div>
        </div>
        
        <!-- 簡化搜尋功能 -->
        <div class="search-container mb-4">
          <div class="row g-2 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="搜尋商店名稱、簡介..."
                  v-model="searchQuery"
                  @keyup.enter="search"
                />
                <button class="btn btn-primary" type="button" @click="search">
                  <i class="bi bi-search me-1"></i> 搜尋
                </button>
              </div>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="sortDir" @change="search">
                <option value="desc">由新到舊</option>
                <option value="asc">由舊到新</option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="pageSize" @change="search">
                <option value="5">每頁 5 筆</option>
                <option value="10">每頁 10 筆</option>
                <option value="20">每頁 20 筆</option>
                <option value="50">每頁 50 筆</option>
              </select>
            </div>
          </div>
        </div>
        
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
                  <th scope="col">申請 ID</th>
                  <th scope="col">用戶 ID</th>
                  <th scope="col">用戶名稱</th>
                  <th scope="col">商店名稱</th>
                  <th scope="col">商店分類</th>
                  <th scope="col">商店簡介</th>
                  <th scope="col">申請時間</th>
                  <th scope="col" class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="applications.length > 0">
                  <tr v-for="app in applications" :key="app.applicationId">
                    <td>{{ app.applicationId }}</td>
                    <td>{{ app.userId }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                          {{ getInitials(app.userName) }}
                        </div>
                        {{ app.userName }}
                      </div>
                    </td>
                    <td>
                      <span class="shop-name">{{ app.shopName }}</span>
                    </td>
                    <td>
                      <span class="badge bg-info text-white">{{ app.shopCategory }}</span>
                    </td>
                    <td>
                      <div class="description-cell" @click="showFullDescription(app.description || app.shopDescription)">
                        {{ truncateDescription(app.description || app.shopDescription) }}
                      </div>
                    </td>
                    <td>{{ formatDate(app.applicationTime || app.createdAt) }}</td>
                    <td class="text-center">
                      <button
                        class="btn btn-success btn-sm me-2"
                        @click="approveApplication(app.applicationId)"
                      >
                        通過
                      </button>
                      <button class="btn btn-danger btn-sm" @click="rejectApplication(app.applicationId)">
                        拒絕
                      </button>
                    </td>
                  </tr>
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
                  <th scope="col">申請 ID</th>
                  <th scope="col">用戶 ID</th>
                  <th scope="col">用戶名稱</th>
                  <th scope="col">商店名稱</th>
                  <th scope="col">商店分類</th>
                  <th scope="col">商店簡介</th>
                  <th scope="col">申請時間</th>
                  <th scope="col">審核人</th>
                  <th scope="col">審核時間</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="applications.length > 0">
                  <tr v-for="app in applications" :key="app.applicationId">
                    <td>{{ app.applicationId }}</td>
                    <td>{{ app.userId }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                          {{ getInitials(app.userName) }}
                        </div>
                        {{ app.userName }}
                      </div>
                    </td>
                    <td>
                      <span class="shop-name">{{ app.shopName }}</span>
                    </td>
                    <td>
                      <span class="badge bg-info text-white">{{ app.shopCategory }}</span>
                    </td>
                    <td>
                      <div class="description-cell" @click="showFullDescription(app.description || app.shopDescription)">
                        {{ truncateDescription(app.description || app.shopDescription) }}
                      </div>
                    </td>
                    <td>{{ formatDate(app.applicationTime || app.createdAt) }}</td>
                    <td>
                      <span class="reviewer-badge">{{ app.reviewer }}</span>
                    </td>
                    <td>{{ formatDate(app.reviewedAt) }}</td>
                  </tr>
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
                  <th scope="col">申請 ID</th>
                  <th scope="col">用戶 ID</th>
                  <th scope="col">用戶名稱</th>
                  <th scope="col">商店名稱</th>
                  <th scope="col">商店分類</th>
                  <th scope="col">商店簡介</th>
                  <th scope="col">申請時間</th>
                  <th scope="col">審核人</th>
                  <th scope="col">拒絕原因</th>
                  <th scope="col">審核時間</th>
                  <th scope="col" class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="applications.length > 0">
                  <tr v-for="app in applications" :key="app.applicationId">
                    <td>{{ app.applicationId }}</td>
                    <td>{{ app.userId }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                          {{ getInitials(app.userName) }}
                        </div>
                        {{ app.userName }}
                      </div>
                    </td>
                    <td>
                      <span class="shop-name">{{ app.shopName }}</span>
                    </td>
                    <td>
                      <span class="badge bg-info text-white">{{ app.shopCategory }}</span>
                    </td>
                    <td>
                      <div class="description-cell" @click="showFullDescription(app.description || app.shopDescription)">
                        {{ truncateDescription(app.description || app.shopDescription) }}
                      </div>
                    </td>
                    <td>{{ formatDate(app.applicationTime || app.createdAt) }}</td>
                    <td>
                      <span class="reviewer-badge">{{ app.reviewer }}</span>
                    </td>
                    <td>
                      <div class="comment-cell" @click="showFullComment(app.adminComment)">
                        {{ truncateDescription(app.adminComment) }}
                      </div>
                    </td>
                    <td>{{ formatDate(app.reviewedAt) }}</td>
                    <td class="text-center">
                      <button class="btn btn-outline-success btn-sm" @click="approveApplication(app.applicationId)" title="重新核准">
                        <i class="bi bi-check-lg"></i>
                      </button>
                    </td>
                  </tr>
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
          <div class="pagination-container d-flex justify-content-between align-items-center mt-3" v-if="totalItems > 0">
            <div class="pagination-info">
              顯示 {{ startItem }}-{{ endItem }} 筆，共 {{ totalItems }} 筆結果
            </div>
            
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a class="page-link" href="#" @click.prevent="handlePageChange(0)">
                    <i class="bi bi-chevron-double-left"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                
                <template v-for="page in visiblePages" :key="page">
                  <li v-if="page === '...'" class="page-item disabled">
                    <span class="page-link">...</span>
                  </li>
                  <li v-else class="page-item" :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="handlePageChange(page)">{{ page + 1 }}</a>
                  </li>
                </template>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="handlePageChange(totalPages - 1)">
                    <i class="bi bi-chevron-double-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
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

export default {
  data() {
    return {
      applications: [], // 儲存當前顯示的申請
      adminId: null,
      showPending: true,
      showApproved: false,
      showRejected: false,
      isLoading: false,
      globalLoading: false,
      
      // 搜尋相關
      searchQuery: "",
      sortBy: "createdAt",
      sortDir: "desc",
      pageSize: 10,
      searchPerformed: false,
      
      // 分頁相關
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      
      // 計數相關
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    };
  },
  computed: {
    startItem() {
      return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
    },
    endItem() {
      const end = (this.currentPage + 1) * this.pageSize;
      return end > this.totalItems ? this.totalItems : end;
    },
    visiblePages() {
      // 定義要顯示的頁碼數量（不包括首尾頁和省略號）
      const maxVisiblePages = 5;
      const pages = [];
      
      if (this.totalPages <= maxVisiblePages + 2) {
        // 如果總頁數較少，全部顯示
        for (let i = 0; i < this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 始終顯示第一頁
        pages.push(0);
        
        // 計算中間顯示的頁碼範圍
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages - 2, startPage + maxVisiblePages - 1);
        
        // 調整開始頁，確保顯示足夠的頁碼
        if (endPage - startPage < maxVisiblePages - 1) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // 添加省略號（如果需要）
        if (startPage > 1) {
          pages.push('...');
        }
        
        // 添加中間頁碼
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        // 添加省略號（如果需要）
        if (endPage < this.totalPages - 2) {
          pages.push('...');
        }
        
        // 始終顯示最後一頁
        pages.push(this.totalPages - 1);
      }
      
      return pages;
    }
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
    
    getInitials(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },
    
    truncateDescription(text) {
      if (!text) return '無';
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return dateStr;
      }
    },
    
    // 更新導航欄徽章計數
    updateNavBadgeCount() {
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
    
    // 展示完整描述
    showFullDescription(description) {
      if (!description) return;
      
      Swal.fire({
        title: '商店簡介',
        html: `<div class="text-start p-3 bg-light rounded">${description || '無'}</div>`,
        width: 600,
        confirmButtonText: '關閉'
      });
    },
    
    // 展示完整拒絕原因
    showFullComment(comment) {
      if (!comment) return;
      
      Swal.fire({
        title: '拒絕原因',
        html: `<div class="text-start p-3 bg-light rounded">${comment || '無'}</div>`,
        width: 600,
        confirmButtonText: '關閉'
      });
    },
    
    // 更新顯示視圖
    updateView(view) {
      this.showPending = view === "pending";
      this.showApproved = view === "approved";
      this.showRejected = view === "rejected";
      
      // 重置搜尋參數
      this.searchQuery = "";
      this.searchPerformed = false;
      
      // 重置分頁
      this.currentPage = 0;
      
      // 獲取新數據
      this.fetchApplications();
    },
    
    // 搜尋功能
    search() {
      this.currentPage = 0;
      this.searchPerformed = true;
      this.fetchApplications();
    },
    
    // 分頁處理
    handlePageChange(page) {
      if (page < 0 || page >= this.totalPages) return;
      if (page === this.currentPage) return;
      
      this.currentPage = page;
      this.fetchApplications();
    },
    
    // 獲取申請數據
    async fetchApplications() {
      this.isLoading = true;
      
      try {
        let params = {
          page: this.currentPage,
          size: this.pageSize,
          query: this.searchQuery.trim(),
          sortBy: this.sortBy,
          sortDir: this.sortDir
        };
        
        // 根據當前視圖設置狀態
        if (this.showPending) params.status = "PENDING";
        else if (this.showApproved) params.status = "APPROVED";
        else if (this.showRejected) params.status = "REJECTED";
        
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
          this.updateNavBadgeCount();
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
    
    // 核准申請
    async approveApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }

      const { isConfirmed } = await Swal.fire({
        title: "確認通過？",
        text: "此操作將核准此商店申請，確認繼續？",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "確認核准",
        cancelButtonText: "取消",
      });

      if (!isConfirmed) return;

      this.globalLoading = true;
      try {
        const response = await axios.post(
          `/api/shop/application/approve/${applicationId}?adminId=${this.adminId}`
        );
        
        this.showSuccess("核准成功", response.data.message || "申請已成功核准!");
        
        // 更新計數
        if (this.showPending) {
          this.pendingCount--;
          this.approvedCount++;
        } else if (this.showRejected) {
          this.rejectedCount--;
          this.approvedCount++;
        }
        
        // 更新導航欄徽章
        this.updateNavBadgeCount();
        
        // 重新加載當前頁面數據
        await this.fetchApplications();
      } catch (error) {
        this.showError("操作失敗：" + (error.response?.data.message || error.message));
      } finally {
        this.globalLoading = false;
      }
    },
    
    // 拒絕申請
    async rejectApplication(applicationId) {
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }

      const { value: text } = await Swal.fire({
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

      if (!text) return;

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

      if (!isConfirmed) return;

      this.globalLoading = true;
      try {
        const response = await axios.post(
          `/api/shop/application/reject/${applicationId}?adminId=${this.adminId}&comment=${encodeURIComponent(text)}`
        );
        
        this.showSuccess("已拒絕", response.data.message || "申請已被拒絕");
        
        // 更新計數
        if (this.showPending) {
          this.pendingCount--;
          this.rejectedCount++;
        }
        
        // 更新導航欄徽章
        this.updateNavBadgeCount();
        
        // 重新加載當前頁面數據
        await this.fetchApplications();
      } catch (error) {
        this.showError("操作失敗：" + (error.response?.data.message || error.message));
      } finally {
        this.globalLoading = false;
      }
    },
    
    // 錯誤提示
    showError(message) {
      Swal.fire({
        icon: "error",
        title: "錯誤",
        text: message,
        confirmButtonText: "確定"
      });
    },
    
    // 成功提示
    showSuccess(title, message) {
      Swal.fire({
        icon: "success",
        title: title,
        text: message,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  },
  mounted() {
    this.adminId = this.getAdminId();
    this.fetchApplications();
    
    // 設置定時器定期更新計數（例如每5分鐘）
    this.countUpdateTimer = setInterval(() => {
      if (!this.isLoading) {
        // 如果沒有正在加載，則獲取最新計數
        axios.get("/api/shop/application/counts")
          .then(response => {
            if (response.data) {
              this.pendingCount = response.data.pending || 0;
              this.approvedCount = response.data.approved || 0;
              this.rejectedCount = response.data.rejected || 0;
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
  min-height: 100vh;
}

.application-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.btn-group {
  border-radius: 0.375rem;
  overflow: hidden;
}

.search-container {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.description-cell, .comment-cell {
  cursor: pointer;
  position: relative;
  white-space: normal;
  word-break: break-word;
  max-width: 200px;
}

.description-cell:hover, .comment-cell:hover {
  color: #007bff;
  text-decoration: underline;
}

.description-cell:hover::after, .comment-cell:hover::after {
  content: "點擊查看完整內容";
  position: absolute;
  top: -30px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 10;
}

.shop-name {
  font-weight: 500;
}

.reviewer-badge {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
}

.pagination-container {
  font-size: 0.875rem;
}

.pagination-info {
  color: #6c757d;
}

.page-link {
  color: #4e73df;
  padding: 0.375rem 0.5rem;
}

.page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
}

.page-item.disabled .page-link {
  color: #6c757d;
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