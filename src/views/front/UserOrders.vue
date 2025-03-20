<template>
  <div class="user-orders">
    <h2>🛍 我的訂單</h2>
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
                <span class="product-name">{{ item.productName }}</span> (x{{
                  item.quantity
                }})
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
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";

const orders = ref([]);

const fetchOrders = async () => {
  try {
    const response = await axios.get(
      isSeller.value ? "/api/orders/seller/orders" : "/api/orders/user/orders"
    );
    orders.value = response.data;
  } catch (error) {
    console.error("❌ 訂單 API 錯誤:", error);
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

onMounted(() => {
  fetchOrders();
});
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
