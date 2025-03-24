<template>
    <div class="container">
        <h2>變更收件資訊</h2>
        <form @submit.prevent="updateAddress">
            <AddressSelector v-model="user.address" />
            <div>收件人：
                <input v-model="user.recipientName" class="recipient full-width"
                    required />
            </div>
            <div>電話：
                <input v-model="user.recipientPhone"
                    class="recipient full-width" required />
            </div>
            <button type="submit">更新</button>
            <button type="button" @click="cancel">取消</button>
        </form>
        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import AddressSelector from '@/components/address/AddressSelector.vue';

const user = ref({
    address: '',
    recipientName: '',
    recipientPhone: ''
});
const message = ref('');
const route = useRoute();
const router = useRouter(); // ✅ 加入 router
const addressId = ref(route.params.addressId);

onMounted(() => {
    fetchUserData();
});

async function fetchUserData() {
    try {
        const res = await axios.get(`/api/addresses/${addressId.value}`);
        const data = res.data;
        user.value.address = data.address || `${data.city} ${data.district} ${data.streetEtc}`;
        user.value.recipientName = data.recipientName;
        user.value.recipientPhone = data.recipientPhone;
    } catch (err) {
        console.error('獲取資料失敗', err);
    }
}

async function updateAddress() {
    try {
        await axios.put(`http://localhost:8081/api/user/address/${addressId.value}`, {
            streetEtc: user.value.address,
            recipientName: user.value.recipientName,
            recipientPhone: user.value.recipientPhone
        });

        message.value = '地址更新成功！';

        // ✅ 1 秒後跳轉至 /address 頁面
        setTimeout(() => {
            router.push('/address');
        }, 1000);

    } catch (err) {
        console.error('更新失敗', err);
        message.value = '更新失敗，請稍後再試！';
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

h2 {
    text-align: center;
}

.message {
    text-align: center;
    color: green;
    margin-top: 10px;
}

.recipient {
    flex-grow: 1;
}

.full-width {
    display: block;
    width: 100%;
    margin-top: 5px;
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
</style>