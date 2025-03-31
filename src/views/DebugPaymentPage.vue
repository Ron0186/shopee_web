<template>
    <div class="debug-payment">
        <h2>訂單付款調試頁</h2>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>載入中...</p>
        </div>

        <div v-else-if="error" class="error">
            <h3>發生錯誤</h3>
            <p>{{ error }}</p>
            <button @click="goBack">返回訂單列表</button>
        </div>

        <div v-else class="content">
            <div class="order-info">
                <p><strong>訂單ID:</strong> {{ orderId }}</p>
                <p><strong>檢查結果:</strong> {{ checkResult }}</p>
            </div>

            <div class="actions">
                <button @click="checkOrder" :disabled="checking">
                    {{ checking ? '檢查中...' : '檢查訂單' }}
                </button>
                <button @click="makeXHRRequest" :disabled="making">
                    {{ making ? '請求中...' : '直接XHR請求' }}
                </button>
                <button @click="fetchOrder" :disabled="fetching">
                    {{ fetching ? '獲取中...' : '獲取訂單' }}
                </button>
                <button @click="goBack">返回</button>
            </div>

            <div v-if="responseData" class="response">
                <h3>回應數據:</h3>
                <pre>{{ JSON.stringify(responseData, null, 2) }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DebugPaymentPage',
    data() {
        return {
            orderId: this.$route.params.orderId || this.$route.params.id,
            loading: false,
            error: null,
            checkResult: '尚未檢查',
            responseData: null,
            checking: false,
            making: false,
            fetching: false
        }
    },
    mounted() {
        console.log('調試頁面已加載，訂單ID:', this.orderId);
    },
    methods: {
        // 檢查訂單是否可以付款
        async checkOrder() {
            this.checking = true;
            this.error = null;
            this.responseData = null;

            try {
                const token = localStorage.getItem('token') || '';

                // 使用純XHR請求，避免任何框架可能的干擾
                const xhr = new XMLHttpRequest();
                xhr.open('GET', `/api/orders/check-payment/${this.orderId}`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                xhr.onload = () => {
                    this.checking = false;

                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            this.checkResult = `成功 (${xhr.status}): ${response.message || JSON.stringify(response)}`;
                            this.responseData = response;
                        } catch (parseError) {
                            this.checkResult = `成功但解析失敗 (${xhr.status})`;
                            this.error = `回應不是有效的JSON: ${xhr.responseText.substring(0, 100)}...`;
                        }
                    } else {
                        this.checkResult = `失敗 (${xhr.status})`;
                        this.error = `請求失敗: ${xhr.statusText}`;
                    }
                };

                xhr.onerror = () => {
                    this.checking = false;
                    this.checkResult = '連接錯誤';
                    this.error = '無法連接到服務器';
                };

                xhr.send();
            } catch (err) {
                this.checking = false;
                this.checkResult = '異常';
                this.error = `發生異常: ${err.message}`;
            }
        },

        // 直接使用XHR獲取訂單，完全略過框架可能的干擾
        makeXHRRequest() {
            this.making = true;
            this.error = null;
            this.responseData = null;

            try {
                const token = localStorage.getItem('token') || '';

                const xhr = new XMLHttpRequest();
                xhr.open('GET', `/api/orders/${this.orderId}`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                xhr.onload = () => {
                    this.making = false;

                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            this.responseData = response;
                        } catch (parseError) {
                            this.error = `回應不是有效的JSON: ${xhr.responseText.substring(0, 100)}...`;
                        }
                    } else {
                        this.error = `請求失敗: ${xhr.status} ${xhr.statusText}`;
                    }
                };

                xhr.onerror = () => {
                    this.making = false;
                    this.error = '無法連接到服務器';
                };

                xhr.send();
            } catch (err) {
                this.making = false;
                this.error = `發生異常: ${err.message}`;
            }
        },

        // 使用Fetch API獲取訂單
        async fetchOrder() {
            this.fetching = true;
            this.error = null;
            this.responseData = null;

            try {
                const token = localStorage.getItem('token') || '';

                const response = await fetch(`/api/orders/${this.orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');

                    if (contentType && contentType.includes('application/json')) {
                        this.responseData = await response.json();
                    } else {
                        // 如果不是JSON
                        const text = await response.text();
                        this.error = `回應不是JSON: ${text.substring(0, 100)}...`;
                    }
                } else {
                    this.error = `請求失敗: ${response.status} ${response.statusText}`;
                }
            } catch (err) {
                this.error = `發生異常: ${err.message}`;
            } finally {
                this.fetching = false;
            }
        },

        // 返回上一頁
        goBack() {
            this.$router.push('/orders');
        }
    }
}
</script>

<style scoped>
.debug-payment {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}

.loading {
    text-align: center;
    padding: 30px;
}

.error {
    color: #dc3545;
    background-color: #f8d7da;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
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

.actions {
    display: flex;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
}

button {
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #2980b9;
}

.response {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}

pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>