<template>
    <div class="checkout-container" :class="{ 'loading': loading, 'error': error }">
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>正在載入訂單詳情...</p>
        </div>

        <div v-else-if="error" class="error-container">
            <h2>發生錯誤</h2>
            <p>{{ error }}</p>
            <button @click="goBack">返回</button>
        </div>

        <div v-else-if="!order" class="error-container">
            <h2>訂單不存在</h2>
            <p>找不到指定的訂單，請確認訂單編號是否正確。</p>
            <button @click="goBack">返回</button>
        </div>

        <template v-else>
            <h1>結帳頁面</h1>

            <div class="order-summary">
                <h2>訂單摘要</h2>
                <div class="order-info">
                    <p><strong>訂單編號:</strong> {{ order.orderId }}</p>
                    <p><strong>訂單日期:</strong> {{ formatDate(order.createdAt) }}</p>
                    <p><strong>收件人:</strong> {{ order.receiverName }}</p>
                    <p><strong>聯絡電話:</strong> {{ order.receiverPhone }}</p>
                    <p><strong>送貨地址:</strong> {{ order.shippingAddress }}</p>
                </div>

                <h3>訂單項目</h3>
                <table class="order-items">
                    <thead>
                        <tr>
                            <th>商品</th>
                            <th>單價</th>
                            <th>數量</th>
                            <th>小計</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in order.orderItem" :key="index">
                            <td>{{ item.sku.product.name }} {{ item.sku.colorName }} {{ item.sku.sizeName }}</td>
                            <td>NT$ {{ item.price }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>NT$ {{ item.price * item.quantity }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="total-label">商品小計</td>
                            <td>NT$ {{ order.totalPrice - order.shippingFee }}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="total-label">運費</td>
                            <td>NT$ {{ order.shippingFee }}</td>
                        </tr>
                        <tr class="grand-total">
                            <td colspan="3" class="total-label">總計</td>
                            <td>NT$ {{ order.totalPrice }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="payment-section">
                <h2>選擇付款方式</h2>
                <p>目前支援綠界支付(ECPay)，將會跳轉至綠界支付系統完成付款。</p>

                <div class="payment-notice">
                    <p>⚠️ 注意事項：</p>
                    <ul>
                        <li>完成付款後，系統將自動跳轉回訂單結果頁面</li>
                        <li>如果您在付款過程中遇到問題，可以返回此頁面重新嘗試</li>
                        <li>付款成功後，您將收到付款成功的電子郵件通知</li>
                    </ul>
                </div>

                <payment-button :order-id="orderId"></payment-button>
            </div>
        </template>
    </div>
</template>

<script>
import PaymentButton from './PaymentButton.vue';

export default {
    name: 'CheckoutPage',
    components: {
        PaymentButton
    },
    data() {
        return {
            orderId: null,
            order: null,
            loading: true,
            error: null
        }
    },
    created() {
        // 從路由參數獲取訂單ID
        this.orderId = this.$route.params.orderId;

        if (this.orderId) {
            this.fetchOrderDetails();
        } else {
            this.loading = false;
            this.error = '無效的訂單ID';
        }
    },
    methods: {
        async fetchOrderDetails() {
            try {
                this.loading = true;

                // 從localStorage獲取token
                const token = localStorage.getItem('token') || '';

                const response = await fetch(`http://localhost:8081/api/orders/user/${this.orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('獲取訂單失敗');
                }

                const data = await response.json();
                this.order = data;
                this.error = null;
            } catch (err) {
                this.error = '無法載入訂單詳情，請重試';
                console.error('獲取訂單詳情錯誤:', err);
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        },
        goBack() {
            this.$router.go(-1);
        }
    }
}
</script>

<style scoped>
.checkout-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.checkout-container h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    margin: 0 auto 20px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #2980b9;
}

.order-summary {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
}

.order-summary h2 {
    color: #2c3e50;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.order-summary h3 {
    color: #2c3e50;
    margin: 20px 0 10px;
}

.order-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
}

.order-info p {
    margin: 5px 0;
}

.order-items {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.order-items th {
    background-color: #f8f9fa;
    padding: 12px;
    text-align: left;
    color: #2c3e50;
    font-weight: bold;
}

.order-items td {
    padding: 12px;
    border-top: 1px solid #ecf0f1;
}

.order-items tfoot td {
    padding: 12px;
    font-weight: bold;
}

.total-label {
    text-align: right;
}

.grand-total {
    background-color: #f8f9fa;
    font-size: 18px;
}

.payment-section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.payment-section h2 {
    color: #2c3e50;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.payment-notice {
    background-color: #fff8e1;
    padding: 15px;
    border-radius: 5px;
    margin: 20px 0;
}

.payment-notice p {
    font-weight: bold;
    margin-bottom: 10px;
    color: #f39c12;
}

.payment-notice ul {
    padding-left: 20px;
}

.payment-notice li {
    margin-bottom: 8px;
    color: #7f8c8d;
}
</style>