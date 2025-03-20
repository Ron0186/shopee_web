<template>
    <div class="container">
        <h2>配送地址</h2>

        <!-- 導覽列 -->
        <div class="navbar">
            <button :class="{ active: activeTab === 'primary' }"
                @click="setActiveTab('primary')">
                🏠 宅配地址
            </button>
            <button :class="{ active: activeTab === 'secondary' }"
                @click="setActiveTab('secondary')">
                📦 超商取貨地址
            </button>
        </div>

        <!-- 主要地址 (宅配地址) -->
        <div v-if="activeTab === 'primary' && primaryAddress"
            class="address-card">
            <h3>🏠 宅配地址</h3>
            <div class="icon-group">
                <img src="@/assets/data-processing.png" class="icon"
                    @click="goToUpdatePage(primaryAddress.userAddressId)" />
                <img src="@/assets/trash.png" class="icon"
                    @click="deleteAddress(primaryAddress.userAddressId)" />
            </div>
            <p><strong>收件人：</strong>{{ userName }}</p>
            <p><strong>城市：</strong> {{ primaryAddress.city || '尚未設定' }}</p>
            <p><strong>區：</strong> {{ primaryAddress.district || '尚未設定' }}</p>
            <p><strong>郵遞區號：</strong> {{ primaryAddress.zipCode || '尚未設定' }}</p>
            <p><strong>詳細地址：</strong> {{ primaryAddress.streetEtc || '尚未設定' }}
            </p>
        </div>

        <!-- 次要地址 (超商取貨地址) -->
        <div v-if="activeTab === 'secondary' && secondaryAddress"
            class="address-card">
            <h3>📦 超商取貨地址</h3>
            <div class="icon-group">
                <img src="@/assets/data-processing.png" class="icon"
                    @click="goToUpdatePage(secondaryAddress.userAddressId)" />
                <img src="@/assets/trash.png" class="icon"
                    @click="deleteAddress(secondaryAddress.userAddressId)" />
            </div>
            <p><strong>收件人：</strong>{{ userName }}</p>
            <p><strong>城市：</strong> {{ secondaryAddress.city || '尚未設定' }}</p>
            <p><strong>區：</strong> {{ secondaryAddress.district || '尚未設定' }}</p>
            <p><strong>郵遞區號：</strong> {{ secondaryAddress.zipCode || '尚未設定' }}
            </p>
            <p><strong>詳細地址：</strong> {{ secondaryAddress.streetEtc || '尚未設定' }}
            </p>
        </div>

        <!-- 新增按鈕 -->
        <button type="submit" @click="goToAddPage">新增地址</button>
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
            activeTab: "primary", // 預設顯示「宅配地址」
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
        setActiveTab(tab) {
            this.activeTab = tab;  // 切換分頁
        },
        goToUpdatePage(addressId) {
            this.router.push(`/updateAddress/${addressId}`); // 跳轉到更新地址頁面
        },
        goToAddPage() {
            this.router.push('/addAddress'); // 跳轉到新增地址頁面
        },
        async deleteAddress(addressId) {
            if (!confirm("確定要刪除此地址嗎？")) return;

            try {
                const token = sessionStorage.getItem("token");
                await axios.delete(`http://localhost:8081/api/user/address/${this.userId}/${addressId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.message = "地址刪除成功！";
                console.log("✅ 地址刪除成功");

                // 重新獲取地址數據
                this.fetchAddresses();

            } catch (error) {
                console.error("刪除地址失敗:", error);
                this.message = "刪除失敗，請稍後再試！";
            }
        },
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

            } catch (error) {
                console.error("獲取地址數據失敗:", error);
                this.router.push('/user/login');
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

/* Navbar 樣式 */
.navbar {
    display: flex;
    justify-content: space-around;
    margin-bottom: 15px;
}

.navbar button {
    flex: 1;
    padding: 10px;
    font-size: 16px;
    background: #f4f4f4;
    border: 1px solid #ddd;
    cursor: pointer;
}

.navbar button.active {
    background: #04AA6D;
    color: white;
    font-weight: bold;
}

/* 地址卡片 */
.address-card {
    position: relative;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 5px;
    margin-bottom: 15px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

/* 編輯 & 刪除按鈕組 (h3 下方) */
.icon-group {
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    gap: 10px;
}

/* 圖示樣式 */
.icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}

/* 按鈕樣式 */
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

button:hover {
    background-color: #3e8e41;
}
</style>
