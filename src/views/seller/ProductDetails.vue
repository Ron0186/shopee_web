<template>
    <div class="list-page">
        <h1>🛍 我的商品</h1>
        <!-- <p>商品數量：{{ shopData.length }}</p> -->

        <ul>
            <li v-for="product in shopData" :key="product.productId"
                class="product-item">
                <div class="product-detail">
                    <!-- 商品名稱 -->
                    <p>商品：{{ product.productName }}</p>

                    <!-- 圖片顯示 -->
                    <div class="product-image">
                        <img :src="product.image" alt="商品圖片"
                            v-if="product.image" />
                        <span v-else>❌ 無圖片</span>
                    </div>

                    <!-- 商品描述 -->
                    <p>描述：{{ product.description || '無描述' }}</p>

                    <!-- 商品狀態 -->
                    <!-- <p>
                        商品狀態：
                        <span v-if="product.productActive === 1"
                            class="status-active">販售中</span>
                        <span v-else class="status-inactive">已下架</span>
                    </p> -->

                    <!-- 上架日期 -->
                    <p>上架日期：{{ formatDate(product.createdAt) }}</p>

                    <!-- 上次更新日期 -->
                    <p>上次更新：{{ formatDate(product.updatedAt) }}</p>
                </div>
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
import axios from 'axios'
import { useRouter } from 'vue-router'

// 定義商品數據
const shopData = ref<any[]>([])
const pageSize = ref(5) // 每頁顯示 5 筆
const currentPage = ref(1) // 當前頁數

const router = useRouter() // 用於返回上一頁

// 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(shopData.value.length / pageSize.value)
})

// 取得目前分頁的資料
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return shopData.value.slice(start, end)
})

// 格式化日期方法
const formatDate = (dateString: string) => {
    if (!dateString) return '無資料'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

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

// 取得 shopId 和 token（根據實際情況調整）
const shopId = 1 // 假設是 shopId = 1，可根據情況改動
const token = localStorage.getItem('token')

onMounted(async () => {
    try {
        const res = await axios.get(`http://localhost:8081/api/products/shop/${shopId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        shopData.value = res.data
    } catch (error) {
        console.error('❌ 無法取得商品資料', error)
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

.product-item {
    list-style-type: none;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
}

.product-detail p {
    margin: 5px 0;
}

.product-image img {
    max-width: 100px;
    height: auto;
    border-radius: 5px;
    margin-top: 5px;
}

.product-image span {
    color: red;
}

.status-active {
    color: green;
    font-weight: bold;
}

.status-inactive {
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
    /* cursor: not-allowed; */
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
