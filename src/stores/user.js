import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import router from '@/router';
import { useChatStore } from './chatStore';  // 引入 chatStore 获取 stompClient

export const useUserStore = defineStore('user', () => {
    const username = ref('');
    const userId = ref('');
    const token = ref('');
    const roles = ref([]);

    // ✅ 改為 computed 確保 Vue 會自動監聽變更
    const isSeller = computed(() => roles.value.includes("SELLER"));
    const isAdmin = computed(() => roles.value.includes("ADMIN"));
    const isSuperAdmin = computed(() => roles.value.includes("SUPER_ADMIN"));
    const isUser = computed(() => roles.value.includes("USER"));
    console.log(isSeller.value)

    const logout = async () => {
        // 🔴 强制断开所有 WebSocket 连接
        const chatStore = useChatStore();
        if (chatStore.stompClient) {
            chatStore.stompClient.disconnect(() => {
                console.log('旧用户 WebSocket 已断开');
            });
            chatStore.stompClient = null; // 重要！重置为 null
        }

        // 🔴 清除所有存储中的用户数据
        sessionStorage.removeItem('tempAuthToken'); // 仅清除 sessionStorage 的 Token
        localStorage.removeItem('authToken');       // 清除长效 Token（如果存在）
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');

        // 🔴 重置 Pinia 状态
        this.username = '';
        this.userId = '';
        this.token = '';
        this.roles = [];

        console.log("✅ 用户状态已完全重置");

        // 4. 跳转登录页
        await router.push('/user/login');
    };

    function loadUserData() {
        username.value = localStorage.getItem('username') || '';
        userId.value = localStorage.getItem('userId') || '';
        token.value = localStorage.getItem('token') || '';

        const rolesString = localStorage.getItem('roles');
        roles.value = rolesString ? JSON.parse(rolesString) : [];

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
        roles.value = newRoles;

        // 同步存储
        localStorage.setItem('userData', JSON.stringify({ username, userId, roles }));
        sessionStorage.setItem('sessionToken', token);


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

        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');

        // 清除所有存储
        localStorage.removeItem('userData');
        sessionStorage.removeItem('sessionToken');
        console.log("🗑️ 清除用戶數據");

    }

    // ✅ 監聽角色變更，確保 UI 更新
    watch(roles, (newRoles) => {
        console.log("🎯 角色變更:", newRoles);
    });

    loadUserData();

    return {
        username, userId, token, roles, isSeller, isAdmin, isUser, isSuperAdmin,
        setUserData, clearUserData, saveUserData, reloadUserData, logout
    };
});
