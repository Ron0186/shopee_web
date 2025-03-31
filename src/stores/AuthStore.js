// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getCurrentUser } from '../api/authApi'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!user.value)
    const isShopOwner = computed(() => user.value?.role === 'shop_owner')

    const loginUser = async (credentials) => {
        loading.value = true
        error.value = null
        try {
            const response = await login(credentials)
            user.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || '登入失敗'
            throw err
        } finally {
            loading.value = false
        }
    }

    const logoutUser = async () => {
        loading.value = true
        try {
            await logout()
            user.value = null
        } catch (err) {
            error.value = err.response?.data?.message || '登出失敗'
        } finally {
            loading.value = false
        }
    }

    const fetchCurrentUser = async () => {
        loading.value = true
        try {
            const response = await getCurrentUser()
            user.value = response.data
        } catch (err) {
            user.value = null
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        isShopOwner,
        loginUser,
        logoutUser,
        fetchCurrentUser
    }
})