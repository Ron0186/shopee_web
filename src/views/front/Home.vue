<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">最新商品</h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="item in products" :key="item.productId" class="border p-3 rounded-lg shadow">
          <img
            :src="getImageUrl(item)"
            alt="商品圖片"
            class="w-full h-48 object-cover rounded mb-2"
          />
          <h2 class="text-lg font-semibold truncate">{{ item.productName }}</h2>
          <p class="text-gray-600 mb-2">
            {{ item.lowestPrice ? `最低價：${item.lowestPrice} 元` : '未定價' }}
          </p>
          <RouterLink
            :to="`/products/${item.productId}`"
            class="text-blue-500 hover:underline text-sm"
          >
            查看詳情
          </RouterLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import axios from 'axios'
  
  const products = ref([])
  
  onMounted(async () => {
    try {
      const res = await axios.get('/api/products/public')
      products.value = res.data
    } catch (err) {
      console.error('載入商品失敗', err)
    }
  })
  
  // 處理圖片網址
  const getImageUrl = (item) => {
    if (!item.imageUrls || item.imageUrls.length === 0) {
      return '/default.jpg'
    }
    const path = item.imageUrls[0]
    return path.startsWith('http') ? path : `http://localhost:8081${path}`
  }
  </script>
  