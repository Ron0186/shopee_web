<template>
  <div class="container mt-5">
    <h2 class="mb-4">商店申請審核</h2>
    <ApplicationControls :showPending="showPending" :showRejected="showRejected" @updateView="updateView"/>

    <table class="table table-bordered" v-if="showPending">
      <thead class="table-light">
        <tr>
          <th>申請 ID</th><th>用戶 ID</th><th>用戶名稱</th><th>商店名稱</th><th>商店分類</th><th>商店簡介</th><th>申請時間</th><th>操作</th>
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
          <td colspan="8" class="text-center">查無資料</td>
        </tr>
      </tbody>
    </table>

    <table class="table table-bordered" v-if="showRejected">
      <thead class="table-light">
        <tr>
          <th>申請 ID</th><th>用戶 ID</th><th>用戶名稱</th><th>商店名稱</th><th>商店分類</th><th>商店簡介</th><th>申請時間</th><th>拒絕原因</th><th>審核人</th><th>審核時間</th><th>操作</th>
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
          <td colspan="11" class="text-center">查無資料</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import ApplicationControls from "@/components/admin/ShopApplication.components/applicationControls.vue";
import ApplicationItem from "@/components/admin/ShopApplication.components/applicationItem.vue";
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
        const adminIdStr = sessionStorage.getItem("adminId");
        console.log("getAdminId - adminIdStr:", adminIdStr); // 檢查原始值

        if (adminIdStr) {
            const adminId = parseInt(adminIdStr, 10);
            console.log("getAdminId - adminId (parsed):", adminId); // 檢查轉換後的數字

            if (!isNaN(adminId)) {
                console.log("getAdminId - returning:", adminId);  // 檢查返回值
                return adminId;
            } else {
                console.error("getAdminId - parseInt failed:", adminIdStr); // 檢查 parseInt 失敗的情況
            }
        }
        console.log("getAdminId - returning null");  // 檢查返回 null 的情況
        return null;
    },
    async fetchApplications() {
      try {
        const response = await axios.get("/api/shop/application/pending");
        this.pendingApplications = response.data;
      } catch (error) {
        this.showError(
          "載入待審核申請失敗：" +
            (error.response?.data.message || error.message)
        );
      }
    },
    async fetchRejectedApplications() {
      try {
        const response = await axios.get("/api/shop/application/rejected");
        this.rejectedApplications = response.data;
      } catch (error) {
        this.showError(
          "載入已拒絕申請失敗：" +
            (error.response?.data.message || error.message)
        );
      }
    },
    async approveApplication(applicationId) {
      this.adminId = this.getAdminId();
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }
      console.log(typeof this.adminId)
      const { value: confirmResult } = await Swal.fire({
        title: "確認通過？",
        text: "此操作不可逆!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確認",
        cancelButtonText: '取消'
      });

      if (confirmResult) {
        try {
          const response = await axios.post(
            `/api/shop/application/approve/${applicationId}?adminId=${this.adminId}`
          );
          if (response.data.success) {
            Swal.fire("已通過!", response.data.message, "success");
            this.fetchApplications();
            this.fetchRejectedApplications();
          } else {
            Swal.fire("錯誤!", response.data.message, "error");
          }
        } catch (error) {
          this.showError(
            "操作失敗：" + (error.response?.data.message || error.message)
          );
        }
      }
    },
    async rejectApplication(applicationId) {
      this.adminId = this.getAdminId();
      if (this.adminId === null) {
        this.showError("未找到管理員 ID，請重新登入");
        return;
      }

      const { value: text } = await Swal.fire({
        input: "textarea",
        inputLabel: "拒絕原因",
        inputPlaceholder: "請輸入拒絕原因...",
        inputAttributes: {
          "aria-label": "Type your message here",
        },
        showCancelButton: true,
        confirmButtonText: "確認拒絕",
        cancelButtonText: "取消",
        preConfirm: (text) => {
          if (!text) {
            Swal.showValidationMessage("請輸入拒絕原因");
          }
          return text;
        },
      });

      if (text) {
          const { value: confirmResult } = await Swal.fire({
            title: '確認拒絕？',
            text: "此操作不可逆!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '確認拒絕',
            cancelButtonText: '取消'
          });

        if (confirmResult) {
          try {
            const response = await axios.post(
              `/api/shop/application/reject/${applicationId}?adminId=${this.adminId}&comment=${encodeURIComponent(text)}`
            );

            if (response.data.success) {
              Swal.fire("已拒絕!", response.data.message, "success");
              this.fetchApplications();
              this.fetchRejectedApplications();
            } else {
              Swal.fire("錯誤!", response.data.message, "error");
            }
          } catch (error) {
            this.showError(
              "操作失敗：" + (error.response?.data.message || error.message)
            );
          }
        }
      }
    },
    showError(message) {
      Swal.fire({
        icon: "error",
        title: "錯誤",
        text: message,
        confirmButtonText: "確定",
      });
    },
    updateView(view){
      if(view === 'pending'){
        this.showPending = true;
        this.showRejected = false;
      }
      else{
        this.showPending = false;
        this.showRejected = true;
      }
    }
  },
  mounted() {
    this.fetchApplications();
    this.fetchRejectedApplications();
    this.adminId = this.getAdminId(); // 在 mounted 中獲取 adminId
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>