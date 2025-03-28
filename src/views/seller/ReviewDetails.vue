<template>
    <div class="list-page">
        <h1>🌟 收到評論</h1>
        <p>評論數量：{{ reviewData.length }}</p>

        <ul>
            <li v-for="review in paginatedData" :key="review.reviewId"
                class="review-item">
                <p>評論內容：{{ review.reviewContent }}</p>
                <p>評分：{{ formatRating(review.rating) }} ⭐</p>
                <p>評論商品：{{ review.productName }}</p>
                <!-- <p>評論者：{{ review.reviewId
                }}</p>
                <p>評論者：{{ getUserName(review.userId) }}</p> -->
                <p>評論狀態：{{ review.status
                }}</p>
                <p>評論時間：{{ formatDate(review.createdAt) }}</p>
            </li>
        </ul>

        <!-- 分頁按鈕 -->
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

const reviewData = ref<any[]>([]) // 存放評論資料
const pageSize = ref(5) // 每頁顯示 5 筆
const currentPage = ref(1) // 當前頁數
const router = useRouter() // 用於返回上一頁
const userCache = ref<Record<number, string>>({}) // 快取 username

// ✅ 格式化評分為 1 位小數
const formatRating = (rating: any) => {
    // 確保是數字，如果不是，嘗試轉換
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating)

    // 轉換成 1 位小數
    if (!isNaN(numRating)) {
        return numRating.toFixed(1) // 轉換為 1 位小數
    }
    return '0.0' // 如果出錯顯示 0.0
}


// ✅ 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(reviewData.value.length / pageSize.value)
})

// ✅ 取得目前分頁的資料
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return reviewData.value.slice(start, end)
})

// ✅ 分頁操作
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

// ✅ 格式化日期
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    return new Date(dateString).toLocaleDateString('zh-TW', options)
}

// ✅ 根據 userId 取得 username
const getUserName = async (userId: number) => {
    // 檢查快取
    if (userCache.value[userId]) {
        return userCache.value[userId]
    }

    try {
        const res = await axios.get(`http://localhost:8081/api/user/check/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const userName = res.data.username
        userCache.value[userId] = userName // 快取用戶名
        return userName
    } catch (error) {
        console.error(`❌ 無法取得 userId=${userId} 的使用者資料`, error)
        return '未知用戶'
    }
}

// ✅ 取得 shopId 和 token（根據實際情況調整）
const shopId = 1 // 假設是 shopId = 1，可根據情況改動
const token = localStorage.getItem('token')

// ✅ 請求評論資料
onMounted(async () => {
    try {
        const res = await axios.get(`http://localhost:8081/api/review/shop/${shopId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        reviewData.value = res.data
        console.log('🌟 reviewData', reviewData.value)
    } catch (error) {
        console.error('❌ 無法獲取評論資料：', error)
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

.review-item {
    list-style-type: none;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
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
