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
      <button class="checkout-btn" @click="checkout">結帳</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const cartItems = ref([])
const userId = ref(1) // 假設 userId = 1

// ✅ 總計計算
const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
})

// ✅ 獲取購物車
const fetchCart = async () => {
  try {
    const response = await axios.get(`http://localhost:8081/api/cart/${userId.value}`)
    console.log('購物車 API 回傳:', response.data)
    cartItems.value = response.data
  } catch (error) {
    console.error('獲取購物車資料失敗', error)
  }
}

// ✅ 更新數量
const updateQuantity = async (cartId, newQuantity) => {
  if (newQuantity < 1) {
    removeFromCart(cartId)
    return
  }

  try {
    await axios.put(`http://localhost:8081/api/cart/${cartId}`, { quantity: newQuantity })
    fetchCart()
  } catch (error) {
    console.error('❌ 更新購物車失敗', error)
  }
}

// ✅ 刪除商品
const removeFromCart = async (cartId, skuId) => {
  try {
    await axios.delete(`http://localhost:8081/api/cart/remove`, {
      params: { userId: userId.value, skuId: skuId }
    })
    fetchCart()
  } catch (error) {
    console.error('❌ 刪除失敗', error)
  }
}

// ✅ 結帳
const checkout = async () => {
  try {
    const response = await axios.post(`http://localhost:8081/api/orders/checkout/${userId.value}`)
    alert('結帳成功！訂單編號：' + response.data.orderId)
    cartItems.value = [] // 清空購物車
  } catch (error) {
    console.error('結帳失敗', error)
  }
}

// ✅ Vue 3 的生命周期方法，等同於 Vue 2 的 `mounted()`
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
.delete-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
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
