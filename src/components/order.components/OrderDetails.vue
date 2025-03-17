<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal">
            <h3>訂單詳情</h3>
            <p><strong>訂單編號：</strong> {{ order.id }}</p>
            <p><strong>客戶：</strong> {{ order.customer }}</p>
            <p><strong>總金額：</strong> ${{ order.total }}</p>
            <p><strong>狀態：</strong> {{ order.status }}</p>

            <!-- 購買的商品列表 -->
            <h4>購買商品：</h4>
            <table class="order-items-table">
                <thead>
                    <tr>
                        <th>商品名稱</th>
                        <th>數量</th>
                        <th>單價</th>
                        <th>小計</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in order.items" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>${{ item.price }}</td>
                        <td>${{ item.quantity * item.price }}</td>
                    </tr>
                </tbody>
            </table>

            <button class="close-btn" @click="$emit('close')">關閉</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    order: Object
});
</script>

<style scoped>
/* 彈跳視窗的背景遮罩 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* 彈跳視窗樣式 */
.modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

/* 訂單商品表格 */
.order-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.order-items-table th,
.order-items-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}

/* 按鈕樣式 */
.close-btn {
    display: block;
    width: 100%;
    background: red;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
}

.close-btn:hover {
    background: darkred;
}
</style>