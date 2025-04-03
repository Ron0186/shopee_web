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
        <p>總訂單數: <strong>{{ orders.length }}</strong></p>
        <p>篩選後訂單數: <strong>{{ filteredOrders.length }}</strong></p>
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
              <th>🛒 商品數量</th>
              <th>⏳ 成立時間</th>
              <th>🔍 操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td>{{ order.orderId }}</td>
              <td>{{ order.username || '未知用戶' }}</td>
              <td class="price">${{ formatPrice(order.totalPrice) }}</td>
              <td :class="statusClass(order.status)">{{ order.status }}</td>
              <td>{{ order.items ? order.items.length : 0 }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view-btn" @click="viewOrder(order)">
                    <i class="bi bi-eye"></i> 查看
                  </button>
                  <button class="action-btn edit-btn-small" @click="quickEditOrder(order)">
                    <i class="bi bi-pencil"></i> 編輯
                  </button>
                  <button class="action-btn delete-btn-small" @click="confirmDelete(order)">
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
      <b-modal v-model="showOrderDetailModal" title="訂單詳情" size="lg" hide-footer>
        <div v-if="selectedOrder">
          <div class="order-details">
            <div class="detail-section">
              <h4>📋 基本資訊</h4>
              <p><strong>💰 總金額：</strong> ${{ formatPrice(selectedOrder.totalPrice) }}</p>
              <p>
                <strong>📦 訂單狀態：</strong>
                <select v-model="selectedOrder.status" class="status-dropdown form-control">
                  <option value="PENDING">待處理</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="DELIVERED">已送達</option>
                  <option value="CANCELLED">已取消</option>
                  <option value="COMPLETED">已完成</option>
                </select>
              </p>
              <p><strong>⏳ 成立時間：</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
              <p><strong>⚡ 更新時間：</strong> {{ formatDate(selectedOrder.updatedAt) }}</p>
            </div>

            <div class="detail-section">
              <h4>👤 用戶資訊</h4>
              <p>
                <strong>用戶名稱：</strong>
                <input type="text" v-model="selectedOrder.username" class="form-control">
              </p>
              <p>
                <strong>電子郵件：</strong>
                <input type="email" v-model="selectedOrder.email" class="form-control">
              </p>
              <p>
                <strong>電話：</strong>
                <input type="tel" v-model="selectedOrder.phone" class="form-control">
              </p>
            </div>

            <div class="detail-section">
              <h4>📍 地址資訊</h4>
              <p>
                <strong>帳單地址：</strong>
                <textarea v-model="selectedOrder.billingAddress" class="form-control" rows="2"></textarea>
              </p>
              <p>
                <strong>收貨地址：</strong>
                <textarea v-model="selectedOrder.shippingAddress" class="form-control" rows="2"></textarea>
              </p>
            </div>

            <div class="detail-section">
              <h4>💳 付款資訊</h4>
              <p>
                <strong>付款方式：</strong>
                <select v-model="selectedOrder.paymentMethod" class="form-control">
                  <option value="">請選擇</option>
                  <option value="CREDIT_CARD">信用卡</option>
                  <option value="BANK_TRANSFER">銀行轉帳</option>
                  <option value="CASH_ON_DELIVERY">貨到付款</option>
                </select>
              </p>
              <p>
                <strong>付款狀態：</strong>
                <select v-model="selectedOrder.paymentStatus" class="form-control">
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
                <select v-model="selectedOrder.shipmentMethod" class="form-control">
                  <option value="">請選擇</option>
                  <option value="STANDARD">標準運送</option>
                  <option value="EXPRESS">快速運送</option>
                  <option value="STORE_PICKUP">門市取貨</option>
                </select>
              </p>
              <p>
                <strong>運送狀態：</strong>
                <select v-model="selectedOrder.shipmentStatus" class="form-control">
                  <option value="">請選擇</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="DELIVERED">已送達</option>
                </select>
              </p>
              <p>
                <strong>追蹤號碼：</strong>
                <input type="text" v-model="selectedOrder.trackingNumber" class="form-control">
              </p>
            </div>
          </div>

          <h4>🛒 商品列表：</h4>
          <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="order-items">
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
                    <input type="text" v-model="item.productName" class="form-control">
                  </td>
                  <td>
                    <input type="number" v-model.number="item.quantity" min="1" class="form-control">
                  </td>
                  <td>
                    <input type="number" v-model.number="item.unitPrice" min="0" step="0.01" class="form-control">
                  </td>
                  <td>${{ formatPrice(item.unitPrice * item.quantity) }}</td>
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
      <b-modal v-model="showQuickEditModal" title="快速編輯訂單狀態" hide-footer>
        <div v-if="quickEditOrderData" class="quick-edit-content">
          <p><strong>訂單編號：</strong> {{ quickEditOrderData.orderId }}</p>
          <p><strong>用戶：</strong> {{ quickEditOrderData.username || '未知用戶' }}</p>
          <p><strong>總金額：</strong> ${{ formatPrice(quickEditOrderData.totalPrice) }}</p>

          <div class="edit-status-section">
            <label for="quick-status"><strong>更新訂單狀態：</strong></label>
            <select id="quick-status" v-model="quickEditOrderData.status" class="status-dropdown">
              <option value="PENDING">待處理</option>
              <option value="PROCESSING">處理中</option>
              <option value="SHIPPED">已出貨</option>
              <option value="DELIVERED">已送達</option>
              <option value="CANCELLED">已取消</option>
              <option value="COMPLETED">已完成</option>
            </select>
          </div>

          <div class="modal-buttons">
            <button class="edit-btn" @click="saveQuickEdit">
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
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useUserStore } from "@/stores/user";
// 引入 Bootstrap Vue Next 組件
import { BModal, BButton } from 'bootstrap-vue-next';

const userStore = useUserStore();
const orders = ref([]);
const selectedOrder = ref(null);
const quickEditOrderData = ref(null);
const filterCriteria = ref({ status: "all" });
const loading = ref(true);
const error = ref(null);

// 控制模態框顯示的狀態
const showOrderDetailModal = ref(false);
const showQuickEditModal = ref(false);

onMounted(async () => {
  await loadOrders();
});

async function loadOrders() {
  loading.value = true;
  error.value = null;

  try {
    // 檢查Token是否存在
    if (!userStore.token) {
      error.value = "您尚未登入或授權已過期，請重新登入";
      loading.value = false;
      return;
    }

    // 獲取所有訂單數據
    const response = await axios.get("/api/orders/admin/orders", {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });

    console.log("API 回應:", response);

    // 處理API回應
    if (response.data && response.data.data) {
      // 新的API格式 (包含在 data 欄位)
      orders.value = response.data.data;
      console.log("✅ 取得訂單數據:", orders.value.length, "筆記錄");
    } else if (Array.isArray(response.data)) {
      // 舊格式 (直接返回數組)
      orders.value = response.data;
      console.log("✅ 取得訂單數據:", orders.value.length, "筆記錄");
    } else {
      // 意外的數據格式
      console.error("❓ 未預期的API回傳格式:", response.data);
      error.value = "伺服器返回了意外的數據格式";
    }
  } catch (err) {
    console.error("❌ 取得訂單失敗:", err);

    // 提供更具體的錯誤訊息
    if (err.response) {
      const statusCode = err.response.status;

      if (statusCode === 401) {
        error.value = "登入已過期，請重新登入";
      } else if (statusCode === 403) {
        error.value = "您沒有權限訪問此資源";
      } else {
        error.value = `伺服器錯誤 (${statusCode}): ${err.response.data?.message || "未知錯誤"}`;
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
  if (!orders.value || orders.value.length === 0) return [];

  if (filterCriteria.value.status === "all") return orders.value;

  return orders.value.filter(
    (order) => order.status === filterCriteria.value.status
  );
});

// 修改為使用bootstrap-vue-next的模態框
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

// 快速編輯訂單 - 使用bootstrap-vue-next的模態框
const quickEditOrder = (order) => {
  console.log("快速編輯訂單:", order);
  quickEditOrderData.value = { ...order }; // 避免直接修改原始資料
  showQuickEditModal.value = true;
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
  if (!quickEditOrderData.value) return;

  try {
    const response = await axios.put(
      `/api/orders/${quickEditOrderData.value.orderId}`,
      {
        status: quickEditOrderData.value.status
      },
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
    );

    console.log("訂單快速更新回應:", response);

    // 根據回應更新本地訂單數據
    if (response.data && (response.data.success || response.data.status === "success")) {
      // 找到並更新本地訂單
      const index = orders.value.findIndex(o => o.orderId === quickEditOrderData.value.orderId);
      if (index !== -1) {
        // 更新訂單數據
        const updatedOrder = response.data.data || response.data;
        orders.value[index] = { ...orders.value[index], ...updatedOrder };
        // 如果只有狀態變更，則手動更新
        orders.value[index].status = quickEditOrderData.value.status;
      }

      alert("✅ 訂單狀態更新成功！");
      closeQuickEditModal();
    } else {
      alert(`❌ 訂單狀態更新失敗: ${response.data?.message || "伺服器返回了意外的回應"}`);
    }
  } catch (err) {
    console.error("❌ 訂單狀態更新失敗:", err);
    alert(`❌ 訂單狀態更新失敗: ${err.response?.data?.message || err.message || "未知錯誤"}`);
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
    const response = await axios.delete(
      `/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
    );

    console.log("訂單刪除回應:", response);

    // 根據回應更新本地訂單數據
    if (response.data && (response.data.success || response.data.status === "success")) {
      // 從本地移除已刪除的訂單
      orders.value = orders.value.filter(o => o.orderId !== orderId);
      alert("🗑️ 訂單已成功刪除！");
    } else {
      alert(`❌ 訂單刪除失敗: ${response.data?.message || "伺服器返回了意外的回應"}`);
    }
  } catch (err) {
    console.error("❌ 訂單刪除失敗:", err);
    alert(`❌ 訂單刪除失敗: ${err.response?.data?.message || err.message || "未知錯誤"}`);
  }
};

// 更新訂單 - 修改為處理所有可編輯字段的更新
const updateOrder = async () => {
  if (!selectedOrder.value) return;

  try {
    // 準備要發送的數據，包含所有可編輯字段
    const orderData = {
      status: selectedOrder.value.status,
      username: selectedOrder.value.username,
      email: selectedOrder.value.email,
      phone: selectedOrder.value.phone,
      billingAddress: selectedOrder.value.billingAddress,
      shippingAddress: selectedOrder.value.shippingAddress,
      paymentMethod: selectedOrder.value.paymentMethod,
      paymentStatus: selectedOrder.value.paymentStatus,
      shipmentMethod: selectedOrder.value.shipmentMethod,
      shipmentStatus: selectedOrder.value.shipmentStatus,
      trackingNumber: selectedOrder.value.trackingNumber,
      items: selectedOrder.value.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    const response = await axios.put(
      `/api/orders/${selectedOrder.value.orderId}`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
    );

    console.log("訂單更新回應:", response);

    // 根據回應更新本地訂單數據
    if (response.data && (response.data.success || response.data.status === "success")) {
      // 找到並更新本地訂單
      const index = orders.value.findIndex(o => o.orderId === selectedOrder.value.orderId);
      if (index !== -1) {
        // 更新訂單數據
        const updatedOrder = response.data.data || response.data;
        orders.value[index] = { ...orders.value[index], ...updatedOrder };

        // 如果API沒有返回完整數據，則使用我們的本地更新數據
        if (!updatedOrder.items) {
          orders.value[index] = { ...orders.value[index], ...orderData };
        }
      }

      alert("✅ 訂單更新成功！");
      closeOrderDetailModal();
    } else {
      alert(`❌ 訂單更新失敗: ${response.data?.message || "伺服器返回了意外的回應"}`);
    }
  } catch (err) {
    console.error("❌ 訂單更新失敗:", err);
    alert(`❌ 訂單更新失敗: ${err.response?.data?.message || err.message || "未知錯誤"}`);
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
          Authorization: `Bearer ${userStore.token}`
        }
      }
    );

    console.log("訂單刪除回應:", response);

    // 根據回應更新本地訂單數據
    if (response.data && (response.data.success || response.data.status === "success")) {
      // 從本地移除已刪除的訂單
      orders.value = orders.value.filter(
        (o) => o.orderId !== selectedOrder.value.orderId
      );

      alert("🗑️ 訂單已成功刪除！");
      closeOrderDetailModal();
    } else {
      alert(`❌ 訂單刪除失敗: ${response.data?.message || "伺服器返回了意外的回應"}`);
    }
  } catch (err) {
    console.error("❌ 訂單刪除失敗:", err);
    alert(`❌ 訂單刪除失敗: ${err.response?.data?.message || err.message || "未知錯誤"}`);
  }
};

const statusClass = (status) => {
  switch (status) {
    case "PENDING": return "pending";
    case "PROCESSING": return "processing";
    case "SHIPPED": return "shipped";
    case "DELIVERED": return "delivered";
    case "CANCELLED": return "cancelled";
    case "COMPLETED": return "completed";
    default: return "";
  }
};

const formatDate = (date) => {
  if (!date) return "未知";
  return new Date(date).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return "0.00";
  return Number(price).toFixed(2);
};
</script>

<style scoped>
/* 樣式美化 */
.admin-orders {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

/* 載入及錯誤狀態 */
.loading-section,
.error-section {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

.loading-section {
  background-color: #f8f9fa;
}

.error-section {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.error-message {
  color: #721c24;
  margin-bottom: 15px;
}

.retry-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background-color: #c82333;
}

/* 訂單統計 */
.order-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 5px;
}

.order-stats p {
  margin: 0;
}

/* 訂單篩選 */
.filter-section {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dropdown {
  padding: 8px;
  margin-left: 10px;
  border-radius: 5px;
  border: 1px solid #ced4da;
}

/* 訂單表格 */
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.order-table th,
.order-table td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: center;
}

.order-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.order-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.order-table tr:hover {
  background-color: #e9ecef;
}

/* 操作按鈕容器 */
.action-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
}

/* 按鈕樣式 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-btn {
  background-color: #007bff;
  color: white;
}

.view-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.edit-btn-small {
  background-color: #28a745;
  color: white;
}

.edit-btn-small:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.delete-btn-small {
  background-color: #dc3545;
  color: white;
}

.delete-btn-small:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 狀態樣式 */
.pending {
  color: #ffc107;
  font-weight: bold;
}

.processing {
  color: #17a2b8;
  font-weight: bold;
}

.shipped {
  color: #007bff;
  font-weight: bold;
}

.delivered {
  color: #28a745;
  font-weight: bold;
}

.completed {
  color: #28a745;
  font-weight: bold;
}

.cancelled {
  color: #dc3545;
  font-weight: bold;
}

/* 訂單詳情區塊 */
.order-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 0 0 20px;
  padding-top: 20px;
}

.detail-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
}

.detail-section p {
  margin: 8px 0;
}

/* 表單控件樣式 */
.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  margin-top: 0.25rem;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 訂單商品表格 */
.order-items {
  margin: 0 0 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.items-table th,
.items-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.items-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.items-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* 調整表格中的輸入框 */
.items-table .form-control {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.no-items {
  color: #dc3545;
  font-style: italic;
  margin: 0 0 20px;
}

.no-orders {
  text-align: center;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
  color: #6c757d;
  font-style: italic;
}

/* 操作按鈕 */
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px solid #dee2e6;
}

.edit-btn {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 快速編輯內容 */
.quick-edit-content {
  padding: 10px;
}

.edit-status-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

/* 加強表單標籤顯示 */
.detail-section strong {
  display: block;
  margin-bottom: 5px;
  color: #495057;
  font-size: 0.9rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .order-details {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }

  .action-btn {
    width: 100%;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .edit-btn,
  .delete-btn,
  .close-btn {
    width: 100%;
    justify-content: center;
  }

  .order-table th,
  .order-table td {
    padding: 8px;
    font-size: 14px;
  }

  .form-control {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .detail-section strong {
    font-size: 0.8rem;
  }
}
</style>