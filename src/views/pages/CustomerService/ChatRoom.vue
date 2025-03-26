<template>
    <div class="chat-room">
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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
// import SockJS from "sockjs-client/dist/sockjs";
// import Stomp from "stompjs";
import axios from "@/plugins/axios";
import { useChatStore } from '@/stores/chatStore';
const chatStore = useChatStore();

const route = useRoute();
// const chatRoomId = route.params.chatRoomId;

const newMessage = ref("");




// 初始化聊天室
onMounted(async () => {
    const chatRoomId = route.params.chatRoomId;

    // 1. 載入聊天室資訊
    const chatRoomRes = await axios.get(`http://localhost:8081/api/chat/${chatRoomId}`);
    chatStore.activeChatRoom = chatRoomRes.data;

    // 2. 載入歷史訊息
    await chatStore.loadMessages(chatRoomId);

    // 3. 訂閱即時訊息
    chatStore.stompClient.subscribe(
        `/topic/chat/${chatRoomId}`,
        (message) => {
            chatStore.messages.push(JSON.parse(message.body));
        }
    );
});

const send = () => {
    if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = '';
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