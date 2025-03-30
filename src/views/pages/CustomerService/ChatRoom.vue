<template>
    <!-- 在聊天室容器顶部添加状态提示 -->
    <div class="connection-status" :class="connectionStatus">
        {{ statusText }}

    </div>
    <!-- 先檢查 activeChatRoom 是否存在，若不存在則顯示 loading -->
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
                <div v-for="msg in displayMessages" :key="msg.id + msg._status" class="message">
                    <div :class="[
                        'message-container',
                        {
                            'my-message': isMyMessage(msg),
                            'sending': msg._status === 'sending',
                            'failed': msg._status === 'failed'
                        }
                    ]">
                        <div class="message-state">
                            <span v-if="msg._status === 'sending'">🔄 发送中</span>
                            <span v-if="msg._status === 'failed'">❌ 发送失败</span>
                        </div>
                        <div class="message-header">
                            <span class="username">{{ msg.senderName || '未知用户' }}</span>
                            <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                        </div>
                        <div class="message-content">{{ msg.content }}</div>
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
import { ref, onMounted, watch, computed, onUnmounted, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { storeToRefs } from "pinia";
import { useChatStore } from '@/stores/chatStore';

// 從 store 中取得相關狀態與方法
const chatStore = useChatStore();
const { currentUser, activeChatRoom, displayMessages, connectionStatus } = storeToRefs(chatStore);

const route = useRoute();
const router = useRouter();

const loadingText = ref("載入中...");
const checkingExisting = ref(false);
const newMessage = ref("");
const userId = ref(localStorage.getItem("userId"));
const authToken = ref(sessionStorage.getItem("authToken"));

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
const isMyMessage = computed(() => (msg) => {
    return msg.sender?.userId === currentUser.value?.userId;
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

// 自動同步 token
watchEffect(() => {
    sessionStorage.setItem("authToken", authToken.value);
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken.value}`;
});

// 載入聊天室資料與連線
async function loadChatRoom(chatRoomId) {
    try {
        authToken.value = sessionStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}`, {
            headers: { Authorization: `Bearer ${authToken.value}` },
        });

        // 若有店鋪資訊則檢查擁有權
        if (response.data.shop) {
            authToken.value = sessionStorage.getItem("authToken");
            const isOwner = await axios.get(
                `http://localhost:8081/api/chat/${response.data.shop.shopId}/check-ownership`,
                { headers: { Authorization: `Bearer ${authToken.value}` } }
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
    }
}

async function loadMessages(chatRoomId) {
    try {
        authToken.value = sessionStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}/messages`, {
            headers: { Authorization: `Bearer ${authToken.value}` },
        });
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

onMounted(async () => {
    try {
        if (!chatStore.socketManager.value) {
            chatStore.socketManager.value = {
                stompClient: null,
                subscriptions: new Map(),
                isConnecting: false
            };
        }

        authToken.value = sessionStorage.getItem("authToken");
        if (!authToken.value) {
            Swal.fire("错误", "登录状态已过期", "error");
            router.push("/user/login");
            return;
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken.value}`;
        await chatStore.fetchCurrentUser();
        if (route.params.chatRoomId) {
            await loadChatRoom(route.params.chatRoomId);
            await chatStore.connectChatRoom(route.params.chatRoomId);

            if (chatStore.activeChatRoom.chatRoomId && chatStore.socketManager?.value?.stompClient?.connected) {
                setupSubscriptions(chatStore.activeChatRoom.chatRoomId);
            }
        } else if (route.query.shopId) {
            checkingExisting.value = true;
            authToken.value = sessionStorage.getItem("authToken");
            const response = await axios.post(
                "http://localhost:8081/api/chat/create",
                { shopId: route.query.shopId },
                { headers: { Authorization: `Bearer ${authToken.value}` } }
            );
            if (response.data.alreadyExists) {
                await loadChatRoom(response.data.chatRoomId);
            } else {
                router.replace({
                    path: `/chat/${response.data.chatRoomId}`,
                    query: { from: "new" },
                });
            }
        }
    } catch (error) {
        Swal.fire({
            title: "錯誤",
            text: error.response?.data?.message || "聊天室處理失敗",
            icon: "error",
        });
        router.push("/user/login");
    } finally {
        checkingExisting.value = false;
    }
});

onUnmounted(() => {
    if (chatStore.socketManager?.value?.stompClient?.connected) {
        chatStore.socketManager.value.disconnect();
    }
});

/**
 * 發送訊息：加入臨時訊息後送出，待回應後更新狀態
 */
// ChatRoom.vue
async function send() {
    try {
        if (!newMessage.value.trim()) return;

        // 第一层检查：管理器是否存在
        if (!chatStore.socketManager?.value) {
            throw new Error('聊天系统未就绪，请刷新页面');
        }

        // 第二层检查：连接状态
        if (!chatStore.socketManager.value.stompClient?.connected) {
            console.log('正在尝试重新连接...');
            await chatStore.connectChatRoom(route.params.chatRoomId);
        }

        // 第三层检查：最终状态验证
        const { stompClient } = chatStore.socketManager.value;
        if (!stompClient || !stompClient.connected) {
            throw new Error('无法建立稳定连接，请检查网络');
        }

        // 发送逻辑
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const payload = {
            content: newMessage.value.trim(),
            senderId: userId.value,
            tempId: tempId
        };

        stompClient.send(
            `/app/chat/${route.params.chatRoomId}/send`,
            {},
            JSON.stringify(payload)
        );

        newMessage.value = "";
    } catch (error) {
        console.error('发送失败详情:', {
            error: error.message,
            managerState: chatStore.socketManager?.value,
            connectionStatus: chatStore.connectionStatus
        });

        Swal.fire({
            title: '发送失败',
            text: error.message,
            icon: 'error',
            willClose: () => {
                // 尝试恢复连接
                chatStore.connectChatRoom(route.params.chatRoomId);
            }
        });
    }
}

function setupSubscriptions(chatRoomId) {
    const stompClient = chatStore.socketManager.value.stompClient;
    if (!stompClient) return;

    Object.keys(subs).forEach(subId => {
        stompClient.unsubscribe(subId);
    });

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

    // 錯誤訂閱
    const errorSub = stompClient.subscribe(
        `/user/queue/errors`,
        (error) => {
            const errorData = JSON.parse(error.body);
            Swal.fire('錯誤', errorData.message, 'error');
        },
        { id: `error-sub-${chatRoomId}` }
    );
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
</style>
