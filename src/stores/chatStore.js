import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';

class SocketManager {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }
    connect(chatRoomId, userId, messageHandler) {
        const socket = new SockJS('http://localhost:8081/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.connect({}, () => {
            this.subscribe(`/topic/chat/${chatRoomId}`, messageHandler);
            this.subscribe(`/user/${userId}/queue/notifications`, this.handleNotification);
        });
    }
    subscribe(destination, callback) {
        const sub = this.stompClient.subscribe(destination, (message) => {
            callback(JSON.parse(message.body));
        });
        this.subscriptions.set(destination, sub);
    }
    disconnect() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.stompClient?.disconnect();
    }
}

export const useChatStore = defineStore('chat', () => {
    const currentUser = ref(null);
    const activeChatRoom = ref(null);
    const messages = ref([]);
    const unreadCounts = ref({});
    const stompClient = ref(null);
    const socketManager = ref(new SocketManager());

    const connectWebSocket = (userId) => {
        const socket = new SockJS('http://localhost:8081/ws');
        stompClient.value = new Stomp.Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            onConnect: () => {
                // 订阅聊天室訊息
                stompClient.value.subscribe(
                    `/topic/chat/${activeChatRoom.value.chatRoomId}`,
                    (message) => {
                        const newMessage = JSON.parse(message.body);
                        messages.value.push(newMessage);
                    }
                );
                // 订阅賣家通知頻道
                stompClient.value.subscribe(
                    `/user/${userId}/queue/notifications`,
                    (notification) => {
                        const data = JSON.parse(notification.body);
                        unreadCounts.value[data.chatRoomId] = data.unreadCount;
                    }
                );
            },
        });
        stompClient.value.activate();
    };

    const createOrJoinChatRoom = async (shopId) => {
        try {
            const response = await axios.post(
                '/api/chat/create',
                { shopId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            activeChatRoom.value = response.data;
            connectWebSocket(currentUser.value.userId);
        } catch (error) {
            console.error('创建聊天室失败:', error.response?.data?.error || error.message);
        }
    };

    const sendMessage = (content) => {
        if (!stompClient.value?.connected) return;
        stompClient.value.publish({
            destination: '/app/send',
            body: JSON.stringify({
                chatRoomId: activeChatRoom.value.chatRoomId,
                content,
            }),
        });
    };

    const fetchUnreadCounts = async (sellerId) => {
        const response = await axios.get(`/api/chat/unread?sellerId=${sellerId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        unreadCounts.value = response.data;
    };

    // 🔴 修改訊息處理邏輯：避免重複添加訊息
    const handleIncomingMessage = (message) => {
        if (!messages.value.some(m => m.messageId === message.messageId)) {
            messages.value.push(message);
        }
    };

    const connectChatRoom = (chatRoomId) => {
        // 此處使用 socketManager 連線
        socketManager.value.connect(
            chatRoomId,
            currentUser.value.userId,
            handleIncomingMessage
        );
    };

    return {
        currentUser,
        activeChatRoom,
        messages,
        unreadCounts,
        createOrJoinChatRoom,
        sendMessage,
        fetchUnreadCounts,
        connectChatRoom,
        socketManager
    };
});
