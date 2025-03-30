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

    function saveUserData() {
        localStorage.setItem('username', username.value);
        localStorage.setItem('userId', userId.value);
        localStorage.setItem('token', token.value);
        localStorage.setItem('roles', JSON.stringify(roles.value));

        console.log("💾 儲存用戶數據: ", {
            username: username.value,
            userId: userId.value,
            token: token.value,
            roles: roles.value
        });
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
        setUserData, clearUserData
    };
});
