<template>
    <div class="chat-container">
        <div class="chat-header">
            <h3>{{ chatRoomName }}</h3>
        </div>
        <div class="chat-messages" ref="messageContainer">
            <div v-for="message in messages" :key="message.messageId" class="message">
                <div class="message-sender">{{ message.senderName }}</div>
                <div class="message-content" v-if="message.messageType === 'TEXT'">{{ message.messageContent }}</div>
                <div class="message-content" v-if="message.messageType === 'IMAGE'">
                    <img :src="message.messageContent" alt="Image" />
                </div>
            </div>
        </div>
        <div class="chat-input">
            <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
            <button @click="sendMessage">Send</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';

const chatRoomId = ref(1); // 設置聊天室 ID
const senderId = ref(1);   // 當前使用者 ID
const chatRoomName = ref('Java專題 - 第一組'); // 設置聊天室名稱
const messages = ref([]);
const newMessage = ref('');
let stompClient = null;

const connect = () => {
    const socket = new SockJS('http://localhost:8081/ws'); // 確保 URL 正確
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnect, onError);
};

const onConnect = () => {
    // 訂閱指定聊天室的訊息頻道
    stompClient.subscribe(`/topic/chatroom/${chatRoomId.value}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        messages.value.push(receivedMessage);
        scrollToBottom();
    });
};

const onError = (error) => {
    console.error('WebSocket error:', error);
};

const sendMessage = () => {
    if (newMessage.value.trim() === '') return;

    // 構建要發送的訊息對象
    const message = {
        chatRoomId: chatRoomId.value,
        senderId: senderId.value,
        messageType: 'TEXT', // 根據需要可設為 'IMAGE'
        messageContent: newMessage.value,
    };

    // 發送訊息到後端
    stompClient.send('/app/chat/sendMessage', {}, JSON.stringify(message));
    newMessage.value = ''; // 清空輸入框
};

const scrollToBottom = () => {
    nextTick(() => {
        const messageContainer = document.querySelector('.chat-messages');
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
};

onMounted(() => {
    connect();
});

onBeforeUnmount(() => {
    if (stompClient) {
        stompClient.disconnect();
    }
});
</script>

<style scoped>
.chat-container {
    width: 400px;
    height: 600px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
}

.chat-header {
    padding: 10px;
    background-color: #0044cc;
    color: white;
}

.chat-messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: white;
}

.message {
    margin-bottom: 10px;
}

.message-sender {
    font-weight: bold;
}

.message-content img {
    max-width: 100%;
}

.chat-input {
    display: flex;
    padding: 10px;
    background-color: #efefef;
}

.chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.chat-input button {
    padding: 10px;
    background-color: #0044cc;
    color: white;
    border: none;
    border-radius: 5px;
    margin-left: 10px;
}
</style>
