import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';
import { useUserStore } from './user';
import { useRouter } from 'vue-router';

class SocketManager {

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
    const currentUser = ref(null);
    const activeChatRoom = ref(null);
    const messages = ref([]);
    const unreadCounts = ref({});
    const stompClient = ref(null);

    // 統一從 sessionStorage 讀取 'authToken'
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

    // 新增消息已读状态更新方法
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
            // 此處請依專案實際狀況調整錯誤處理
            console.error('聊天室狀態錯誤');
        }
    };

    // 當 userId 未傳入時，從 localStorage 取得 userId
    const fetchCurrentUser = async (userId) => {
        try {
            authToken.value = sessionStorage.getItem('authToken');
            if (!authToken) {
                router.push('/user/login');
            }
            const uid = userId || sessionStorage.getItem('userId');
            const response = await axios.get(`http://localhost:8081/api/user/check/${uid}`, {
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
                await fetchCurrentUser(); // 確保用戶已載入
            }
            const response = await axios.post(
                'http://localhost:8081/api/chat/create',
                { shopId },
                { headers: { Authorization: `Bearer ${authToken.value}` } }
            );
            activeChatRoom.value = response.data;
            connectChatRoom(response.data.chatRoomId);
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
                tempId: tempId // 傳遞臨時ID供伺服器回傳確認
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

    // 修改訊息處理邏輯：避免重複添加訊息
    const handleIncomingMessage = (message) => {
        // 改用 addMessage 方法處理訊息，確保統一更新
        addMessage(message);
    };

    const setupSubscriptions = (chatRoomId) => {
        try {
            // 1. 清理旧订阅
            if (socketManager.value.stompClient?.subscriptions) {
                Object.keys(socketManager.value.stompClient.subscriptions).forEach(subId => {
                    socketManager.value.stompClient.unsubscribe(subId);
                });
            }

            // 2. 订阅主聊天室频道
            const mainSubscription = socketManager.value.stompClient.subscribe(
                `/topic/chat/${chatRoomId}`,
                (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    addMessage(receivedMessage); // 使用 store 的 addMessage 方法
                },
                { id: `sub-${chatRoomId}-${Date.now()}` } // 动态生成唯一ID
            );

            // 3. 订阅错误频道
            const errorSubscription = socketManager.value.stompClient.subscribe(
                '/user/queue/errors',
                (error) => {
                    const errorData = JSON.parse(error.body);
                    Swal.fire('错误', errorData.message, 'error');
                }
            );

            console.log('订阅成功:', {
                main: mainSubscription.id,
                error: errorSubscription.id
            });

        } catch (error) {
            console.error('订阅失败:', error);
            throw error;
        }
    };



    // stores/chatStore.js
    const connectChatRoom = async (chatRoomId) => {
        try {
            // 强制初始化（双重验证）
            if (!socketManager.value) {
                socketManager.value = {
                    stompClient: null,
                    subscriptions: new Map(),
                    isConnecting: false
                };
            }

            // 如果正在连接中则等待
            if (socketManager.value.isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 500));
                return connectChatRoom(chatRoomId);
            }

            // 如果已连接则直接返回
            if (socketManager.value.stompClient?.connected) {
                return;
            }

            socketManager.value.isConnecting = true;

            const socket = new SockJS('http://localhost:8081/ws');
            const stompClient = Stomp.over(socket);

            // 添加心跳配置
            stompClient.heartbeatIncoming = 5000;
            stompClient.heartbeatOutgoing = 5000;

            await new Promise((resolve, reject) => {
                stompClient.connect(
                    {
                        Authorization: `Bearer ${authToken.value}`,
                        'X-User-Id': userId.value
                    },
                    () => {
                        socketManager.value.stompClient = stompClient;
                        socketManager.value.isConnecting = false;
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
    // 使用 Set 存儲訊息ID避免重複
    const messageIds = ref(new Set());

    // 新增正式訊息方法：更新 messages 並強制觸發響應式更新
    const addMessage = (message) => {
        console.log('[DEBUG] 收到新消息:', message); // 添加日誌
        // 避免重複
        if (!messages.value.some(m => m.id === message.id)) {
            messages.value.push({
                ...message,
                // 確保字段名稱與後端一致
                id: message.id || message.messageId, // 兼容不同命名
                timestamp: message.timestamp || message.createdAt // 兼容不同時間字段
            });
            messages.value = [...messages.value];
            console.log('[DEBUG] 更新後的消息列表:', messages.value); // 添加日誌
            messageIds.value.add(message.id);
            localStorage.setItem(`msg-${message.id}`, JSON.stringify(message));
        }
    };

    // 新增跨標籤頁同步方法
    const syncMessages = () => {
        window.addEventListener('storage', (e) => {
            if (e.key.startsWith('msg-') && e.newValue) {
                const msg = JSON.parse(e.newValue);
                addMessage(msg);
            }
        });
    };
    syncMessages();

    // 新增臨時訊息：用於本地先行顯示
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

    // 更新臨時訊息為正式訊息或更新狀態後，同樣重設陣列
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

    // 合併正式訊息與臨時訊息，並根據 timestamp 排序
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
        setupSubscriptions
    };
});