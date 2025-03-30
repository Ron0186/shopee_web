<template>
    <div class="payment-result-container">
        <div class="result-card" :class="resultStatus">
            <div class="result-icon">
                <i v-if="isSuccess" class="bi bi-check-circle-fill"></i>
                <i v-else class="bi bi-x-circle-fill"></i>
            </div>
            <h2>{{ resultTitle }}</h2>
            <p class="result-message">{{ resultMessage }}</p>

            <!-- 訂單資訊摘要 -->
            <div v-if="order" class="order-summary">
                <div class="summary-row">
                    <span>訂單編號：</span>
                    <span>{{ order.orderId }}</span>
                </div>
                <div class="summary-row">
                    <span>付款金額：</span>
                    <span>NT${{ formatPrice(order.totalPrice) }}</span>
                </div>
                <div class="summary-row">
                    <span>付款方式：</span>
                    <span>{{ paymentMethodText }}</span>
                </div>
                <div v-if="isSuccess && paymentTime" class="summary-row">
                    <span>付款時間：</span>
                    <span>{{ paymentTime }}</span>
                </div>
                <div v-if="bankTransferInfo" class="bank-transfer-info">
                    <p>請記錄以下銀行轉帳資訊，並於期限內完成轉帳：</p>
                    <div class="info-box">
                        <div class="summary-row">
                            <span>銀行名稱：</span>
                            <span>台灣第一銀行</span>
                        </div>
                        <div class="summary-row">
                            <span>銀行代碼：</span>
                            <span>007</span>
                        </div>
                        <div class="summary-row">
                            <span>帳號：</span>
                            <span>123-456-789-000</span>
                        </div>
                        <div class="summary-row">
                            <span>戶名：</span>
                            <span>MyShop 購物網</span>
                        </div>
                        <div class="summary-row">
                            <span>轉帳期限：</span>
                            <span>{{ formatDate(transferDeadline) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 付款結果指引 -->
            <div class="result-guide">
                <div v-if="isSuccess && !isBankTransfer" class="guide-section">
                    <h3>接下來會發生什麼？</h3>
                    <ul>
                        <li>我們已收到您的付款，訂單處理中</li>
                        <li>您將收到確認付款的電子郵件</li>
                        <li>商家將會盡快處理您的訂單並安排出貨</li>
                        <li>您可以在「訂單管理」中查看訂單的最新進度</li>
                    </ul>
                </div>
                <div v-else-if="isSuccess && isBankTransfer" class="guide-section">
                    <h3>接下來會發生什麼？</h3>
                    <ul>
                        <li>請在轉帳時備註您的訂單編號</li>
                        <li>完成轉帳後，請保留收據以利查詢</li>
                        <li>我們確認款項後，將自動處理您的訂單</li>
                        <li>您可以在「訂單管理」中查看訂單的最新進度</li>
                    </ul>
                </div>
                <div v-else class="guide-section">
                    <h3>出了什麼問題？</h3>
                    <ul>
                        <li>付款處理過程中發生錯誤</li>
                        <li>您的信用卡可能未成功授權</li>
                        <li>您可以前往「訂單管理」頁面再次嘗試付款</li>
                        <li>如果問題持續，請聯絡客服獲得協助</li>
                    </ul>
                </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="action-buttons">
                <router-link to="/" class="action-btn home-btn">
                    <i class="bi bi-house"></i>
                    返回首頁
                </router-link>
                <router-link to="/orders" class="action-btn order-btn">
                    <i class="bi bi-box"></i>
                    查看我的訂單
                </router-link>
                <button v-if="!isSuccess" @click="retryPayment" class="action-btn retry-btn">
                    <i class="bi bi-arrow-repeat"></i>
                    重新付款
                </button>
                <button @click="contactSupport" class="action-btn support-btn">
                    <i class="bi bi-headset"></i>
                    聯絡客服
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 狀態變數
const loading = ref(true);
const paymentStatus = ref('');
const paymentMethod = ref('');
const order = ref(null);
const paymentTime = ref('');
const transferDeadline = ref(null);

// 從路由參數中獲取付款狀態和訂單ID
const orderId = computed(() => route.params.id);

// 計算付款是否成功
const isSuccess = computed(() => {
    return paymentStatus.value === 'success';
});

// 計算是否為銀行轉帳付款
const isBankTransfer = computed(() => {
    return paymentMethod.value === 'BANK_TRANSFER';
});

// 計算是否顯示銀行轉帳資訊
const bankTransferInfo = computed(() => {
    return isSuccess.value && isBankTransfer.value;
});

// 計算結果標題
const resultTitle = computed(() => {
    if (isSuccess.value) {
        if (isBankTransfer.value) {
            return '付款指示已建立';
        }
        return '付款成功';
    }
    return '付款失敗';
});

// 計算結果訊息
const resultMessage = computed(() => {
    if (isSuccess.value) {
        if (isBankTransfer.value) {
            return '請按照以下指示完成銀行轉帳';
        }
        return '您的訂單已成功付款，我們正在處理您的訂單';
    }
    return '付款處理過程中發生錯誤，請重新嘗試';
});

// 計算付款方式文字
const paymentMethodText = computed(() => {
    const methodMap = {
        'CREDIT_CARD': '信用卡付款',
        'BANK_TRANSFER': 'ATM轉帳',
        'CASH_ON_DELIVERY': '貨到付款'
    };
    return methodMap[paymentMethod.value] || paymentMethod.value;
});

// 計算結果頁面的CSS類別
const resultStatus = computed(() => {
    if (isSuccess.value) {
        if (isBankTransfer.value) {
            return 'pending';
        }
        return 'success';
    }
    return 'fail';
});

// 格式化價格
const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return Number(price).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 重新嘗試付款
const retryPayment = () => {
    router.push(`/checkout/pay/${orderId.value}`);
};

// 聯絡客服
const contactSupport = () => {
    router.push({
        path: '/support/contact',
        query: { orderId: orderId.value }
    });
};

// 載入訂單數據
const loadOrderData = async () => {
    try {
        // 從URL獲取訂單ID和付款狀態
        const status = route.query.status || 'fail';
        const method = route.query.method || 'CREDIT_CARD';

        paymentStatus.value = status;
        paymentMethod.value = method;

        // 如果未提供訂單ID，返回訂單列表
        if (!orderId.value) {
            router.push('/orders');
            return;
        }

        // 設置轉帳截止時間（當前時間後3天）
        if (isBankTransfer.value) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 3);
            transferDeadline.value = deadline;
        }

        // 設置付款時間
        if (isSuccess.value && !isBankTransfer.value) {
            paymentTime.value = formatDate(new Date());
        }

        // 獲取訂單詳情
        const response = await axios.get(`/api/orders/${orderId.value}`, {
            headers: {
                Authorization: `Bearer ${userStore.token}`
            }
        });

        // 處理API回應
        if (response.data) {
            // 如果回應數據在data字段
            if (response.data.data) {
                order.value = response.data.data;
            } else {
                order.value = response.data;
            }
        }
    } catch (err) {
        console.error('載入訂單數據失敗:', err);

        // 如果出錯，依然顯示基本付款結果
        // 但不顯示訂單詳情
        order.value = {
            orderId: orderId.value,
            totalPrice: 0
        };
    } finally {
        loading.value = false;
    }
};

// 組件掛載時載入數據
onMounted(() => {
    loadOrderData();
});
</script>

<style scoped>
.payment-result-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Microsoft JhengHei", Arial, sans-serif;
}

.result-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    text-align: center;
    transition: all 0.3s ease;
}

.result-card.success {
    border-top: 5px solid #28a745;
}

.result-card.pending {
    border-top: 5px solid #ffc107;
}

.result-card.fail {
    border-top: 5px solid #dc3545;
}

.result-icon {
    font-size: 72px;
    margin-bottom: 20px;
}

.result-icon i {
    transition: transform 0.5s ease;
}

.success .result-icon i {
    color: #28a745;
    animation: pulse 2s infinite;
}

.pending .result-icon i {
    color: #ffc107;
}

.fail .result-icon i {
    color: #dc3545;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

h2 {
    font-size: 28px;
    margin-bottom: 15px;
    font-weight: bold;
    color: #333;
}

.result-message {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
}

/* 訂單摘要樣式 */
.order-summary {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
    text-align: left;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.summary-row span:first-child {
    font-weight: bold;
    color: #555;
}

.bank-transfer-info {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
}

.bank-transfer-info p {
    margin-bottom: 15px;
    color: #856404;
    font-weight: bold;
}

.info-box {
    background-color: #fff3cd;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #ffc107;
}

/* 指引區塊 */
.result-guide {
    margin: 30px 0;
    text-align: left;
}

.guide-section h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
}

.guide-section ul {
    list-style-type: none;
    padding: 0;
}

.guide-section li {
    padding: 8px 0 8px 25px;
    position: relative;
}

.guide-section li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
}

.fail .guide-section li:before {
    content: "✗";
    color: #dc3545;
}

.pending .guide-section li:before {
    content: "→";
    color: #ffc107;
}

/* 按鈕區塊 */
.action-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
}

.home-btn {
    background-color: #6c757d;
    color: white;
    border: none;
}

.home-btn:hover {
    background-color: #5a6268;
}

.order-btn {
    background-color: #007bff;
    color: white;
    border: none;
}

.order-btn:hover {
    background-color: #0069d9;
}

.retry-btn {
    background-color: #28a745;
    color: white;
    border: none;
}

.retry-btn:hover {
    background-color: #218838;
}

.support-btn {
    background-color: #17a2b8;
    color: white;
    border: none;
}

.support-btn:hover {
    background-color: #138496;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .payment-result-container {
        margin: 20px auto;
    }

    .result-card {
        padding: 30px 20px;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>