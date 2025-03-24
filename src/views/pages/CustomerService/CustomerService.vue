<template>
    <div class="chat-container">
        <h2>聊天室</h2>

        <!-- 若還沒拿到 chatRoomId，就顯示載入中... -->
        <div v-if="!chatRoomId">
            <p>載入中，請稍候...</p>
        </div>
        <div v-else>
            <p>聊天室 ID: {{ chatRoomId }}</p>

            <!-- 訊息列表 (歷史 + 新訊息) -->
            <div class="chat-messages" ref="messagesContainer">
                <div v-for="(msg, index) in messages" :key="index" class="message-item">
                    <strong>{{ msg.senderName }}：</strong>
                    <span v-if="msg.messageType === 'TEXT'">
                        {{ msg.messageContent }}
                    </span>
                    <img v-else-if="msg.messageType === 'IMAGE'" :src="msg.messageContent" alt="image"
                        style="max-width: 200px;" />
                    <img v-else-if="msg.messageType === 'STICKER'" :src="msg.messageContent" alt="sticker"
                        style="max-width: 80px;" />
                </div>
            </div>

            <!-- 輸入區 -->
            <div class="chat-input">
                <input v-model="messageContent" type="text" placeholder="輸入文字..." @keyup.enter="sendText" />
                <button @click="sendText">送出文字</button>

                <div style="margin-top: 8px;">
                    <input type="file" accept="image/*" @change="onImageSelected" />
                    <button @click="sendImage" :disabled="!selectedImage">
                        送出圖片
                    </button>
                </div>

                <div style="margin-top: 8px;">
                    <button v-for="sticker in stickers" :key="sticker.id" @click="sendSticker(sticker)">
                        <img :src="sticker.url" alt="sticker" width="40" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'webstomp-client'
import axiosapi from '@/plugins/axios'
import { useRouter } from 'vue-router'

/* --- 響應式變數 --- */

const router = useRouter()
const buyerId = ref(null)
const shopId = ref(null)
const chatRoomId = ref(null)
const messages = ref([])
const messageContent = ref('')
const selectedImage = ref(null)
const messagesContainer = ref(null) // 用於自動捲動
let stompClient = null
const userId = ref(localStorage.getItem("userId")); // 從 localStorage 讀取 userId

/* --- 貼圖列表 (範例) --- */
const stickers = [
    { id: 1, url: '/images/sticker1.png' },
    { id: 2, url: '/images/sticker2.png' },
    { id: 3, url: '/images/sticker3.png' },
]

/* --- 1. 掛載時流程 --- */
onMounted(async () => {
    if (!userId.value) {
        router.push('/user/login')
        return;
    }
    try {
        // (1) 從後端取得 buyerId
        const userRes = await axiosapi.get(`/api/user/check/${userId.value}`)

        buyerId.value = userRes.data.buyerId // 假設後端回傳 { buyerId: 101, username: "小明", ... }

        // (2) 從後端取得 shopId
        const shopRes = await axiosapi.get(`/api/shop/${shopId.value}`)

        shopId.value = shopRes.data.shopId // 假設後端回傳 { shopId: 999, shopName: "賣家商店", ... }

        // (3) 建立或取得聊天室
        await createOrGetChatRoom()

        // (4) 載入歷史訊息
        await loadHistory()

        // (5) 連線 STOMP
        connectStomp()
    } catch (err) {
        console.error('onMounted error:', err)
    }
})

/* --- 2. 建立 / 取得聊天室 --- */
async function createOrGetChatRoom() {
    try {
        const payload = {
            buyerId: buyerId.value,
            shopId: shopId.value,
        }
        const res = await axiosapi.post(`/api/chat/createChatRoom`, payload)
        chatRoomId.value = parseInt(res.data, 10)
    } catch (err) {
        console.error('createOrGetChatRoom error:', err)
    }
}

/* --- 3. 載入歷史訊息 --- */
async function loadHistory() {
    if (!chatRoomId.value) return
    try {
        const res = await axiosapi.get('/api/chat/messages', {
            params: { chatRoomId: chatRoomId.value }
        })
        // 假設後端回傳一個 ChatMessageDTO[] 陣列
        // 例如: [ { messageId, chatRoomId, senderId, senderName, messageType, messageContent, createdAt }, ... ]
        messages.value = res.data.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        )
        await nextTick()
        scrollToBottom()
    } catch (err) {
        console.error('loadHistory error:', err)
    }
}

/* --- 4. 連線 STOMP 並訂閱聊天室 --- */
function connectStomp() {
    const socket = new SockJS('/ws')
    stompClient = Stomp.over(socket, { debug: false })
    stompClient.connect(
        {},
        () => {
            console.log('STOMP connected')
            // 訂閱
            stompClient.subscribe(`/topic/chatroom/${chatRoomId.value}`, (msg) => {
                const payload = JSON.parse(msg.body)
                messages.value.push(payload)
                nextTick(() => scrollToBottom())
            })
        },
        (error) => {
            console.error('STOMP error:', error)
        }
    )
}

/* --- 5. 送出文字訊息 --- */
function sendText() {
    if (!messageContent.value.trim()) return
    const payload = {
        chatRoomId: chatRoomId.value,
        senderId: buyerId.value,
        senderName: '小明', // 或從後端 userData 取
        messageType: 'TEXT',
        messageContent: messageContent.value,
    }
    stompClient.send(`/app/chat/sendMessage`, JSON.stringify(payload))
    messageContent.value = ''
}

/* --- 6. 上傳圖片 & 送出 --- */
function onImageSelected(e) {
    selectedImage.value = e.target.files[0]
}

async function sendImage() {
    if (!selectedImage.value) return
    try {
        // 假設後端提供 /api/chat/upload 來處理圖片上傳
        const formData = new FormData()
        formData.append('file', selectedImage.value)

        const res = await axiosapi.post(`/api/chat/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        // 假設後端回傳圖片 URL (string)
        const fileUrl = res.data

        const payload = {
            chatRoomId: chatRoomId.value,
            senderId: buyerId.value,
            senderName: '小明',
            messageType: 'IMAGE',
            messageContent: fileUrl,
        }
        stompClient.send(`/app/chat/sendMessage`, JSON.stringify(payload))
        selectedImage.value = null
    } catch (err) {
        console.error('sendImage error:', err)
    }
}

/* --- 7. 送出貼圖 --- */
function sendSticker(sticker) {
    const payload = {
        chatRoomId: chatRoomId.value,
        senderId: buyerId.value,
        senderName: '小明',
        messageType: 'STICKER',
        messageContent: sticker.url,
    }
    stompClient.send(`/app/chat/sendMessage`, JSON.stringify(payload))
}

/* --- 8. 自動捲動到底部 --- */
function scrollToBottom() {
    if (!messagesContainer.value) return
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}
</script>

<style scoped>
.chat-container {
    width: 400px;
    margin: 0 auto;
    border: 1px solid #ccc;
    padding: 16px;
}

.chat-messages {
    border: 1px solid #999;
    height: 300px;
    overflow-y: auto;
    padding: 8px;
    margin-bottom: 12px;
}

.message-item {
    margin-bottom: 6px;
}

.chat-input {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
