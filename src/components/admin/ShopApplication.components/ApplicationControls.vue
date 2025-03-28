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
    
    <div class="status-info">
      <div class="application-stats">
        <div class="stats-item pending">
          <i class="bi bi-hourglass-split"></i>
          <span>待審核: {{ pendingCount }}</span>
        </div>
        <div class="stats-item approved">
          <i class="bi bi-check-circle"></i>
          <span>已核准: {{ approvedCount }}</span>
        </div>
        <div class="stats-item rejected">
          <i class="bi bi-x-circle"></i>
          <span>已拒絕: {{ rejectedCount }}</span>
        </div>
      </div>
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
      rejectedCount: 0
    };
  },
  emits: ["updateView"],
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
      this.pendingCount = counts.pending;
      this.approvedCount = counts.approved;
      this.rejectedCount = counts.rejected;
    }
  },
  mounted() {
    this.fetchApplicationCounts();
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