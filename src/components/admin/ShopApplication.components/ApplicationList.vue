<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">商店申請審核</h2>

    <ApplicationControls :showPending="showPending" :showRejected="showRejected"
      @updateView="updateView" />

    <div class="table-container">
      <table class="table table-bordered table-hover table-striped"
        v-if="showPending">
        <caption class="text-center text-primary">待審核申請</caption>
        <thead class="table-light">
          <tr>
            <th scope="col" style="width: 80px;">申請 ID</th>
            <th scope="col" style="width: 80px;">用戶 ID</th>
            <th scope="col" style="width: 120px;">用戶名稱</th>
            <th scope="col" style="width: 150px;">商店名稱</th>
            <th scope="col" style="width: 120px;">商店分類</th>
            <th scope="col" style="width: 200px;">商店簡介</th>
            <th scope="col" style="width: 150px;">申請時間</th>
            <th scope="col" style="width: 100px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="pendingApplications.length > 0">
            <ApplicationItem v-for="app in pendingApplications"
              :key="app.applicationId" :app="app" @approve="approveApplication"
              @reject="rejectApplication" />
          </template>
          <tr v-else>
            <td colspan="8" class="text-center">查無資料</td>
          </tr>
        </tbody>
      </table>

      <table class="table table-bordered table-hover table-striped"
        v-if="showRejected">
        <caption class="text-center text-danger">已拒絕申請</caption>
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
            <th scope="col" style="width: 80px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="rejectedApplications.length > 0">
            <RejectedApplicationItem v-for="app in rejectedApplications"
              :key="app.applicationId" :app="app"
              @approve="approveApplication" />
          </template>
          <tr v-else>
            <td colspan="11" class="text-center">查無資料</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
// ... (其餘的 <script> 部分保持不變) ...
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import ApplicationControls from "@/components/admin/ShopApplication.components/ApplicationControls.vue";
import ApplicationItem from "@/components/admin/ShopApplication.components/ApplicationItem.vue";
import RejectedApplicationItem from "./RejectedApplicationItem.vue";

export default {
  components: {
    ApplicationControls,
    ApplicationItem,
    RejectedApplicationItem,
  },
  data() {
    return {
      pendingApplications: [],
      rejectedApplications: [],
      adminId: null,
      showPending: true,
      showRejected: false,
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
      try {
        const response = await axios.get("/api/shop/application/pending");
        this.pendingApplications = response.data;
      } catch (error) {
        this.showError("載入待審核申請失敗：" + (error.response?.data.message || error.message));
      }
    },
    async fetchRejectedApplications() {
      if (!this.showRejected) return; // 避免不必要請求
      try {
        const response = await axios.get("/api/shop/application/rejected");
        this.rejectedApplications = response.data;
      } catch (error) {
        this.showError("載入已拒絕申請失敗：" + (error.response?.data.message || error.message));
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
        text: "此操作不可逆!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確認",
        cancelButtonText: "取消",
      });

      if (isConfirmed) {
        try {
          const response = await axios.post(
            `/api/shop/application/approve/${applicationId}?adminId=${this.adminId}`
          );
          Swal.fire("已通過!", response.data.message, "success");
          this.fetchApplications();
          this.fetchRejectedApplications();
        } catch (error) {
          this.showError("操作失敗：" + (error.response?.data.message || error.message));
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
        input: "textarea",
        inputLabel: "拒絕原因",
        inputPlaceholder: "請輸入拒絕原因...",
        showCancelButton: true,
        confirmButtonText: "確認拒絕",
        cancelButtonText: "取消",
        preConfirm: (text) => {
          if (!text) {
            Swal.showValidationMessage("請輸入拒絕原因");
          }
          return text; // 這裡修正確保回傳拒絕原因
        },
      });

      if (text) {
        const response = await Swal.fire({
          title: '確認拒絕？',
          text: "此操作不可逆!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '確認拒絕',
          cancelButtonText: '取消'
        });

        if (response.isConfirmed) {
          try {
            const response = await axios.post(
              `/api/shop/application/reject/${applicationId}?adminId=${this.adminId}&comment=${encodeURIComponent(text)}`
            );
            Swal.fire("已拒絕!", response.data.message, "success");
            this.fetchApplications();
            this.fetchRejectedApplications();
          } catch (error) {
            this.showError("操作失敗：" + (error.response?.data.message || error.message));
          }
        }
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
    updateView(view) {
      if (view === "pending") {
        this.showPending = true;
        this.showRejected = false;
        this.fetchApplications();
      } else {
        this.showPending = false;
        this.showRejected = true;
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
/* 設定表格容器的固定大小 */
.table-container {
  width: 1200px;
  /* 或您希望的寬度 */
  height: 600px;
  /* 或您希望的高度 */
  overflow: auto;
  /* 當內容超出時顯示捲軸 */
  margin: 0 auto;
  /* 讓容器水平置中 */
  border: 1px solid #dee2e6;
  /* 可選：加上邊框 */
  border-radius: 0.25rem;
  /* 可選：加上圓角 */
}

.table-responsive {
  overflow-x: auto;
}

/* 表格標題置中 */
.table caption {
  font-size: 1.2em;
  font-weight: bold;
}

.table {
  table-layout: fixed;
  width: 100%;
}

/* 可選：稍微調整表格欄位寬度，讓內容更緊湊 */
.table th,
.table td {
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>