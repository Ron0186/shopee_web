<template>
    <div class="list-page">
        <h1>📦 庫存管理</h1>

        <ul>
            <li v-for="sku in paginatedData" :key="sku.skuId" class="sku-item">
                <p>商品名稱：{{ sku.productName || '未知商品' }}</p>
                <p>商品圖片：</p>
                <img v-if="sku.productImage" :src="sku.productImage" alt="商品圖片"
                    class="product-image" />
                <span v-else class="no-image">無圖片</span>
                <p>價格：${{ sku.price }}</p>
                <p>在庫數量：{{ sku.stock }}</p>
                <p>詳細規格：{{ formatSpecPairs(sku.specPairs) }}</p>
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
        <button @click="goBack" class="back-btn">返回上一頁</button>
    </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 主要資料
const skuData = ref<any[]>([]) // SKU 資料
const productData = ref<any[]>([]) // 產品資料

const router = useRouter() // 用於返回上一頁

// 分頁參數
const pageSize = ref(5) // 每頁顯示 5 筆
const currentPage = ref(1) // 當前頁數

// 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(skuData.value.length / pageSize.value)
})

// 取得目前分頁的資料
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return skuData.value.slice(start, end)
})

// 分頁操作
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

// ✅ 返回上一頁
const goBack = () => {
    router.go(-1)
}

// 格式化 specPairs 轉換成文字
const formatSpecPairs = (specPairs: any) => {
    if (!specPairs) return '無規格'
    return Object.entries(specPairs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
}

// 取得 shopId 和 token（根據實際情況調整）
const shopId = 1 // 假設是 shopId = 1，可根據情況改動
const token = localStorage.getItem('token')

// 合併 SKU 與 Product 資料
const mergeSkuWithProduct = () => {
    skuData.value = skuData.value.map((sku) => {
        const product = productData.value.find((p) => p.productId === sku.productId)
        return {
            ...sku,
            productName: product ? product.productName : '未知商品',
            productImage: product ? product.image : null
        }
    })
}

// 請求資料
onMounted(async () => {
    try {
        // 取得 SKU 資料
        const [skuRes, productRes] = await Promise.all([
            axios.get(`http://localhost:8081/api/byshop/${shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`http://localhost:8081/api/product/byShop?shopId=${shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ])

        skuData.value = skuRes.data
        productData.value = productRes.data

        // 合併 SKU 與 Product 資料
        mergeSkuWithProduct()

        console.log('📦 skuData', skuData.value)
        console.log('🛍 productData', productData.value)
    } catch (error) {
        console.error('❌ 取得資料失敗:', error)
    }
})
</script>



<style scoped>
.list-page {
    max-width: 600px;
    margin: auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px #ccc;
}

.sku-item {
    list-style-type: none;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
}

.product-image {
    max-width: 100px;
    height: auto;
    border-radius: 5px;
    margin-top: 5px;
}

.no-image {
    color: red;
    font-weight: bold;
}

/* 分頁樣式 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
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

.pagination span {
    font-size: 14px;
    margin: 0 10px;
}

/* 返回按鈕樣式 */
.back-btn {
    margin-top: 20px;
    padding: 8px 15px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
}

.back-btn:hover {
    background-color: #d32f2f;
}
</style>
