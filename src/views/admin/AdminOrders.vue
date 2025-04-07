<template>
  <div class="admin-orders">
    <h2>📋 後台訂單管理</h2>

    <div v-if="loading" class="loading-section">
      <p>正在加載訂單資料...</p>
    </div>

    <div v-else-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="loadOrders">重新嘗試</button>
    </div>

    <div v-else>
      <!-- 訂單篩選 -->
      <div class="filter-section">
        <label for="status">📌 訂單狀態：</label>
        <select v-model="filterCriteria.status" class="status-dropdown">
          <option value="all">全部</option>
          <option value="PENDING">待處理</option>
          <option value="PROCESSING">處理中</option>
          <option value="SHIPPED">已出貨</option>
          <option value="DELIVERED">已送達</option>
          <option value="CANCELLED">已取消</option>
          <option value="COMPLETED">已完成</option>
        </select>
      </div>

      <!-- 訂單統計 -->
      <div class="order-stats">
        <div class="stats-item">
          <span class="stats-label">總訂單數：</span>
          <span class="stats-value">{{ orders.length }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">篩選後訂單數：</span>
          <span class="stats-value">{{ filteredOrders.length }}</span>
        </div>
      </div>

      <!-- 訂單表格 -->
      <div v-if="filteredOrders.length > 0" class="table-wrapper">
        <table class="order-table">
          <thead>
            <tr>
              <th>📌 訂單編號</th>
              <th>👤 用戶</th>
              <th>💰 總金額</th>
              <th>📦 訂單狀態</th>
              <th>💳 付款方式</th>
              <th>💰 付款狀態</th>
              <th>🚚 運送狀態</th>
              <th>🛒 商品數量</th>
              <th>⏳ 成立時間</th>
              <th>🔍 操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.orderId"
              :data-order-id="order.orderId"
            >
              <td>{{ order.orderId }}</td>
              <td>{{ order.userName || "未知用戶" }}</td>
              <td class="price">${{ formatPrice(order.totalPrice) }}</td>

              <!-- 訂單狀態 -->
              <td :class="statusClass(order.status)" class="order-status">
                {{ translateOrderStatus(order.status) }}
              </td>

              <!-- 付款方式 -->
              <td>
                {{ translatePaymentMethod(order.paymentMethod) }}
              </td>

              <!-- 付款狀態 -->
              <td :class="paymentStatusClass(order.paymentStatus)">
                {{ translatePaymentStatus(order.paymentStatus) }}
              </td>

              <!-- 運送狀態 -->
              <td :class="shipmentStatusClass(order.shipmentStatus)">
                {{ translateShipmentStatus(order.shipmentStatus) }}
              </td>
              <td>{{ getTotalQuantity(order.items) }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view-btn" @click="viewOrder(order)">
                    <i class="bi bi-eye"></i> 查看
                  </button>
                  <button
                    class="action-btn edit-btn-small"
                    @click="quickEditOrder(order)"
                    :data-order-id="order.orderId"
                  >
                    <i class="bi bi-pencil"></i> 編輯
                  </button>
                  <button
                    class="action-btn delete-btn-small"
                    @click="confirmDelete(order)"
                  >
                    <i class="bi bi-trash"></i> 刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="no-orders">
        <p>沒有符合條件的訂單記錄</p>
      </div>

      <!-- 使用Bootstrap Vue Next的模態框 -->
      <!-- 訂單詳情模態框 -->
      <b-modal
        v-model="showOrderDetailModal"
        title="訂單詳情"
        size="lg"
        hide-footer
        modal-class="detail-modal"
      >
        <div v-if="selectedOrder">
          <div class="order-details">
            <div class="detail-section">
              <h4>📋 基本資訊</h4>
              <p>
                <strong>💰 總金額：</strong>
                <span class="order-amount-highlight"
                  >${{ formatPrice(selectedOrder.totalPrice) }}</span
                >
              </p>
              <p>
                <strong>📦 訂單狀態：</strong>
                <select
                  v-model="selectedOrder.status"
                  class="status-dropdown form-control"
                >
                  <option value="PENDING">待處理</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="DELIVERED">已送達</option>
                  <option value="CANCELLED">已取消</option>
                  <option value="COMPLETED">已完成</option>
                </select>
              </p>
              <p>
                <strong>⏳ 成立時間：</strong>
                {{ formatDate(selectedOrder.createdAt) }}
              </p>
              <p>
                <strong>⚡ 更新時間：</strong>
                {{ formatDate(selectedOrder.updatedAt) }}
              </p>
            </div>

            <div class="detail-section">
              <h4>👤 用戶資訊</h4>
              <p>
                <strong>用戶名稱：</strong>
                <input
                  type="text"
                  v-model="selectedOrder.userName"
                  class="form-control"
                />
              </p>
              <p>
                <strong>電子郵件：</strong>
                <input
                  type="email"
                  v-model="selectedOrder.email"
                  class="form-control"
                />
              </p>
              <p>
                <strong>電話：</strong>
                <input
                  type="tel"
                  v-model="selectedOrder.phone"
                  class="form-control"
                />
              </p>
            </div>

            <div class="detail-section">
              <h4>📍 地址資訊</h4>
              <p>
                <strong>帳單地址：</strong>
                <textarea
                  v-model="selectedOrder.billingAddress"
                  class="form-control"
                  rows="2"
                ></textarea>
              </p>
              <p>
                <strong>收貨地址：</strong>
                <textarea
                  v-model="selectedOrder.shippingAddress"
                  class="form-control"
                  rows="2"
                ></textarea>
              </p>
            </div>

            <div class="detail-section">
              <h4>💳 付款資訊</h4>
              <p>
                <strong>付款方式：</strong>
                <select
                  v-model="selectedOrder.paymentMethod"
                  class="form-control"
                >
                  <option value="">請選擇</option>
                  <option value="CREDIT_CARD">信用卡</option>
                  <option value="BANK_TRANSFER">銀行轉帳</option>
                  <option value="CASH_ON_DELIVERY">貨到付款</option>
                </select>
              </p>
              <p>
                <strong>付款狀態：</strong>
                <select
                  v-model="selectedOrder.paymentStatus"
                  class="form-control"
                >
                  <option value="">請選擇</option>
                  <option value="PAID">已付款</option>
                  <option value="UNPAID">未付款</option>
                  <option value="REFUNDED">已退款</option>
                </select>
              </p>
            </div>

            <div class="detail-section">
              <h4>🚚 運送資訊</h4>
              <p>
                <strong>運送方式：</strong>
                <select
                  v-model="selectedOrder.shipmentMethod"
                  class="form-control"
                >
                  <option value="">請選擇</option>
                  <option value="STANDARD">標準運送</option>
                  <option value="EXPRESS">快速運送</option>
                  <option value="STORE_PICKUP">門市取貨</option>
                </select>
              </p>
              <p>
                <strong>運送狀態：</strong>
                <select
                  v-model="selectedOrder.shipmentStatus"
                  class="form-control"
                >
                  <option value="">請選擇</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="DELIVERED">已送達</option>
                </select>
              </p>
              <p>
                <strong>追蹤號碼：</strong>
                <input
                  type="text"
                  v-model="selectedOrder.trackingNumber"
                  class="form-control"
                />
              </p>
            </div>
          </div>

          <h4>🛒 商品列表：</h4>
          <div
            v-if="selectedOrder.items && selectedOrder.items.length > 0"
            class="order-items"
          >
            <table class="items-table">
              <thead>
                <tr>
                  <th>商品名稱</th>
                  <th>數量</th>
                  <th>單價</th>
                  <th>小計</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedOrder.items" :key="index">
                  <td>
                    <input
                      type="text"
                      v-model="item.productName"
                      class="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      min="1"
                      class="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      v-model.number="item.unitPrice"
                      min="0"
                      step="0.01"
                      class="form-control"
                    />
                  </td>
                  <td class="item-subtotal">
                    ${{ formatPrice(item.unitPrice * item.quantity) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="no-items">此訂單沒有商品</p>

          <!-- 操作按鈕 -->
          <div class="modal-buttons">
            <button class="edit-btn" @click="updateOrder">
              <i class="bi bi-save"></i> 更新訂單
            </button>
            <button class="delete-btn" @click="deleteOrder">
              <i class="bi bi-trash"></i> 刪除訂單
            </button>
            <button class="close-btn" @click="closeOrderDetailModal">
              <i class="bi bi-x-circle"></i> 關閉
            </button>
          </div>
        </div>
      </b-modal>

      <!-- 快速編輯模態框 -->
      <b-modal
        v-model="showQuickEditModal"
        title="快速編輯訂單狀態"
        hide-footer
        modal-class="status-edit-modal"
        id="quickEditModal"
      >
        <div v-if="quickEditOrderData" class="quick-edit-content">
          <p>
            <strong>訂單編號：</strong>
            <span class="order-id-highlight">{{
              quickEditOrderData.orderId
            }}</span>
            <input
              type="hidden"
              id="edit-order-id"
              :value="quickEditOrderData.orderId"
            />
          </p>
          <p>
            <strong>用戶：</strong>
            {{ quickEditOrderData.userName || "未知用戶" }}
          </p>
          <p>
            <strong>總金額：</strong>
            <span class="order-amount-highlight"
              >${{ formatPrice(quickEditOrderData.totalPrice) }}</span
            >
          </p>

          <div class="edit-status-section">
            <label for="order-status-select"
              ><strong>更新訂單狀態：</strong></label
            >
            <select v-model="quickEditOrderData.status">
              <option value="PENDING">未付款</option>
              <option value="PAID">已付款</option>
              <option value="PREPARING">備貨中</option>
              <option value="PROCESSING">處理中</option>
              <option value="SHIPPED">已出貨</option>
              <option value="DELIVERED">已送達</option>
              <option value="CANCELLED">已取消</option>
              <option value="COMPLETED">已完成</option>
            </select>
          </div>

          <div class="modal-buttons">
            <button
              class="edit-btn btn-update"
              id="update-status-btn"
              @click="saveQuickEdit"
            >
              <i class="bi bi-save"></i> 保存更改
            </button>
            <button class="close-btn" @click="closeQuickEditModal">
              <i class="bi bi-x-circle"></i> 取消
            </button>
          </div>
        </div>
      </b-modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "axios";
import { useUserStore } from "@/stores/user";
// 引入 Bootstrap Vue Next 組件
import { BModal, BButton } from "bootstrap-vue-next";
import { log } from "sockjs-client/dist/sockjs";

const userStore = useUserStore();
const orders = ref([]);
const selectedOrder = ref(null);
const quickEditOrderData = ref(null);
const filterCriteria = ref({ status: "all" });
const loading = ref(true);
const error = ref(null);
const updateInProgress = ref(false); // 新增：用於追蹤更新狀態
// 將中文狀態轉成英文代碼
const normalizeOrderData = (order) => {
  const normalizeField = (value) => statusCodeMap[value] || value;
  return {
    ...order,
    status: normalizeField(order.status),
    paymentStatus: normalizeField(order.paymentStatus),
    shipmentStatus: normalizeField(order.shipmentStatus),
    paymentMethod: order.paymentMethod || "-",
  };
};

// 中文對應英文代碼
const statusCodeMap = {
  未付款: "PENDING",
  已付款: "PAID",
  備貨中: "PREPARING",
  處理中: "PROCESSING",
  已出貨: "SHIPPED",
  已送達: "DELIVERED",
  已取消: "CANCELLED",
  已完成: "COMPLETED",
};

// 英文代碼對應中文
const statusNameMap = {
  PENDING: "未付款",
  PAID: "已付款",
  PREPARING: "備貨中",
  PROCESSING: "處理中",
  SHIPPED: "已出貨",
  DELIVERED: "已送達",
  CANCELLED: "已取消",
  COMPLETED: "已完成",
  all: "全部",
};

// 付款方式代碼對應的中文名稱
const paymentMethodMap = {
  CREDIT_CARD: "信用卡",
  CREDIT: "信用卡",
  BANK_TRANSFER: "銀行轉帳",
  CASH_ON_DELIVERY: "貨到付款",
};

// 付款狀態代碼對應的中文名稱
const paymentStatusMap = {
  PAID: "已付款",
  UNPAID: "未付款",
  REFUNDED: "已退款",
};

// 運送狀態代碼對應的中文名稱
const shipmentStatusMap = {
  PROCESSING: "處理中",
  SHIPPED: "已出貨",
  DELIVERED: "已送達",
};

// 運送方式代碼對應的中文名稱
const shipmentMethodMap = {
  STANDARD: "標準運送",
  EXPRESS: "快速運送",
  STORE_PICKUP: "門市取貨",
};

// 監聽快速編輯訂單狀態的變化
watch(
  () => quickEditOrderData.value?.status,
  (newStatus, oldStatus) => {
    if (newStatus && newStatus !== oldStatus) {
      console.log(
        `狀態從 ${statusNameMap[oldStatus]} 變更為 ${statusNameMap[newStatus]}`
      );
    }
  }
);

const getTotalQuantity = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

const paymentStatusClass = (status) => {
  switch (status) {
    case "PAID":
      return "text-success paid";
    case "UNPAID":
      return "text-danger unpaid";
    case "REFUNDED":
      return "text-warning refunded";
    default:
      return "";
  }
};

const shipmentStatusClass = (status) => {
  switch (status) {
    case "SHIPPED":
      return "text-info shipped";
    case "DELIVERED":
      return "text-success delivered";
    case "PROCESSING":
      return "text-warning processing";
    default:
      return "";
  }
};

// 訂單狀態轉中文
const translateOrderStatus = (status) => {
  if (Object.values(statusNameMap).includes(status)) return status;
  console.log("翻譯訂單狀態:", status);

  return statusNameMap[status] || "-";
};

// 付款方式轉中文
const translatePaymentMethod = (method) => {
  return paymentMethodMap[method] || "-";
};

// 付款狀態轉中文
const translatePaymentStatus = (status) => {
  return paymentStatusMap[status] || "-";
};

// 運送狀態轉中文
const translateShipmentStatus = (status) => {
  return shipmentStatusMap[status] || "-";
};

// 控制模態框顯示的狀態
const showOrderDetailModal = ref(false);
const showQuickEditModal = ref(false);

onMounted(async () => {
  await loadOrders();

  // 確保 DOM 完全渲染後執行這些操作
  nextTick(() => {
    // 為訂單狀態下拉選單添加change事件監聽器
    const statusSelect = document.getElementById("order-status-select");
    if (statusSelect) {
      statusSelect.addEventListener("change", function () {
        console.log("訂單狀態變更為:", statusNameMap[this.value]);
      });
    }

    // 為保存按鈕添加點擊事件監聽器 (作為備用方案)
    const updateBtn = document.getElementById("update-status-btn");
    if (updateBtn) {
      updateBtn.addEventListener("click", function (e) {
        console.log("更新按鈕點擊 (DOM事件)");
        // 這裡不執行實際更新邏輯，因為Vue的@click已處理
      });
    }
  });
});

async function loadOrders() {
  loading.value = true;
  error.value = null;

  try {
    if (!userStore.token) {
      error.value = "您尚未登入或授權已過期，請重新登入";
      loading.value = false;
      return;
    }

    const response = await axios.get("/api/orders/admin/orders", {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    console.log("API 回應:", response);

    if (response.data && response.data.data) {
      const rawOrders = response.data.data;

      // ✅ 把每筆訂單的中文欄位轉成標準英文代碼
      orders.value = rawOrders.map(normalizeOrderData);

      console.log("✅ 已處理後端回傳資料，筆數：", orders.value.length);
    } else {
      console.error("❓ 未預期的API回傳格式:", response.data);
      error.value = "伺服器返回了意外的數據格式";
    }
  } catch (err) {
    console.error("❌ 取得訂單失敗:", err);

    if (err.response) {
      const statusCode = err.response.status;
      if (statusCode === 401) {
        error.value = "登入已過期，請重新登入";
      } else if (statusCode === 403) {
        error.value = "您沒有權限訪問此資源";
      } else {
        error.value = `伺服器錯誤 (${statusCode}): ${
          err.response.data?.message || "未知錯誤"
        }`;
      }
    } else if (err.request) {
      error.value = "無法連接到伺服器，請檢查網絡連接";
    } else {
      error.value = err.message || "發生未知錯誤";
    }
  } finally {
    loading.value = false;
  }
}

const filteredOrders = computed(() => {
  if (!orders.value.length) return [];

  const filter = filterCriteria.value.status;
  if (filter === "all") return orders.value;

  return orders.value.filter((order) => order.status === filter);
});

// 查看訂單詳情
const viewOrder = (order) => {
  try {
    console.log("查看訂單詳情:", order);
    // 創建一個安全的副本，避免引用相關問題
    const safeOrder = JSON.parse(JSON.stringify(order));
    // 確保有一個空的items數組，避免undefined錯誤
    if (!safeOrder.items) {
      safeOrder.items = [];
    }
    selectedOrder.value = safeOrder;
    // 打開模態框
    showOrderDetailModal.value = true;
    console.log("設置後的selectedOrder:", selectedOrder.value);
  } catch (error) {
    console.error("設置訂單詳情時出錯:", error);
  }
};

// 關閉訂單詳情模態框
const closeOrderDetailModal = () => {
  showOrderDetailModal.value = false;
  // 在模態框完全關閉後清空selectedOrder
  setTimeout(() => {
    selectedOrder.value = null;
  }, 300);
};

// 快速編輯訂單 - 改進版本
const quickEditOrder = (order) => {
  console.log("快速編輯訂單:", order);

  // 創建一個深拷貝，避免直接修改原始資料
  quickEditOrderData.value = JSON.parse(JSON.stringify(order));

  // 打開模態窗口
  showQuickEditModal.value = true;

  // 確保下次DOM更新後執行
  nextTick(() => {
    // 更新隱藏的訂單ID字段
    const editOrderIdField = document.getElementById("edit-order-id");
    if (editOrderIdField) {
      editOrderIdField.value = order.orderId;
    }

    // 確保狀態下拉選單選中正確的值
    const statusSelect = document.getElementById("order-status-select");
    if (statusSelect) {
      statusSelect.value = order.status;
    }
  });
};

// 關閉快速編輯模態框
const closeQuickEditModal = () => {
  showQuickEditModal.value = false;
  // 在模態框完全關閉後清空quickEditOrderData
  setTimeout(() => {
    quickEditOrderData.value = null;
  }, 300);
};

const saveQuickEdit = async () => {
  if (!quickEditOrderData.value) {
    console.error("未找到要更新的訂單數據");
    return;
  }

  if (updateInProgress.value) {
    console.log("更新已在進行中，請稍候...");
    return;
  }

  updateInProgress.value = true;

  try {
    console.log(
      "正在嘗試更新訂單狀態...",
      quickEditOrderData.value.orderId,
      quickEditOrderData.value.status,
      statusNameMap[quickEditOrderData.value.status] ||
        quickEditOrderData.value.status
    );

    const updateBtn = document.querySelector("#quickEditModal .btn-update");
    if (updateBtn) {
      updateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 更新中...';
      updateBtn.disabled = true;
    }

    const response = await axios.put(
      `/api/orders/${quickEditOrderData.value.orderId}`,
      {
        status: quickEditOrderData.value.status,
      },
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    );

    console.log("訂單快速更新回應:", response);

    if (
      response.data &&
      (response.data.success || response.data.status === "success")
    ) {
      // ✅ 更新完後重新請求訂單清單資料，確保畫面與後端一致
      await loadOrders();

      alert(
        `✅ 訂單狀態已更新為「${
          statusNameMap[quickEditOrderData.value.status] ||
          quickEditOrderData.value.status
        }」！`
      );
      closeQuickEditModal();
    } else {
      alert(
        `❌ 訂單狀態更新失敗: ${
          response.data?.message || "伺服器返回了意外的回應"
        }`
      );
    }
  } catch (err) {
    console.error("❌ 訂單狀態更新失敗:", err);
    alert(
      `❌ 訂單狀態更新失敗: ${
        err.response?.data?.message || err.message || "未知錯誤"
      }`
    );
  } finally {
    const updateBtn = document.querySelector("#quickEditModal .btn-update");
    if (updateBtn) {
      updateBtn.innerHTML = '<i class="bi bi-save"></i> 保存更改';
      updateBtn.disabled = false;
    }

    updateInProgress.value = false;
  }
};

// 確認刪除訂單
const confirmDelete = (order) => {
  if (confirm(`⚠️ 確定要刪除訂單 #${order.orderId} 嗎？此操作無法撤銷！`)) {
    deleteOrderById(order.orderId);
  }
};

// 刪除指定ID的訂單
const deleteOrderById = async (orderId) => {
  try {
    const response = await axios.delete(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    console.log("訂單刪除回應:", response);

    // 根據回應更新本地訂單數據
    if (
      response.data &&
      (response.data.success || response.data.status === "success")
    ) {
      // 從本地移除已刪除的訂單
      orders.value = orders.value.filter((o) => o.orderId !== orderId);
      alert("🗑️ 訂單已成功刪除！");
    } else {
      alert(
        `❌ 訂單刪除失敗: ${response.data?.message || "伺服器返回了意外的回應"}`
      );
    }
  } catch (err) {
    console.error("❌ 訂單刪除失敗:", err);
    alert(
      `❌ 訂單刪除失敗: ${
        err.response?.data?.message || err.message || "未知錯誤"
      }`
    );
  }
};

// 更新訂單 - 修改為處理所有可編輯字段的更新
const updateOrder = async () => {
  if (!selectedOrder.value) return;

  try {
    // 顯示加載狀態
    const updateBtn = document.querySelector(".modal-buttons .edit-btn");
    if (updateBtn) {
      updateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 更新中...';
      updateBtn.disabled = true;
    }

    // 準備要發送的數據，包含所有可編輯字段
    const orderData = {
      status: selectedOrder.value.status,
      userName: selectedOrder.value.userName,
      email: selectedOrder.value.email,
      phone: selectedOrder.value.phone,
      billingAddress: selectedOrder.value.billingAddress,
      shippingAddress: selectedOrder.value.shippingAddress,
      paymentMethod: selectedOrder.value.paymentMethod,
      paymentStatus: selectedOrder.value.paymentStatus,
      shipmentMethod: selectedOrder.value.shipmentMethod,
      shipmentStatus: selectedOrder.value.shipmentStatus,
      trackingNumber: selectedOrder.value.trackingNumber,
      items: selectedOrder.value.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    const response = await axios.put(
      `/api/orders/${selectedOrder.value.orderId}`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    );

    console.log("訂單更新回應:", response);

    // 根據回應更新本地訂單數據
    if (
      response.data &&
      (response.data.success || response.data.status === "success")
    ) {
      // 找到並更新本地訂單
      const index = orders.value.findIndex(
        (o) => o.orderId === selectedOrder.value.orderId
      );
      if (index !== -1) {
        // 更新訂單數據
        const updatedOrder = response.data.data || response.data;
        orders.value[index] = { ...orders.value[index], ...updatedOrder };

        // 如果API沒有返回完整數據，則使用我們的本地更新數據
        if (!updatedOrder.items) {
          orders.value[index] = { ...orders.value[index], ...orderData };
        }
      }

      alert("✅ 訂單資料更新成功！");
      closeOrderDetailModal();
    } else {
      alert(
        `❌ 訂單更新失敗: ${response.data?.message || "伺服器返回了意外的回應"}`
      );
    }
  } catch (err) {
    console.error("❌ 訂單更新失敗:", err);
    alert(
      `❌ 訂單更新失敗: ${
        err.response?.data?.message || err.message || "未知錯誤"
      }`
    );
  } finally {
    // 恢復按鈕狀態
    const updateBtn = document.querySelector(".modal-buttons .edit-btn");
    if (updateBtn) {
      updateBtn.innerHTML = '<i class="bi bi-save"></i> 更新訂單';
      updateBtn.disabled = false;
    }
  }
};

const deleteOrder = async () => {
  if (!selectedOrder.value) return;

  if (!confirm("⚠️ 確定要刪除此訂單嗎？此操作無法撤銷！")) {
    return;
  }

  try {
    const response = await axios.delete(
      `/api/orders/${selectedOrder.value.orderId}`,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    );

    console.log("訂單刪除回應:", response);

    // 根據回應更新本地訂單數據
    if (
      response.data &&
      (response.data.success || response.data.status === "success")
    ) {
      // 從本地移除已刪除的訂單
      orders.value = orders.value.filter(
        (o) => o.orderId !== selectedOrder.value.orderId
      );

      alert("🗑️ 訂單已成功刪除！");
      closeOrderDetailModal();
    } else {
      alert(
        `❌ 訂單刪除失敗: ${response.data?.message || "伺服器返回了意外的回應"}`
      );
    }
  } catch (err) {
    console.error("❌ 訂單刪除失敗:", err);
    alert(
      `❌ 訂單刪除失敗: ${
        err.response?.data?.message || err.message || "未知錯誤"
      }`
    );
  }
};

const statusClass = (status) => {
  switch (status) {
    case "PENDING":
      return "pending";
    case "PROCESSING":
      return "processing";
    case "SHIPPED":
      return "shipped";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    default:
      return "";
  }
};

const formatDate = (date) => {
  if (!date) return "未知";
  return new Date(date).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return "0.00";
  return Number(price).toFixed(2);
};
</script>

<style scoped>
/* 訂單管理頁面全局樣式 */
.admin-orders {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: "Noto Sans TC", sans-serif;
}

/* 修正標題區域，確保不被擋住 */
.admin-orders h2 {
  font-size: 1.8rem;
  margin-top: 60px; /* 增加頂部間距，確保標題不被頂部導航欄擋住 */
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #f5a623;
  padding-bottom: 10px;
  clear: both; /* 清除浮動 */
}

/* 載入和錯誤訊息區域 */
.loading-section,
.error-section {
  text-align: center;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error-message {
  color: #dc3545;
  font-weight: 500;
}

.retry-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #c82333;
}

/* 篩選區域 */
.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-section label {
  margin-right: 10px;
  font-weight: 500;
}

.status-dropdown {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: white;
  min-width: 150px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.status-dropdown:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 訂單統計信息 */
.order-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stats-item {
  background-color: #fff;
  padding: 12px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-weight: 500;
  color: #555;
}

.stats-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f5a623;
}

/* 訂單表格 - 修正表格跑版問題 */
.table-wrapper {
  overflow-x: auto; /* 允許在小螢幕上水平滾動 */
  margin-bottom: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed; /* 固定表格布局，防止跑版 */
}

/* 定義每列的寬度 */
.order-table th:nth-child(1),
.order-table td:nth-child(1) {
  width: 5%; /* 訂單編號列 */
  text-align: center;
}

.order-table th:nth-child(2),
.order-table td:nth-child(2) {
  width: 10%; /* 用戶列 */
}

.order-table th:nth-child(3),
.order-table td:nth-child(3) {
  width: 10%; /* 總金額列 */
  text-align: right;
}

.order-table th:nth-child(4),
.order-table td:nth-child(4) {
  width: 10%; /* 訂單狀態列 */
  text-align: center;
}

.order-table th:nth-child(5),
.order-table td:nth-child(5) {
  width: 10%; /* 付款方式列 */
  text-align: center;
}

.order-table th:nth-child(6),
.order-table td:nth-child(6) {
  width: 10%; /* 付款狀態列 */
  text-align: center;
}

.order-table th:nth-child(7),
.order-table td:nth-child(7) {
  width: 10%; /* 運送狀態列 */
  text-align: center;
}

.order-table th:nth-child(8),
.order-table td:nth-child(8) {
  width: 5%; /* 商品數量列 */
  text-align: center;
}

.order-table th:nth-child(9),
.order-table td:nth-child(9) {
  width: 15%; /* 成立時間列 */
  text-align: center;
}

.order-table th:nth-child(10),
.order-table td:nth-child(10) {
  width: 15%; /* 操作列 */
  text-align: center;
}

.order-table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
  text-align: left;
  padding: 12px 15px;
  border-bottom: 2px solid #dee2e6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-table tr:hover {
  background-color: #f8f9fa;
}

.order-table .price {
  font-weight: 500;
  color: #28a745;
}

/* 訂單狀態樣式 - 簡化為純文字樣式 */
.order-status {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.pending {
  color: #c0932a;
}

.processing {
  color: #3498db;
}

.shipped {
  color: #27ae60;
}

.delivered {
  color: #16a085;
}

.cancelled {
  color: #e74c3c;
}

.completed {
  color: #2c3e50;
}

/* 付款狀態樣式 - 簡化為純文字樣式 */
.paid,
.unpaid,
.refunded {
  font-size: 14px;
  text-align: center;
}

.paid {
  color: #28a745;
  font-weight: 500;
}

.unpaid {
  color: #dc3545;
  font-weight: 500;
}

.refunded {
  color: #ffc107;
  font-weight: 500;
}

/* 運送狀態樣式 - 簡化為純文字樣式 */
.shipped,
.delivered,
.processing {
  font-size: 14px;
  text-align: center;
}

.shipped {
  color: #17a2b8;
  font-weight: 500;
}

.delivered {
  color: #28a745;
  font-weight: 500;
}

.processing {
  color: #ffc107;
  font-weight: 500;
}

/* 操作按鈕樣式 - 修正跑版問題 */
.action-buttons {
  display: flex;
  justify-content: center; /* 居中對齊 */
  gap: 8px;
}

.action-btn {
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; /* 文字圖標居中 */
  transition: all 0.2s ease;
  min-width: 60px; /* 統一按鈕寬度 */
}

.action-btn i {
  margin-right: 4px;
}

.view-btn {
  background-color: #e9f7fe;
  color: #3498db;
}

.view-btn:hover {
  background-color: #3498db;
  color: white;
}

.edit-btn-small {
  background-color: #eafaf1;
  color: #27ae60;
}

.edit-btn-small:hover {
  background-color: #27ae60;
  color: white;
}

.delete-btn-small {
  background-color: #fdedec;
  color: #e74c3c;
}

.delete-btn-small:hover {
  background-color: #e74c3c;
  color: white;
}

/* 沒有訂單的提示 */
.no-orders {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
  font-size: 16px;
}

/* 模態框樣式 */
.detail-modal .modal-content,
.status-edit-modal .modal-content {
  border-radius: 8px;
  overflow: hidden;
}

.detail-modal .modal-header,
.status-edit-modal .modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 15px 20px;
}

.detail-modal .modal-title,
.status-edit-modal .modal-title {
  font-weight: 600;
  color: #333;
}

.detail-modal .modal-body,
.status-edit-modal .modal-body {
  padding: 20px;
}

/* 訂單詳情模態框 */
.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.detail-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
}

.detail-section p {
  margin-bottom: 10px;
}

.order-amount-highlight {
  font-size: 1.1rem;
  font-weight: 600;
  color: #28a745;
}

.order-id-highlight {
  font-weight: 600;
  color: #3498db;
}

/* 訂單項目表格 */
.order-items {
  margin-top: 15px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background-color: #e9ecef;
  padding: 10px;
  text-align: left;
  font-weight: 500;
  border-bottom: 1px solid #dee2e6;
}

.items-table td {
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
}

.item-subtotal {
  font-weight: 500;
  color: #28a745;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 模態框按鈕 */
.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.edit-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.edit-btn i {
  margin-right: 6px;
}

.edit-btn:hover {
  background-color: #218838;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.delete-btn i {
  margin-right: 6px;
}

.delete-btn:hover {
  background-color: #c82333;
}

.close-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.close-btn i {
  margin-right: 6px;
}

.close-btn:hover {
  background-color: #5a6268;
}

/* 快速編輯模態框 */
.quick-edit-content {
  padding: 10px;
}

.edit-status-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.edit-status-section label {
  display: block;
  margin-bottom: 8px;
}

/* 沒有商品的提示 */
.no-items {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}

/* 響應式調整 - 修改以確保表格在小螢幕上也能正常顯示 */
@media (max-width: 992px) {
  .order-details {
    grid-template-columns: 1fr;
  }

  /* 在較小的螢幕上隱藏某些列，但保持重要列 */
  .order-table th:nth-child(7),
  .order-table td:nth-child(7) {
    display: none;
  }
}

@media (max-width: 768px) {
  .order-table th:nth-child(6),
  .order-table td:nth-child(6),
  .order-table th:nth-child(8),
  .order-table td:nth-child(8) {
    display: none;
  }

  /* 保持操作按鈕垂直排列但確保它們能夠正確顯示 */
  .action-buttons {
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  /* 進一步優化小螢幕顯示 */
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-section label {
    margin-bottom: 8px;
  }

  .status-dropdown {
    width: 100%;
  }

  .order-stats {
    flex-direction: column;
    gap: 10px;
  }

  /* 在最小螢幕上隱藏更多非關鍵列 */
  .order-table th:nth-child(5),
  .order-table td:nth-child(5) {
    display: none;
  }

  /* 確保表格仍然可以水平滾動 */
  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
