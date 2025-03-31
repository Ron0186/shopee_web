<template>
    <div class="container">
        <h2>編輯個人資料</h2>

        <form @submit.prevent="updateProfile">
            <div>
                <label>使用者名稱：</label>
                <input type="text" v-model="user.username"
                    :placeholder="userPlaceholder.username" required />
            </div>

            <div>
                <label>電子郵件：</label>
                <input type="email" v-model="user.email"
                    :placeholder="userPlaceholder.email" required />
            </div>

            <div>
                <label>手機號碼：</label>
                <input type="text" v-model="user.phone"
                    :placeholder="userPlaceholder.phone" @input="validatePhone"
                    @keypress="onlyNumber" required />
                <p v-if="phoneError" class="error">{{ phoneError }}</p>
            </div>

            <button type="submit">更新</button>
            <button type="button" @click="cancel">取消</button>
        </form>

        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default {
    data() {
        return {
            userId: null,
            user: {
                username: "",
                email: "",
                phone: "",
            },
            userPlaceholder: {
                username: "載入中...",
                email: "載入中...",
                phone: "載入中...",
            },

            message: "",
            phoneError: "",
            router: useRouter()
        };
    },
    mounted() {
        this.loadUserId();
        if (this.userId) {
            this.fetchUserData();
        } else {
            this.router.push('/user/login'); // 未登入則跳轉登入頁
        }
    },
    methods: {
        loadUserId() {
            const token = localStorage.getItem("token");
            console.log("獲取的 Token:", token);  // ✅ 確認 Token 是否存在

            if (!token) {
                console.warn("未找到 Token，跳轉至登入頁");
                this.router.push('/user/login');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                this.userId = decodedToken.userId;
                console.log("解析的 JWT User ID:", this.userId);  // ✅ 確認 userId 是否正確解析
            } catch (error) {
                console.error("無法解析 JWT:", error);
                this.router.push('/user/login');
            }
        },
        async fetchUserData() {
            try {
                const token = localStorage.getItem("token");
                console.log("使用 Token 取得用戶資訊，User ID:", this.userId);  // ✅ 確保請求時 userId 正確

                const response = await axios.get(`http://localhost:8081/api/user/check/${this.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.user = response.data;
                this.userPlaceholder = { ...this.user }; // 設定 placeholder
                console.log("獲取的用戶資料:", this.user);  // ✅ 檢查 API 回傳的用戶資料

            } catch (error) {
                console.error("獲取用戶數據失敗:", error);
                this.router.push('/user/login');
            }
        },
        async updateProfile() {
            try {
                const token = localStorage.getItem("token");
                console.log("更新 User ID:", this.userId);  // ✅ 確認 userId 在更新時是否存在

                const updatedUser = { ...this.user };
                // delete updatedUser.password; // **不變更密碼**

                await axios.put(`http://localhost:8081/api/user/update/${this.userId}`, updatedUser, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.message = "個人資料更新成功！";
                console.log("更新成功:", updatedUser);  // ✅ 確認更新的內容
                setTimeout(() => {
                    this.router.push('/memberCenter');
                }, 1000);
            } catch (error) {
                console.error("更新失敗:", error);
                this.message = "更新失敗，請稍後再試！";
            }
        },
        validatePhone() {
            const regex = /^09\d{8}$/;
            this.phoneError = regex.test(this.user.phone) ? "" : "手機號碼需以09開頭，並為10位數";
        },
        onlyNumber(event) {
            if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
            }
        },
        cancel() {
            this.router.push('/memberCenter'); // 返回會員中心
        }
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
    background-color: #3e8e41;
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

.error {
    color: red;
    font-size: 12px;
    margin-top: 5px;
}
</style>
