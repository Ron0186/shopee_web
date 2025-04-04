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
            <button class="btn btn-primary btn-lg" @click="openModal">
                <i class="bi bi-chat-dots-fill me-2"></i>
                即時聊天客服</button>
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
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">載入中...</span>
                            </div>
                            <p>載入對話列表中...</p>
                        </div>

                        <div v-else-if="conversations.length > 0" class="list-group">
                            <a href="#" v-for="conversation in conversations" :key="conversation.chatRoomId"
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                @click.prevent="goToChat(conversation.chatRoomId)">
                                <div>
                                    <h5 v-if="isSeller" class="mb-1">與 {{ conversation.buyerName || '未知買家' }} 的對話
                                    </h5>
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
const { conversations, isLoadingConversations } = storeToRefs(chatStore);
// --- >>> ---


watch(() => route.params.id, newId => {
    helpStore.setSelectedArticle(newId);
}, { immediate: true });

const isSeller = computed(() => userStore.isSeller); // 獲取賣家身份


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

// --- >>> 新增 goToChat 函數 <<< ---
const goToChat = (chatRoomId) => {
    console.log(`goToChat called with chatRoomId: ${chatRoomId}, Type: ${typeof chatRoomId}`); // <-- 加入此行
    if (!chatRoomId || typeof chatRoomId !== 'number') { // <-- 增加類型檢查
        console.error("goToChat: 無效的 chatRoomId:", chatRoomId);
        Swal.fire("錯誤", `無法識別的聊天室 ID: ${chatRoomId}`, "error"); // 提示具體 ID
        return;
    }
    console.log(`Navigating to chat room URL: /chat/${chatRoomId}`);
    router.push(`/chat/${chatRoomId}`);
    closeModal();
};
// --- >>> ---

// --- 聊天導航邏輯 (可以保持不變) ---
// const buyerChat = async (shopId) => {
//     console.log(`Buyer attempting to chat with shopId: ${shopId}`);
//     try {
//         // 買家點擊，通常是創建或查找房間
//         // 這裡用 axios 呼叫後端 /api/chat/create 端點
//         const response = await axios.post('/api/chat/create', { shopId }, {
//             headers: { Authorization: `Bearer ${authToken.value}` }
//         });
//         if (response.data && response.data.chatRoomId) {
//             router.push(`/chat/${response.data.chatRoomId}`); // 跳轉到聊天室
//         } else {
//             throw new Error("無法獲取聊天室 ID");
//         }
//     } catch (error) {
//         console.error("買家聊天啟動失敗:", error);
//         Swal.fire("錯誤", error.response?.data?.message || "無法開啟聊天", "error");
//     }
// };






onMounted(() => {
    syncUserInfoToSession(); // 如果需要同步 session storage
    console.log('Content.vue Mounted - Current User ID:', userStore.userId);

    // 如果是賣家，可以在元件掛載時嘗試載入一次商店和未讀數
    // 並且確保 WebSocket 連接已建立 (或嘗試建立)
    if (isSeller.value) {
        console.log("賣家身份，嘗試載入初始商店數據並連接 WebSocket...");

        chatStore.connectWebSocket(); // connectWebSocket 內部會檢查是否已連接
    }
});


</script>

<style scoped>
.help-center {
    text-align: center;
}
</style>
