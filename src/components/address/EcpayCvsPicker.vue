<template>
  <div class="store-picker">
    <label for="cvsType">選擇超商類型：</label>
    <select id="cvsType" v-model="cvsType">
      <option value="FAMI">全家</option>
      <option value="UNIMART">7-11</option>
      <option value="HILIFE">萊爾富</option>
    </select>

    <button @click="getStoreList">取得門市清單</button>

    <div class="filters" v-if="storeList.length">
      <label>
        城市：<input v-model="cityFilter" placeholder="例如：高雄市" />
      </label>
      <label>
        區名：<input v-model="districtFilter" placeholder="例如：鼓山區" />
      </label>
      <label>
        路名/街名：<input v-model="streetFilter" placeholder="例如：美術館路" />
      </label>
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
      <button @click="confirmStore">確認門市</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import qs from 'qs'
import { parseStoreAddress } from '@/assets/parseStoreAddress.js'

const emit = defineEmits(['selected'])

const cvsType = ref('FAMI')
const storeList = ref([])

const cityFilter = ref('')
const districtFilter = ref('')
const streetFilter = ref('')

const selectedStoreId = ref(null)
const selectedStore = computed(() =>
  storeList.value.find(store => store.StoreId === selectedStoreId.value)
)

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

function confirmStore() {
  if (!selectedStore.value) return
  const parsed = parseStoreAddress(selectedStore.value.StoreName, selectedStore.value.StoreAddr)
  emit('selected', {
    name: selectedStore.value.StoreName,
    address: selectedStore.value.StoreAddr,
    ...parsed,
    type: cvsType.value,
  })
}
</script>

<style scoped>
.store-picker {
  padding: 16px;
}
label {
  display: block;
  margin: 10px 0;
}
input {
  padding: 6px;
  margin-left: 6px;
  width: 200px;
}
select {
  padding: 6px;
  width: 100%;
}
button {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
</style>