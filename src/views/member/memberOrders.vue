<template>
    <div class="order-container">
        <h2>我的訂單管理</h2>

        <!-- 訂單篩選 -->
        <!-- <OrderFilter @filter="applyFilter" /> -->

        <!-- 訂單表格 -->
        <div class="table-container">
            <table class="order-table">
                <thead>
                    <tr>
                        <th @click="sortById">訂單編號 ⬆️⬇️</th>
                        <th>用戶</th>
                        <th>金額</th>
                        <th>日期</th>
                        <th>狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in sortedOrders" :key="order.id">
                        <td>{{ order.id }}</td>
                        <td>{{ order.customer }}</td>
                        <td>${{ order.total }}</td>
                        <td>{{ order.date }}</td>
                        <td>{{ order.status }}</td>
                        <td>
                            <button class="view-btn"
                                @click="viewOrder(order)">查看</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 訂單詳情 (彈跳視窗) -->
        <!-- <OrderDetails v-if="selectedOrder" :order="selectedOrder" -->
        <!-- @close="selectedOrder = null" /> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
// import OrderFilter from "@/components/order.components/OrderFilter.vue";
// import OrderDetails from "@/components/order.components/OrderDetails.vue";
import { fetchSellerOrders } from "@/api/orders";

const orders = ref([]);
const selectedOrder = ref(null);
const filterCriteria = ref({ status: "all", startDate: null, endDate: null });
const sortAscending = ref(true);

onMounted(async () => {
    orders.value = await fetchSellerOrders();
});

// ✅ 確保篩選條件能夠正確更新
const filteredOrders = computed(() => {
    return orders.value.filter(order => {
        const orderDate = new Date(order.date);
        const startDate = filterCriteria.value.startDate ? new Date(filterCriteria.value.startDate) : null;
        const endDate = filterCriteria.value.endDate ? new Date(filterCriteria.value.endDate) : null;

        if (filterCriteria.value.status !== "all" && order.status !== filterCriteria.value.status) {
            return false;
        }
        if (startDate && orderDate < startDate) {
            return false;
        }
        if (endDate && orderDate > endDate) {
            return false;
        }
        return true;
    });
});

// ✅ 訂單排序功能
const sortedOrders = computed(() => {
    return [...filteredOrders.value].sort((a, b) => {
        return sortAscending.value ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
});

// 🔀 切換排序方式
const sortById = () => {
    sortAscending.value = !sortAscending.value;
};

const applyFilter = (criteria) => {
    filterCriteria.value = { ...criteria };
};

const viewOrder = (order) => {
    selectedOrder.value = order;
};
</script>

<style scoped>
/* ✅ 確保整體容器不會擠壓 */
.order-container {
    padding: 20px;
    max-width: 1200px;
    margin: auto;
}

/* ✅ 讓表格不會超出邊界 */
.table-container {
    overflow-x: auto;
}

/* ✅ 設定表格的邊框、間距與對齊 */
.order-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

/* ✅ 設定表頭 */
.order-table th {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    font-weight: bold;
    cursor: pointer;
}

/* ✅ 設定表格內容 */
.order-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
}

/* ✅ 設定行 hover 效果 */
.order-table tbody tr:hover {
    background-color: #f1f1f1;
}

/* ✅ 設定按鈕樣式 */
.view-btn {
    background: #007bff;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.view-btn:hover {
    background: #0056b3;
}
</style>