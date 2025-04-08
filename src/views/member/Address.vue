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

        <!-- 宅配地址 -->
        <div v-if="activeTab === 'primary'" class="address-card">
            <h3>🏠 宅配地址</h3>
            <div v-if="primaryAddress.length > 0">
                <div v-for="(address, index) in sortedPrimaryAddress"
                    :key="index" class="address-block">
                    <div class="icon-group">
                        <img src="@/assets/trash.png" class="icon" title="刪除地址"
                            @click="deleteAddress(address.userAddressId)" />
                    </div>
                    <p><strong>地址：</strong>{{ address.city }}{{ address.district
                        }}{{ address.streetEtc }}</p>
                    <p><strong>郵遞區號：</strong>{{ address.zipCode }}</p>
                    <p><strong>收件人：</strong>{{ address.recipientName }}</p>
                    <p><strong>電話：</strong>{{ address.recipientPhone }}</p>
                    <p v-if="address.isDefault">
                        <strong>✅ 預設地址</strong>
                    </p>

                </div>
            </div>
            <button type="submit" class="func"
                @click="goToHomeAddressUpdate">新增宅配地址</button>
            <button type="button" class="func" @click="cancel">取消</button>
        </div>

        <!-- 超商取貨地址 -->
        <div v-if="activeTab === 'secondary'" class="address-card">
            <h3>📦 超商取貨</h3>
            <div v-if="secondaryAddress.length > 0">
                <div v-for="(address, index) in sortedSecondaryAddress"
                    :key="index" class="address-block">
                    <div class="icon-group">
                        <img src="@/assets/trash.png" class="icon" title="刪除地址"
                            @click="deleteAddress(address.userAddressId)" />
                    </div>
                    <p><strong>地址：</strong>
                        <!-- {{ address.city }}{{ address.district }} -->
                        {{ address.streetEtc }}</p>
                    <!-- <p><strong>郵遞區號：</strong>{{ address.zipCode }}</p> -->
                    <p><strong>收件人：</strong>{{ address.recipientName }}</p>
                    <p><strong>電話：</strong>{{ address.recipientPhone }}</p>
                    <!-- <p>
                        <strong>預設：</strong>
                        <span v-if="address.isDefault">✅ 是</span>
                        <span v-else> -->
                            <!-- <button
                                @click="confirmSetDefault(address.userAddressId, 2)">設為預設</button> -->
                        <!-- </span>
                    </p> -->
                </div>
            </div>
            <button type="submit" class="func"
                @click="goToCVSAddressUpdate">新增超商門市</button>
            <button type="button" class="func" @click="cancel">取消</button>
        </div>

        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            userId: null,
            primaryAddress: [],
            secondaryAddress: [],
            message: "",
            activeTab: "primary",
            router: useRouter(),
        };
    },
    computed: {
        sortedPrimaryAddress() {
            return [...this.primaryAddress].sort((a, b) => b.isDefault - a.isDefault);
        },
        sortedSecondaryAddress() {
            return [...this.secondaryAddress].sort((a, b) => b.isDefault - a.isDefault);
        }
    },
    mounted() {
        this.loadUserId();
        if (this.userId) {
            this.fetchAddresses();
        } else {
            this.router.push('/user/login');
        }
    },
    methods: {
        setActiveTab(tab) {
            this.activeTab = tab;
        },
        goToHomeAddressUpdate() {
            this.router.push({ name: 'HomeAddressCreate' });
        },
        goToCVSAddressUpdate() {
            this.router.push({ name: 'CVSAddressCreate' });
        },
        confirmSetDefault(addressId, typeId) {
            if (confirm("確定要將此地址設為預設嗎？")) {
                this.setAsDefault(addressId, typeId);
            }
        },
        async deleteAddress(addressId) {
            const result = await Swal.fire({
                title: '確認刪除？',
                text: "此操作將刪除此地址！",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '刪除',
                cancelButtonText: '取消'
            });

            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(`http://localhost:8081/api/user/address/${this.userId}/${addressId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    await Swal.fire('刪除成功', '地址已被刪除。', 'success');
                    this.fetchAddresses();
                } catch (error) {
                    Swal.fire('錯誤', '刪除失敗，請稍後再試！', 'error');
                }
            }
        },
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
        async fetchAddresses() {
            try {
                const token = localStorage.getItem("token");
                const primaryRes = await axios.get(`http://localhost:8081/api/user/address/${this.userId}/type/1`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const secondaryRes = await axios.get(`http://localhost:8081/api/user/address/${this.userId}/type/2`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.primaryAddress = primaryRes.data.sort(a => a.isDefault ? -1 : 1);
                this.secondaryAddress = secondaryRes.data.sort(a => a.isDefault ? -1 : 1);
            } catch (error) {
                console.error("獲取地址數據失敗:", error);
            }
        },
        async setAsDefault(addressId, typeId) {
            try {
                const token = localStorage.getItem("token");
                await axios.put(`http://localhost:8081/api/user/address/${this.userId}/set-default/${addressId}`, {
                    typeId: typeId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.message = "已設為預設地址 ✅";
                this.fetchAddresses();
            } catch (err) {
                this.message = "設為預設地址失敗，請稍後再試！";
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
    width: 45vw;
}

.navbar button.active {
    background: #04AA6D;
    color: white;
    font-weight: bold;
}

.address-card {
    padding: 15px;
    background: #f9f9f9;
    border-radius: 5px;
    margin-bottom: 15px;
}

.icon-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}

.func {
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

.func:hover {
    background-color: #3e8e41;
}

.func:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}

.message {
    text-align: center;
    margin-top: 10px;
    color: green;
}
</style>
