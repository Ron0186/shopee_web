<template>
    <div class="container">
        <h2>編輯個人資料</h2>

        <form @submit.prevent="updateProfile">
            <div>
                <label>使用者名稱：</label>
                <input type="text" v-model="user.userName"
                    :placeholder="userPlaceholder.userName" required />
            </div>

            <div>
  <label>電子郵件：</label>
  <input type="email" v-model="user.email" :placeholder="userPlaceholder.email" required />
  <p v-if="emailError" class="error">{{ emailError }}</p>
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
                userName: "",
                email: "",
                phone: "",
            },
            userPlaceholder: {
                userName: "載入中...",
                email: "載入中...",
                phone: "載入中...",
            },
            message: "",
            phoneError: "",
            emailError: "",
            router: useRouter()
        };
    },
    computed: {
        isValidEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(this.user.email);
        }
    },
    mounted() {
        this.loadUserId();
        if (this.userId) {
            this.fetchUserData();
        } else {
            this.router.push('/user/login');
        }
    },
    methods: {
        loadUserId() {
            const token = localStorage.getItem("token");
            if (!token) {
                this.router.push('/user/login');
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                this.userId = decodedToken.userId;
            } catch (error) {
                this.router.push('/user/login');
            }
        },
        async fetchUserData() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8081/api/user/membercenter/id/${this.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.user = response.data;
                this.userPlaceholder = { ...this.user };
            } catch (error) {
                this.router.push('/user/login');
            }
        },
        async updateProfile() {
            if (!this.isValidEmail) {
                this.emailError = "請輸入有效的電子郵件格式";
                return;
            } else {
                this.emailError = "";
            }

            if (this.phoneError) {
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const updatedUser = { ...this.user };

                await axios.put(`http://localhost:8081/api/user/update/${this.userId}`, updatedUser, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.message = "個人資料更新成功！";
                setTimeout(() => {
                    this.router.push('/memberCenter');
                }, 1000);
            } catch (error) {
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
            this.router.push('/memberCenter');
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
