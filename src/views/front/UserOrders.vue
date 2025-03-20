<template>
    <div class="user-orders">
        <h2>🛍 我的訂單</h2>
        <table>
            <thead>
                <tr>
                    <th>訂單編號</th>
                    <th>商品名稱</th>
                    <th>金額</th>
                    <th>狀態</th>
                    <th>下單時間</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ order.productName }}</td>
                    <td>${{ order.amount }}</td>
                    <td>{{ order.status }}</td>
                    <td>{{ order.createdAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";

const orders = ref([]);

async function fetchUserOrders() {
    try {
        const response = await axios.get("/user/orders");
        orders.value = response.data;
    } catch (error) {
        console.error("❌ 獲取用戶訂單失敗:", error);
    }
}

onMounted(() => {
    fetchUserOrders();
});
</script>

<style scoped>
.user-orders {
    padding: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

th {
    background-color: #f4f4f4;
}
</style>