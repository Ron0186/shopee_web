import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUserStore = defineStore('user', () => {
    const username = ref('');
    const userId = ref('');  // 添加 userId
    const token = ref('');    // 添加 token

    function loadUserData() {
        username.value = sessionStorage.getItem('username') || '';
        userId.value = sessionStorage.getItem('userId') || '';
        token.value = sessionStorage.getItem('token') || '';
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
    }

    function clearUserData() {
        username.value = '';
        userId.value = '';
        token.value = '';
        sessionStorage.clear(); // 或者分别 removeItem
    }

    loadUserData(); // 初始化时加载

    watch([username, userId, token], saveUserData); // 监听所有数据的变化

    return { username, userId, token, setUsername, setUserId, setToken, setUserData, clearUserData };
});