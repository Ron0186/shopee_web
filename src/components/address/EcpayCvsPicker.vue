<template>
  <div>
    <button @click="selectStore">選擇超商門市</button>
    <div v-if="store">
      你選擇了：{{ store.name }}，地址：{{ store.address }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const store = ref(null)
let pollInterval = null

function selectStore() {
  window.open('http://localhost:8081/api/ecpay/cvs-map', '_blank')

  // 啟動輪詢，每秒去問後端一次門市資料（可視需求調整）
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
