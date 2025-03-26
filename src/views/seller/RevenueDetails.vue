<template>
    <div class="dashboard">
        <h1>賣家後台總覽</h1>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <!-- 迴圈detail  SKU GET有誤 -->
        <div v-else>
            <!-- 每個區塊都分頁 -->
            <div class="section">
                <h2>🛍 商品數量：{{ shopData.length }}</h2>
                <!-- 搜尋功能未實作完成 -->
                <!-- <input v-model="shopSearch" placeholder="搜尋商品名稱..." /> -->
                <ul>
                    <li v-for="product in paginated(shopData, productPage)"
                        :key="product.productId">
                        {{ product.productName }}
                    </li>
                </ul>
                <div class="pagination">
                    <button @click="productPage--"
                        :disabled="productPage === 1">上一頁</button>
                    <span>第 {{ productPage }} 頁</span>
                    <button @click="productPage++"
                        :disabled="productPage * pageSize >= shopData.length">下一頁</button>
                </div>
            </div>

            <div class="section">
                <h2>📦 訂單數量：{{ orderData.length }}</h2>
                <ul>
                    <li v-for="order in paginated(orderData, orderPage)"
                        :key="order.orderId">
                        訂單編號：{{ order.orderId }}
                    </li>
                </ul>
                <div class="pagination">
                    <button @click="orderPage--"
                        :disabled="orderPage === 1">上一頁</button>
                    <span>第 {{ orderPage }} 頁</span>
                    <button @click="orderPage++"
                        :disabled="orderPage * pageSize >= orderData.length">下一頁</button>
                </div>
            </div>

            <!-- <div class="section">
                <h2>🧾 SKU 數量：{{ skuData.length }}</h2>
                <ul>
                    <li v-for="sku in paginated(skuData, skuPage)"
                        :key="sku.id">
                        SKU：{{ sku.code }}
                    </li>
                </ul>
                <div class="pagination">
                    <button @click="skuPage--"
                        :disabled="skuPage === 1">上一頁</button>
                    <span>第 {{ skuPage }} 頁</span>
                    <button @click="skuPage++"
                        :disabled="skuPage * pageSize >= skuData.length">下一頁</button>
                </div>
            </div> -->

            <div class="section">
                <h2>🌟 評論數量：{{ reviewData.length }}</h2>
                <ul>
                    <li v-for="review in paginated(reviewData, reviewPage)"
                        :key="review.reviewId">
                        評論：{{ review.reviewContent }}
                    </li>
                </ul>
                <div class="pagination">
                    <button @click="reviewPage--"
                        :disabled="reviewPage === 1">上一頁</button>
                    <span>第 {{ reviewPage }} 頁</span>
                    <button @click="reviewPage++"
                        :disabled="reviewPage * pageSize >= reviewData.length">下一頁</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    userId: number
    shopId?: number
}

const userId = ref<number | null>(null)
const shopId = ref<number | null>(null)

const shopData = ref<any[]>([])
const orderData = ref<any[]>([])
// const skuData = ref<any[]>([])
const reviewData = ref<any[]>([])
const errorMessage = ref('')

const pageSize = 5
const productPage = ref(1)
const orderPage = ref(1)
// const skuPage = ref(1)
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
            // , skuRes 
        ] = await Promise.all([
            axios.get(`http://localhost:8081/api/product/byShop?shopId=${shopId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8081/api/orders/seller/orders?seller=${userId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8081/api/review/shop/${shopId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
            // axios.get(`http://localhost:8081/api/sku/all`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        shopData.value = shopRes.data
        orderData.value = orderRes.data.data || []
        reviewData.value = reviewRes.data
        // skuData.value = skuRes.data

        console.log("📦 shopData", shopRes.data)
        console.log("📦 orderData", orderRes.data)
        console.log("📦 reviewData", reviewRes.data)


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