<template>
    <div class="chat-room" v-if="activeChatRoom.seller?.userId">
        <!-- 優先顯示店鋪名，沒有則顯示賣家名 -->
        <h2>{{ activeChatRoom.seller?.shopName || activeChatRoom.seller?.username }}的客服聊天室</h2>

        <div class="messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <!-- 顯示實際發送者 -->
                <div :class="['message-container', { 'my-message': msg.sender.userId === currentUser.userId }]">
                    <div class="message-header">
                        <small class="timestamp">{{ formatTime(msg.timestamp) }}</small>
                        <strong class="username">{{ msg.sender.username }}</strong>
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
import { ref, onMounted, onUnmounted } from "vue";
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
const { currentUser, messages } = storeToRefs(chatStore);
let stompClient = null;// WebSocket 相關
const activeChatRoom = ref({
    id: null,
    seller: {
        userId: null,
        username: null,
        shopName: null
    }
});

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

// 初始化聊天室
onMounted(async () => {
    try {
        const chatRoomId = route.params.chatRoomId;
        console.log("載入聊天室 ID:", chatRoomId);

        // 1. 取得聊天室資訊
        const chatRoomRes = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}`);

        console.log("後端返回數據:", chatRoomRes.data);

        // 更新數據，優先使用 seller 資訊
        activeChatRoom.value = {
            chatRoomId: chatRoomRes.data.chatRoomId,  // 使用 chatRoomRes 代替 response
            seller: {
                userId: chatRoomRes.data.seller?.userId,
                username: chatRoomRes.data.seller?.username,
                shopName: chatRoomRes.data.seller?.shopName || '個人賣家'
            },

        };

        // 2. 確保數據完整性
        if (!activeChatRoom.value.seller?.userId) {
            throw new Error("聊天室賣家資訊不完整");
        }

        console.log("聊天室資訊:", activeChatRoom.value);

        // 3. 載入歷史訊息
        await chatStore.loadMessages(chatRoomId);
        console.log("歷史訊息:", messages.value);

        // 4. 初始化 WebSocket 連線
        const socket = new SockJS('http://localhost:8081/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            console.log("WebSocket 連線成功");

            stompClient.subscribe(
                `/topic/chat/${chatRoomId}`,
                (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    console.log("收到訊息:", receivedMessage);
                    chatStore.messages.push(receivedMessage);
                }
            );
        }, (error) => {
            console.error("WebSocket 連接失敗:", error);
            Swal.fire("錯誤", "即時聊天連接失敗，請刷新頁面重試", "error");
        });

    } catch (error) {
        console.error("載入聊天室時發生錯誤:", error);
        Swal.fire({
            title: "錯誤",
            text: error.message || "聊天室加載失敗，請稍後重試",
            icon: "error"
        });
        router.push('/user/login'); // 返回首頁
    }
});



const send = () => {
    if (!newMessage.value.trim()) return;
    console.log("currentUser =", chatStore.currentUser);
    if (!currentUser.value?.id) {
        Swal.fire({
            title: "提示",
            text: "請先登入後再發送訊息",
            icon: "warning"
        }).then(() => {
            router.push("/user/login");
        });
        return;
    }

    const { userId, username } = currentUser.value;
    const chatRoomId = route.params.chatRoomId;
    const message = {
        content: newMessage.value,
        chatRoomId,
        sender: { userId, username }, // 明確字段映射
        timestamp: new Date().toISOString()
    };
    // 本地快取訊息使用深拷貝
    chatStore.messages.push({
        ...message,
        id: Date.now(),
    });
    if (stompClient) {
        stompClient.send("/app/chat/send", {}, JSON.stringify(message));
        newMessage.value = "";
    }
    // 格式化時間
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }




    if (!chatStore.currentUser?.id) {
        Swal.fire("請先登入", "需要登入才能發送訊息", "warning");
        return router.push("/login");
    }


};



// 組件卸載時斷開連接
onUnmounted(() => {
    if (stompClient) {
        stompClient.disconnect();
    }
});
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
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
</style>