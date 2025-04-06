<template>
    <div class="container">
      <h2>選擇超商門市</h2>
      <form @submit.prevent="createCVSAddress">
        <!-- 門市選擇按鈕 -->
        <button type="button" class="select-btn" @click="showPicker = true">
          點我選擇門市
        </button>
  
        <!-- 顯示選中的門市資料 -->
        <div v-if="selectedStore" class="selected-info">
          <p>🏪 店名：{{ selectedStore.name }}</p>
          <p>📍 地址：{{ selectedStore.address }}</p>
        </div>
  
        <!-- 門市選擇器 Modal -->
        <CvsStorePicker v-model:show="showPicker" @selected="handleStoreSelected" />
  
        <button type="submit">儲存地址</button>
        <button type="button" @click="cancel">取消</button>
      </form>
  
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { jwtDecode } from 'jwt-decode';
  import CvsStorePicker from '@/components/address/CvsStorePicker.vue';
  
  const router = useRouter();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;
  
  const showPicker = ref(false);
  const selectedStore = ref(null);
  const message = ref('');
  
  const handleStoreSelected = (store) => {
    selectedStore.value = store;
    showPicker.value = false;
    console.log('✅ 選到門市：', store.name, store.address);
  };
  
  async function createCVSAddress() {
    if (!selectedStore.value) {
      message.value = '請先選擇門市';
      return;
    }
  
    try {
      await axios.post(`http://localhost:8081/api/user/address/${userId}/create-cvs`, {
        storeName: selectedStore.value.name,
        address: selectedStore.value.address,
        type: selectedStore.value.type,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      message.value = '門市地址新增成功！';
      setTimeout(() => {
        router.push('/address');
      }, 1000);
    } catch (error) {
      console.error('新增地址失敗', error);
      message.value = '新增失敗，請稍後再試';
    }
  }
  
  function cancel() {
    router.push('/address');
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .select-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 10px;
  }
  
  .selected-info {
    margin-bottom: 15px;
    font-size: 14px;
    color: #333;
  }
  
  button {
    display: inline-block;
    padding: 12px 20px;
    font-size: 18px;
    cursor: pointer;
    color: #fff;
    background-color: #04AA6D;
    border: none;
    border-radius: 8px;
    margin-right: 10px;
  }
  
  .message {
    margin-top: 10px;
    text-align: center;
    color: green;
  }
  </style>
  