<template>
    <div class="container">
        <h2>新增收件資訊</h2>
        <label>宅配地址：</label>
        <form @submit.prevent="createAddress">
            <AddressSelector v-model="user.addressInfo" />

            <div>收件人：
                <input v-model="user.recipientName" class="recipient full-width"
                    required />
            </div>

            <div>
  手機號碼：
  <input
    v-model="user.recipientPhone"
    class="recipient full-width"
    @input="validatePhone"
    required
  />
  <p v-if="phoneError" class="error">{{ phoneError }}</p>
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
import { jwtDecode } from 'jwt-decode'

// ✅ router 用於跳轉頁面
const router = useRouter();

// ✅ 假設你有從 JWT 解析出 userId，或直接寫死 userId = 1
const token = localStorage.getItem("token");
const decoded = jwtDecode(token);
const userId = decoded.userId;

// ✅ 組件綁定資料
const user = ref({
    addressInfo: {
        fullAddress: '',
        zipCode: ''
    },
    recipientName: '',
    recipientPhone: ''
});

const message = ref('');

const phoneError = ref("");

function validatePhone() {
  const phone = user.value.recipientPhone;
  const regex = /^09\d{8}$/; // 台灣手機格式
  phoneError.value = regex.test(phone)
    ? ""
    : "手機號碼需以09開頭，且共10位數字";
}



async function createAddress() {
    validatePhone();
  if (phoneError.value) {
    message.value = "❗手機格式錯誤，請修正後再提交";
    return;
  }
    try {
        const token = localStorage.getItem("token");
        // 從完整地址字串中：台北市 信義區 忠孝東路100號，後端再去 split 拆解
        await axios.post(`http://localhost:8081/api/user/address/${userId}/create-home`, {
            streetEtc: user.value.addressInfo.fullAddress,
            zipCode: user.value.addressInfo.zipCode,
            recipientName: user.value.recipientName,
            recipientPhone: user.value.recipientPhone
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

</style>