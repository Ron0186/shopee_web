<template>
    <div class="container">
        <h2>變更密碼</h2>
        <form @submit.prevent="handleChangePassword">
            <div>
                <label>舊密碼：</label>
                <input type="password" placeholder="請輸入舊密碼"
                    v-model="currentPassword" required />
            </div>
            <div>
                <label>新密碼：</label>
                <input type="password" placeholder="請輸入新密碼"
                    v-model="newPassword" required />
                <p v-if="passwordError" class="error">{{ passwordError }}</p>
            </div>
            <div>
                <label>確認新密碼：</label>
                <input type="password" placeholder="再次輸入新密碼"
                    v-model="confirmPassword" required />
            </div>
            <button type="submit">確認變更</button>
            <button type="button" @click="cancel">取消</button>
            <p v-if="message" class="message">{{ message }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const passwordError = ref('');
const token = localStorage.getItem('token');
const userId = jwtDecode(token).userId;
const router = useRouter();
const userStore = useUserStore()

// ✅ 密碼格式驗證（即時觸發）
watch(newPassword, (val) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    passwordError.value = pattern.test(val)
        ? ''
        : '密碼需至少8碼，包含大小寫英文與數字';
});

async function handleChangePassword() {
    message.value = '';

    if (passwordError.value) {
        message.value = '❗密碼格式不符合要求';
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        message.value = '❗新密碼與確認密碼不一致';
        return;
    }

    try {
        await axios.put(
            `http://localhost:8081/api/user/${userId}/change-password`,
            {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        message.value = '✅ 密碼變更成功，將自動登出...';

        // 清除 localStorage & sessionStorage
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        sessionStorage.clear()

        // 清除 Pinia 或 Vuex 的用戶資料
        userStore.clearUserData()

        setTimeout(() => {
            router.push('/user/login');
        }, 3000);

    } catch (error) {
        console.error('密碼變更失敗：', error);
        message.value = error.response?.data || '變更失敗，請稍後再試';
    }
}
function cancel() {
    router.push('/memberCenter');
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

label {
    font-weight: bold;
}

input {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
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
}

button:hover {
    background-color: #3e8e41
}

button:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}

.message {
    margin-top: 10px;
    color: red;
    text-align: center;
}

.error {
    color: red;
    font-size: 14px;
    margin-top: 5px;
}
</style>