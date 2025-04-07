<template>
  <div>
    <button @click="selectStore">選擇超商門市</button>
    <div v-if="store">
      你選擇了：{{ store.name }}，地址：{{ store.address }}
    </div>
  </div>

  <div class="store-list">
    <label for="cvsType">選擇超商類型：</label>
    <select id="cvsType" v-model="cvsType">
      <option value="FAMI">全家 (FAMI)</option>
      <option value="UNIMART">7-11 (UNIMART)</option>
      <option value="HILIFE">萊爾富 (HILIFE)</option>
    </select>

    <button @click="getStoreList">取得門市清單</button>

    <div v-if="storeList">
      <h3>取得結果：</h3>
      <pre>{{ storeList }}</pre>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// 門市資料
const store = ref(null)
let pollInterval = null

// 門市清單查詢
const cvsType = ref('FAMI')
const storeList = ref('')

function selectStore() {
  window.open('http://localhost:8081/api/ecpay/cvs-map', '_blank')
  pollInterval = setInterval(fetchStoreInfo, 1000)
}

async function fetchStoreInfo() {
  try {
    const res = await axios.get('http://localhost:8081/api/ecpay/selected-store')
    if (res.data && res.data.CVSStoreName && res.data.CVSAddress) {
      store.value = {
        name: res.data.CVSStoreName,
        address: res.data.CVSAddress,
      }
      clearInterval(pollInterval)
    }
  } catch (err) {
    console.error('輪詢門市資料失敗:', err)
  }
}

async function getStoreList() {
  try {
    const response = await axios.post(
      'http://localhost:8081/api/ecpay/store-list',
      null,
      {
        params: {
          cvsType: cvsType.value,
        },
      }
    )
    storeList.value = response.data
  } catch (error) {
    console.error('取得門市清單失敗:', error)
    storeList.value = '取得失敗：' + error.message
  }
}

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

</script>

<style scoped>
button {
  padding: 8px 12px;
  border-radius: 6px;
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
