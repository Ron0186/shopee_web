<template>
  <div class="user-orders">
    <h2 v-if="isSeller">📦 賣家訂單管理</h2>
    <h2 v-else-if="isUser">🛍 我的訂單</h2>
    <h2 v-else>訂單</h2>

    <div v-if="loading" class="loading">加載中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="no-orders">
      您目前沒有訂單記錄
    </div>
    <table v-else>
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
import { ref, onMounted, computed } from "vue";
import axios from "@/plugins/axios";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
// ✅ 修正：使用正確大小寫檢查角色
const isSeller = computed(() => userStore.roles?.includes("SELLER"));
const isUser = computed(() => userStore.roles?.includes("USER")); // 新增：檢查 USER 角色

const orders = ref([]);
const loading = ref(true);
const error = ref(null);

// 格式化日期函數
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

// 獲取訂單資料函數
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 檢查 token
    if (!userStore.token) {
      error.value = "您尚未登入或登入已過期，請重新登入";
      loading.value = false;
      return;
    }

    // 輸出調試信息
    console.log("⏳ 準備獲取訂單...");
    console.log("📝 當前Token:", userStore.token.substring(0, 15) + "...");
    console.log("📝 當前用戶角色:", userStore.roles);

    // 根據角色選擇適當的 API
    let apiUrl;
    if (isSeller.value) {
      apiUrl = "/api/orders/seller/orders";
    } else if (isUser.value) {
      apiUrl = "/api/orders/user/orders";
    } else {
      error.value = "您沒有適當的角色權限";
      loading.value = false;
      return;
    }

    console.log("📤 發送請求:", apiUrl);

    // 發送請求，確保包含 Authorization header
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    console.log("📥 收到回應:", response);

    // 處理新的 API 回應格式
    if (response.data && response.data.hasOwnProperty("statusCode")) {
      // 新的 API 回應格式 { statusCode, status, message, data }
      if (response.data.status === "success") {
        orders.value = response.data.data || [];
        console.log("✅ 訂單數據:", response.data.message);
      } else {
        error.value = response.data.message || "獲取訂單失敗";
      }
    } else {
      // 舊的直接數據格式
      orders.value = response.data || [];
    }

    loading.value = false;
  } catch (err) {
    console.error("❌ 獲取訂單錯誤:", err);

    // 處理不同類型的錯誤
    if (err.response) {
      // 服務器回應錯誤
      const statusCode = err.response.status;
      const responseData = err.response.data;

      console.error(`服務器錯誤(${statusCode}):`, responseData);

      if (statusCode === 403) {
        error.value = `權限不足，您沒有權限查看這些訂單 (角色: ${
          userStore.roles?.join(", ") || "無"
        })`;
      } else if (statusCode === 401) {
        error.value = "登入已過期，請重新登入";
      } else {
        error.value = responseData.message || "獲取訂單時出現問題";
      }
    } else if (err.request) {
      // 請求發送但沒有收到回應
      error.value = "無法連接到伺服器，請檢查網絡連接";
    } else {
      // 請求設置出問題
      error.value = "訂單請求錯誤: " + err.message;
    }

    loading.value = false;
  }
};

// 在組件掛載時獲取訂單
onMounted(() => {
  // 輸出角色信息
  console.log("當前用戶角色:", userStore.roles);
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

.loading,
.error-message,
.no-orders {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error-message {
  color: #dc3545;
  border: 1px solid #dc3545;
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
