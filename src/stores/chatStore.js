import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';
import { useUserStore } from './user';
import { useRouter } from 'vue-router';

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
    // 修改：統一從 sessionStorage 讀取 'authToken'
    const authToken = ref(sessionStorage.getItem('authToken'));
    const userStore = useUserStore();
    const router = useRouter();

    const connectWebSocket = () => {
        const socket = new SockJS('http://localhost:8081/ws');
        stompClient.value = new Stomp.Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${authToken.value}` },
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
                    `/user/${currentUser.value.userId}/queue/notifications`,
                    (notification) => {
                        const data = JSON.parse(notification.body);
                        unreadCounts.value[data.chatRoomId] = data.unreadCount;
                    }
                );
            },
        });
        stompClient.value.activate();
    };

    // 修改 fetchCurrentUser：當 userId 未傳入時，從 localStorage 取得 userId
    const fetchCurrentUser = async (userId) => {
        try {
            // 檢查 Token 是否存在且有效
            const currentToken = sessionStorage.getItem('authToken');
            if (!currentToken) {
                // 跳轉到登入頁面
                router.push('/login');
            }

            const uid = userId || sessionStorage.getItem('userId');
            const response = await axios.get(`http://localhost:8081/api/user/check/${uid}`, {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            });
            currentUser.value = response.data;
        } catch (error) {
            console.error('獲取用戶失敗', error);
            userStore.clearUserData();
            router.push('/user/login');
        }
    };

    const createOrJoinChatRoom = async (shopId) => {
        try {
            if (!currentUser.value) {
                await fetchCurrentUser(); // 確保用戶已載入
            }
            const response = await axios.post(
                'http://localhost:8081/api/chat/create',
                { shopId },
                { headers: { Authorization: `Bearer ${authToken.value}` } }
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
        const response = await axios.get(`http://localhost:8081/api/chat/unread?sellerId=${sellerId}`, {
            headers: { Authorization: `Bearer ${authToken.value}` },
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

    const tempMessages = ref([]);
    // 使用 Set 数据结构存储消息ID避免重复
    const messageIds = ref(new Set());

    const addMessage = (message) => {
        if (!messageIds.value.has(message.id)) {
            messages.value.push(message);
            messageIds.value.add(message.id);
        }
    };

    const addTempMessage = (message) => {
        if (!messageIds.value.has(message.id)) {
            tempMessages.value.push({ ...message, _status: 'sending' });
            messageIds.value.add(message.id);
        }
    };

    const removeTempMessage = (messageId) => {
        tempMessages.value = tempMessages.value.filter(msg => msg.id !== messageId);
        messageIds.value.delete(messageId);
    };

    // 新增消息状态更新方法
    const updateMessageStatus = (tempId, newStatus, serverMessage = {}) => {
        const index = tempMessages.value.findIndex(msg => msg.id === tempId);
        if (index !== -1) {
            // 合併伺服器返回的正式消息資料
            tempMessages.value[index] = {
                ...tempMessages.value[index],
                _status: newStatus,
                id: serverMessage?.id || serverMessage?.messageId || tempId,
                timestamp: serverMessage?.timestamp || serverMessage?.createdAt || new Date().toISOString()
            };
        }
    };

    // 合併正式訊息與臨時訊息
    const displayMessages = computed(() => {
        const finalMessages = [...messages.value];

        tempMessages.value.forEach(temp => {
            if (!finalMessages.some(m => m.id === temp.id)) {
                finalMessages.push(temp);
            }
        });

        return finalMessages.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    });

    const messageState = ref({
        pending: new Map(),
        sent: new Map(),
        failed: new Map()
    });

    const updateMessageState = (tempId, status, payload) => {
        messageState.value[status].set(tempId, payload);
        messageState.value.pending.delete(tempId);
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
        socketManager,
        fetchCurrentUser,
        addTempMessage,
        removeTempMessage,
        displayMessages,
        addMessage,
        updateMessageStatus,
        messageState,
        updateMessageState
    };
});
