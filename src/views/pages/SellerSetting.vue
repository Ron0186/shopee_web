<template>
    <div class="container">
      <h2 class="text-xl font-bold mb-4">賣家設定</h2>
  
      <form @submit.prevent="saveSettings" class="grid gap-4 max-w-xl">
        <input v-model="shop.shopName" type="text" placeholder="商店名稱" required />
        <input v-model="shop.shopCategory" type="text" placeholder="商店類別" />
        <textarea v-model="shop.description" placeholder="商店簡介"></textarea>
  
        <h3 class="font-semibold mt-4">退貨地址</h3>
        <input v-model="shop.returnCity" type="text" placeholder="城市" />
        <input v-model="shop.returnDistrict" type="text" placeholder="區域" />
        <input v-model="shop.returnZipCode" type="text" placeholder="郵遞區號" />
        <input v-model="shop.returnStreetEtc" type="text" placeholder="街道地址" />
        <input v-model="shop.returnRecipientName" type="text" placeholder="收件人姓名" />
        <input v-model="shop.returnRecipientPhone" type="text" placeholder="收件人電話" />
  
        <button type="submit" class="bg-green-500 text-white p-2 rounded">儲存設定</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from '@/plugins/axios'
  
  const shop = ref({})
  
  const fetchShop = async () => {
    const res = await axios.get('/api/shop/my')
    shop.value = res.data
  }
  
  const saveSettings = async () => {
    await axios.put('/api/shop/my', shop.value)
    alert('商店設定已儲存')
  }
  
  onMounted(fetchShop)
  </script>
  