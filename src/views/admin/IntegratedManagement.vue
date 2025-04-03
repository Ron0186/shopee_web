<template>
  <div>
    <h2>訂單系統管理</h2>
    <div class="container">
      <!-- 頁籤導航 -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'paymentMethod' }"
            href="#"
            @click.prevent="activeTab = 'paymentMethod'"
          >
            付款方式管理
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'paymentStatus' }"
            href="#"
            @click.prevent="activeTab = 'paymentStatus'"
          >
            付款狀態管理
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'shipmentMethod' }"
            href="#"
            @click.prevent="activeTab = 'shipmentMethod'"
          >
            配送方式管理
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'shipmentStatus' }"
            href="#"
            @click.prevent="activeTab = 'shipmentStatus'"
          >
            配送狀態管理
          </a>
        </li>
      </ul>

      <!-- 付款方式管理頁籤 -->
      <div v-if="activeTab === 'paymentMethod'">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">付款方式</h5>
            <button class="btn btn-primary" @click="openPaymentMethodDialog()">
              新增付款方式
            </button>
            <table class="table mt-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>付款方式名稱</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paymentMethodList" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    <button
                      class="btn btn-primary me-2"
                      @click="openPaymentMethodDialog(item)"
                    >
                      編輯
                    </button>
                    <button
                      class="btn btn-danger"
                      @click="deletePaymentMethod(item.id)"
                    >
                      刪除付款方式
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 付款狀態管理頁籤 -->
      <div v-if="activeTab === 'paymentStatus'">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">付款狀態</h5>
            <button class="btn btn-primary" @click="openPaymentStatusDialog()">
              新增付款狀態
            </button>
            <table class="table mt-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>付款狀態名稱</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paymentStatusList" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    <button
                      class="btn btn-primary me-2"
                      @click="openPaymentStatusDialog(item)"
                    >
                      編輯
                    </button>
                    <button
                      class="btn btn-danger"
                      @click="deletePaymentStatus(item.id)"
                    >
                      刪除付款狀態
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 配送方式管理頁籤 -->
      <div v-if="activeTab === 'shipmentMethod'">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">配送方式</h5>
            <button class="btn btn-primary" @click="openShipmentMethodDialog()">
              新增配送方式
            </button>
            <table class="table mt-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>配送方式名稱</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in shipmentMethodList" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    <button
                      class="btn btn-primary me-2"
                      @click="openShipmentMethodDialog(item)"
                    >
                      編輯資料
                    </button>
                    <button
                      class="btn btn-danger"
                      @click="deleteShipmentMethod(item.id)"
                    >
                      刪除配送方式
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 配送狀態管理頁籤 -->
      <div v-if="activeTab === 'shipmentStatus'">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">配送狀態</h5>
            <button class="btn btn-primary" @click="openShipmentStatusDialog()">
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
                      @click="openShipmentStatusDialog(item)"
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
      </div>

      <!-- 付款方式對話框 -->
      <div
        class="modal"
        tabindex="-1"
        :class="{
          'd-block': paymentMethodDialogVisible,
          'd-none': !paymentMethodDialogVisible,
        }"
        @click="closePaymentMethodDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ paymentMethodDialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closePaymentMethodDialog"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="paymentMethodName" class="form-label"
                  >付款方式名稱</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="paymentMethodName"
                  v-model="paymentMethodForm.name"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closePaymentMethodDialog"
              >
                關閉
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="savePaymentMethod"
              >
                儲存付款方式
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 付款狀態對話框 -->
      <div
        class="modal"
        tabindex="-1"
        :class="{
          'd-block': paymentStatusDialogVisible,
          'd-none': !paymentStatusDialogVisible,
        }"
        @click="closePaymentStatusDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ paymentStatusDialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closePaymentStatusDialog"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="paymentStatusName" class="form-label"
                  >付款狀態名稱</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="paymentStatusName"
                  v-model="paymentStatusForm.name"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closePaymentStatusDialog"
              >
                關閉
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="savePaymentStatus"
              >
                儲存付款狀態
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 配送方式對話框 -->
      <div
        class="modal"
        tabindex="-1"
        :class="{
          'd-block': shipmentMethodDialogVisible,
          'd-none': !shipmentMethodDialogVisible,
        }"
        @click="closeShipmentMethodDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ shipmentMethodDialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeShipmentMethodDialog"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="shipmentMethodName" class="form-label"
                  >配送方式名稱</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="shipmentMethodName"
                  v-model="shipmentMethodForm.name"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeShipmentMethodDialog"
              >
                關閉
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveShipmentMethod"
              >
                儲存配送方式
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 配送狀態對話框 -->
      <div
        class="modal"
        tabindex="-1"
        :class="{
          'd-block': shipmentStatusDialogVisible,
          'd-none': !shipmentStatusDialogVisible,
        }"
        @click="closeShipmentStatusDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ shipmentStatusDialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeShipmentStatusDialog"
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
                  v-model="shipmentStatusForm.name"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeShipmentStatusDialog"
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

// 激活頁籤
const activeTab = ref("paymentMethod");

// 付款方式狀態變數
const paymentMethodList = ref([]);
const paymentMethodDialogVisible = ref(false);
const paymentMethodDialogTitle = ref("");
const paymentMethodForm = ref({ id: null, name: "" });

// 付款狀態狀態變數
const paymentStatusList = ref([]);
const paymentStatusDialogVisible = ref(false);
const paymentStatusDialogTitle = ref("");
const paymentStatusForm = ref({ id: null, name: "" });

// 配送方式狀態變數
const shipmentMethodList = ref([]);
const shipmentMethodDialogVisible = ref(false);
const shipmentMethodDialogTitle = ref("");
const shipmentMethodForm = ref({ id: null, name: "" });

// 配送狀態狀態變數
const shipmentStatusList = ref([]);
const shipmentStatusDialogVisible = ref(false);
const shipmentStatusDialogTitle = ref("");
const shipmentStatusForm = ref({ id: null, name: "" });

// =============== 付款方式相關功能 ===============

// 獲取所有付款方式
const fetchPaymentMethods = async () => {
  try {
    const response = await axios.get("/api/paymentMethod/all");
    paymentMethodList.value = response.data;
  } catch (error) {
    console.error("獲取付款方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取付款方式失敗",
      icon: "error",
    });
  }
};

// 打開付款方式對話框
const openPaymentMethodDialog = (data = null) => {
  paymentMethodDialogTitle.value = data ? "編輯付款方式" : "新增付款方式";
  paymentMethodDialogVisible.value = true;

  if (data) {
    // 編輯現有支付方式
    paymentMethodForm.value = { ...data };
  } else {
    // 新增支付方式
    paymentMethodForm.value = { id: null, name: "" };
  }
};

// 保存付款方式
const savePaymentMethod = async () => {
  try {
    if (!paymentMethodForm.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入付款方式名稱",
        icon: "warning",
      });
      return;
    }

    const url = paymentMethodForm.value.id
      ? `/api/paymentMethod/${paymentMethodForm.value.id}`
      : `/api/paymentMethod`;
    const method = paymentMethodForm.value.id ? "put" : "post";

    console.log(
      `準備發送 ${method.toUpperCase()} 請求到 ${url}`,
      paymentMethodForm.value
    );
    await axios[method](url, paymentMethodForm.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    paymentMethodDialogVisible.value = false;
    await fetchPaymentMethods();
  } catch (error) {
    console.error("保存付款方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "保存付款方式失敗",
      icon: "error",
    });
  }
};

// 刪除付款方式
const deletePaymentMethod = async (id) => {
  try {
    const result = await Swal.fire({
      title: "確定刪除？",
      text: "刪除後將無法恢復，且相關訂單付款資訊可能會受影響！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/paymentMethod/${id}`);

      Swal.fire({
        title: "成功",
        text: "刪除成功",
        icon: "success",
      });

      await fetchPaymentMethods();
    }
  } catch (error) {
    console.error("刪除付款方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除付款方式失敗",
      icon: "error",
    });
  }
};

// 關閉付款方式對話框
const closePaymentMethodDialog = () => {
  paymentMethodDialogVisible.value = false;
};

// =============== 付款狀態相關功能 ===============

// 獲取所有付款狀態
const fetchPaymentStatuses = async () => {
  try {
    const response = await axios.get("/api/paymentStatus/all");
    paymentStatusList.value = response.data;
  } catch (error) {
    console.error("獲取付款狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取付款狀態失敗",
      icon: "error",
    });
  }
};

// 打開付款狀態對話框
const openPaymentStatusDialog = (data = null) => {
  paymentStatusDialogTitle.value = data ? "編輯付款狀態" : "新增付款狀態";
  paymentStatusDialogVisible.value = true;

  if (data) {
    // 編輯現有支付狀態
    paymentStatusForm.value = { ...data };
  } else {
    // 新增支付狀態
    paymentStatusForm.value = { id: null, name: "" };
  }
};

// 保存付款狀態
const savePaymentStatus = async () => {
  try {
    if (!paymentStatusForm.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入付款狀態名稱",
        icon: "warning",
      });
      return;
    }

    const url = paymentStatusForm.value.id
      ? `/api/paymentStatus/${paymentStatusForm.value.id}`
      : `/api/paymentStatus`;
    const method = paymentStatusForm.value.id ? "put" : "post";

    console.log(
      `準備發送 ${method.toUpperCase()} 請求到 ${url}`,
      paymentStatusForm.value
    );
    await axios[method](url, paymentStatusForm.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    paymentStatusDialogVisible.value = false;
    await fetchPaymentStatuses();
  } catch (error) {
    console.error("保存付款狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "保存付款狀態失敗",
      icon: "error",
    });
  }
};

// 刪除付款狀態
const deletePaymentStatus = async (id) => {
  try {
    const result = await Swal.fire({
      title: "確定刪除？",
      text: "刪除後將無法恢復，且相關訂單付款資訊可能會受影響！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/paymentStatus/${id}`);

      Swal.fire({
        title: "成功",
        text: "刪除成功",
        icon: "success",
      });

      await fetchPaymentStatuses();
    }
  } catch (error) {
    console.error("刪除付款狀態失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除付款狀態失敗",
      icon: "error",
    });
  }
};

// 關閉付款狀態對話框
const closePaymentStatusDialog = () => {
  paymentStatusDialogVisible.value = false;
};

// =============== 配送方式相關功能 ===============

// 獲取所有配送方式
const fetchShipmentMethods = async () => {
  try {
    const response = await axios.get("/api/shipmentMethod/all");
    shipmentMethodList.value = response.data;
  } catch (error) {
    console.error("獲取配送方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取配送方式失敗",
      icon: "error",
    });
  }
};

// 打開配送方式對話框
const openShipmentMethodDialog = (data = null) => {
  shipmentMethodDialogTitle.value = data ? "編輯配送方式" : "新增配送方式";
  shipmentMethodDialogVisible.value = true;

  if (data) {
    // 編輯現有配送方式
    shipmentMethodForm.value = { ...data };
  } else {
    // 新增配送方式
    shipmentMethodForm.value = { id: null, name: "" };
  }
};

// 保存配送方式
const saveShipmentMethod = async () => {
  try {
    if (!shipmentMethodForm.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入配送方式名稱",
        icon: "warning",
      });
      return;
    }

    const url = shipmentMethodForm.value.id
      ? `/api/shipmentMethod/${shipmentMethodForm.value.id}`
      : `/api/shipmentMethod`;
    const method = shipmentMethodForm.value.id ? "put" : "post";

    console.log(
      `準備發送 ${method.toUpperCase()} 請求到 ${url}`,
      shipmentMethodForm.value
    );
    await axios[method](url, shipmentMethodForm.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    shipmentMethodDialogVisible.value = false;
    await fetchShipmentMethods();
  } catch (error) {
    console.error("保存配送方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "保存配送方式失敗",
      icon: "error",
    });
  }
};

// 刪除配送方式
const deleteShipmentMethod = async (id) => {
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
      await axios.delete(`/api/shipmentMethod/${id}`);

      Swal.fire({
        title: "成功",
        text: "刪除成功",
        icon: "success",
      });

      await fetchShipmentMethods();
    }
  } catch (error) {
    console.error("刪除配送方式失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除配送方式失敗",
      icon: "error",
    });
  }
};

// 關閉配送方式對話框
const closeShipmentMethodDialog = () => {
  shipmentMethodDialogVisible.value = false;
};

// =============== 配送狀態相關功能 ===============

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

// 打開配送狀態對話框
const openShipmentStatusDialog = (data = null) => {
  shipmentStatusDialogTitle.value = data ? "編輯配送狀態" : "新增配送狀態";
  shipmentStatusDialogVisible.value = true;

  if (data) {
    // 編輯現有配送狀態
    shipmentStatusForm.value = { ...data };
  } else {
    // 新增配送狀態
    shipmentStatusForm.value = { id: null, name: "" };
  }
};

// 保存配送狀態
const saveShipmentStatus = async () => {
  try {
    if (!shipmentStatusForm.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入配送狀態名稱",
        icon: "warning",
      });
      return;
    }

    const url = shipmentStatusForm.value.id
      ? `/api/shipmentStatus/${shipmentStatusForm.value.id}`
      : `/api/shipmentStatus`;
    const method = shipmentStatusForm.value.id ? "put" : "post";

    console.log(
      `準備發送 ${method.toUpperCase()} 請求到 ${url}`,
      shipmentStatusForm.value
    );
    await axios[method](url, shipmentStatusForm.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    shipmentStatusDialogVisible.value = false;
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

// 關閉配送狀態對話框
const closeShipmentStatusDialog = () => {
  shipmentStatusDialogVisible.value = false;
};

// 初始化 - 載入所有數據
onMounted(() => {
  fetchPaymentMethods();
  fetchPaymentStatuses();
  fetchShipmentMethods();
  fetchShipmentStatuses();
});
</script>

<style scoped>
/* 基本容器樣式 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 頁籤導航樣式 */
.nav-tabs {
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.nav-link {
  cursor: pointer;
  color: #495057;
  background-color: #fff;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 0.5rem 1rem;
  margin-bottom: -1px;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.nav-link.active {
  color: #007bff;
  font-weight: bold;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

/* 卡片樣式 */
.card {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 1.25rem;
}

.card-title {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #343a40;
}

/* 表格樣式 */
.table {
  width: 100%;
  margin-top: 1rem;
  color: #212529;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

/* 按鈕樣式 */
button {
  margin-right: 5px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  color: #fff;
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  color: #fff;
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  color: #fff;
  background-color: #c82333;
  border-color: #bd2130;
}

.me-2 {
  margin-right: 0.5rem;
}

/* 模態框樣式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: none;
  overflow: hidden;
  outline: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.d-block {
  display: block;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 0.5rem;
  pointer-events: none;
  max-width: 500px;
  margin: 1.75rem auto;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
}

.modal-title {
  margin-bottom: 0;
  line-height: 1.5;
}

.btn-close {
  padding: 0.5rem 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  background-color: transparent;
  border: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
}

.btn-close:hover {
  color: #000;
  text-decoration: none;
  opacity: 0.75;
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

/* Form styles */
.mb-3 {
  margin-bottom: 1rem;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
