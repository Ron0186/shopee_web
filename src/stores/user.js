import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
    const username = ref('');
    const userId = ref('');
    const token = ref('');
    const roles = ref([]);

    // ✅ 改為 computed 確保 Vue 會自動監聽變更
    const isSeller = computed(() => roles.value.includes("SELLER"));
    const isAdmin = computed(() => roles.value.includes("ADMIN"));
    console.log(isSeller.value)

    function loadUserData() {
        username.value = sessionStorage.getItem('username') || '';
        userId.value = sessionStorage.getItem('userId') || '';
        token.value = sessionStorage.getItem('token') || '';

        const rolesString = sessionStorage.getItem('roles');
        roles.value = rolesString ? JSON.parse(rolesString) : [];

        console.log("📌 讀取用戶數據: ", {
            username: username.value,
            userId: userId.value,
            token: token.value,
            roles: roles.value
        });
    }

    function saveUserData() {
        sessionStorage.setItem('username', username.value);
        sessionStorage.setItem('userId', userId.value);
        sessionStorage.setItem('token', token.value);
        sessionStorage.setItem('roles', JSON.stringify(roles.value));

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
        roles.value = newRoles;

        saveUserData();

        console.log("🚀 設定用戶角色:", roles.value);

        // ✅ 角色變更後確保 UI 反應正確
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

        sessionStorage.removeItem('username');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('roles');

        console.log("🗑️ 清除用戶數據");
    }

    // ✅ 監聽角色變更，確保 UI 更新
    watch(roles, (newRoles) => {
        console.log("🎯 角色變更:", newRoles);
    });

    loadUserData();

    return {
        username, userId, token, roles, isSeller, isAdmin,
        setUserData, clearUserData
    };
});
