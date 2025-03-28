<template>
    <div v-if="!activeChatRoom.chatRoomId || checkingExisting" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ loadingText }}</p>
    </div>
    <!-- 修改判断条件为 chatRoomId -->
    <div class="chat-room" v-if="activeChatRoom.chatRoomId">
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
const newMessage = ref("");
const { currentUser } = storeToRefs(chatStore);
let stompClient = null;// WebSocket 相關
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
const messages = computed(() => chatStore.messages);

// 時間格式化函式
const formatTime = (timestamp) => {
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
};

// 新增检查聊天室存在状态
const checkingExisting = ref(false);

const safeMessages = computed(() => messages.value);


onMounted(async () => {

    // 情况1：直接通过 chatRoomId 访问
    if (route.params.chatRoomId) {
        await loadChatRoom(route.params.chatRoomId);
        return;
    }

    // 情况2：通过 shopId 创建/获取聊天室
    if (route.query.shopId) {
        checkingExisting.value = true;
        try {
            const response = await axios.post('/api/chat/create', {
                buyerId: currentUser.value?.userId,
                shopId: route.query.shopId
            });
            // 根据已存在标识判断
            if (response.data.alreadyExists) {
                // 聊天室已存在，直接加载聊天室数据
                await loadChatRoom(response.data.chatRoomId);
            } else {
                // 新创建的聊天室，进行路由替换
                router.replace({
                    path: `/chat/${response.data.chatRoomId}`,
                    query: { from: 'new' }
                });
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
    }
    try {
        if (!chatStore.currentUser) {
            await chatStore.fetchCurrentUser();
        }
    } catch (error) {
        console.error('用户数据加载失败:', error);
        router.push('/user/login');
    }
});

// 新增路由监听
watch(
    () => route.params.chatRoomId,
    async (newChatRoomId, oldChatRoomId) => {
        if (newChatRoomId && newChatRoomId !== oldChatRoomId) {
            // 清空舊訊息，避免前一個聊天室的訊息殘留
            chatStore.messages = []; // 直接操作 store 的 messages


            // 取消舊的 WebSocket 訂閱
            if (stompClient && stompClient.connected) {
                stompClient.unsubscribe(`sub-${oldChatRoomId}`);
            }

            // 重置 activeChatRoom 避免残留旧数据
            activeChatRoom.value = {
                chatRoomId: null,
                seller: {},
                shop: {}
            };
            // 加載新的聊天室
            await loadChatRoom(newChatRoomId);
        }
    },
    { immediate: true } // 初始化时立即执行
);

watch(() => chatStore.messages, (newMessages) => {
    messages.value = newMessages;
}, { deep: true });


// 封装加载聊天室逻辑
async function loadChatRoom(chatRoomId) {
    try {
        const chatRoomRes = await axios.get(`/api/chat/${chatRoomId}`);

        // 验证响应数据格式
        if (!chatRoomRes.data?.chatRoomId) {
            throw new Error("无效的聊天室数据");
        }

        activeChatRoom.value = {
            chatRoomId: chatRoomRes.data.chatRoomId,
            seller: {
                userId: chatRoomRes.data.seller?.userId,
                username: chatRoomRes.data.seller?.username
            },
            shop: chatRoomRes.data.shop ? {
                shopId: chatRoomRes.data.shop.shopId,
                shopName: chatRoomRes.data.shop.shopName
            } : null
        };

        await chatStore.loadMessages(chatRoomId);
        connectWebSocket(chatRoomId);
    } catch (error) {
        Swal.fire("錯誤", "聊天室加載失敗", "error");
        router.push('/user/login');
    }
}


// 增强版WebSocket连接
function connectWebSocket(chatRoomId) {
    const socket = new SockJS('http://localhost:8081/ws');
    stompClient = Stomp.over(socket);

    const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        // 從 Session 屬性中獲取用戶 ID（需前端在連線時設置）
        userId: localStorage.getItem('userId')
    };
    stompClient.connect(headers, () => {
        console.log('WebSocket连接成功');

        const subscription = stompClient.subscribe(
            `/topic/chat/${chatRoomId}`,
            (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("收到訊息:", receivedMessage); // **除錯用，確認 WebSocket 有收到**
                // chatStore.messages.push(receivedMessage);
                chatStore.messages = [...chatStore.messages]; // **強制 Vue 更新**

                // 防止重复添加
                if (!chatStore.messages.some(msg => msg.id === receivedMessage.id)) {
                    // 使用函數式更新確保響應性
                    chatStore.messages.push(receivedMessage);
                }

            },
            { id: `sub-${chatRoomId}` } // 指定订阅ID
        );

        // 组件卸载时取消订阅
        onUnmounted(() => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('WebSocket 已断开');
                });
            }
        });

    }, (error) => {
        console.error("WebSocket连接失败:", error);
        // 5秒后尝试重连
        setTimeout(() => connectWebSocket(chatRoomId), 5000);
    });
}

const send = async () => {
    if (!newMessage.value.trim() || !activeChatRoom.value.chatRoomId) return;

    try {
        // 确保用户已加载且数据完整
        if (!currentUser.value?.userId) {
            Swal.fire("錯誤", "請先登入", "error");
            return router.push('/user/login');
        }


        // 构建消息对象（需匹配后端 ChatMessageDTO）
        const message = {
            chatRoomId: activeChatRoom.value.chatRoomId,
            content: newMessage.value.trim(),
            senderName: currentUser.value.username, // 发送 senderName
            sender: {
                userId: currentUser.value.userId,

            },
            timestamp: new Date().toISOString() // 手動加上時間
        };
        console.log("Sending message:", message); // 用於除錯
        console.log("currentUser:", currentUser.value);
        // 添加到本地消息列表
        chatStore.addMessage({
            ...message,
            id: `temp-${Date.now()}`  // 添加临时唯一ID
        });

        // 通过 STOMP 发送消息到后端（路径对应 @MessageMapping("/send"）
        if (stompClient && stompClient.connected) {
            stompClient.send(
                "/app/send", // 目标路径（Spring 的 MessageMapping 前缀为 /app）
                {},
                JSON.stringify(message)
            );
            // ✅ **手動將訊息推入 `messages`，確保畫面即時更新**
            chatStore.addMessage(message);
            // 清空输入框
            newMessage.value = "";
        } else {
            throw new Error("WebSocket 未连接");
        }
    } catch (error) {
        console.error("消息发送失败:", error);
        Swal.fire({
            title: "錯誤",
            text: "訊息發送失敗，請檢查網路連接",
            icon: "error"
        });
    }
};
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
    /* 调整最大宽度 */

}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    /* 调整对齐方式 */
    margin-bottom: 4px;
}

.username {
    order: 2;
    /* 用户名在右側 */
    color: #2c3e50;
    font-weight: 600;
}

.timestamp {
    order: 1;
    /* 時間在左側 */
    font-size: 0.75rem;
    color: #666;
}

.message-content {
    color: #34495e;
    word-break: break-word;
    font-size: 0.9rem;
}

/* 自己訊息的特別樣式 */
.my-message .message-header {
    flex-direction: row-reverse;
}

.my-message .username {
    color: #27ae60;
}

.my-message .timestamp {
    color: #7f8c8d;
}

/* 新增加载动画样式 */
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