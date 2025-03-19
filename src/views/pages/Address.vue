<template>
    <div class="container">
        <h2>配送地址</h2>

        <!-- 主要地址 (宅配地址) -->
        <div v-if="primaryAddress">
            <h3>🏠 宅配地址</h3>
            <p><strong>城市：</strong> {{ primaryAddress.city || '尚未設定' }}</p>
            <p><strong>區：</strong> {{ primaryAddress.district }}</p>
            <p><strong>郵遞區號：</strong> {{ primaryAddress.zipCode }}</p>
            <p><strong>詳細地址：</strong> {{ primaryAddress.streetEtc }}</p>
        </div>

        <!-- 次要地址 (可選) -->
        <div v-if="secondaryAddress">
            <h3>📦 超商取貨地址</h3>
            <p><strong>城市：</strong> {{ secondaryAddress.city }}</p>
            <p><strong>區：</strong> {{ secondaryAddress.district }}</p>
            <p><strong>郵遞區號：</strong> {{ secondaryAddress.zipCode }}</p>
            <p><strong>詳細地址：</strong> {{ secondaryAddress.streetEtc }}</p>
        </div>

        <button type="submit" @click="updateAddress">更新</button>
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
            primaryAddress: null,  // 主要地址 (宅配)
            secondaryAddress: null, // 次要地址 (超商取貨)
            message: "",
            router: useRouter(),
        };
    },
    mounted() {
        this.loadUserId();
        if (this.userId) {
            this.fetchAddresses();
        } else {
            this.router.push('/user/login'); // 未登入則跳轉登入頁
        }
    },
    methods: {
        loadUserId() {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.warn("未找到 Token，跳轉至登入頁");
                this.router.push('/user/login');
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                this.userId = decodedToken.userId;
                console.log("解析的 JWT User ID:", this.userId);
            } catch (error) {
                console.error("無法解析 JWT:", error);
                this.router.push('/user/login');
            }
        },
        async fetchAddresses() {
            try {
                const token = sessionStorage.getItem("token");

                // 查詢主要地址 (宅配地址)
                const primaryRes = await axios.get(`http://localhost:8081/api/user/address/${this.userId}/type/1`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 查詢次要地址 (超商取貨地址)
                const secondaryRes = await axios.get(`http://localhost:8081/api/user/address/${this.userId}/type/2`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("🏠 主要地址 API 回應:", primaryRes.data);
                console.log("📦 次要地址 API 回應:", secondaryRes.data);

                this.primaryAddress = primaryRes.data;
                this.secondaryAddress = secondaryRes.data;

                console.log("🏠 主要地址:", this.primaryAddress);
                console.log("📦 次要地址:", this.secondaryAddress);

            } catch (error) {
                console.error("獲取地址數據失敗:", error);
                this.router.push('/user/login');
            }
        },
        async updateAddress() {
            try {
                const token = sessionStorage.getItem("token");

                // 更新主要地址
                if (this.primaryAddress) {
                    await axios.put(`http://localhost:8081/api/user/address/${this.userId}/${this.primaryAddress.userAddressId}`,
                        this.primaryAddress, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                // 更新次要地址
                if (this.secondaryAddress) {
                    await axios.put(`http://localhost:8081/api/user/address/${this.userId}/${this.secondaryAddress.userAddressId}`,
                        this.secondaryAddress, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                this.message = "地址更新成功！";
                console.log("✅ 地址更新成功");

                // 1 秒後回到會員中心
                setTimeout(() => {
                    this.router.push('/memberCenter');
                }, 1000);

            } catch (error) {
                console.error("更新地址失敗:", error);
                this.message = "更新失敗，請稍後再試！";
            }
        }
    }
};
</script>

<style scoped>
.container {
    max-width: 500px;
    margin: auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
    text-align: center;
}

button {
    width: 100%;
    padding: 10px;
    font-size: 18px;
    color: white;
    background-color: #04AA6D;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
}

p {
    font-size: 16px;
    margin: 5px 0;
}

button:hover {
    background-color: #3e8e41;
}

.message {
    text-align: center;
    color: green;
    margin-top: 10px;
}
</style>
