<template>
  <div class="container">
    <h2>新增超商取貨地址</h2>
    <form @submit.prevent="createCVSAddress">
      <!-- 門市選擇區塊 -->
      <div class="store-picker">
        <label for="cvsType">選擇超商類型：</label>
        <select id="cvsType" v-model="cvsType">
          <option value="FAMI">全家</option>
          <option value="UNIMART">7-11</option>
          <option value="HILIFE">萊爾富</option>
        </select>

        <button @click="getStoreList" type="button">取得門市清單</button>

        <div class="filters" v-if="storeList.length">
          <label>城市：<input v-model="cityFilter" placeholder="例如：高雄市" /></label>
          <label>區名：<input v-model="districtFilter" placeholder="例如：鼓山區" /></label>
          <label>路名/街名：<input v-model="streetFilter" placeholder="例如：美術館路" /></label>
        </div>

        <div v-if="filteredStores.length">
          <h3>門市選擇：</h3>
          <select v-model="selectedStoreId">
            <option v-for="store in filteredStores" :key="store.StoreId" :value="store.StoreId">
              {{ store.StoreName }} - {{ store.StoreAddr }}
            </option>
          </select>
        </div>

        <div v-if="selectedStore">
          <h4>你選擇了：</h4>
          <p>{{ selectedStore.StoreName }} - {{ selectedStore.StoreAddr }}</p>
        </div>
      </div>

      <!-- 收件人與手機 -->
      <div>
        收件人：<input v-model="form.recipientName" required />
      </div>

      <div>
        手機號碼：<input v-model="form.recipientPhone" @input="validatePhone" required />
        <p v-if="phoneError" class="error">{{ phoneError }}</p>
      </div>

      <button type="submit" :disabled="!selectedStore">儲存</button>
    </form>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import qs from 'qs'
import { parseStoreAddress } from '@/assets/parseStoreAddress.js'

const token = localStorage.getItem('token')
const userId = jwtDecode(token).userId

const form = ref({
  recipientName: '',
  recipientPhone: ''
})
const phoneError = ref('')
const message = ref('')

// 門市選擇區域邏輯
const cvsType = ref('FAMI')
const storeList = ref([])
const cityFilter = ref('')
const districtFilter = ref('')
const streetFilter = ref('')
const selectedStoreId = ref(null)
const selectedStore = computed(() => storeList.value.find(s => s.StoreId === selectedStoreId.value))

async function getStoreList() {
  try {
    const response = await axios.post(
      'http://localhost:8081/api/ecpay/store-list',
      qs.stringify({ cvsType: cvsType.value }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    const allStores = response.data.StoreList.flatMap(item => item.StoreInfo)
    storeList.value = allStores
    selectedStoreId.value = null
  } catch (error) {
    console.error('取得門市清單失敗:', error)
  }
}

const filteredStores = computed(() => {
  return storeList.value.filter(store => {
    const addr = store.StoreAddr || ''
    return (
      (!cityFilter.value || addr.includes(cityFilter.value)) &&
      (!districtFilter.value || addr.includes(districtFilter.value)) &&
      (!streetFilter.value || addr.includes(streetFilter.value))
    )
  })
})

function validatePhone() {
  const regex = /^09\d{8}$/
  phoneError.value = regex.test(form.value.recipientPhone) ? '' : '手機號碼需以09開頭且共10碼'
}

async function createCVSAddress() {
  if (!selectedStore.value) return
  validatePhone()
  if (phoneError.value) return

  const parsed = parseStoreAddress(selectedStore.value.StoreName, selectedStore.value.StoreAddr)
  const payload = {
    userId,
    addressTypeId: 2,
    isDefault: true,
    city: parsed.city,
    district: parsed.district,
    zipCode: parsed.zipCode,
    streetEtc: parsed.streetEtc,
    recipientName: form.value.recipientName,
    recipientPhone: form.value.recipientPhone
  }

  try {
    await axios.post('http://localhost:8081/api/user/address/cvs', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = '新增成功！'
  } catch (err) {
    console.error(err)
    message.value = '新增失敗，請稍後再試'
  }
}
</script>

<style scoped>
.container {
  max-width: 420px;
  margin: auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
input {
  width: 100%;
  padding: 6px;
  margin: 6px 0 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: #42b983;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.error {
  color: red;
  font-size: 13px;
}
.message {
  text-align: center;
  color: green;
  margin-top: 12px;
}
</style>
