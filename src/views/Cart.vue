<template>
  <div class="cart-container">
    <h1>🛒 購物車</h1>
    <div v-if="cartItems.length === 0">你的購物車是空的</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>商品名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.cartId">
            <td>{{ item.name }}</td>
            <td>
              <button @click="updateQuantity(item.cartId, item.quantity - 1)" :disabled="item.quantity <= 1">➖</button>
              {{ item.quantity }}
              <button @click="updateQuantity(item.cartId, item.quantity + 1)">➕</button>
            </td>
            <td>{{ item.price.toLocaleString() }} 元</td>
            <td>{{ (item.quantity * item.price).toLocaleString() }} 元</td>
            <td>
              <button @click="removeFromCart(item.cartId, item.skuId)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <h3>總計：{{ totalPrice.toLocaleString() }} 元</h3>
      <button class="checkout-btn" @click="checkout">前往結帳</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const cartItems = ref([])
const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
)

const fetchCart = async () => {
  const userId = userStore.userId
  if (!userId) {
    console.warn('⚠️ 無法取得 userId，請先登入')
    return
  }

  try {
    const response = await axios.get(`/api/cart/${userId}`)
    
    // 根據回傳格式選擇正確欄位
    if (Array.isArray(response.data)) {
      cartItems.value = response.data
    } else if (Array.isArray(response.data.data)) {
      cartItems.value = response.data.data
    } else {
      console.warn('⚠️ 無法解析購物車資料格式', response.data)
      cartItems.value = []
    }
  } catch (error) {
    console.error('❌ 獲取購物車資料失敗', error)
  }
}

const updateQuantity = async (cartId, newQuantity) => {
  if (newQuantity < 1) {
    removeFromCart(cartId)
    return
  }

  try {
    await axios.put(`/api/cart/${cartId}`, { quantity: newQuantity })
    fetchCart()
  } catch (error) {
    console.error('❌ 更新購物車失敗', error)
  }
}

const removeFromCart = async (cartId, skuId) => {
  const userId = userStore.userId
  if (!userId) return

  try {
    await axios.delete(`/api/cart/remove`, {
      params: { userId, skuId }
    })
    fetchCart()
  } catch (error) {
    console.error('❌ 刪除失敗', error)
  }
}

const checkout = () => {
  router.push('/checkout')
}

onMounted(fetchCart)
</script>



<style scoped>
.cart-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
button {
  cursor: pointer;
  padding: 5px 10px;
  margin: 0 5px;
}
.checkout-btn {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: green;
  color: white;
  border: none;
  font-size: 16px;
}
</style>
