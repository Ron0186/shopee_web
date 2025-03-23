import { defineStore } from 'pinia';
<<<<<<< HEAD
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
=======
import { ref, watch } from 'vue';

export const useUserStore = defineStore('user', () => {
    const username = ref('');
    const userId = ref('');  // 添加 userId
    const token = ref('');    // 添加 token
>>>>>>> 73dca5e19dd3f967da844617a114e84cfaa3edbf

    function loadUserData() {
        username.value = sessionStorage.getItem('username') || '';
        userId.value = sessionStorage.getItem('userId') || '';
        token.value = sessionStorage.getItem('token') || '';
<<<<<<< HEAD

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
=======
    }

    function saveUserData() {
        if (username.value) {
            sessionStorage.setItem('username', username.value);
        } else {
            sessionStorage.removeItem('username');
        }
        if (userId.value) {
            sessionStorage.setItem("userId", userId.value)
        } else {
            sessionStorage.removeItem('userId');
        }
        if (token.value) {
            sessionStorage.setItem("token", token.value);
        } else {
            sessionStorage.removeItem('token');
        }
    }

    function setUsername(newUsername) {
        username.value = newUsername;
    }
    function setUserId(newUserId) {
        userId.value = newUserId
    }
    function setToken(newToken) {
        token.value = newToken
    }

    // 可以合并为一个 setUserData 方法
    function setUserData(newUsername, newUserId, newToken) {
        username.value = newUsername;
        userId.value = newUserId;
        token.value = newToken;
        saveUserData(); // 保存所有数据
>>>>>>> 73dca5e19dd3f967da844617a114e84cfaa3edbf
    }

    function clearUserData() {
        username.value = '';
        userId.value = '';
        token.value = '';
<<<<<<< HEAD
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
=======
        sessionStorage.clear(); // 或者分别 removeItem
    }

    loadUserData(); // 初始化时加载

    watch([username, userId, token], saveUserData); // 监听所有数据的变化

    return { username, userId, token, setUsername, setUserId, setToken, setUserData, clearUserData };
});
>>>>>>> 73dca5e19dd3f967da844617a114e84cfaa3edbf
