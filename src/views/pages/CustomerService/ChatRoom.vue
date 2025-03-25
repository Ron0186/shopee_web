<template>
    <div class="chat-room">
        <h2>聊天室</h2>
        <div class="messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <strong>{{ msg.sender }}：</strong> {{ msg.content }}
            </div>
        </div>
        <input v-model="newMessage" placeholder="輸入訊息..." @keyup.enter="sendMessage" />
        <button @click="sendMessage">發送</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
import axios from "@/plugins/axios";

const route = useRoute();
const chatRoomId = route.params.chatRoomId;
const messages = ref([]);
const newMessage = ref("");

let stompClient = null;

onMounted(() => {
    connectWebSocket();
    fetchMessages();
});

onUnmounted(() => {
    if (stompClient) {
        stompClient.disconnect();
    }
});

const connectWebSocket = () => {
    const socket = new SockJS("http://localhost:8081/ws/info");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        // 訂閱聊天室的話題，注意模板字串需要正確
        stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
            // 收到訊息後，將其推送至 messages 中
            messages.value.push(JSON.parse(message.body));
        });
    });
};

const fetchMessages = async () => {
    try {
        const response = await axios.get(`/api/chat/${chatRoomId}/messages`);
        messages.value = response.data;
    } catch (error) {
        console.error("無法載入訊息", error);
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    const message = {
        chatRoomId,
        content: newMessage.value,
    };

    try {
        // 發送訊息到 WebSocket 伺服器
        stompClient.send(`/app/chat/sendMessage`, {}, JSON.stringify(message));
        newMessage.value = "";  // 發送後清空輸入框
    } catch (error) {
        console.error("訊息發送失敗", error);
    }
};
</script>

<style scoped>
.chat-room {
    padding: 20px;
}

.messages {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 10px;
}

.message {
    margin-bottom: 5px;
}
</style>