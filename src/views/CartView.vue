<script setup>
import { ref, onMounted } from 'vue'

const cartItems = ref([])

// 取得購物車資料
const fetchCart = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/cart/1') // userId = 1
    if (!response.ok) throw new Error('購物車載入失敗')
    cartItems.value = await response.json()
  } catch (error) {
    console.error(error)
  }
}

// 更新商品數量
const updateQuantity = async (cartId, newQuantity) => {
  if (newQuantity < 1) return // 最小數量是 1
  try {
    const response = await fetch(`http://localhost:8081/api/cart/${cartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity }),
    })
    if (!response.ok) throw new Error('更新數量失敗')

    // 更新前端顯示
    const updatedItem = await response.json()
    const index = cartItems.value.findIndex(item => item.id === cartId)
    if (index !== -1) {
      cartItems.value[index].quantity = updatedItem.quantity
    }
  } catch (error) {
    console.error(error)
  }
}

// 刪除購物車商品
const removeItem = async (cartId) => {
  try {
    const response = await fetch(`http://localhost:8081/api/cart/${cartId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('刪除失敗')

    // 更新前端顯示
    cartItems.value = cartItems.value.filter(item => item.id !== cartId)
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchCart)
</script>

<template>
  <div>
    <h2>🛒 購物車</h2>
    <ul v-if="cartItems.length">
      <li v-for="item in cartItems" :key="item.id">
        {{ item.name }} - {{ item.quantity }} 件 - ${{ item.price }}
        <button @click="updateQuantity(item.id, item.quantity - 1)">➖</button>
        <button @click="updateQuantity(item.id, item.quantity + 1)">➕</button>
        <button @click="removeItem(item.id)">🗑️</button> <!-- 新增刪除按鈕 -->
      </li>
    </ul>
    <p v-else>購物車是空的</p>
  </div>
</template>

<style scoped>
button {
  margin: 5px;
  padding: 5px;
  cursor: pointer;
}
</style>
