<template>
    <div class="payment-button-container">
        <button class="payment-button" :class="{ 'loading': isLoading }" @click="initiatePayment" :disabled="isLoading">
            {{ isLoading ? '處理中...' : '前往 ECPay 付款' }}
        </button>

        <div v-if="isLoading" class="payment-overlay">
            <div class="spinner"></div>
            <p>正在連接到綠界支付系統，請稍候...</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PaymentButton',
    props: {
        orderId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            isLoading: false
        }
    },
    // 在 PaymentButton.vue 的 methods 部分

    methods: {
        async checkOrderPayment() {
            try {
                const token = localStorage.getItem('token') || '';

                // 先檢查訂單是否可以付款
                const checkResponse = await fetch(`http://localhost:8081/api/orders/check-payment/${this.orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const checkResult = await checkResponse.json();

                if (!checkResponse.ok || checkResult.status === 'error') {
                    throw new Error(checkResult.message || '此訂單不需要付款或已付款完成');
                }

                return true;
            } catch (error) {
                console.error('檢查付款狀態錯誤:', error);
                alert(error.message || '付款檢查失敗，請稍後再試');
                return false;
            }
        },

        async initiatePayment() {
            this.isLoading = true;

            try {
                // 先檢查訂單是否可以付款
                const canPay = await this.checkOrderPayment();
                if (!canPay) {
                    this.isLoading = false;
                    return;
                }

                // 從 Vuex store 或 localStorage 獲取 token
                const token = localStorage.getItem('token') || '';

                // 向後端 API 發送請求
                const response = await fetch(`http://localhost:8081/api/payment/order/${this.orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('付款請求失敗');
                }

                // 獲取 HTML 表單回應
                const htmlResponse = await response.text();

                // 檢查是否收到HTML表單而不是錯誤訊息
                if (htmlResponse.includes('<!DOCTYPE html>') || htmlResponse.includes('<html')) {
                    // 處理 ECPay 返回的表單
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlResponse;
                    document.body.appendChild(tempDiv);

                    // 如果表單沒有自動提交，手動提交
                    const form = document.getElementById('ecpayForm');
                    if (form) {
                        form.submit();
                    } else {
                        throw new Error('未找到支付表單');
                    }
                } else {
                    // 可能是JSON格式的錯誤訊息
                    try {
                        const errorData = JSON.parse(htmlResponse);
                        throw new Error(errorData.message || '付款處理失敗');
                    } catch (parseError) {
                        // 如果不是JSON，則顯示原始回應
                        throw new Error('付款處理失敗: ' + htmlResponse);
                    }
                }
            } catch (error) {
                console.error('支付發起失敗:', error);
                this.isLoading = false;
                alert('支付發起失敗: ' + error.message);
            }
        }
    }
}
</script>

<style scoped>
.payment-button-container {
    position: relative;
    margin: 20px 0;
}

.payment-button {
    background-color: #27ae60;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.payment-button:hover {
    background-color: #2ecc71;
}

.payment-button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

.payment-button.loading {
    background-color: #7f8c8d;
}

.payment-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.payment-overlay p {
    color: white;
    font-size: 18px;
    margin-top: 20px;
}

.spinner {
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 5px solid white;
    width: 50px;
    height: 50px;
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
</style>