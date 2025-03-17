<template>
    <div class="admin-orders">
        <h2>後台訂單管理</h2>

        <!-- 訂單篩選 -->
        <OrderFilter @filter="applyFilter" />

        <!-- 訂單表格 -->
        <OrderTable :orders="filteredOrders" @view="viewOrder" />

        <!-- 訂單詳情 -->
        <OrderDetails v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import OrderTable from "@/components/order.components/OrderTable.vue";
import OrderDetails from "@/components/order.components/OrderDetails.vue";
import OrderFilter from "@/components/order.components/OrderFilter.vue";
import AdminNavbar from "@/components/admin/AdminNavbar.vue";
import { fetchAllOrders } from "@/api/orders"; // API 取得所有訂單

const orders = ref([]);
const selectedOrder = ref(null);
const filterCriteria = ref({ status: "all" });

onMounted(async () => {
    orders.value = await fetchAllOrders(); // 取得所有訂單
});

const filteredOrders = computed(() => {
    if (filterCriteria.value.status === "all") return orders.value;
    return orders.value.filter(order => order.status === filterCriteria.value.status);
});

const applyFilter = (criteria) => {
    filterCriteria.value = criteria;
};

const viewOrder = (order) => {
    selectedOrder.value = order;
};
</script>

<style scoped>
.admin-orders {
    padding: 20px;
}
</style>