<template>
  <div class="search-container mb-4">
    <div class="row g-2">
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
        <select class="form-select" v-model="selectedStatus">
          <option value="ALL">全部狀態</option>
          <option value="PENDING">待審核</option>
          <option value="APPROVED">已核准</option>
          <option value="REJECTED">已拒絕</option>
        </select>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="sortBy">
          <option value="createdAt">申請時間</option>
          <option value="shopName">商店名稱</option>
          <option value="applicationId">申請 ID</option>
        </select>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="sortDir">
          <option value="desc">由新到舊</option>
          <option value="asc">由舊到新</option>
        </select>
      </div>
    </div>
    
    <!-- 進階搜索選項 (可以摺疊) -->
    <div class="mt-2">
      <button
        class="btn btn-sm btn-outline-secondary"
        type="button"
        @click="showAdvanced = !showAdvanced"
      >
        <i class="bi" :class="showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        進階選項
      </button>
      
      <div v-if="showAdvanced" class="mt-2 p-2 border rounded bg-light">
        <div class="row g-2 align-items-center">
          <div class="col-md-3">
            <label class="form-label mb-0">每頁顯示:</label>
            <select class="form-select form-select-sm" v-model="pageSize" @change="search">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label mb-0">日期範圍:</label>
            <div class="d-flex gap-2">
              <input
                type="date"
                class="form-control form-control-sm"
                v-model="dateFrom"
              />
              <input
                type="date"
                class="form-control form-control-sm"
                v-model="dateTo"
              />
            </div>
          </div>
          <div class="col-md-3">
            <button class="btn btn-sm btn-primary mt-3" @click="search">
              套用篩選
            </button>
            <button class="btn btn-sm btn-outline-secondary mt-3 ms-1" @click="resetFilters">
              重設
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
      selectedStatus: "ALL",
      sortBy: "createdAt", // 修改默認排序欄位為 createdAt
      sortDir: "desc",
      pageSize: 10,
      showAdvanced: false,
      dateFrom: "",
      dateTo: ""
    };
  },
  emits: ["search"],
  methods: {
    search() {
      // 組合搜尋參數
      const searchParams = {
        query: this.searchQuery.trim(),
        status: this.selectedStatus,
        sortBy: this.sortBy,
        sortDir: this.sortDir,
        size: this.pageSize,
        page: 0 // 搜索時重置到第一頁
      };

      // 添加日期過濾條件（如果有）
      if (this.dateFrom) {
        searchParams.dateFrom = this.dateFrom;
      }
      if (this.dateTo) {
        searchParams.dateTo = this.dateTo;
      }

      // 發送搜索事件到父組件
      this.$emit("search", searchParams);
    },
    resetFilters() {
      this.searchQuery = "";
      this.selectedStatus = "ALL";
      this.sortBy = "createdAt"; // 修改為 createdAt
      this.sortDir = "desc";
      this.pageSize = 10;
      this.dateFrom = "";
      this.dateTo = "";
      
      // 重置後立即搜尋
      this.search();
    },
    updateStatusFilter(status) {
      this.selectedStatus = status;
      this.search();
    }
  }
};
</script>

<style scoped>
.search-container {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>