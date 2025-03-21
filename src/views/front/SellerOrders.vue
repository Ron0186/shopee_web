<template>
  <div class="order-container">
    <h2>賣家訂單管理</h2>

    <!-- ✅ 訂單篩選 -->
    <div class="filter-container">
      <label for="statusFilter">篩選狀態：</label>
      <select id="statusFilter" v-model="filterCriteria.status">
        <option value="all">所有狀態</option>
        <option value="處理中">處理中</option>
        <option value="已完成">已完成</option>
        <option value="已取消">已取消</option>
      </select>
    </div>

    <!-- ✅ 訂單表格 -->
    <div class="table-container">
      <table class="order-table">
        <thead>
          <tr>
            <th @click="sortById">訂單編號 ⬆️⬇️</th>
            <th>用戶</th>
            <th>金額 (NT$)</th>
            <th>日期</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in sortedOrders" :key="order.orderId">
            <td class="order-id">{{ order.orderId }}</td>
            <td>{{ order.customer }}</td>
            <td class="price">${{ order.totalPrice.toLocaleString() }}</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td class="status">{{ order.status }}</td>
            <td>
              <button class="view-btn" @click="viewOrder(order)">
                🔍 查看
              </button>
              <button class="edit-btn" @click="editOrder(order)">
                ✏️ 編輯
              </button>
              <button class="delete-btn" @click="deleteOrder(order.orderId)">
                🗑 刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ 訂單詳情 (彈跳視窗) -->
    <OrderDetails v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from "vue";
import OrderDetails from "@/components/order.components/OrderDetails.vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const isSeller = computed(() => userStore.roles?.includes("SELLER")); // 確保角色正確判斷

const orders = ref([]);
const selectedOrder = ref(null);
const filterCriteria = ref({ status: "all" });
const sortAscending = ref(true);

const fetchOrders = async () => {
  try {
    if (!isSeller.value) {
      console.error("🚫 你不是賣家，無法存取賣家訂單！");
      return;
    }

    const response = await axios.get("/api/orders/seller/orders");
    orders.value = response.data;
  } catch (error) {
    console.error("❌ 訂單 API 錯誤:", error);
  }
};


// ✅ 取得賣家訂單
watchEffect(async () => {
  let apiUrl = isSeller.value
    ? "/api/orders/seller/orders"
    : "/api/orders/user/orders";

  onMounted(() => {
    fetchOrders();
  });
  try {
    const response = await axios.get(apiUrl);
    orders.value = response.data;
  } catch (error) {
    console.error("❌ 訂單 API 錯誤:", error);
  }
});

// ✅ 訂單篩選功能
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    if (
      filterCriteria.value.status !== "all" &&
      order.status !== filterCriteria.value.status
    ) {
      return false;
    }
    return true;
  });
});

// ✅ 訂單排序功能
const sortedOrders = computed(() => {
  return [...filteredOrders.value].sort((a, b) => {
    return sortAscending.value ? a.orderId - b.orderId : b.orderId - a.orderId;
  });
});

// 🔀 切換排序方式
const sortById = () => {
  sortAscending.value = !sortAscending.value;
};

// ✅ 編輯訂單
const editOrder = (order) => {
  Swal.fire({
    title: "編輯訂單狀態",
    input: "select",
    inputOptions: {
      處理中: "處理中",
      已完成: "已完成",
      已取消: "已取消",
    },
    inputValue: order.status,
    showCancelButton: true,
    confirmButtonText: "確定修改",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.put(`/api/orders/${order.orderId}`, {
          status: result.value,
        });
        Swal.fire("修改成功！", "訂單狀態已更新", "success");

        // ✅ 重新取得最新訂單資料
        fetchOrders();
      } catch (error) {
        Swal.fire("修改失敗！", "請稍後再試", "error");
      }
    }
  });
};

// 🗑 刪除訂單
const deleteOrder = async (orderId) => {
  const confirm = await Swal.fire({
    title: "確定要刪除嗎？",
    text: "刪除後無法恢復！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消",
  });

  if (confirm.isConfirmed) {
    try {
      await axios.delete(`/api/orders/${orderId}`);
      orders.value = orders.value.filter((order) => order.orderId !== orderId);
      Swal.fire("刪除成功", "該訂單已被移除", "success");
    } catch (error) {
      Swal.fire("刪除失敗", "請稍後再試", "error");
    }
  }
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 查看訂單
const viewOrder = (order) => {
  selectedOrder.value = order;
};
</script>

<style scoped>
/* ✅ 主要樣式 */
.order-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* ✅ 篩選區塊 */
.filter-container {
  margin-bottom: 10px;
  text-align: right;
}

select {
  padding: 5px;
  font-size: 14px;
}

/* ✅ 表格樣式 */
.table-container {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.order-table th {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}

.order-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

/* ✅ 狀態欄位 */
td.status {
  font-weight: bold;
}

/* ✅ 按鈕樣式 */
.view-btn {
  background: #007bff;
  color: white;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background: #ffc107;
  color: white;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn {
  background: #dc3545;
  color: white;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
