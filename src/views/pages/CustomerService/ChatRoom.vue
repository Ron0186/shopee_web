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


// 監聽路由參數變化
watch(
    () => route.params.chatRoomId,
    async (newChatRoomId) => {
        const currentRoomId = Number(newChatRoomId); // 確保是數字
        if (currentRoomId && !isNaN(currentRoomId)) {
            console.log(`ChatRoom Route Watch: 準備進入聊天室 ${currentRoomId}`);
            checkingExisting.value = true; // 開始載入
            loadingText.value = `正在載入聊天室 ${currentRoomId}...`;
            try {
                // 確保 userStore 已載入 (如果需要用戶 ID 才能進入)
                // 最好在應用程式啟動時或路由守衛中確保用戶已登入
                if (!userStore.userId) {
                    // console.warn("路由變化時用戶數據未載入，可能需要等待或重新驗證");
                    // await userStore.fetchCurrentUser(); // 可能需要重新獲取
                    // if (!userStore.userId) throw new Error("無法獲取用戶信息");
                    // 或者直接報錯/導向登入
                    throw new Error("使用者未登入，無法載入聊天室");
                }
                // 調用 Store 的統一入口函數
                await chatStore.enterChatRoom(currentRoomId);
                console.log(`ChatRoom Route Watch: 成功進入聊天室 ${currentRoomId}`);
            } catch (error) {
                console.error(`進入聊天室 ${currentRoomId} 失敗 (來自路由監聽):`, error);
                Swal.fire("錯誤", `無法載入聊天室: ${error.message || '未知錯誤'}`, "error");
                // 考慮導航離開，例如回到列表頁
                // router.push('/chat-list');
            } finally {
                checkingExisting.value = false; // 結束載入
            }
        } else if (activeChatRoom.value) {
            // 如果 newChatRoomId 無效，且當前有 activeChatRoom，表示離開了聊天室
            console.log("離開聊天室...");
            // chatStore.leaveChatRoom(); // 可選：在 store 中增加離開的清理邏輯
            activeChatRoom.value = null; // 清理本地狀態
        }
    },
    { immediate: true } // 確保組件首次加載時執行
);

onMounted(() => {
    console.log("ChatRoom Component Mounted");
    // 可以在這裡做一些滾動到底部之類的操作
});


// onUnmounted 仍然需要處理組件銷毀時的清理工作
onUnmounted(() => {
    console.log("ChatRoom Component Unmounted");
    // 通知 store 離開聊天室，以便取消訂閱或斷開連接（如果需要）
    // chatStore.leaveChatRoom();
    // 或者直接斷開 (如果 store 沒有單獨的離開邏輯)
    // chatStore.disconnectWebSocket();
});

/**
 * 發送訊息：加入臨時訊息後送出，待回應後更新狀態
 */
// 發送訊息函數
async function send() {
    console.log('send(): 開始執行。');
    const messageContent = newMessage.value.trim();
    if (!messageContent) return;

    const currentUserId = userStore.userId;
    const currentUsername = userStore.username;
    const currentChatRoomId = activeChatRoom.value?.chatRoomId; // 從 store 獲取

    if (!currentUserId || !currentChatRoomId) {
        handleSendError(new Error("無法獲取使用者 ID 或聊天室 ID。"));
        return;
    }

    // 檢查連接狀態 (從 store)
    if (connectionStatus.value !== 'connected') {
        // 可以嘗試重連或提示用戶
        handleSendError(new Error("WebSocket 未連接。"));
        return;
        // 或者:
        // try {
        //     await chatStore.connectWebSocket(); // 假設有這個方法
        // } catch(e) { handleSendError(e); return; }
    }


    const payload = {
        content: messageContent,
        senderId: String(currentUserId),
        tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'TEXT_MESSAGE'
    };
    const messageToAdd = {
        ...payload,
        senderName: currentUsername || '我',
        timestamp: new Date().toISOString(),
        _status: 'sending'
    };

    try {
        // 1. 即時顯示
        chatStore.addMessage(messageToAdd);

        // 2. 透過 WebSocket 發送 (建議封裝到 store action)
        // 保持現狀: 直接訪問 store 的 socketManager
        if (chatStore.socketManager?.stompClient?.connected) {
            chatStore.socketManager.stompClient.send(
                `/app/chat/${currentChatRoomId}/send`,
                {},
                JSON.stringify(payload)
            );
            console.log("send(): 訊息已透過 WebSocket 發送。");
            newMessage.value = ""; // 清空輸入框
        } else {
            throw new Error("WebSocket is not connected. Cannot send message.");
        }

        // 建議方式: 調用 store action
        // await chatStore.sendMessageAction(payload); // 假設您在 store 中創建了這個 action
        // newMessage.value = ""; // 清空輸入框

    } catch (error) {
        handleSendError(error);
        // 考慮是否需要將剛才 optimistic add 的訊息標記為失敗
        // chatStore.updateMessageStatus(payload.tempId, 'failed'); // 需要這個函數存在
    }
}

// 錯誤處理函數
function handleSendError(error) {
    console.error("消息發送失敗 (handleSendError):", error, error?.message, error?.stack);
    Swal.fire("錯誤", error.message || "無法發送訊息", "error");
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
