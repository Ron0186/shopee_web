<template>
    <div class="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg container">
      <h1 class="text-4xl font-bold text-gray-700 mb-4">會員中心</h1>
  
      <div v-if="loading" class="text-center text-gray-500">載入中...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else>
        <h4 class="text-2xl font-semibold text-gray-700 mb-2">Hi, {{ user?.userName }}</h4>
  
        <!-- 功能選單卡片 -->
        <div
          class="mb-4 p-4 bg-gray-50 rounded shadow flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
          @click="goToPage('/profile')"
        >
          <span class="font-semibold text-gray-700">編輯個人資訊</span>
          <img src="@/assets/angle-small-right.png" class="icon" />
        </div>
  
        <div
          class="mb-4 p-4 bg-gray-50 rounded shadow flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
          @click="goToPage('/changePassword')"
        >
          <span class="font-semibold text-gray-700">變更密碼</span>
          <img src="@/assets/angle-small-right.png" class="icon" />
        </div>
  
        <div
          class="mb-4 p-4 bg-gray-50 rounded shadow flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
          @click="goToPage('/address')"
        >
          <span class="font-semibold text-gray-700">配送資訊</span>
          <img src="@/assets/angle-small-right.png" class="icon" />
        </div>
  
        <div
          class="mb-4 p-4 bg-gray-50 rounded shadow flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
          @click="goToPage('/user/orders')"
        >
          <span class="font-semibold text-gray-700">購買清單</span>
          <img src="@/assets/angle-small-right.png" class="icon" />
        </div>
  
        <div
          class="mb-4 p-4 bg-gray-50 rounded shadow flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
          @click="goToPage('/MemberCoupons')"
        >
          <span class="font-semibold text-gray-700">我的優惠券</span>
          <img src="@/assets/angle-small-right.png" class="icon" />
        </div>
  
        <!-- 註冊時間 -->
        <p class="text-sm text-gray-500 mb-4">註冊時間：{{ formatDate(user.createdAt) }}</p>
  
        <!-- 登出按鈕 -->
        <button @click="logout" class="w-full bg-red-500 text-black py-2 rounded mt-6 hover:bg-red-600">
          登出
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { jwtDecode } from 'jwt-decode';
  import dayjs from 'dayjs';
  import { useUserStore } from '@/stores/user';
  
  const router = useRouter();
  const userStore = useUserStore();
  const loading = ref(true);
  const error = ref<string | null>(null);
  
  interface UserAddress {
    userAddressId: number;
    city: string;
    district: string;
    streetEtc: string;
    zipCode: string;
    recipientName: string;
    recipientPhone: string;
    addressType: string | null;
  }
  
  interface UserProfile {
    userId: number;
    userName: string;
    email: string;
    phone: string;
    createdAt: string;
    userAddresses: UserAddress[];
  }
  
  const user = ref<UserProfile | null>(null);
  
  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY 年 M 月 D 日');
  };
  
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('未登入');
  
      const decoded = jwtDecode<{ userId: number }>(token);
      const userId = decoded.userId;
  
      const response = await axios.get(`http://localhost:8081/api/user/membercenter/id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      user.value = response.data;
    } catch (err: any) {
      error.value = err?.response?.data?.message || '無法加載用戶資料';
      Swal.fire({
        title: '未登入',
        text: '請先登入以查看會員資料',
        icon: 'warning',
      }).then(() => {
        router.push('/user/login');
      });
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    try {
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      sessionStorage.clear();
      userStore.clearUserData();
  
      const res = await Swal.fire({
        title: '您已成功登出',
        icon: 'success',
        confirmButtonText: 'OK',
      });
  
      if (res.isConfirmed) {
        router.push('/shop');
      }
    } catch (error) {
      Swal.fire({
        title: '登出失敗，請稍後再試！',
        icon: 'error',
      });
    }
  };
  
  const goToPage = (path: string) => {
    router.push(path);
  };
  
  onMounted(fetchUserData);
  </script>
  
  <style scoped>
  body {
    background-color: #f4f4f4;
  }
  
  .icon {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease-in-out;
  }
  
  .icon:hover {
    opacity: 0.7;
    transform: translateX(3px);
  }
  
  button {
    display: inline-block;
    padding: 15px 25px;
    font-size: 24px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #fff;
    background-color: #04AA6D;
    border: none;
    border-radius: 15px;
    box-shadow: 0 9px #999;
    margin-bottom: 25px;
  }
  
  button:hover {
    background-color: #3e8e41;
  }
  
  button:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
  }
  
  .font-semibold {
    font-size: 1.5rem;
  }
  </style>
  