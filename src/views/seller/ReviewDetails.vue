<template>
    <div class="list-page">
      <h1>🌟 收到評論</h1>
  
      <!-- 上方資訊統一樣式 -->
      <p class="info-row">評論數量：{{ reviewData.length }}</p>
      <p class="info-row">
        平均評分：
        <font-awesome-icon
          v-for="(type, index) in renderStarIcons(parseFloat(averageRating))"
          :key="index"
          :icon="getIcon(type)"
          class="star-icon"
        />
        （{{ averageRating }}）
      </p>
  
      <!-- 排序選單 -->
      <div class="info-row sort-control">
        <label>排序依據：</label>
        <select v-model="sortBy">
          <option value="time">🕒 時間</option>
          <option value="rating">⭐ 評分</option>
        </select>
  
        <label>排序方向：</label>
        <select v-if="sortBy === 'rating'" v-model="sortOrder">
          <option value="desc">↓ 由高到低</option>
          <option value="asc">↑ 由低到高</option>
        </select>
  
        <select v-else v-model="timeOrderDirection">
          <option value="desc">📅 由近至遠</option>
          <option value="asc">📅 由遠至近</option>
        </select>
      </div>
  
      <!-- 評論列表 -->
      <ul>
        <li v-for="review in paginatedData" :key="review.reviewId" class="review-item">
          <p class="label-row">
            <span class="label">評論內容：</span>{{ review.reviewContent }}
          </p>
          <p class="label-row">
            <span class="label">評分：</span>
            <span class="star-group">
                <font-awesome-icon v-for="(type, index) in renderStarIcons(review.rating)" :key="index" :icon="getIcon(type)" class="star-icon" />
            （{{ formatRating(review.rating) }}）
                </span>
            </p>
          <p class="label-row">
            <span class="label">評論商品：</span>{{ review.productName }}
          </p>
          <p class="label-row">
            <span class="label">評論狀態：</span>{{ review.status }}
          </p>
          <p class="label-row">
            <span class="label">評論時間：</span>{{ formatDate(review.createdAt) }}
          </p>
        </li>
      </ul>
  
      <!-- 分頁按鈕 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
        <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
      </div>
  
      <button @click="goBack" class="back-btn">返回上一頁</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { jwtDecode } from 'jwt-decode'
  
  // Token & Router
  const token = localStorage.getItem('token')
  const router = useRouter()
  
  const userId = ref<number | null>(null)
  const shopId = ref<number | null>(null)
  
  const reviewData = ref<any[]>([])
  const sortedReviewData = ref<any[]>([])
  const pageSize = ref(5)
  const currentPage = ref(1)
  
  const sortBy = ref<'time' | 'rating'>('time')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const timeOrderDirection = ref<'asc' | 'desc'>('desc')
  
  // ⭐ 平均分數
  const averageRating = computed(() => {
    if (reviewData.value.length === 0) return '0.0'
    const total = reviewData.value.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0)
    return (total / reviewData.value.length).toFixed(1)
  })
  
  // 📌 星星工具
  const renderStarIcons = (rating: number) => {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.25 && rating % 1 <= 0.75
    const empty = 5 - full - (hasHalf ? 1 : 0)
    return [
      ...Array(full).fill('full'),
      ...(hasHalf ? ['half'] : []),
      ...Array(empty).fill('empty')
    ]
  }
  const getIcon = (type: string) => {
    if (type === 'full') return ['fas', 'star']
    if (type === 'half') return ['far', 'star-half-stroke']
    return ['far', 'star']
  }
  
  const formatRating = (rating: any) => {
    const num = typeof rating === 'number' ? rating : parseFloat(rating)
    return isNaN(num) ? '0.0' : num.toFixed(1)
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  // 🔁 排序
  const sortReviews = () => {
    sortedReviewData.value = [...reviewData.value].sort((a, b) => {
      if (sortBy.value === 'time') {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()
        return timeOrderDirection.value === 'asc' ? tA - tB : tB - tA
      } else {
        const rA = parseFloat(a.rating || 0)
        const rB = parseFloat(b.rating || 0)
        return sortOrder.value === 'asc' ? rA - rB : rB - rA
      }
    })
  }
  watch([sortBy, sortOrder, timeOrderDirection], sortReviews)
  
  // 分頁
  const totalPages = computed(() =>
    Math.ceil(sortedReviewData.value.length / pageSize.value)
  )
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return sortedReviewData.value.slice(start, start + pageSize.value)
  })
  const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
  const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
  const goBack = () => router.go(-1)
  
  // 🔰 onMounted
  onMounted(async () => {
    if (!token) {
      console.warn("⚠️ 尚未登入")
      return
    }
  
    const decoded = jwtDecode<any>(token)
    userId.value = decoded.userId
  
    try {
      // 🔎 拿 shopId
      const shopRes = await axios.get(`http://localhost:8081/api/shop/user/${userId.value}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      shopId.value = shopRes.data.shopId
  
      if (!shopId.value) {
        console.warn("⚠️ 尚未開店")
        return
      }
  
      // ⭐ 拿評論
      const reviewRes = await axios.get(`http://localhost:8081/api/review/shop/${shopId.value}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      reviewData.value = reviewRes.data || []
      sortReviews()
    } catch (error) {
      console.error("❌ 錯誤：", error)
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
  
  .info-row {
    font-size: 15px;
    margin-bottom: 8px;
    color: #333;
  }
  
  .sort-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    font-size: 14px;
  }
  
  .review-item {
    list-style-type: none;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
  }
  
  .label-row {
    display: flex;
    margin-bottom: 4px;
  }
  
  .label {
    display: inline-block;
    width: 90px;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .star-icon {
    color: #f5a623;
    margin-right: 2px;
    font-size: 16px;
  }
  
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

  .star-group {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1.6;
}

  </style>
  