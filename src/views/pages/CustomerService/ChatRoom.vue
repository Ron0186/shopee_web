<template>
    <div class="chat-room" v-if="activeChatRoom && activeChatRoom.seller">
        <h2>{{ activeChatRoom.seller.username }} 的客服聊天室</h2>
        <div class="messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <strong>{{ msg.sender.username }}：</strong> {{ msg.content }}
            </div>
        </div>
        <input v-model="newMessage" @keyup.enter="send" placeholder="輸入訊息..." />
        <button @click="send">發送</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
import axios from "@/plugins/axios";
import { useChatStore } from '@/stores/chatStore';
const chatStore = useChatStore();

const route = useRoute();
const newMessage = ref("");
let stompClient = null;

// 初始化聊天室
onMounted(async () => {
    const chatRoomId = route.params.chatRoomId;

    // 1. 載入聊天室資訊
    const chatRoomRes = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}`);
    chatStore.activeChatRoom = chatRoomRes.data;

    // 2. 載入歷史訊息
    await chatStore.loadMessages(chatRoomId);

    // 3. 初始化 WebSocket 連接
    const socket = new SockJS('http://localhost:8081/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        // 訂閱即時訊息
        stompClient.subscribe(
            `/topic/chat/${chatRoomId}`,
            (message) => {
                chatStore.messages.push(JSON.parse(message.body));
            }
        );
    }, (error) => {
        console.error('WebSocket 連接錯誤:', error);
        alert('即時聊天連接失敗，請刷新頁面重試');
    });
});

// 組件卸載時斷開連接
onUnmounted(() => {
    if (stompClient) {
        stompClient.disconnect();
    }
});

const send = () => {
    if (newMessage.value.trim() && stompClient) {
        const message = {
            content: newMessage.value,
            chatRoomId: route.params.chatRoomId,
            senderId: chatStore.currentUser.id
        };

        // 發送訊息到後端
        stompClient.send(
            "/app/chat/sendMessage",
            {},
            JSON.stringify(message)
        );

        newMessage.value = '';
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

.messages {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    background: white;
}

.message {
    margin-bottom: 10px;
    padding: 8px;
    background: #e3f2fd;
    border-radius: 5px;
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
</style>