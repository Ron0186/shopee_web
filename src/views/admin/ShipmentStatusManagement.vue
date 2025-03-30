<template>
  <div>
    <h2>配送狀態管理</h2>
    <div class="container">
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">配送狀態</h5>
          <button class="btn btn-primary" @click="openDialog()">
            新增配送狀態
          </button>
          <table class="table mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>配送狀態名稱</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in shipmentStatusList" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <button
                    class="btn btn-primary me-2"
                    @click="openDialog(item)"
                  >
                    編輯資料
                  </button>
                  <button
                    class="btn btn-danger"
                    @click="deleteShipmentStatus(item.id)"
                  >
                    刪除配送狀態
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 新增/編輯配送狀態 Dialog -->
      <div
        class="modal"
        tabindex="-1"
        :class="{ 'd-block': dialogVisible, 'd-none': !dialogVisible }"
        @click="closeDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ dialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDialog"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="shipmentStatusName" class="form-label"
                  >配送狀態名稱</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="shipmentStatusName"
                  v-model="form.name"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeDialog"
              >
                關閉
              </button>

              <button
                type="button"
                class="btn btn-primary"
                @click="saveShipmentStatus"
              >
                儲存配送狀態
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

// 狀態變數
const shipmentStatusList = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const form = ref({ id: null, name: "" });

// 獲取所有配送狀態
const fetchShipmentStatuses = async () => {
  try {
    const response = await axios.get("/api/shipmentStatus/all");
    shipmentStatusList.value = response.data;
  } catch (error) {
    console.error("獲取配送狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取配送狀態失敗",
      icon: "error",
    });
  }
};

// 打開對話框
const openDialog = (data = null) => {
  dialogTitle.value = data ? "編輯配送狀態" : "新增配送狀態";
  dialogVisible.value = true;

  if (data) {
    // 編輯現有配送狀態
    form.value = { ...data };
  } else {
    // 新增配送狀態
    form.value = { id: null, name: "" };
  }
};

// 保存配送狀態
const saveShipmentStatus = async () => {
  try {
    if (!form.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入配送狀態名稱",
        icon: "warning",
      });
      return;
    }

    const url = form.value.id
      ? `/api/shipmentStatus/${form.value.id}`
      : `/api/shipmentStatus`;
    const method = form.value.id ? "put" : "post";

    console.log(`準備發送 ${method.toUpperCase()} 請求到 ${url}`, form.value);
    await axios[method](url, form.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    dialogVisible.value = false;
    await fetchShipmentStatuses();
  } catch (error) {
    console.error("保存配送狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "保存配送狀態失敗",
      icon: "error",
    });
  }
};

// 刪除配送狀態
const deleteShipmentStatus = async (id) => {
  try {
    const result = await Swal.fire({
      title: "確定刪除？",
      text: "刪除後將無法恢復，且相關訂單物流資訊可能會受影響！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/shipmentStatus/${id}`);

      Swal.fire({
        title: "成功",
        text: "刪除成功",
        icon: "success",
      });

      await fetchShipmentStatuses();
    }
  } catch (error) {
    console.error("刪除配送狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除配送狀態失敗",
      icon: "error",
    });
  }
};

// 關閉對話框
const closeDialog = () => {
  dialogVisible.value = false;
};

// 初始化
onMounted(() => {
  fetchShipmentStatuses();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table {
  margin-top: 20px;
}

button {
  margin-right: 5px;
}
</style>
