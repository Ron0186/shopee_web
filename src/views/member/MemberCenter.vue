<template>
    <div
        class="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg container">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">會員中心</h2>

        <div v-if="loading" class="text-center text-gray-500">載入中...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <div v-else>
            <h4 class="text-2xl font-semibold text-gray-700 mb-4">Hi, {{
                user?.username || '' }}</h4>
            <div class="mb-4 flex items-center">
                <label class="font-semibold">編輯個人資訊</label>
                <div class="icon-group">
                    <img src="@/assets/angle-small-right.png"
                        class="icon ml-auto" @click="goToPage('/profile')" />
                </div>
            </div>

            <div class="mb-4 flex items-center">
                <label class="font-semibold">變更密碼</label>
                <div class="icon-group">
                    <img src="@/assets/angle-small-right.png"
                        class="icon ml-auto"
                        @click="goToPage('/changePassword')" />
                </div>
            </div>

            <div class="mb-4 flex items-center">
                <label class="font-semibold">配送資訊</label>
                <div class="icon-group">
                    <img src="@/assets/angle-small-right.png"
                        class="icon ml-auto" @click="goToPage('/address')" />
                </div>
            </div>

            <div class="mb-4 flex items-center">
                <label class="font-semibold">購買清單</label>
                <div class="icon-group">
                    <img src="@/assets/angle-small-right.png"
                        class="icon ml-auto"
                        @click="goToPage('/user/orders')" />
                </div>
            </div>

            <div class="mb-4 flex items-center">
                <label class="font-semibold">我的優惠券</label>
                <div class="icon-group">
                    <img src="@/assets/angle-small-right.png"
                        class="icon ml-auto"
                        @click="goToPage('/MemberCoupons')" />
                </div>
            </div>

            <!-- <div class="mb-4 flex items-center">
                <label class="font-semibold">我的錢包</label>
                <img src="@/assets/angle-small-right.png" class="icon ml-auto"
                    @click="goToPage('/profile/wallet')" />
            </div> -->

            <button @click="logout"
                class="w-full bg-red-500 text-black py-2 rounded mt-4 hover:bg-red-600">
                登出
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';  // ✅ 確保已安裝 jwt-decode

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const router = useRouter();
const userStore = useUserStore()

const fetchUserData = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("未登入");
        }

        // ✅ 解析 JWT 取得 userId
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        if (!userId) {
            throw new Error("無法取得用戶 ID");
        }

        // ✅ 改用 userId 取得使用者資訊
        //http://localhost:8081設置?
        const response = await axios.get(`http://localhost:8081/api/user/check/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });


        user.value = response.data;

    } catch (err) {
        error.value = "無法加載用戶資料，請稍後再試。";
        Swal.fire({
            title: "未登入",
            text: "請先登入以查看會員資料",
            icon: "warning",
        }).then(() => {
            router.push('/user/login'); // 導向登入頁面
        });
    } finally {
        loading.value = false;
    }
};

async function logout() {
    try {
        // 清除 localStorage & sessionStorage
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        sessionStorage.clear()

        // 清除 Pinia 或 Vuex 的用戶資料
        userStore.clearUserData()

        // 使用 SweetAlert 提示登出成功
        const response = await Swal.fire({
            title: '您已成功登出',
            icon: 'success',
            confirmButtonText: 'OK',
        })

        // 跳轉回首頁或登入頁面
        if (response.isConfirmed) {
            router.push('/shop')
        }
    } catch (error) {
        console.error('登出失敗', error)
        Swal.fire({
            title: '登出失敗，請稍後再試！',
            icon: 'error',
        })
    }
}

const goToPage = (path) => {
    router.push(path);
};

onMounted(() => {
    fetchUserData();
});
</script>

<style scoped>
body {
    background-color: #f4f4f4;
}

.icon-group {
    display: flex;
    justify-content: flex-end;
    /* 讓圖示靠右 */
    gap: 10px;
}

.icon {
    width: 20px;
    height: 20px;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;

}

.icon:hover {
    opacity: 0.7;
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
    background-color: #3e8e41
}

button:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}
</style>
