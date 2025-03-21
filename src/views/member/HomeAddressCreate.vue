<template>
    <div class="container">
        <h2>新增收件資訊</h2>
        <form @submit.prevent="createAddress">
            <AddressSelector v-model:addressInfo="user.addressInfo" />

            <div>收件人：
                <input v-model="user.recipientName" class="recipient full-width"
                    required />
            </div>

            <div>電話：
                <input v-model="user.recipientPhone"
                    class="recipient full-width" required />
            </div>

            <button type="submit">新增</button>
            <button type="button" @click="cancel">取消</button>
        </form>

        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AddressSelector from '@/components/address/AddressSelector.vue';

// ✅ router 用於跳轉頁面
const router = useRouter();

// ✅ 假設你有從 JWT 解析出 userId，或直接寫死 userId = 1
const userId = 1;

// ✅ 組件綁定資料
const user = ref({
    address: '',
    recipientName: '',
    recipientPhone: ''
});

const message = ref('');

async function createAddress() {
    try {
        // 從完整地址字串中：台北市 信義區 忠孝東路100號，後端再去 split 拆解
        await axios.post(`http://localhost:8081/api/user/address/${userId}`, {
            streetEtc: user.value.address,
            recipientName: user.value.recipientName,
            recipientPhone: user.value.recipientPhone
        });

        message.value = "成功新增地址！";

        setTimeout(() => {
            router.push('/address');
        }, 1000);
    } catch (error) {
        console.error("新增地址失敗", error);
        message.value = "失敗，請稍後再試！";
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

form div {
    margin-bottom: 10px;
}

select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
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
    text-align: center;
    color: green;
    margin-top: 10px;
}

.dropdown {
    display: flex;
    gap: 5px;
}

.recipient {
    flex-grow: 1;
}

.full-width {
    display: block;
    width: 100%;
    margin-top: 5px;
}
</style>