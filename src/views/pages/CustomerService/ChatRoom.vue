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
import { useChatStore } from '@/stores/chatStore';
const chatStore = useChatStore();

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
    const socket = new SockJS("http://localhost:8081/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({},
        () => {
            stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
                const parsedMessage = JSON.parse(message.body);
                // 添加伺服器返回的訊息
                messages.value.push({
                    id: parsedMessage.id,      // 假設後端返回唯一 ID
                    sender: parsedMessage.sender || '用戶',  // 後端需提供發送者
                    content: parsedMessage.content
                });
            });
        },
        (error) => {
            console.error("連接失敗:", error);
        }
    );
};

const fetchMessages = async () => {
    try {
        const response = await axios.get(`/api/chat/${chatRoomId}/messages`);
        // 強制確保 response.data 是陣列
        if (Array.isArray(response.data)) {
            messages.value = response.data;
        } else {
            console.error("後端回傳資料格式錯誤，預期為陣列:", response.data);
            messages.value = []; // 回退為空陣列
        }
    } catch (error) {
        console.error("無法載入訊息", error);
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    // 確保 messages.value 是陣列
    if (!Array.isArray(messages.value)) {
        console.error("messages.value 不是陣列，當前值為:", messages.value);
        messages.value = []; // 強制重置為陣列
    }

    // 暫存新訊息
    const tempMessage = {
        id: Date.now(), // 臨時唯一 ID
        sender: "我",
        content: newMessage.value
    };

    // 使用解構賦值確保響應式更新
    messages.value = [...messages.value, tempMessage];
    newMessage.value = "";

    // 發送至後端
    try {
        stompClient.send("/app/chat/sendMessage", {}, JSON.stringify({
            chatRoomId,
            content: tempMessage.content
        }));
    } catch (error) {
        console.error("訊息發送失敗", error);
        // 可選：移除臨時訊息
        messages.value = messages.value.filter(msg => msg.id !== tempMessage.id);
    };
    chatStore.addMessage(chatRoomId, tempMessage);

};
// 初始化時從全局狀態讀取訊息
onMounted(() => {
    if (chatStore.activeMessages[chatRoomId]) {
        messages.value = chatStore.activeMessages[chatRoomId];
    } else {
        fetchMessages(); // 從 API 獲取並存入全局狀態
    }
});
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