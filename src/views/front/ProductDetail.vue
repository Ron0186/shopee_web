<template>
  <div class="container mt-5">
    <div v-if="loading">載入中...</div>
    <div v-else-if="errorMessage">
      <p class="text-danger">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <h2>{{ product.productName }}</h2>

      <img
        v-if="product.primaryImageUrl"
        :src="product.primaryImageUrl.startsWith('http') ? product.primaryImageUrl : baseUrl + product.primaryImageUrl"
        alt="商品圖片"
        style="max-width: 300px"
      />

      <p>{{ product.description }}</p>

      <!-- 價格 -->
      <p v-if="selectedSku">
        價格：{{ selectedSku.price.toLocaleString() }} 元
      </p>
      <p v-else>價格：未定價</p>

      <!-- SKU 選擇 -->
      <div class="mb-3">
        <label for="skuSelect" class="form-label">選擇規格：</label>
        <select v-model="selectedSkuId" class="form-select" id="skuSelect">
          <option disabled value="">請選擇規格</option>
          <option
            v-for="sku in product.skuList"
            :key="sku.skuId"
            :value="sku.skuId"
          >
            {{ sku.spec }}（{{ sku.price }} 元）
          </option>
        </select>
      </div>

      <!-- 數量 -->
      <div class="mb-3">
        <label>數量：</label>
        <button class="btn btn-sm btn-secondary" @click="quantity--" :disabled="quantity <= 1">-</button>
        <span class="mx-2">{{ quantity }}</span>
        <button class="btn btn-sm btn-secondary" @click="quantity++">+</button>
      </div>

      <!-- 加入購物車 / 立即購買 -->
      <div class="mb-4">
        <button @click="addToCart" class="btn btn-success me-2">加入購物車</button>
        <button @click="buyNow" class="btn btn-primary">立即購買</button>
      </div>

      <!-- 評價區塊 -->
      <hr />
      <div>
        <h4>用戶留言與評價</h4>
        <div v-if="reviews.length === 0">目前尚無留言</div>
        <div v-else>
          <div
            v-for="review in reviews"
            :key="review.reviewId"
            class="border rounded p-3 mb-2"
          >
            <strong>{{ review.userName || "匿名用戶" }}</strong>
            <span class="text-warning">⭐ {{ review.rating }}</span>
            <p class="mt-2">{{ review.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const productId = route.params.productId
const baseUrl = import.meta.env.VITE_API_URL

const product = ref({})
const errorMessage = ref('')
const loading = ref(true)

const selectedSkuId = ref('')
const quantity = ref(1)

const reviews = ref([]) // ⭐ 儲存評論

const selectedSku = computed(() =>
  product.value.skuList?.find(sku => sku.skuId === selectedSkuId.value)
)

const fetchProduct = async () => {
  try {
    const res = await axios.get(`/api/products/${productId}`)
    product.value = res.data
    if (product.value.skuList?.length === 1) {
      selectedSkuId.value = product.value.skuList[0].skuId
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '載入商品失敗'
  }
}

const fetchReviews = async () => {
  try {
    const res = await axios.get(`/api/review/product/${productId}`)
    reviews.value = res.data || []
  } catch (e) {
    console.warn("載入留言失敗", e)
  }
}

onMounted(async () => {
  await fetchProduct()
  await fetchReviews()
  loading.value = false
})

const addToCart = async () => {
  const userId = userStore.userId
  if (!userId || !selectedSkuId.value) {
    alert('請先選擇規格')
    return
  }

  try {
    await axios.post('/api/cart/add', {
      userId,
      skuId: selectedSkuId.value,
      quantity: quantity.value
    })
    alert('✅ 已加入購物車')
  } catch (err) {
    console.error(err)
    alert('加入購物車失敗')
  }
}

const buyNow = async () => {
  await addToCart()
  router.push('/checkout')
}
</script>

<style scoped>
.border {
  border: 1px solid #ddd;
}
</style>
