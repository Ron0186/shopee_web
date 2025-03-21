<template>
    <div class="admin-orders">
        <h2>📋 後台訂單管理</h2>

        <!-- 訂單篩選 -->
        <div class="filter-section">
            <label for="status">📌 訂單狀態：</label>
            <select v-model="filterCriteria.status" class="status-dropdown">
                <option value="all">全部</option>
                <option value="Pending">待處理</option>
                <option value="Processing">處理中</option>
                <option value="Shipped">已出貨</option>
                <option value="Delivered">已送達</option>
                <option value="Cancelled">已取消</option>
            </select>
        </div>

        <!-- 訂單表格 -->
        <div class="table-wrapper">
            <table class="order-table">
                <thead>
                    <tr>
                        <th>📌 訂單編號</th>
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
                        <td class="price">${{ order.totalPrice.toFixed(2) }}</td>
                        <td :class="statusClass(order.status)">{{ order.status }}</td>
                        <td>{{ order.items.length }}</td>
                        <td>{{ formatDate(order.createdAt) }}</td>
                        <td>
                            <button class="view-btn" @click="viewOrder(order)">查看詳情</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 訂單詳情彈窗 -->
        <div v-if="selectedOrder" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <h3>📌 訂單詳情 (編號: {{ selectedOrder.orderId }})</h3>

                <p><strong>💰 總金額：</strong> ${{ selectedOrder.totalPrice.toFixed(2) }}</p>
                <p><strong>📦 訂單狀態：</strong>
                    <select v-model="selectedOrder.status" class="status-dropdown">
                        <option value="Pending">待處理</option>
                        <option value="Processing">處理中</option>
                        <option value="Shipped">已出貨</option>
                        <option value="Delivered">已送達</option>
                        <option value="Cancelled">已取消</option>
                    </select>
                </p>
                <p><strong>⏳ 成立時間：</strong> {{ formatDate(selectedOrder.createdAt) }}</p>

                <h4>🛒 商品列表：</h4>
                <ul>
                    <li v-for="item in selectedOrder.items" :key="item.productName">
                        {{ item.productName }} - 數量: {{ item.quantity }} - 單價: ${{ item.unitPrice.toFixed(2) }}
                    </li>
                </ul>

                <!-- 操作按鈕 -->
                <div class="modal-buttons">
                    <button class="edit-btn" @click="updateOrder">💾 更新訂單</button>
                    <button class="delete-btn" @click="deleteOrder">🗑️ 刪除訂單</button>
                    <button class="close-btn" @click="closeModal">❌ 關閉</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchAdminOrders } from "@/api/orders";
import axios from "axios"; // ✅ 確保可以發送請求

const orders = ref([]);
const selectedOrder = ref(null);
const filterCriteria = ref({ status: "all" });

onMounted(async () => {
    try {
        const response = await fetchAdminOrders();
        console.log("✅ 取得管理員訂單資料:", response);
        orders.value = response;
    } catch (error) {
        console.error("❌ 取得訂單失敗:", error);
    }
});

const filteredOrders = computed(() => {
    if (filterCriteria.value.status === "all") return orders.value;
    return orders.value.filter(order => order.status === filterCriteria.value.status);
});

const viewOrder = (order) => {
    selectedOrder.value = { ...order }; // ✅ 避免直接修改原始資料
};

const closeModal = () => {
    selectedOrder.value = null;
};

const updateOrder = async () => {
    try {
        await axios.put(`http://localhost:8081/api/orders/${selectedOrder.value.orderId}`, {
            status: selectedOrder.value.status
        });
        alert("✅ 訂單更新成功！");
        closeModal();
    } catch (error) {
        console.error("❌ 訂單更新失敗:", error);
        alert("❌ 訂單更新失敗！");
    }
};

const deleteOrder = async () => {
    if (confirm("⚠️ 確定要刪除此訂單嗎？")) {
        try {
            await axios.delete(`http://localhost:8081/api/orders/${selectedOrder.value.orderId}`);
            alert("🗑️ 訂單已刪除！");
            orders.value = orders.value.filter(o => o.orderId !== selectedOrder.value.orderId);
            closeModal();
        } catch (error) {
            console.error("❌ 訂單刪除失敗:", error);
            alert("❌ 訂單刪除失敗！");
        }
    }
};

const statusClass = (status) => ({
    "pending": status === "Pending",
    "processing": status === "Processing",
    "shipped": status === "Shipped",
    "delivered": status === "Delivered",
    "cancelled": status === "Cancelled"
});

const formatDate = (date) => {
    return new Date(date).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
};
</script>

<style scoped>
/* 樣式美化 */
.admin-orders {
    padding: 20px;
    max-width: 900px;
    margin: auto;
}

/* 訂單篩選 */
.filter-section {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 訂單表格 */
.table-wrapper {
    overflow-x: auto;
}

.order-table {
    width: 100%;
    border-collapse: collapse;
}

.order-table th,
.order-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}

.order-table th {
    background-color: #f8f8f8;
}

.view-btn {
    background-color: #007bff;
    color: white;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.view-btn:hover {
    background-color: #0056b3;
}

/* 彈窗樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 500px;
    text-align: center;
}

.modal-buttons {
    margin-top: 15px;
}

.edit-btn,
.delete-btn,
.close-btn {
    margin: 5px;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.edit-btn {
    background-color: #28a745;
    color: white;
}

.delete-btn {
    background-color: red;
    color: white;
}

.close-btn {
    background-color: gray;
    color: white;
}
</style>
