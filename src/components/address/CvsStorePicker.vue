<template>
  <div>
    <button @click="openOption = true">選擇超商門市</button>

    <!-- 選擇方式 Modal -->
    <div v-if="openOption" class="modal-overlay">
      <div class="modal">
        <h3>請選擇方式</h3>
        <button @click="selectMethod('ecpay')">使用綠界地圖</button>
        <button @click="selectMethod('manual')">使用內建門市清單</button>
        <button @click="openOption = false">取消</button>
      </div>
    </div>

    <!-- 內建 modal -->
    <div v-if="showManual" class="modal-overlay">
      <div class="modal">
        <h3>選擇門市（內建資料）</h3>
        <div class="type-selector">
          <button :class="{ active: selectedType === '7-11' }" @click="selectedType = '7-11'">7-11</button>
          <button :class="{ active: selectedType === 'FamilyMart' }" @click="selectedType = 'FamilyMart'">全家</button>
        </div>

        <ul class="store-list">
          <li v-for="store in dummyStores[selectedType]" :key="store.name"
              :class="{ selected: selectedStore?.name === store.name }"
              @click="selectedStore = store">
            <p><strong>{{ store.name }}</strong></p>
            <p>{{ store.address }}</p>
          </li>
        </ul>

        <div class="actions">
          <button @click="confirmManual" :disabled="!selectedStore">確認</button>
          <button @click="showManual = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 顯示選擇結果 -->
    <div v-if="store">
      ✅ 你選擇了：{{ store.name }}，地址：{{ store.address }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const store = ref(null)
const openOption = ref(false)
const showManual = ref(false)
const selectedType = ref('7-11')
const selectedStore = ref(null)
let pollInterval = null

const dummyStores = {
  '7-11': [
    { name: '7-11 松江門市', address: '台北市中山區松江路123號' },
    { name: '7-11 忠孝店', address: '台北市大安區忠孝東路四段222號' }
  ],
  'FamilyMart': [
    { name: '全家 信義店', address: '台北市信義區光復南路300號' },
    { name: '全家 古亭門市', address: '台北市中正區羅斯福路二段88號' }
  ]
}

function selectMethod(method) {
  openOption.value = false
  if (method === 'ecpay') {
    openEcpayMap()
  } else {
    showManual.value = true
  }
}

function confirmManual() {
  if (selectedStore.value) {
    store.value = { ...selectedStore.value }
    showManual.value = false
  }
}

function openEcpayMap() {
  window.open(`http://localhost:8081/api/ecpay/cvs-map?ts=${Date.now()}`, '_blank')
  pollInterval = setInterval(fetchEcpayResult, 1000)
}

async function fetchEcpayResult() {
  try {
    const res = await axios.get('http://localhost:8081/api/ecpay/selected-store')
    if (res.data && res.data.CVSStoreName && res.data.CVSAddress) {
      store.value = {
        name: res.data.CVSStoreName,
        address: res.data.CVSAddress
      }
      clearInterval(pollInterval)
    }
  } catch (e) {
    console.error('取得綠界選擇資料失敗', e)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.type-selector button {
  padding: 5px 10px;
  border: none;
  background: #eee;
  border-radius: 4px;
  cursor: pointer;
}
.type-selector .active {
  background: #04AA6D;
  color: white;
}
.store-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.store-list li {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.store-list li.selected {
  background-color: #e7f9f0;
  border-color: #04AA6D;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
</style>
