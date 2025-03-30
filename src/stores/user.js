import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
    const username = ref('');
    const userId = ref('');
    const token = ref('');
    const roles = ref([]);

    const isSeller = computed(() => roles.value.includes("SELLER"));
    const isAdmin = computed(() => roles.value.includes("ADMIN"));
    const isSuperAdmin = computed(() => roles.value.includes("SUPER_ADMIN"));
    const isUser = computed(() => roles.value.includes("USER"));
    console.log(isSeller.value);

    function loadUserData() {
        username.value = localStorage.getItem('username') || '';
        userId.value = localStorage.getItem('userId') || '';
        token.value = localStorage.getItem('token') || '';

        try {
            const rolesString = localStorage.getItem('roles');
            if (rolesString && rolesString.startsWith('[')) {
                // ✅ 正常的 JSON 陣列字串
                roles.value = JSON.parse(rolesString);
            } else if (typeof rolesString === 'string') {
                // ✅ 單一角色（字串）
                roles.value = [rolesString];
            } else {
                roles.value = [];
            }
        } catch (err) {
            console.warn("⚠️ 讀取角色時發生錯誤，自動重置：", err);
            localStorage.removeItem('roles');
            roles.value = [];
        }

        console.log("📌 讀取用戶數據: ", {
            username: username.value,
            userId: userId.value,
            token: token.value,
            roles: roles.value
        });
    }
    //登入儲存
    function saveUserData(username, userId, token, roles) {

        this.username = username;
        this.userId = userId;
        this.token = token;
        this.roles = roles || [];
        if (!Array.isArray(roles)) {
            console.error('roles 不是陣列，無法存入 localStorage:', roles);
            return;
        }

        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
        localStorage.setItem('roles', JSON.stringify(roles)); // 轉成 JSON 字串存入
    }

    function reloadUserData() {
        // 重新從 localStorage 讀取
        this.username = localStorage.getItem("username") || "";
        this.userId = localStorage.getItem("userId") || "";
        this.token = localStorage.getItem("token") || "";
        this.roles = JSON.parse(localStorage.getItem("roles")) || [];
    }

    function setUserData(newUsername, newUserId, newToken, newRoles = []) {
        username.value = newUsername;
        userId.value = newUserId;
        token.value = newToken;
        roles.value = Array.isArray(newRoles) ? newRoles : [newRoles]; // ✅ 確保是陣列

        saveUserData();

        console.log("🚀 設定用戶角色:", roles.value);

        if (isSeller.value) {
            console.log("✅ 使用者是 SELLER，導向 /seller/orders");
            router.push("/seller/orders");
        } else {
            console.log("✅ 使用者是 USER，導向 /user/orders");
            router.push("/user/orders");
        }
    }

    function clearUserData() {
        username.value = '';
        userId.value = '';
        token.value = '';
        roles.value = [];

        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');

        console.log("🗑️ 清除用戶數據");
    }

    watch(roles, (newRoles) => {
        console.log("🎯 角色變更:", newRoles);
    });

    loadUserData();

    return {
        username, userId, token, roles, isSeller, isAdmin, isUser, isSuperAdmin,
        setUserData, clearUserData, saveUserData, reloadUserData
    };
});