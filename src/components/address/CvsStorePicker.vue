<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <h3>選擇超商門市</h3>
  
        <!-- 超商類型選擇 -->
        <div class="type-selector">
          <button :class="{ active: selectedType === '7-11' }" @click="selectedType = '7-11'">7-11</button>
          <button :class="{ active: selectedType === 'FamilyMart' }" @click="selectedType = 'FamilyMart'">全家</button>
        </div>
  
        <!-- 門市清單 -->
        <ul class="store-list">
          <li
            v-for="store in dummyStores[selectedType]"
            :key="store.name"
            :class="{ selected: selectedStore?.name === store.name }"
            @click="selectStore(store)"
          >
            <p><strong>{{ store.name }}</strong></p>
            <p>{{ store.address }}</p>
          </li>
        </ul>
  
        <!-- 操作按鈕 -->
        <div class="actions">
          <button @click="confirm" :disabled="!selectedStore">確認</button>
          <button @click="close">取消</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    show: Boolean,
  });
  const emit = defineEmits(['update:show', 'selected']);
  
  const selectedType = ref('7-11');
  const selectedStore = ref(null);
  
  const dummyStores = {
    '7-11': [
      { name: '7-11 松江門市', address: '台北市中山區松江路123號' },
      { name: '7-11 忠孝店', address: '台北市大安區忠孝東路四段222號' },
    ],
    'FamilyMart': [
      { name: '全家 信義店', address: '台北市信義區光復南路300號' },
      { name: '全家 古亭門市', address: '台北市中正區羅斯福路二段88號' },
    ]
  };
  
  function selectStore(store) {
    selectedStore.value = store;
  }
  
  function close() {
    emit('update:show', false);
  }
  
  function confirm() {
    if (selectedStore.value) {
      emit('selected', {
        name: selectedStore.value.name,
        address: selectedStore.value.address,
        type: selectedType.value,
      });
      close();
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
  