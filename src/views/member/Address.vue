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
                📦 超商取貨
            </button>
        </div>

        <!-- 主要地址 (宅配地址) -->
        <div v-if="activeTab === 'primary'" class="address-card">
            <h3>🏠 宅配地址</h3>
            <div v-if="primaryAddress">
                <div class="icon-group">
                    <img src="@/assets/data-processing.png" class="icon"
                        @click="goToUpdatePage(primaryAddress.userAddressId)" />
                    <img src="@/assets/trash.png" class="icon"
                        @click="deleteAddress(primaryAddress.userAddressId)" />
                </div>
                <p><strong>收件人：</strong>{{ userName }}</p>
                <p><strong>城市：</strong> {{ primaryAddress.city || '尚未設定' }}</p>
                <p><strong>區：</strong> {{ primaryAddress.district || '尚未設定' }}
                </p>
                <p><strong>郵遞區號：</strong> {{ primaryAddress.zipCode || '尚未設定' }}
                </p>
                <p><strong>詳細地址：</strong> {{ primaryAddress.streetEtc || '尚未設定'
                    }}</p>
            </div>
            <!-- 新增宅配地址按鈕 -->
            <button type="submit" @click="goToHomeAddressUpdate">新增宅配地址</button>
        </div>

        <!-- 次要地址 (超商取貨地址) -->
        <div v-if="activeTab === 'secondary'" class="address-card">
            <h3>📦 超商取貨</h3>
            <div v-if="secondaryAddress">
                <div class="icon-group">
                    <img src="@/assets/data-processing.png" class="icon"
                        @click="goToUpdatePage(secondaryAddress.userAddressId)" />
                    <img src="@/assets/trash.png" class="icon"
                        @click="deleteAddress(secondaryAddress.userAddressId)" />
                </div>
                <p><strong>收件人：</strong>{{ userName }}</p>
                <p><strong>城市：</strong> {{ secondaryAddress.city || '尚未設定' }}
                </p>
                <p><strong>區：</strong> {{ secondaryAddress.district || '尚未設定' }}
                </p>
                <p><strong>郵遞區號：</strong> {{ secondaryAddress.zipCode || '尚未設定'
                    }}</p>
                <p><strong>詳細地址：</strong> {{ secondaryAddress.streetEtc ||
                    '尚未設定' }}</p>
            </div>
            <!-- 新增超商取貨地址按鈕 -->
            <button type="submit" @click="goToCVSAddressUpdate">新增超商門市</button>
        </div>

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
        goToHomeAddressUpdate() {
            this.router.push({ name: 'HomeAddressUpdate' }); // 跳轉到新增宅配地址頁面
        },
        goToCVSAddressUpdate() {
            this.router.push({ name: 'CVSAddressUpdate' }); // 跳轉到新增超商取貨地址頁面
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
    padding: 15px;
    background: #f9f9f9;
    border-radius: 5px;
    margin-bottom: 15px;
}

/* 圖示組 */
.icon-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* 圖示 */
.icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}
</style>
