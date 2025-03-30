<template>
    <div class="checkout-container">
      <h2>🧾 結帳資訊</h2>
  
      <form @submit.prevent="submitOrder">
        <div class="form-group">
          <label>收件人姓名</label>
          <input v-model="recipientName" type="text" required />
        </div>
  
        <div class="form-group">
          <label>電話</label>
          <input v-model="recipientPhone" type="tel" required />
        </div>
  
        <div class="form-group">
          <label>地址</label>
          <input v-model="address" type="text" required />
        </div>
  
        <div class="form-group">
          <label>付款方式</label>
          <select v-model="paymentMethod" required>
            <option disabled value="">請選擇</option>
            <option>信用卡</option>
            <option>貨到付款</option>
          </select>
        </div>
  
        <div class="form-group">
          <label>配送方式</label>
          <select v-model="shippingMethod" required>
            <option disabled value="">請選擇</option>
            <option>宅配</option>
            <option>超商取貨</option>
          </select>
        </div>
  
        <div class="summary">
          <strong>訂單總金額：</strong>
          <span>{{ totalPrice.toLocaleString() }} 元</span>
        </div>
  
        <button type="submit" class="submit-btn">送出訂單</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from '@/plugins/axios'
  import { useUserStore } from '@/stores/user'
  
  const router = useRouter()
  const userStore = useUserStore()
  const token = userStore.token
  const userId = userStore.userId
  
  const recipientName = ref('')
  const recipientPhone = ref('')
  const address = ref('')
  const paymentMethod = ref('')
  const shippingMethod = ref('')
  const cartItems = ref([])
  
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
  })
  
  const fetchCart = async () => {
    try {
      const res = await axios.get(`/api/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      cartItems.value = res.data
    } catch (err) {
      alert('取得購物車失敗')
    }
  }
  
  const submitOrder = async () => {
    try {
      const res = await axios.post(
        `/api/orders/checkout/${userId}`,
        {
          recipientName: recipientName.value,
          recipientPhone: recipientPhone.value,
          address: address.value,
          paymentMethod: paymentMethod.value,
          shippingMethod: shippingMethod.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      alert('✅ 訂單已送出！訂單編號：' + res.data.orderId)
      router.push('/userOrders')
    } catch (err) {
      alert('❌ 結帳失敗：' + (err.response?.data?.message || err.message))
    }
  }
  
  onMounted(fetchCart)
  </script>
  
  <style scoped>
  .checkout-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    font-family: 'Microsoft JhengHei';
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
  }
  
  input,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
  }
  
  .summary {
    margin-top: 20px;
    font-size: 18px;
    text-align: right;
    color: #28a745;
    font-weight: bold;
  }
  
  .submit-btn {
    display: block;
    width: 100%;
    padding: 12px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    margin-top: 20px;
    cursor: pointer;
  }
  .submit-btn:hover {
    background-color: #218838;
  }
  </style>
  