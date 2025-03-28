<template>
    <div class="dashboard">
        <h1>賣家後台總覽</h1>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <!-- 迴圈detail  SKU GET有誤 -->
        <div v-else>
            <!-- 每個區塊都分頁 -->
            <div class="section">
                <div class="section detail"
                    @click="navigateTo('/product-details')">
                    <h2>🛍 我的商品：{{ shopData.length }}</h2>
                </div>

                <div class="section detail"
                    @click="navigateTo('/order-details')">
                    <h2>🧾 訂單數量：{{ orderData.length }}</h2>
                </div>

                <div class="section detail" @click="navigateTo('/sku-details')">
                    <h2>📦 庫存管理：{{ skuData.length }}</h2>
                </div>

                <div class="section detail"
                    @click="navigateTo('/review-details')">
                    <h2>🌟 收到評論：{{ reviewData.length }}</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    userId: number
    shopId?: number
}

const userId = ref<number | null>(null)
const shopId = ref<number | null>(null)

const router = useRouter()

const shopData = ref<any[]>([])
const orderData = ref<any[]>([])
const skuData = ref<any[]>([])
const reviewData = ref<any[]>([])
const errorMessage = ref('')

const navigateTo = (path: string) => {
    router.push(path)
}

const pageSize = 5
const productPage = ref(1)
const orderPage = ref(1)
const skuPage = ref(1)
const reviewPage = ref(1)
const shopSearch = ref('')

// 搜尋功能未實作完成
// const filteredShopData = computed(() => {
//     return shopData.value.filter(p =>
//         p.productName.toLowerCase().includes(shopSearch.value.toLowerCase())
//     )
// })

function paginated(data: any[], page: number) {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
}

onMounted(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        errorMessage.value = "請先登入以查看賣家資訊。"
        return
    }

    try {
        const decoded = jwtDecode<JwtPayload>(token)
        userId.value = decoded.userId
        shopId.value = decoded.shopId || 1

        const [shopRes, orderRes, reviewRes
            , skuRes
        ] = await Promise.all([
            axios.get(`http://localhost:8081/api/product/byShop?shopId=${shopId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8081/api/orders/seller/orders?seller=${userId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8081/api/review/shop/${shopId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8081/api/sku/shop/${shopId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        shopData.value = shopRes.data
        orderData.value = orderRes.data.data || []
        reviewData.value = reviewRes.data
        skuData.value = skuRes.data

        console.log("📦 shopData", shopRes.data)
        console.log("📦 orderData", orderRes.data)
        console.log("📦 reviewData", reviewRes.data)
        console.log("📦 skuData", skuRes.data)


    } catch (error: any) {
        console.error("❌ 錯誤：", error)
        errorMessage.value = error.response?.data?.message || "資料取得失敗，請稍後再試。"
    }
})
</script>

<style scoped>
.dashboard {
    max-width: 600px;
    margin: auto;
    padding: 30px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 0 10px #ccc;
}

.section {
    background: white;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 6px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.detail:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}

h2 {
    margin: 0;
    color: #333;
    font-size: 18px;
}

.error {
    color: red;
    text-align: center;
}

.pagination {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination button {
    background-color: #04AA6D;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 6px 12px;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>