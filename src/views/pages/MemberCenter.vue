<template>
    <div class="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">會員中心</h2>

        <div v-if="loading" class="text-center text-gray-500">載入中...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <div v-else>
            <div class="mb-4">
                <label class="font-semibold">用戶名稱：</label>
                <span class="text-gray-700">{{ user.userName }}</span>
            </div>
            <div class="mb-4">
                <label class="font-semibold">電子郵件：</label>
                <span class="text-gray-700">{{ user.email }}</span>
            </div>
            <div class="mb-4">
                <label class="font-semibold">電話號碼：</label>
                <span class="text-gray-700">{{ user.phone }}</span>
            </div>
            <div class="mb-4">
                <label class="font-semibold">註冊時間：</label>
                <span class="text-gray-700">{{ formattedDate(user.createdAt)
                    }}</span>
            </div>

            <button @click="logout"
                class="w-full bg-red-500 text-white py-2 rounded mt-4 hover:bg-red-600">登出</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

const fetchUserData = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("未登入");

        const response = await axios.get('http://localhost:8081/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        user.value = response.data;
    } catch (err) {
        error.value = "無法加載用戶資料，請稍後再試。";
    } finally {
        loading.value = false;
    }
};

const formattedDate = (dateString) => {
    return new Date(dateString).toLocaleString();
};

const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
};

onMounted(fetchUserData);
</script>

<style>
body {
    background-color: #f4f4f4;
}
</style>