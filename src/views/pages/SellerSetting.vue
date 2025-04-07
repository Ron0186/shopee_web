<template>
  <div class="container my-5">
    <h2 class="mb-4 fw-bold border-bottom pb-2">賣家設定</h2>

    <form @submit.prevent="saveSettings">
      <!-- 商店基本資訊 -->
      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">商店名稱</label>
          <input v-model="shop.shopName" type="text" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">商店類別</label>
          <input v-model="shop.shopCategory" type="text" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label">商店簡介</label>
          <textarea v-model="shop.description" class="form-control" rows="3" />
        </div>
      </div>

      <!-- 退貨地址 -->
      <h5 class="fw-bold mt-4 mb-3">退貨地址</h5>
      <div class="row mb-3">
        <div class="col-md-4 mb-3">
          <label class="form-label">城市</label>
          <select v-model="shop.returnCity" @change="onCityChange" class="form-select">
            <option disabled value="">請選擇城市</option>
            <option v-for="(districts, city) in taiwanCities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <div class="col-md-4 mb-3">
          <label class="form-label">區域</label>
          <select v-model="shop.returnDistrict" @change="onDistrictChange" class="form-select">
            <option disabled value="">請選擇區域</option>
            <option v-for="(zip, district) in districtsForSelectedCity" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
        </div>

        <div class="col-md-4 mb-3">
          <label class="form-label">郵遞區號</label>
          <input v-model="shop.returnZipCode" type="text" class="form-control" readonly />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">街道地址</label>
          <input v-model="shop.returnStreetEtc" type="text" class="form-control" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">收件人姓名</label>
          <input v-model="shop.returnRecipientName" type="text" class="form-control" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">收件人電話</label>
          <input v-model="shop.returnRecipientPhone" type="text" class="form-control" />
        </div>
      </div>

      <button type="submit" class="btn btn-success px-4">儲存設定</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/plugins/axios'
import { taiwanCities } from '@/utils/taiwanAddressData'

const shop = ref({
  shopName: '',
  shopCategory: '',
  description: '',
  returnCity: '',
  returnDistrict: '',
  returnZipCode: '',
  returnStreetEtc: '',
  returnRecipientName: '',
  returnRecipientPhone: ''
})

const districtsForSelectedCity = computed(() => {
  return taiwanCities[shop.value.returnCity] || {}
})

const onCityChange = () => {
  shop.value.returnDistrict = ''
  shop.value.returnZipCode = ''
}

const onDistrictChange = () => {
  const zip = taiwanCities[shop.value.returnCity]?.[shop.value.returnDistrict]
  shop.value.returnZipCode = zip || ''
}

const fetchShop = async () => {
  try {
    const res = await axios.get('/api/shop/my')
    if (res?.data) {
      shop.value = { ...shop.value, ...res.data }
    }
  } catch (error) {
    console.error('取得商店資訊失敗:', error)
    alert('取得商店資訊失敗')
  }
}

const saveSettings = async () => {
  try {
    await axios.put('/api/shop/my', shop.value)
    alert('商店設定已儲存')
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗')
  }
}

onMounted(fetchShop)
</script>
