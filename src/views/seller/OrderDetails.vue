<template>
    <div class="list-page">
        <h1>🧾 訂單數量</h1>
        <p>訂單總數：{{ orderData.length }}</p>

        <ul>
            <li v-for="order in paginatedData" :key="order.orderId"
                class="order-item">
                <p>📦 訂單編號：{{ order.orderId }}</p>
                <p>🛍 商品：
                <ul>
                    <li v-for="item in order.items" :key="item.productId">
                        {{ item.productName }} × {{ item.quantity }}
                    </li>
                </ul>
                </p>
                <p>💰 總價：{{ order.totalPrice }}</p>
                <p>👤 買家：{{ order.userName }}</p>
                <p>💳 付款狀態：{{ order.paid ? '已付款' : '未付款' }}</p>
                <p>🚚 物流狀態：{{ order.shipped ? '已出貨' : '未出貨' }}</p>
                <p>🔍 追蹤碼：{{ order.trackingNumber || '無' }}</p>
                <p>🏡 收件地址：{{ order.billingAddress }}</p>
                <p>🕓 結帳時間：{{ formatDate(order.createdAt) }}</p>
                <p>🕘 上次更新：{{ formatDate(order.updatedAt) }}</p>
            </li>
        </ul>

        <!-- 分頁 -->
        <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
            <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
            <button @click="nextPage"
                :disabled="currentPage === totalPages">下一頁</button>
        </div>

        <!-- 返回上一頁按鈕 -->
        <div class="back-button">
            <button @click="goBack">返回上一頁</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const orderData = ref<any[]>([]) // 訂單數據
const errorMessage = ref<string | null>(null) // 錯誤訊息
const pageSize = ref(5) // 每頁顯示的數量
const currentPage = ref(1) // 當前頁數

// ✅ 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(orderData.value.length / pageSize.value)
})

// ✅ 取得目前分頁的資料
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return orderData.value.slice(start, start + pageSize.value)
})

// ✅ 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// ✅ 上一頁
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

// ✅ 下一頁
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

// ✅ 返回上一頁
const goBack = () => {
    router.back()
}

// ✅ 初始化
onMounted(async () => {
    const token = localStorage.getItem('token')
    const userId = 1 // 測試時固定為 userId 1，請根據情境調整

    try {
        const res = await axios.get(`http://localhost:8081/api/orders/seller/orders?seller=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        orderData.value = res.data.data || []
        console.log('📦 orderData:', orderData.value)
    } catch (error) {
        console.error('❌ 無法取得訂單資料:', error)
        errorMessage.value = '無法載入訂單資料，請稍後再試。'
    }
})
</script>

<style scoped>
.list-page {
    max-width: 800px;
    margin: auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px #ccc;
}

.order-item {
    list-style-type: none;
    padding: 15px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
}

.order-item p {
    margin: 5px 0;
}

.pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.pagination button {
    background-color: #04aa6d;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin: 0 5px;
}

.pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.back-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.back-button button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
}

.back-button button:hover {
    background-color: #d32f2f;
}
</style>
