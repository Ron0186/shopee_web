<template>
    <div v-if="!activeChatRoom.chatRoomId || checkingExisting" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ loadingText }}</p>
    </div>
    <!-- 修改判断条件为 chatRoomId -->
    <div class="chat-room" v-else>
        <!-- 调整显示逻辑，优先显示店铺信息 -->
        <h2 v-if="activeChatRoom.shop">
            {{ activeChatRoom.shop.shopName || activeChatRoom.seller.username }}的客服聊天室
        </h2>
        <h2 v-else>
            {{ activeChatRoom.seller.username }}的個人聊天室
        </h2>

        <div class="messages">
            <div v-for="msg in safeMessages" :key="msg.id" class="message">
                <div :class="['message-container', { 'my-message': msg.sender?.userId === currentUser?.userId }]">
                    <div class="message-header">
                        <small class="timestamp">{{ formatTime(msg.timestamp) }}</small>
                        <strong class="username">{{ msg.senderName }}</strong>
                    </div>
                    <div class="message-content">{{ msg.content }}</div>
                </div>
            </div>
        </div>

        <div class="input-area">
            <input v-model="newMessage" @keyup.enter="send" placeholder="輸入訊息..." />
            <button @click="send">發送</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
import axios from "@/plugins/axios";
import { useChatStore } from '@/stores/chatStore';
import Swal from 'sweetalert2';
import { storeToRefs } from "pinia";

const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();

// 🔴 <span style="color:red;">【修改處】用於顯示載入中文案</span>
const loadingText = ref("載入中...");

// 文字輸入框
const newMessage = ref("");

// 🔴 修改1：直接从 localStorage 获取 userId
const userId = ref(localStorage.getItem('userId'));
const token = ref(localStorage.getItem('token'));

// 從 chatStore 取出當前使用者
const { currentUser } = storeToRefs(chatStore);

// 聊天室基本資料
const activeChatRoom = ref({
    chatRoomId: null,
    seller: {
        userId: null,
        username: null
    },
    shop: {
        shopId: null,
        shopName: null
    }
});

// 聊天訊息列表 (來自 store)
const messages = computed(() => chatStore.messages);
const safeMessages = computed(() => messages.value);

// 是否在檢查聊天室狀態
const checkingExisting = ref(false);

// WebSocket 客戶端
let stompClient = null;

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
        hour12: false
    });
}

onMounted(async () => {
    // 🔴 统一使用函数获取最新 Token
    const getValidToken = () => {
        const token = sessionStorage.getItem('tempAuthToken') || localStorage.getItem('authToken');
        if (!token) {
            router.push('/user/login');
            throw new Error('未找到有效 Token');
        }
        return token;
    };

    // 🌟 确保 token 存在
    const token = getValidToken();
    if (!token) {
        router.push('/user/login');
        return;
    }

    try {
        const token = getValidToken();
        // 後續聊天室操作使用 sessionStorage 的 Token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // 🔴 确保先获取用户数据再加载聊天室
        await chatStore.fetchCurrentUser(localStorage.getItem('userId'));

        // 情況1：直接透過路由參數 chatRoomId 進入
        if (route.params.chatRoomId) {
            await loadChatRoom(route.params.chatRoomId);

        } else if (route.query.shopId) {
            checkingExisting.value = true;

            const response = await axios.post(
                "http://localhost:8081/api/chat/create",
                { shopId: route.query.shopId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.alreadyExists) {
                // 聊天室已存在，直接載入
                await loadChatRoom(response.data.chatRoomId);
            } else {
                // 新建立的聊天室，改用 router.replace 進入
                router.replace({
                    path: `/chat/${response.data.chatRoomId}`,
                    query: { from: 'new' }
                });
            }
        }
    } catch (error) {
        Swal.fire({
            title: "錯誤",
            text: error.response?.data?.message || "聊天室處理失敗",
            icon: "error"
        });
        router.push('/user/login');
    } finally {
        checkingExisting.value = false;
    }
})





// 監聽路由參數的變動（如切換聊天室）
watch(
    () => route.params.chatRoomId,
    async (newChatRoomId, oldChatRoomId) => {
        if (newChatRoomId && newChatRoomId !== oldChatRoomId) {
            // 清空舊訊息
            chatStore.messages = [];

            // 若已有 stompClient，取消訂閱舊聊天室
            if (stompClient && stompClient.connected) {
                stompClient.unsubscribe(`sub-${oldChatRoomId}`);
            }

            // 重置 activeChatRoom
            activeChatRoom.value = {
                chatRoomId: null,
                seller: {},
                shop: {}
            };

            // 載入新聊天室
            await loadChatRoom(newChatRoomId);
        }
    },
    { immediate: true }
);

// 監聽 store 中 messages 的變化
watch(() => chatStore.messages, (newMessages) => {
    // 這裡可以做一些 UI 效果，例如自動捲動到底部
}, { deep: true });

/**
 * 依 chatRoomId 取得聊天室詳情，並連線 WebSocket
 */
async function loadChatRoom(chatRoomId) {
    try {
        // 🔴 先断开旧连接
        if (stompClient && stompClient.connected) {
            stompClient.disconnect();
            stompClient = null;
        }
        const response = await axios.get(
            `http://localhost:8081/api/chat/${chatRoomId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}` // 帶上 token
                }
            }
        );
        // 設定聊天室資訊
        activeChatRoom.value = response.data;

        // 🔴 <span style="color:red;">【修改處】載入歷史訊息 (若需要)</span>
        await loadMessages(chatRoomId);

        // 🔴 <span style="color:red;">【修改處】呼叫 connectWebSocket，建立訂閱</span>
        await connectWebSocket(chatRoomId);

    } catch (error) {
        console.error('聊天室詳情載入失敗:', error);
        Swal.fire("錯誤", error.response?.data?.message || '載入失敗', 'error');
        router.push('/user/login');
    }
}

/**
 * 若需要歷史訊息，可從 /api/chat/{chatRoomId}/messages 取得
 */
async function loadMessages(chatRoomId) {
    try {
        const response = await axios.get(
            `http://localhost:8081/api/chat/${chatRoomId}/messages`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        // 直接替換 store 中 messages
        chatStore.messages = response.data;
    } catch (error) {
        console.error('歷史訊息載入失敗:', error);
    }
}

/**
 * 建立 WebSocket 連線並訂閱聊天室頻道
 */
const connectionStatus = ref('disconnected') // 添加连接状态跟踪

// ChatRoom.vue - 修改 connectWebSocket
async function connectWebSocket(chatRoomId) {
    try {
        // 🔴 断开旧连接
        if (stompClient && stompClient.connected) {
            stompClient.disconnect();
            stompClient = null;
            console.log('旧连接已断开');
        }

        // 🔴 动态获取最新 Token
        const token = sessionStorage.getItem('tempAuthToken') || localStorage.getItem('authToken');
        if (!token) throw new Error('Token 不存在');

        const socket = new SockJS('http://localhost:8081/ws');
        stompClient = Stomp.over(socket);

        // 🔴 添加连接状态追踪
        connectionStatus.value = 'connecting';

        await new Promise((resolve, reject) => {
            stompClient.connect(
                { Authorization: `Bearer ${token}` },
                () => {
                    console.log('STOMP 连接成功');
                    connectionStatus.value = 'connected';
                    resolve();
                },
                (error) => {
                    console.error('STOMP 连接失败', error);
                    connectionStatus.value = 'disconnected';
                    reject(error);
                }
            );
        });

        setupSubscriptions(chatRoomId);
    } catch (error) {
        console.error('WebSocket 连接异常:', error);
        connectionStatus.value = 'disconnected';
        Swal.fire('连接失败', '无法连接到聊天服务器', 'error');
        throw error;
    }
}

// 订阅消息的逻辑
function setupSubscriptions(chatRoomId) {
    // 主消息订阅
    const mainSub = stompClient.subscribe(
        `/topic/chat/${chatRoomId}`,
        (message) => {
            const receivedMessage = JSON.parse(message.body);
            chatStore.removeTempMessage(receivedMessage.id);
            chatStore.addMessage(receivedMessage);
        }
    );

    // 错误订阅
    const errorSub = stompClient.subscribe(
        `/user/${userId.value}/errors`,
        (error) => {
            const errData = JSON.parse(error.body);
            chatStore.updateMessageStatus(errData.messageId, 'failed');
        }
    );

    // 组件卸载时取消订阅
    onUnmounted(() => {
        mainSub.unsubscribe();
        errorSub.unsubscribe();
        if (stompClient) {
            stompClient.disconnect();
        }
    });
}


/**
 * 發送訊息
 */
async function send() {

    if (!newMessage.value.trim()) return;

    // 🌟 实时获取最新 token
    const currentToken = sessionStorage.getItem('tempAuthToken') || localStorage.getItem('authToken');

    const messageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {

        // 🌟 强制更新 axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

        // 🌟 检查连接时使用最新 token
        if (!stompClient?.connected) {
            await connectWebSocket(activeChatRoom.value.chatRoomId);
        }

        // 生成唯一訊息ID
        const tempMessage = {
            id: messageId,
            content: newMessage.value.trim(),
            sender: { userId: userId.value },
            timestamp: new Date().toISOString(),
            _status: 'sending'
        };
        chatStore.addTempMessage(tempMessage);

        // 发送请求
        const response = await axios.post(`/api/chat/${activeChatRoom.value.chatRoomId}/send`, {
            content: newMessage.value.trim(),
            tempId: messageId // 携带临时ID
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        // 处理响应
        if (response.data) {
            // 更新消息状态
            chatStore.updateMessageStatus(messageId, 'sent', {
                id: response.data.id, // 假設後端回傳 id
                timestamp: response.data.createdAt
            });
            newMessage.value = "";
        }
    } catch (error) {
        if (error.message.includes('身份已变更')) {
            Swal.fire({
                title: '会话过期',
                text: '检测到用户切换，请刷新页面',
                icon: 'warning'
            });
        }
    }
}
</script>

<style scoped>
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
</style>
