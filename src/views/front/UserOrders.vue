<template>
  <div class="user-orders">
    <h2 v-if="isSeller">📦 賣家訂單管理</h2>
    <h2 v-else>🛍 我的訂單</h2>

    <table>
      <thead>
        <tr>
          <th>訂單編號</th>
          <th>商品名稱</th>
          <th>金額 (NT$)</th>
          <th>狀態</th>
          <th>訂單成立時間</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.orderId">
          <td class="order-id">{{ order.orderId }}</td>
          <td class="product-list">
            <ul>
              <li v-for="item in order.items" :key="item.productName">
                <span class="product-name">{{ item.productName }}</span> (x{{ item.quantity }})
              </li>
            </ul>
          </td>
          <td class="price">${{ order.totalPrice.toLocaleString() }}</td>
          <td class="status">{{ order.status }}</td>
          <td class="created-at">{{ formatDate(order.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "@/plugins/axios";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const isSeller = computed(() => userStore.isSeller);
const orders = ref([]);

// ✅ **修正錯誤：補充 `formatDate` 函式**
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // 避免 undefined 導致錯誤
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ✅ **修正錯誤：確保 `fetchOrders` 正確取得資料**
const fetchOrders = async () => {
  try {
    if (!userStore.token) {
      console.error("❌ Token 不存在，請重新登入！");
      return;
    }

    const apiUrl = isSeller.value ? "/api/orders/seller/orders" : "/api/orders/user/orders";

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    });

    orders.value = response.data;
  } catch (error) {
    console.error("❌ 訂單 API 錯誤:", error);
  }
};

// ✅ **確保訂單在組件掛載時載入**
onMounted(fetchOrders);
</script>

<style scoped>
.user-orders {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  font-size: 14px;
}

th {
  background-color: #f8f8f8;
  font-weight: bold;
}

td.order-id {
  font-weight: bold;
  color: #007bff;
}

td.price {
  color: #28a745;
  font-weight: bold;
}

td.status {
  font-weight: bold;
}

td.created-at {
  font-size: 12px;
  color: #666;
}

/* 商品名稱美化 */
td.product-list {
  text-align: left;
  padding-left: 20px;
}

.product-name {
  font-weight: bold;
  color: #333;
}
</style>
