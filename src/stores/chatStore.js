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
        this.isConnecting = false;
    }
    connect(chatRoomId, messageHandler) {
        const socket = new SockJS('http://localhost:8081/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.connect(
            {
                Authorization: `Bearer ${authToken.value}`,
                'X-User-Id': userId.value
            },
            () => {
                // 只訂閱公共頻道
                this.subscribe(`/topic/chat/${chatRoomId}`, messageHandler);
            }
        );
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
    // state
    const currentUser = ref(null);
    const activeChatRoom = ref(null);
    const messages = ref([]);
    const unreadCounts = ref({});

    const authToken = ref(sessionStorage.getItem('authToken'));
    const userStore = useUserStore();
    const router = useRouter();
    const connectionStatus = ref('disconnected');
    const userId = ref(localStorage.getItem('userId'));
    const socketManager = ref({
        stompClient: null,
        subscriptions: new Map(),
        isConnecting: false
    });

    // 新增檢查連線狀態的方法
    function checkConnection() {
        return socketManager.value?.stompClient && socketManager.value.stompClient.connected;
    }

    // 更新已读状态
    const updateReadStatus = (chatRoomId, readerId) => {
        messages.value = messages.value.map(msg => {
            const senderId = msg.sender?.userId || null;
            return {
                ...msg,
                isRead: (msg.chatRoomId === chatRoomId &&
                    senderId !== readerId &&
                    !msg.isRead)
                    ? true
                    : msg.isRead
            };
        });
    };

    const enterSellerChat = async (shopId) => {
        try {
            const response = await axios.get(`/api/chat/seller/enter/${shopId}`);
            if (response.data.chatRoomId) {
                await connectChatRoom(response.data.chatRoomId);
                return true;
            }
            return false;
        } catch (error) {
            handleStoreError(error);
            return false;
        }
    };

    const handleStoreError = (error) => {
        const status = error.response?.status;
        if (status === 403) {
            router.push('/auth-error');
        } else if (status === 404) {
            console.error('聊天室狀態錯誤');
        }
    };

    const fetchCurrentUser = async (uid) => {
        try {
            authToken.value = sessionStorage.getItem('authToken');
            if (!authToken.value) {
                router.push('/user/login');
            }
            const userIdToUse = uid || sessionStorage.getItem('userId');
            const response = await axios.get(`http://localhost:8081/api/user/check/${userIdToUse}`, {
                headers: {
                    Authorization: `Bearer ${authToken.value}`
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
                await fetchCurrentUser();
            }
            const response = await axios.post(
                'http://localhost:8081/api/chat/create',
                { shopId },
                { headers: { Authorization: `Bearer ${authToken.value}` } }
            );
            activeChatRoom.value = response.data;
            await connectChatRoom(response.data.chatRoomId);
        } catch (error) {
            console.error('创建聊天室失败:', error.response?.data?.error || error.message);
        }
    };

    const sendMessage = (content, tempId) => {
        if (!socketManager.value.stompClient?.connected) return;
        socketManager.value.stompClient.send(
            `/app/chat/${activeChatRoom.value.chatRoomId}/send`,
            {},
            JSON.stringify({
                content: content,
                senderId: currentUser.value.userId,
                tempId: tempId
            })
        );
    };

    const fetchUnreadCounts = async (sellerId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/chat/unread?sellerId=${sellerId}`, {
                headers: { Authorization: `Bearer ${authToken.value}` },
            });
            return response.data;
        } catch (error) {
            console.error('未讀計數獲取失敗:', error);
            const cached = localStorage.getItem(`unreadCache_${sellerId}`);
            return cached ? JSON.parse(cached) : {};
        }
    };

    const handleIncomingMessage = (message) => {
        addMessage(message);
    };

    // 將連線與訂閱邏輯放在 store 中，由 connectChatRoom 統一管理
    const setupSubscriptions = (chatRoomId) => {
        try {
            if (socketManager.value.stompClient?.subscriptions) {
                Object.keys(socketManager.value.stompClient.subscriptions).forEach(subId => {
                    socketManager.value.stompClient.unsubscribe(subId);
                });
            }
            // 主頻道訂閱：所有使用者訂閱同一個公共頻道 /topic/chat/{chatRoomId}
            socketManager.value.stompClient.subscribe(
                `/topic/chat/${chatRoomId}`,
                (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    addMessage(receivedMessage);
                },
                { id: `sub-${chatRoomId}-${Date.now()}` }
            );
            // 錯誤訂閱
            socketManager.value.stompClient.subscribe(
                '/user/queue/errors',
                (error) => {
                    const errorData = JSON.parse(error.body);
                    Swal.fire('错误', errorData.message, 'error');
                }
            );
            console.log('订阅成功');
        } catch (error) {
            console.error('订阅失败:', error);
            throw error;
        }
    };

    const connectChatRoom = async (chatRoomId) => {
        try {
            console.log("[connectChatRoom] 開始建立連線，chatRoomId:", chatRoomId);
            if (!socketManager.value) {
                socketManager.value = {
                    stompClient: null,
                    subscriptions: new Map(),
                    isConnecting: false
                };
            }
            if (socketManager.value.isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 500));
                return connectChatRoom(chatRoomId);
            }
            if (socketManager.value.stompClient?.connected) {
                return;
            }
            socketManager.value.isConnecting = true;
            const socket = new SockJS('http://localhost:8081/ws');
            const stompClient = Stomp.over(socket);
            stompClient.heartbeatIncoming = 5000;
            stompClient.heartbeatOutgoing = 5000;
            await new Promise((resolve, reject) => {
                stompClient.connect(
                    {
                        Authorization: `Bearer ${authToken.value}`,
                        'userId': userId.value // 將 'X-User-Id' 修改為 'userId'
                    },
                    () => {
                        socketManager.value.stompClient = stompClient;
                        socketManager.value.isConnecting = false;
                        connectionStatus.value = 'connected';
                        // 連線成功後統一在 store 裡訂閱
                        setupSubscriptions(chatRoomId);
                        resolve();
                    },
                    (error) => {
                        socketManager.value.isConnecting = false;
                        reject(error);
                    }
                );
            });
        } catch (error) {
            socketManager.value.isConnecting = false;
            throw error;
        }
    };

    const tempMessages = ref([]);
    const messageIds = ref(new Set());

    const addMessage = (message) => {
        console.log('[DEBUG] 收到新消息:', message);
        if (!messages.value.some(m => m.id === message.id)) {
            messages.value.push({
                ...message,
                id: message.id || message.messageId,
                timestamp: message.timestamp || message.createdAt
            });
            messages.value = [...messages.value];
            console.log('[DEBUG] 更新後的消息列表:', messages.value);
            messageIds.value.add(message.id);
            localStorage.setItem(`msg-${message.id}`, JSON.stringify(message));
        }
    };

    const syncMessages = () => {
        window.addEventListener('storage', (e) => {
            if (e.key.startsWith('msg-') && e.newValue) {
                const msg = JSON.parse(e.newValue);
                addMessage(msg);
            }
        });
    };
    syncMessages();

    const addTempMessage = (message) => {
        if (!messageIds.value.has(message.id)) {
            tempMessages.value.push({ ...message, _status: 'sending' });
            tempMessages.value = [...tempMessages.value];
            messageIds.value.add(message.id);
        }
    };

    const removeTempMessage = (messageId) => {
        tempMessages.value = tempMessages.value.filter(msg => msg.id !== messageId);
        messageIds.value.delete(messageId);
    };

    const updateMessageStatus = (tempId, newStatus, serverMessage = {}) => {
        const index = tempMessages.value.findIndex(msg => msg.id === tempId);
        if (index !== -1) {
            tempMessages.value[index] = {
                ...tempMessages.value[index],
                _status: newStatus,
                id: serverMessage.id || serverMessage.messageId || tempId,
                timestamp: serverMessage.timestamp || serverMessage.createdAt || new Date().toISOString()
            };
            tempMessages.value = [...tempMessages.value];
        }
    };

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
        updateMessageState,
        enterSellerChat,
        updateReadStatus,
        connectionStatus,
        setupSubscriptions,
        checkConnection // 新增 checkConnection 方法
    };
});
