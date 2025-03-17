<template>
    <table>
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>用戶</th>
                <th>金額</th>
                <th>狀態</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>${{ order.total }}</td>
                <td>{{ order.status }}</td>
                <td>
                    <button @click="$emit('view', order)">查看</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
defineProps({
    orders: Array
});
</script>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

button {
    cursor: pointer;
}
</style>