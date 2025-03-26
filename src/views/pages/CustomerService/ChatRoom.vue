<template>
    <div class="chat-room" v-if="activeChatRoom.seller?.userId">
        <!-- 優先顯示店鋪名，沒有則顯示賣家名 -->
        <h2>{{ activeChatRoom.seller?.shopName || activeChatRoom.seller?.username }}的客服聊天室</h2>

        <div class="messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <strong>{{ msg.sender?.username || '匿名' }}：</strong> {{ msg.content }}
            </div>
        </div>

        <div class="input-area">
            <input v-model="newMessage" @keyup.enter="send" placeholder="輸入訊息..." />
            <button @click="send">發送</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
import axios from "@/plugins/axios";
import { useChatStore } from '@/stores/chatStore';
import Swal from 'sweetalert2';

const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();
const newMessage = ref("");
const messages = computed(() => chatStore.messages);
let stompClient = null;
const activeChatRoom = ref({
    seller: {
        username: "加载中...",
        userId: null
    },
    shopDTO: {
        shopName: "加载中...",
        shopId: null
    },
    chatRoomId: null,
    success: false
});



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
                userId: chatRoomRes.data.seller.userId,
                username: chatRoomRes.data.seller.username,
                shopName: chatRoomRes.data.seller.shopName || '個人賣家'
            },
            shop: chatRoomRes.data.shop || null,

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

    if (!chatStore.currentUser?.id) {
        Swal.fire({
            title: "提示",
            text: "請先登入後再發送訊息",
            icon: "warning"
        }).then(() => {
            router.push("/user/login");
        });
        return;
    }

    if (stompClient) {
        const message = {
            content: newMessage.value,
            chatRoomEntity: { chatRoomId: route.params.chatRoomId }, // 傳送聊天室 ID
            sender: { id: chatStore.currentUser.id } // 傳送發送者 ID
        };

        // 將訊息先加入本地顯示，避免伺服器回傳有延遲
        chatStore.messages.push({
            id: Date.now(),  // 用 timestamp 作為暫時的 id
            content: newMessage.value,
            sender: {
                username: chatStore.currentUser.name  // 假設 currentUser 有 name 欄位
            }
        });

        stompClient.send(
            "/app/chat/sendMessage",
            {},
            JSON.stringify(message)
        );

        newMessage.value = '';
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