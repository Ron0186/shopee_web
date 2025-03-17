<template>
    <div class="container">
        <h2>編輯個人資料</h2>
        <!-- TODO  自動帶入會員資料 -->
        <form @submit.prevent="updateProfile">
            <div>
                <label>使用者名稱：</label>
                <input type="text" v-model="user.userName" required />
            </div>

            <div>
                <label>電子郵件：</label>
                <input type="email" v-model="user.email" required />
            </div>

            <div>
                <label>手機號碼：</label>

                <input type="text" v-model="user.phone" @input="validatePhone"
                    @keypress="onlyNumber" required />
                <p v-if="phoneError" class="error">{{ phoneError }}</p>
            </div>

            <!-- 地址選擇元件 -->
            <!-- <AddressSelector :onStoreSelected="handleStoreSelected" /> -->

            <button type="submit">更新</button>
        </form>
        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script>
import axios from "axios";
import AddressSelector from "@/components/address/AddressSelector.vue";

export default {
    components: {
        AddressSelector,
    },
    data() {
        return {
            userId: 1,
            user: {
                userName: "",
                email: "",
                phone: "",
                address: "",
            },
            message: "",
        };
    },
    mounted() {
        this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
            try {
                const response = await axios.get(`/api/users/${this.userId}`);
                this.user = response.data;
            } catch (error) {
                console.error("獲取用戶數據失敗", error);
            }
        },
        async updateProfile() {
            try {
                await axios.put(`/api/users/${this.userId}`, this.user);
                this.message = "個人資料更新成功！";
            } catch (error) {
                console.error("更新失敗", error);
                this.message = "更新失敗，請稍後再試！";
            }
        },
        validatePhone() {
            const regex = /^09\d{8}$/;
            if (!regex.test(this.user.phone)) {
                this.phoneError = "";
            } else {
                this.phoneError = "";
            }
        },
        onlyNumber(event) {
            if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
            }
        },
        handleStoreSelected(store) {
            this.user.address = `${store.StoreName} (${store.StoreAddress})`;
        },
    }
};
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

input,
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

.street {
    flex-grow: 1;
}

.full-width {
    display: block;
    width: 100%;
    /* 讓 input 佔滿整行 */
    margin-top: 5px;
    /* 可選，讓它和上面的選單稍微分開 */
}
</style>
