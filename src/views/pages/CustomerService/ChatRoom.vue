<template>
    <div class="connection-status" :class="connectionStatus">
        {{ statusText }}
    </div>
    <div v-if="!activeChatRoom || !activeChatRoom.chatRoomId || checkingExisting" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ loadingText }}</p>
    </div>
    <div class="chat-room" v-else>
        <h2 v-if="activeChatRoom.shop">
            {{ activeChatRoom.shop.shopName || activeChatRoom.seller.username }}的客服聊天室
        </h2>
        <h2 v-else>
            {{ activeChatRoom.seller.username }}的個人聊天室
        </h2>

        <div class="messages">
            <transition-group name="message-list" tag="div">
                <div v-for="msg in displayMessages" :key="msg.tempId || msg.id" class="message">
                    <div class="message-wrapper" :class="{
                        'sent-by-me': isMyMessage(msg),
                        'sent-by-other': !isMyMessage(msg)
                    }">
                        <div class="message-bubble">
                            <div class="message-header">
                                <span class="username">{{ msg.senderName || '未知用户' }}</span>
                                <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                            </div>
                            <div class="message-content">{{ msg.content }}</div>
                            <div class="message-state">
                                <span v-if="msg._status === 'sending'">🔄 发送中</span>
                                <span v-if="msg._status === 'failed'">❌ 发送失败</span>
                            </div>
                        </div>
                    </div>
                </div>
            </transition-group>
        </div>

        <div class="input-area">
            <input v-model="newMessage" @keyup.enter="send" placeholder="輸入訊息..." />
            <button @click="send">發送</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted, watchEffect, onMounted } from "vue"; // 確保引入 onMounted
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { storeToRefs } from "pinia";
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/user'; // 新增這行
// 從 store 中取得相關狀態與方法
const chatStore = useChatStore();
const { currentUser, activeChatRoom, displayMessages, connectionStatus, socketManager } = storeToRefs(chatStore);

const route = useRoute();
const router = useRouter();

const loadingText = ref("載入中...");
const checkingExisting = ref(false);
const newMessage = ref("");
const userId = ref(localStorage.getItem("userId"));

const subs = ref({}); // 用於儲存訂閱的物件，方便後續取消訂閱
// 獲取 userStore 實例
const userStore = useUserStore(); // 新增這行

console.log('ChatRoom Setup: chatStore instance:', chatStore); // 檢查 chatStore 是否有實例
if (!chatStore) {
    console.error('！！！！ chatStore 實例未定義 ！！！！');
}
console.log('ChatRoom Setup: connectionStatus ref:', connectionStatus); // 檢查是否為 Ref 物件
console.log('ChatRoom Setup: socketManager ref:', socketManager);     // 檢查是否為 Ref 物件

// 添加计算属性和方法
const statusText = computed(() => {
    return {
        disconnected: '❌ 连接已断开',
        connecting: '🔄 连接中...',
        connected: '✅ 已连接'
    }[connectionStatus.value];
});

const reconnect = async () => {
    try {
        await chatStore.connectChatRoom(chatStore.activeChatRoom.chatRoomId);
    } catch (error) {
        Swal.fire('错误', '重新连接失败', 'error');
    }
};

// 判斷是否為本人發送
const isMyMessage = computed(() => {
    // 在 computed 工廠函數外部獲取一次 userId，確保響應性
    const loggedInUserId = computed(() => Number(userStore.userId)); // 從 userStore 獲取登入者 ID (數字)

    return (msg) => {
        // *** 使用正確的屬性：msg.senderId ***
        const messageSenderIdRaw = msg?.senderId; // 讀取原始值
        const messageSenderId = Number(msg?.senderId);

        // (可選) 保留日誌以便測試階段驗證
        console.log(
            `比較訊息: ID=${msg?.messageId || msg?.tempId}, ` +
            `原始 msg.senderId=${messageSenderIdRaw} (類型 ${typeof messageSenderIdRaw}), ` + // 記錄正確的原始值
            `轉換後 senderId=${messageSenderId}, ` +
            `登入者ID=${loggedInUserId.value}, ` +
            `是否匹配=${loggedInUserId.value && !isNaN(messageSenderId) && messageSenderId === loggedInUserId.value}`
        );

        // 使用從 msg.senderId 獲取的值進行比較
        return loggedInUserId.value && !isNaN(messageSenderId) && messageSenderId === loggedInUserId.value;
    };
});

// 時間格式化函式
function formatTime(timestamp) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}



// 載入聊天室資料與連線
async function loadChatRoom(chatRoomId) {
    try {

        const response = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}`);

        // 若有店鋪資訊則檢查擁有權
        if (response.data.shop) {

            const isOwner = await axios.get(
                `http://localhost:8081/api/chat/${response.data.shop.shopId}/check-ownership`
            );
            if (isOwner.data.isOwner) {
                response.data.isOwner = true;
                await checkChatActivity(chatRoomId);
            }
        }

        // 將取得的聊天室資訊設定到 store 中
        chatStore.activeChatRoom = response.data;

        // 載入歷史訊息
        await loadMessages(chatRoomId);

        // 若 currentUser 有值，再建立 WebSocket 連線
        if (currentUser.value) {
            chatStore.connectChatRoom(chatRoomId);
        }
    } catch (error) {
        console.error("聊天室詳情載入失敗:", error);
        Swal.fire("錯誤", error.response?.data?.message || "載入失敗", "error");
        router.push("/user/login");
    }
}

async function checkChatActivity(chatRoomId) {
    try {
        const res = await axios.get(`/api/chat/${chatRoomId}/activity`);
        if (!res.data.hasMessages) {
            Swal.fire("提示", "此聊天室尚无有效对话", "info");
        }
    } catch (error) {
        console.error("活动检查失败:", error);
        // 您可以在這裡添加錯誤處理邏輯，例如顯示錯誤訊息給使用者
    }
}

async function loadMessages(chatRoomId) {
    try {

        const response = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}/messages`);
        chatStore.messages = response.data;
    } catch (error) {
        console.error("歷史訊息載入失敗:", error);
    }
}

// 監聽路由參數變化
watch(
    () => route.params.chatRoomId,
    async (newChatRoomId, oldChatRoomId) => {
        if (newChatRoomId && newChatRoomId !== oldChatRoomId) {
            chatStore.messages = [];
            await loadChatRoom(newChatRoomId);
        }
    },
    { immediate: true }
);

onMounted(async () => { // 使用 onMounted

    const userStoreInstance = useUserStore(); // 獲取 userStore 實例
    if (!currentUser.value) {
        // 這裡假設您的 userStore 中有獲取 currentUser 的方法
        await userStoreInstance.fetchCurrentUser();
    }

    // 如果 activeChatRoom 和 currentUser 都存在，則連接 WebSocket
    if (activeChatRoom.value && activeChatRoom.value.chatRoomId && currentUser.value) {
        chatStore.connectChatRoom(activeChatRoom.value.chatRoomId);
    }
});

onUnmounted(() => {
    if (chatStore.socketManager?.value?.stompClient?.connected) {
        chatStore.socketManager.value.disconnect();
    }
    // 取消所有訂閱
    if (chatStore.socketManager?.value?.stompClient) {
        Object.keys(subs.value).forEach(key => {
            chatStore.socketManager.value.stompClient.unsubscribe(subs.value[key].id);
        });
    }
});

/**
 * 發送訊息：加入臨時訊息後送出，待回應後更新狀態
 */
async function send() {
    // 函數開始時記錄關鍵狀態
    console.log('send(): 開始執行。');
    console.log('  - UserStore:', { userId: userStore.userId, username: userStore.username });
    console.log('  - ChatStore:', { connectionStatus: connectionStatus.value, isConnecting: socketManager.value?.isConnecting, stompClientConnected: socketManager.value?.stompClient?.connected });
    console.log('  - ActiveChatRoom ID:', activeChatRoom.value?.chatRoomId);
    console.log('  - Route Params ChatRoom ID:', route.params.chatRoomId);

    try {
        const messageContent = newMessage.value.trim();
        if (!messageContent) {
            console.log('send(): 訊息內容為空，已取消發送。');
            return;
        }

        // 1. 再次確認使用者 ID 是否存在 (從 userStore)
        const currentUserId = userStore.userId;
        const currentUsername = userStore.username;
        if (!currentUserId) {
            // 如果 userId 為空，立即拋出錯誤，阻止後續執行
            throw new Error("無法獲取使用者 ID，請重新登入。");
        }

        // 2. 檢查並確保 WebSocket 連接
        // 使用 chatStore 的 connectionStatus 和 socketManager 進行判斷
        if (connectionStatus.value !== 'connected' || !socketManager.value?.stompClient?.connected) {
            console.warn("send(): WebSocket 未連接或狀態異常，嘗試重新連接...");
            try {
                // 呼叫 Store 中統一的連接方法
                await chatStore.connectWebSocket(); // 等待連接嘗試完成
                // 再次檢查連接狀態
                if (connectionStatus.value !== 'connected' || !socketManager.value?.stompClient?.connected) {
                    // 如果重連後仍然失敗，拋出錯誤
                    throw new Error('WebSocket 重新連接失敗。');
                }
                console.log("send(): WebSocket 重新連接成功。");
            } catch (connectError) {
                console.error("send(): WebSocket 連接/重連過程中斷:", connectError);
                // 將連接錯誤包裝後拋出，讓 handleSendError 處理
                throw new Error(`WebSocket 連接失敗，無法發送訊息 (${connectError.message || connectError})`);
            }
        }

        // --- 到這裡，可以假設連接是成功的 ---
        const stompClient = socketManager.value.stompClient; // 現在可以安全獲取
        const currentChatRoomId = activeChatRoom.value?.chatRoomId || route.params.chatRoomId; // 確保有 chatRoomId

        if (!currentChatRoomId) {
            throw new Error("無法確定當前聊天室 ID。");
        }

        // 3. 構建 Payload
        const payload = {
            content: messageContent,
            senderId: String(currentUserId), // 使用來自 userStore 的 ID
            tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'TEXT_MESSAGE'
        };
        console.log("send(): 準備發送的 Payload:", JSON.stringify(payload));

        // 4. 即時顯示 (Optimistic Update)
        const messageToAdd = {
            ...payload,
            senderName: currentUsername || '我', // 使用 userStore 的 username
            // sender: { userId: currentUserId }, // 根據 addMessage 決定是否需要
            timestamp: new Date().toISOString(),
            _status: 'sending'
        };
        console.log("send(): 添加即時顯示訊息:", JSON.stringify(messageToAdd));
        // 確保 addMessage 能處理此結構，且不會拋錯
        chatStore.addMessage(messageToAdd);

        // 5. 透過 WebSocket 發送
        const destination = `/app/chat/${currentChatRoomId}/send`;
        console.log(`send(): 使用 stompClient 發送到 ${destination}`);
        stompClient.send(
            destination,
            {},
            JSON.stringify(payload)
        );
        console.log("send(): 訊息已透過 WebSocket 發送。");

        newMessage.value = ""; // 清空輸入框

    } catch (error) {
        // 統一由 handleSendError 處理並記錄詳細錯誤
        handleSendError(error);
    }
}

function handleSendError(error) {
    // 記錄完整的錯誤物件、訊息和堆疊追蹤
    console.error("消息發送失敗 (handleSendError):", error, error?.message, error?.stack);
    // 顯示給使用者的提示
    Swal.fire("錯誤", error.message || "無法發送訊息", "error");
}

function setupSubscriptions(chatRoomId) {
    const stompClient = chatStore.socketManager.value.stompClient;
    if (!stompClient) return;

    // 取消之前的訂閱
    Object.keys(subs.value).forEach(key => {
        if (subs.value[key] && stompClient.connected) { // 確保 stompClient 已連接
            stompClient.unsubscribe(subs.value[key].id);
        }
    });
    subs.value = {}; // 重置 subs 物件

    // 訂閱公共聊天頻道
    const mainSub = stompClient.subscribe(
        `/topic/chat/${chatRoomId}`,
        (message) => {
            const receivedMessage = JSON.parse(message.body);
            // 處理伺服器回傳的訊息確認
            if (receivedMessage.tempId) {
                chatStore.updateMessageStatus(receivedMessage.tempId, 'sent', receivedMessage);
            } else {
                chatStore.addMessage(receivedMessage);
            }
        },
        { id: `sub-main-${chatRoomId}` }
    );
    subs.value[`sub-main-${chatRoomId}`] = mainSub;

    // 錯誤訂閱
    const errorSub = stompClient.subscribe(
        `/user/queue/errors`,
        (error) => {
            const errorData = JSON.parse(error.body);
            Swal.fire('錯誤', errorData.message, 'error');
        },
        { id: `error-sub-${chatRoomId}` }
    );
    subs.value[`error-sub-${chatRoomId}`] = errorSub;
}
</script>

<style scoped>
/* 此處保持原有樣式不變 */
.chat-room {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    background: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

input {
    width: 70%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-right: 10px;
}

button {
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #1976D2;
}

.message-container {
    background: #e3f2fd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    max-width: 80%;
}

.my-message .message-container {
    background: #dcf8c6;
    margin-left: auto;
    max-width: 75%;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
}

.username {
    order: 2;
    color: #2c3e50;
    font-weight: 600;
}

.timestamp {
    order: 1;
    font-size: 0.75rem;
    color: #666;
}

.message-content {
    color: #34495e;
    word-break: break-word;
    font-size: 0.9rem;
}

.my-message .message-header {
    flex-direction: row-reverse;
}

.my-message .username {
    color: #27ae60;
}

.my-message .timestamp {
    color: #7f8c8d;
}

.loading-container {
    text-align: center;
    padding: 2rem;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.message-list-enter-active,
.message-list-leave-active {
    transition: all 0.5s ease;
}

.message-list-enter-from,
.message-list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.message-state {
    font-size: 0.8em;
    margin-bottom: 4px;
    color: #666;
}

.message-wrapper {
    display: flex;
    /* 使用 flex 來控制左右對齊 */
    margin-bottom: 10px;
}

.sent-by-me {
    justify-content: flex-end;
    /* 自己的訊息靠右 */
}

.sent-by-other {
    justify-content: flex-start;
    /* 對方的訊息靠左 */
}

.message-bubble {
    padding: 8px 12px;
    border-radius: 15px;
    max-width: 100%;
    word-wrap: break-word;
    position: relative;
    /* 相對定位，如果需要放狀態指示 */
}

/* 對方訊息氣泡樣式 */
.sent-by-other .message-bubble {
    background-color: #ffffff;
    /* 範例：白色 */
    border: 1px solid #eee;
    /* 可以添加 border-bottom-left-radius: 5px; */
}

/* 自己訊息氣泡樣式 */
.sent-by-me .message-bubble {
    background-color: #dcf8c6;
    /* 範例：淺綠色 */
    /* 可以添加 border-bottom-right-radius: 5px; */
}

/* 其他樣式 (header, username, content, timestamp, state) */
.message-header {
    display: flex;

    align-items: baseline;
    /* 建議保留，讓文字基線對齊 */
    margin-bottom: 4px;
    /* 如果是自己的訊息，可能需要反轉方向 */
    /* 例如：.sent-by-me .message-header { flex-direction: row-reverse; } */
}

.username {
    font-weight: bold;
    font-size: 0.8em;
    color: #555;
    margin-left: 15px;
}

.timestamp {

    color: #999;
    /* *** 加入這一行來增加左邊距 *** */

    /* 8px 是一個參考值，你可以調整大小直到滿意為止 */
    /* 如果你的 .sent-by-me .message-header 使用了 row-reverse，
     那麼對於你自己的訊息，可能需要設定 margin-right 而不是 margin-left */
}

.message-content {
    margin: 0;
}

.message-state {
    font-size: 0.75em;
    color: #888;
    text-align: right;
    margin-top: 2px;
}
</style>
