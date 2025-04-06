<template>
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
</template>

<script>
import axios from "@/plugins/axios";

export default {
  props: {
    showPending: {
      type: Boolean,
      default: true
    },
    showApproved: {
      type: Boolean,
      default: false
    },
    showRejected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      // 防抖計時器
      debounceTimer: null
    };
  },
  emits: ["updateView", "requestCounts"],
  methods: {
    updateView(view) {
      this.$emit("updateView", view);
    },
    async fetchApplicationCounts() {
      try {
        // 這裡假設你的API有提供計數端點，如果沒有可以用各表格的長度估算
        const response = await axios.get("/api/shop/application/counts");
        this.pendingCount = response.data.pending || 0;
        this.approvedCount = response.data.approved || 0;
        this.rejectedCount = response.data.rejected || 0;
      } catch (error) {
        console.error("獲取申請計數失敗:", error);
        // 如果API不存在，您可以註釋掉上面的代碼，直接使用下面的代碼
        // 從父組件獲取計數
        this.fetchCountsFromParent();
      }
    },
    fetchCountsFromParent() {
      // 使用事件請求父組件提供計數
      this.$emit("requestCounts");
    },
    updateCounts(counts) {
      // 清除之前的防抖計時器
      clearTimeout(this.debounceTimer);
      
      // 設置新的防抖計時器，50毫秒內的多次更新會合併為一次
      this.debounceTimer = setTimeout(() => {
        if (typeof counts === 'object' && counts !== null) {
          // 如果是完整的計數對象
          if ('pending' in counts) this.pendingCount = counts.pending;
          if ('approved' in counts) this.approvedCount = counts.approved;
          if ('rejected' in counts) this.rejectedCount = counts.rejected;
        } else if (typeof counts === 'object' && 'type' in counts && 'amount' in counts) {
          // 如果是部分更新 {type: 'pending', amount: -1} 格式
          const { type, amount } = counts;
          if (type === 'pending') this.pendingCount += amount;
          else if (type === 'approved') this.approvedCount += amount;
          else if (type === 'rejected') this.rejectedCount += amount;
        }
        
        // 確保計數不為負數
        this.pendingCount = Math.max(0, this.pendingCount);
        this.approvedCount = Math.max(0, this.approvedCount);
        this.rejectedCount = Math.max(0, this.rejectedCount);
        
        // 可選：更新 localStorage 緩存
        this.saveCounts();
      }, 50);
    },
    // 提供給其他元件使用的更新計數方法
    updateCount(type, amount) {
      this.updateCounts({ type, amount });
    },
    // 緩存計數到 localStorage
    saveCounts() {
      try {
        localStorage.setItem('shop_application_counts', JSON.stringify({
          pending: this.pendingCount,
          approved: this.approvedCount,
          rejected: this.rejectedCount,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('無法保存計數到 localStorage:', e);
      }
    },
    // 從 localStorage 恢復計數
    loadCounts() {
      try {
        const savedCounts = localStorage.getItem('shop_application_counts');
        if (savedCounts) {
          const counts = JSON.parse(savedCounts);
          // 檢查緩存是否過期 (24小時)
          const isExpired = Date.now() - counts.timestamp > 24 * 60 * 60 * 1000;
          
          if (!isExpired) {
            this.pendingCount = counts.pending || 0;
            this.approvedCount = counts.approved || 0;
            this.rejectedCount = counts.rejected || 0;
            return true;
          }
        }
      } catch (e) {
        console.warn('無法從 localStorage 讀取計數:', e);
      }
      return false;
    }
  },
  mounted() {
    // 先嘗試從 localStorage 載入
    const loadedFromCache = this.loadCounts();
    
    if (!loadedFromCache) {
      // 如果無法從緩存載入，就從服務器獲取
      this.fetchApplicationCounts();
    } else {
      // 即使從緩存載入了，也在背景更新一次最新數據
      setTimeout(() => {
        this.fetchApplicationCounts();
      }, 500);
    }
    
    // 掛載全局事件總線監聽器（如果你的專案使用了事件總線）
    if (this.$root.eventBus) {
      this.$root.eventBus.$on('application-count-change', this.updateCounts);
    }
  },
  beforeDestroy() {
    // 清理全局事件監聽器
    if (this.$root.eventBus) {
      this.$root.eventBus.$off('application-count-change', this.updateCounts);
    }
    
    // 清理防抖計時器
    clearTimeout(this.debounceTimer);
  }
};
</script>

<style scoped>
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

.status-info {
  display: flex;
  align-items: center;
}

.application-stats {
  display: flex;
  gap: 1rem;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f8f9fa;
}

.stats-item.pending {
  color: #0d6efd;
}

.stats-item.approved {
  color: #198754;
}

.stats-item.rejected {
  color: #dc3545;
}

.btn .badge {
  font-size: 0.65rem;
  position: relative;
  top: -1px;
}
</style>