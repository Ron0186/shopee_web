<template>
    <div v-if="selectedArticle">
        <h3 class="fw-bold">{{ selectedArticle.question }}</h3>
        <p class="lead">{{ selectedArticle.answer }}</p>
    </div>
    <div class="container my-4 help-center">
        <div v-if="!route.params.id" class="text-center mb-5">
            <h6 class="display-5 fw-bold">
                <i class="bi bi-question-circle-fill text-primary me-2"></i>歡迎來到幫助中心
            </h6>
            <p class="lead text-muted">我們隨時準備為您提供協助！</p>
        </div>

        <div class="text-center mt-5 pt-4 border-top">
            <h4>找不到您需要的答案嗎？</h4>
            <p class="text-muted">我們的客服團隊很樂意協助您。</p>
            <button class="btn btn-primary btn-lg position-relative" @click="openModal">
                <i class="bi bi-chat-dots-fill me-2"></i>
                即時聊天客服
                <span v-if="totalUnreadCount > 0"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
                    <span class="visually-hidden">未讀訊息</span>
                </span>
            </button>
        </div>

        <div v-if="showStoreList" class="modal fade show d-block" tabindex="-1"
            style="background-color: rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">選擇對話</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="isLoadingConversations" class="text-center">
                        </div>
                        <div v-else-if="conversations.length > 0" class="list-group">
                            <a href="#" v-for="conversation in conversations" :key="conversation.chatRoomId"
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                @click.prevent="goToChat(conversation.chatRoomId)">
                                <div>
                                    <h5 v-if="isSeller" class="mb-1">與 {{ conversation.buyerName || '未知買家' }} 的對話</h5>
                                    <h5 v-else class="mb-1">與 {{ conversation.sellerName || conversation.shopName ||
                                        '未知賣家' }} 的對話</h5>
                                    <small v-if="isSeller">商店: {{ conversation.shopName || 'N/A' }}</small>
                                    <p v-if="conversation.lastMessageContentPreview" class="mb-1 text-muted small">
                                        {{ conversation.lastMessageSenderName }}: {{
                                            conversation.lastMessageContentPreview }}
                                    </p>
                                </div>
                                <span v-if="conversation.unreadCount > 0" class="badge bg-danger rounded-pill">
                                    {{ conversation.unreadCount }}
                                </span>
                            </a>
                        </div>
                        <div v-else class="text-center">
                            <p>目前沒有進行中的對話，請先至商店聊聊發起對話。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHelpStore } from "../stores/HelpStore";
import { useUserStore } from '../stores/user';
import axios from 'axios';
import Swal from "sweetalert2";
import { useChatStore } from '@/stores/chatStore'; // *** 引入 ChatStore ***
import { storeToRefs } from 'pinia'; // *** 引入 storeToRefs ***

const authToken = ref(sessionStorage.getItem("authToken"));
const route = useRoute();
const router = useRouter();
const helpStore = useHelpStore();
const userStore = useUserStore();
const showStoreList = ref(false);
const selectedArticle = computed(() =>
    helpStore.faqCategories.flatMap(category => category.items)
        .find(item => item.id === route.params.id)
);

const chatStore = useChatStore();
// --- >>> 獲取新的狀態 <<< ---
const { conversations, isLoadingConversations, totalUnreadCount } = storeToRefs(chatStore);
// --- >>> ---


watch(() => route.params.id, newId => {
    helpStore.setSelectedArticle(newId);
}, { immediate: true });

const isSeller = computed(() => userStore.isSeller); // 獲取賣家身份

// --- 新增：用於標記聊天初始化是否已完成 ---
const isInitialChatLoadDone = ref(false);

// --- 使用 watch 監聽 isSeller 的變化 ---
watch(isSeller, async (newValue, oldValue) => {
    // newValue 是 isSeller.value 的新值
    console.log(`[Content.vue Watch isSeller] 值從 ${oldValue} 變為 ${newValue}`);

    // 確保 newValue 不再是 undefined，且使用者已登入，且初始化尚未完成
    if (typeof newValue !== 'undefined' && !isInitialChatLoadDone.value && userStore.userId) {
        console.log(`[Content.vue Watch isSeller] isSeller 已定義 (${newValue})，執行聊天初始化邏輯...`);
        isInitialChatLoadDone.value = true; // 標記為已執行，防止重複

        try {
            if (newValue === true) { // 明確檢查布林值
                await chatStore.fetchSellerConversations();
                console.log('[Content.vue Watch] fetchSellerConversations 完成。');
            } else {
                await chatStore.fetchBuyerConversations();
                console.log('[Content.vue Watch] fetchBuyerConversations 完成。');
            }
            console.log('%c[Content.vue Watch] fetch 完成後。目前 totalUnreadCount:', 'color: blue; font-weight: bold;', totalUnreadCount.value);

            // 連接 WebSocket
            await chatStore.connectWebSocket();
            console.log('[Content.vue Watch] WebSocket 連接嘗試完成。');

        } catch (error) {
            console.error('[Content.vue Watch] 聊天初始化過程中發生錯誤:', error);
            isInitialChatLoadDone.value = false; // 允許重試？或設置錯誤狀態
        }
    } else if (typeof newValue !== 'undefined' && isInitialChatLoadDone.value) {
        console.log("[Content.vue Watch isSeller] 聊天初始化邏輯已執行過。");
    } else if (!userStore.userId) {
        console.log("[Content.vue Watch isSeller] 使用者未登入。");
    } else {
        console.log("[Content.vue Watch isSeller] isSeller 仍然是 undefined。");
    }
}, { immediate: true }); // { immediate: true } 讓 watch 在元件掛載時立即執行一次檢查


// 同步 localStorage 中的 userId 與 userName 至 sessionStorage
const syncUserInfoToSession = () => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('username');
    if (storedUserId) sessionStorage.setItem('userId', storedUserId);
    if (storedUserName) sessionStorage.setItem('username', storedUserName);
};



const openModal = () => {
    showStoreList.value = true;
    // --- >>> 根據身份調用不同的加載方法 <<< ---
    if (isSeller.value) {
        chatStore.fetchSellerConversations(); // 賣家加載對話
    } else {
        chatStore.fetchBuyerConversations(); // <<< 買家加載對話
    }
    // --- ---
    chatStore.connectWebSocket(); // 確保 WS 連接
};

const closeModal = () => {
    showStoreList.value = false;

};

onMounted(() => {
    syncUserInfoToSession(); // 同步 Session Storage 的邏輯可以保留
    console.log('Content.vue Mounted - Current User ID:', userStore.userId);
    // 主要的 fetch 和 connect 邏輯已移至 watch 中
});

const goToChat = (chatRoomId) => {
    console.log(`goToChat called with chatRoomId: ${chatRoomId}, Type: ${typeof chatRoomId}`);
    if (!chatRoomId || typeof chatRoomId !== 'number') {
        console.error("goToChat: 無效的 chatRoomId:", chatRoomId);
        Swal.fire("錯誤", `無法識別的聊天室 ID: ${chatRoomId}`, "error");
        return;
    }

    // *** 再次檢查 markConversationAsRead 是否存在 ***
    if (typeof chatStore.markConversationAsRead === 'function') {
        chatStore.markConversationAsRead(chatRoomId); // 調用 store 中的 action
    } else {
        console.error("!!!! chatStore.markConversationAsRead 仍然不是一個函數 !!!! 請檢查 chatStore.js 的定義和導出。");
        // 即使沒有這個函數，也先讓導航繼續，但未讀數不會被清除
    }

    console.log(`Navigating to chat room URL: /chat/${chatRoomId}`);
    router.push(`/chat/${chatRoomId}`);
    closeModal();
};
</script>

<style scoped>
.help-center {
    text-align: center;
}

/* 可選：微調 Badge 位置 (如果需要) */
.btn .badge {
    /* 預設的 translate-middle 可能會讓 badge 稍微偏離右上角 */
    /* transform: translate(50%, -50%); */
    /* 可以試試只向右和向上移動 50% */
}
</style>
