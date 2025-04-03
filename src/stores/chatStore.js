import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';
import { useUserStore } from './user';
import { storeToRefs } from 'pinia'; // 引入 storeToRefs
import Swal from "sweetalert2";




export const useChatStore = defineStore('chat', () => {
    // state
    const userStore = useUserStore();
    const { userId, username, isSeller } = storeToRefs(userStore);
    // --- 新狀態：存儲對話列表 ---
    const conversations = ref([]); // 替換/補充舊的 stores
    const isLoadingConversations = ref(false); // 替換/補充 isLoadingStores
    const activeChatRoom = ref(null);
    const messages = ref([]);
    const connectionStatus = ref('disconnected');
    const socketManager = ref({   // WebSocket 管理物件
        stompClient: null,
        subscriptions: new Map(), // 儲存訂閱物件 (key: destination, value: subscription)
        isConnecting: false
    });

    const displayMessages = computed(() => {
        // 直接使用 messages.value，因為 addMessage 已經處理了所有狀態
        // 確保 addMessage 內部維持了排序，或者在這裡排序
        return [...messages.value].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
        // 如果 addMessage 能保證順序，甚至可以更簡單：
        // return messages.value;
    });


    const currentUser = ref(null);
    const unreadCounts = ref({});

    const authToken = ref(sessionStorage.getItem('authToken'));

    // --- 獲取 Token 的輔助函數 ---
    function getCurrentAuthToken() {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            console.error("[ChatStore] 缺少 Auth Token。");
            // 可以考慮拋出錯誤或導向登入
        }
        return token;
    }

    // --- >>> 新 Action：獲取賣家對話列表 <<< ---
    async function fetchSellerConversations() {
        // 只在賣家登入時執行
        if (!isSeller.value || !userId.value) {
            console.log("[ChatStore] 非賣家或未登入，不載入對話列表。");
            conversations.value = []; // 清空列表
            return;
        }

        isLoadingConversations.value = true;
        console.log("[ChatStore] 載入賣家對話列表 for sellerId:", userId.value);
        const currentAuthToken = sessionStorage.getItem('authToken'); // 獲取當前 Token
        if (!currentAuthToken) {
            console.error("[ChatStore] 缺少 Auth Token，無法載入對話列表。");
            isLoadingConversations.value = false;
            conversations.value = [];
            // 可以考慮彈出提示或導向登入
            return;
        }

        try {
            const response = await axios.get('/api/chat/seller/conversations', {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            // 後端應返回 List<ConversationDTO>
            conversations.value = response.data || [];
            console.log("[ChatStore] 賣家對話列表 API 回應:", conversations.value);
        } catch (error) {
            console.error('[ChatStore] 載入賣家對話列表失敗:', error);
            conversations.value = []; // 清空以表示錯誤
            if (error.response) {
                console.error("錯誤狀態碼:", error.response.status);
                console.error("錯誤回應數據:", error.response.data);
            }
            // Swal.fire("錯誤", "無法載入對話列表", "error"); // 可以在組件層提示
        } finally {
            isLoadingConversations.value = false;
        }
    }
    // --- >>> 新 Action 結束 <<< ---

    // --- >>> 新增 Action：獲取買家對話列表 <<< ---
    async function fetchBuyerConversations() {
        if (isSeller.value || !userId.value) return; // 身份檢查 (確保是買家且已登入)
        isLoadingConversations.value = true;
        console.log("[ChatStore] 載入買家對話列表 for buyerId:", userId.value);
        const currentAuthToken = getCurrentAuthToken();
        if (!currentAuthToken) {
            isLoadingConversations.value = false;
            conversations.value = [];
            return;
        }
        try {
            // *** 調用為買家設計的新 API ***
            const response = await axios.get('/api/chat/buyer/conversations', {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            // 後端應返回 List<ConversationDTO> 或類似結構
            conversations.value = response.data || [];
            console.log("[ChatStore] 買家對話列表 API 回應:", conversations.value);
        } catch (error) {
            console.error('[ChatStore] 載入買家對話列表失敗:', error);
            conversations.value = [];
        } finally {
            isLoadingConversations.value = false;
        }
    }
    // --- >>> 新增 Action 結束 <<< ---


    /**
       * 根據 WebSocket 推送更新 conversations 列表中的未讀計數
       * @param {Object} unreadDataMap - 從後端收到的數據，格式需要確認 (可能是 { chatRoomId: count } ?)
       */
    function updateUnreadCounts(unreadDataMap) {
        // *** 注意：這裡假設 unreadDataMap 的 key 是 chatRoomId ***
        // *** 您需要確認後端 /queue/unread-update 推送的數據格式 ***
        console.log("[ChatStore] 收到 WebSocket 未讀數更新:", unreadDataMap);
        if (!unreadDataMap || typeof unreadDataMap !== 'object') {
            console.warn("[ChatStore] 收到的未讀數更新格式不正確，已忽略。");
            return;
        }

        let changed = false;
        conversations.value = conversations.value.map(conv => {
            const chatRoomId = conv.chatRoomId;
            // 檢查是否有此 chatRoomId 的更新
            const newCount = unreadDataMap[chatRoomId] !== undefined
                ? Number(unreadDataMap[chatRoomId])
                : (unreadDataMap[String(chatRoomId)] !== undefined
                    ? Number(unreadDataMap[String(chatRoomId)])
                    : undefined);

            if (newCount !== undefined && !isNaN(newCount) && conv.unreadCount !== newCount) {
                console.log(`[ChatStore] Conversation 更新: ChatRoom ID ${chatRoomId} 未讀數從 ${conv.unreadCount} 改為 ${newCount}`);
                changed = true;
                return { ...conv, unreadCount: newCount }; // 更新未讀數
            }
            return conv; // 保持不變
        });

        if (changed) {
            console.log("[ChatStore] 應用 WebSocket 更新後的 conversations 狀態:", JSON.stringify(conversations.value));
            // 按需重新排序 (如果排序依賴未讀數)
            conversations.value.sort((a, b) =>
                (b.lastMessageTimestamp || b.lastActiveAt || '1970') > (a.lastMessageTimestamp || a.lastActiveAt || '1970') ? 1 : -1
            );
        } else {
            console.log("[ChatStore] WebSocket 更新未導致 conversations 狀態變化。");
        }
    }
    // --- ---

    /**
         * 建立 WebSocket 連接並設定應用級訂閱 (應在登入後呼叫一次)
         */
    async function connectWebSocket() {
        const currentUserId = userStore.userId; // 從 userStore 獲取響應式 ref 的值
        const currentAuthToken = sessionStorage.getItem('authToken'); // 獲取 token

        if (!currentUserId) {
            console.error("[ChatStore] 無法連接 WebSocket：缺少 User ID。");
            reject(new Error("缺少 User ID")); // 在 Promise 中 reject
            return; // 停止執行
        }
        if (!currentAuthToken) {
            console.error("[ChatStore] 無法連接 WebSocket：缺少 Auth Token。");
            reject(new Error("缺少 Auth Token")); // 在 Promise 中 reject
            return; // 停止執行
        }
        // 防止重複連接或未登入時連接
        if (!userId.value || socketManager.value.stompClient?.connected || socketManager.value.isConnecting) {
            console.log(`[ChatStore] 跳過 WebSocket 連接 (userId: ${userId.value}, connected: ${socketManager.value.stompClient?.connected}, connecting: ${socketManager.value.isConnecting})`);
            return;
        }

        socketManager.value.isConnecting = true;
        connectionStatus.value = 'connecting';
        console.log(`[ChatStore] 嘗試建立 WebSocket 連接 for user: ${username.value} (ID: ${userId.value})`);

        const socket = new SockJS('http://localhost:8081/ws'); // 後端 WebSocket 端點
        const stompClient = Stomp.over(socket);
        // stompClient.debug = null; // 在生產環境關閉除錯訊息

        try {
            await new Promise((resolve, reject) => {
                // *** 從 sessionStorage 獲取最新的 Token ***
                const currentAuthToken = sessionStorage.getItem('authToken');
                if (!currentAuthToken) {
                    reject(new Error("無法連接 WebSocket: 未找到 authToken"));
                    return;
                }

                stompClient.connect(
                    { // STOMP Headers
                        // 通常 Token 和 UserId 由後端從 Security Context 或 Session Attributes 獲取
                        'Authorization': `Bearer ${currentAuthToken}`, // 如果後端需要 Header 驗證
                        'userId': String(currentUserId) // 如果後端需要 Header 傳遞 ID
                    },
                    (frame) => { // 連接成功回調
                        console.log('[ChatStore] WebSocket 連接成功:', frame);
                        socketManager.value.stompClient = stompClient;
                        socketManager.value.isConnecting = false;
                        connectionStatus.value = 'connected';
                        // 設定應用級別的訂閱（錯誤、未讀數等）
                        setupAppSubscriptions();
                        resolve();
                    },
                    (error) => { // 連接失敗回調
                        console.error('[ChatStore] WebSocket 連接失敗:', error);
                        socketManager.value.stompClient = null;
                        socketManager.value.isConnecting = false;
                        connectionStatus.value = 'disconnected';
                        // 可以在這裡加入重試邏輯
                        reject(error);
                    }
                );
            });
        } catch (error) {
            socketManager.value.isConnecting = false;
            connectionStatus.value = 'disconnected';
            console.error("[ChatStore] WebSocket connect Promise 失敗:", error);
        }
    }

    /**
     * 斷開 WebSocket 連接
     */
    function disconnectWebSocket() {
        if (socketManager.value.stompClient?.connected) {
            console.log("[ChatStore] 正在斷開 WebSocket 連接。");
            // 先取消所有訂閱
            socketManager.value.subscriptions.forEach((sub, key) => {
                try {
                    sub.unsubscribe();
                    console.log(`[ChatStore] 已取消訂閱: ${key}`);
                } catch (e) { console.warn(`[ChatStore] 取消訂閱 ${key} 失敗`, e); }
            });
            socketManager.value.subscriptions.clear(); // 清空 Map
            // 執行斷開連接
            socketManager.value.stompClient.disconnect(() => {
                console.log("[ChatStore] WebSocket 已斷開。");
                connectionStatus.value = 'disconnected';
                socketManager.value.stompClient = null; // 清理 stompClient
            });
        } else {
            console.log("[ChatStore] WebSocket 未連接，無需斷開。");
            // 確保狀態乾淨
            connectionStatus.value = 'disconnected';
            socketManager.value.stompClient = null;
            socketManager.value.subscriptions.clear();
        }
    }



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
                        Authorization: `Bearer ${sessionStorage.getItem('authToken')}`, // 從 sessionStorage 讀取最新的
                        'userId': userStore.userId // 傳遞當前用戶 ID
                    },
                    (frame) => { // Connect Callback
                        console.log('WebSocket 連接成功:', frame);
                        socketManager.value.stompClient = stompClient;
                        socketManager.value.isConnecting = false;
                        connectionStatus.value = 'connected';

                        // --- 連接成功後，設定應用級別的訂閱 ---
                        setupAppSubscriptions(); // 訂閱錯誤和未讀數更新

                        // --- 再訂閱聊天室本身的主題 ---
                        setupChatRoomSpecificSubscription(chatRoomId); // 訂閱 /topic/chat/{id}

                        // resolve(); // 如果你用了 Promise
                    },
                    (error) => { // Error Callback
                        console.error('WebSocket 連接失敗:', error);
                        socketManager.value.stompClient = null;
                        socketManager.value.isConnecting = false;
                        connectionStatus.value = 'disconnected';
                        // reject(error); // 如果你用了 Promise
                    }
                );
            });
        } catch (error) {
            socketManager.value.isConnecting = false;
            throw error;
        }
    };

    // 新增一個專門處理聊天室訊息訂閱的函數
    function setupChatRoomSpecificSubscription(chatRoomId) {
        if (!socketManager.value.stompClient || !socketManager.value.stompClient.connected) {
            console.warn("[ChatStore] WebSocket 未連接，無法訂閱聊天室主題。"); // 保留原有的警告
            return;
        }
        const stompClient = socketManager.value.stompClient;
        const destination = `/topic/chat/${chatRoomId}`;

        // 取消舊的聊天室訂閱 (如果需要切換聊天室)
        socketManager.value.subscriptions.forEach((sub, key) => {
            if (key.startsWith('/topic/chat/')) {
                try {
                    sub.unsubscribe();
                    console.log(`[ChatStore] 已取消舊的聊天室主題訂閱: ${key}`); // 保留原有日誌
                } catch (e) { }
                socketManager.value.subscriptions.delete(key);
            }
        });
        console.log(`[ChatStore] setupChatRoomSpecificSubscription: 準備訂閱聊天室主題 --> ${destination}`);

        const chatSub = stompClient.subscribe(destination, (message) => {
            const receivedMessage = JSON.parse(message.body);
            // 處理收到的聊天訊息 (addMessage 或 updateMessageStatus)
            if (receivedMessage.tempId) { // 假設這是伺服器對你發送訊息的確認
                console.log("收到訊息確認:", receivedMessage);
                // 你可能需要一個 updateMessage 方法來更新狀態和 ID
                // chatStore.updateMessage(receivedMessage.tempId, receivedMessage);
                addMessage(receivedMessage); // 或者如果 addMessage 能處理重複 ID
            } else { // 這是其他人發來的訊息
                console.log("收到新訊息:", receivedMessage);
                addMessage(receivedMessage);
            }
        }, { id: `chat-sub-${chatRoomId}` });
        socketManager.value.subscriptions.set(destination, chatSub);
        console.log("已成功訂閱聊天室主題。");
    }

    /**
        * 設定應用級別的訂閱 (錯誤、未讀數)
        */
    function setupAppSubscriptions() {
        // 確保已連接且有使用者資訊
        if (!socketManager.value.stompClient?.connected || !userId.value) {
            console.error("[ChatStore] 無法設定應用訂閱 - WebSocket 未連接或 userId 缺失。");
            return;
        }
        const stompClient = socketManager.value.stompClient;
        const currentUserIdString = String(userId.value);
        const currentUserPrincipalName = username.value; // **後端推送目標，需要確認是 ID 還是 Name**

        // --- 訂閱未讀數更新隊列 ---
        const unreadDest = `/user/queue/unread-update`; // `/user` 前綴由 Spring 處理
        // 檢查是否已訂閱，避免重複
        if (!socketManager.value.subscriptions.has(unreadDest)) {
            console.log(`[ChatStore] 準備訂閱未讀數更新: ${unreadDest} (for user ${currentUserPrincipalName})`);
            const subId = `unread-sub-${currentUserIdString}`; // 唯一的訂閱 ID
            const sub = stompClient.subscribe(unreadDest, (message) => {
                try {
                    const updatedCounts = JSON.parse(message.body); // 預期是 { shopId: count }
                    // --- >>> 調用新的更新函數 <<< ---
                    updateUnreadCounts(updatedCounts);

                } catch (e) {
                    console.error("[ChatStore] 處理未讀數 WebSocket 訊息時出錯:", e, message.body);
                }
            }, { id: subId }); // 指定訂閱 ID
            socketManager.value.subscriptions.set(unreadDest, sub); // 保存訂閱
            console.log(`[ChatStore] 已成功訂閱未讀數更新 (ID: ${subId})。`);
        } else {
            console.log(`[ChatStore] 已存在未讀數更新的訂閱: ${unreadDest}`);
        }

        // --- 訂閱錯誤隊列 ---
        const errorDest = '/user/queue/errors';
        if (!socketManager.value.subscriptions.has(errorDest)) {
            console.log(`[ChatStore] 準備訂閱錯誤隊列: ${errorDest}`);
            const subId = `error-sub-${currentUserIdString}`;
            const sub = stompClient.subscribe(errorDest, (error) => {
                try {
                    const errorData = JSON.parse(error.body);
                    console.error("解析後的後端錯誤數據:", errorData); // 打印解析後的 JSON 內容
                    Swal.fire('錯誤', errorData.message || '收到未知的後端錯誤', 'error');
                } catch (e) {
                    console.error("解析後端錯誤訊息失敗:", parseError, error.body); // 如果 JSON 解析失敗，打印原始 body
                    Swal.fire('錯誤', '收到無法解析的後端錯誤訊息', 'error');
                }
            }, { id: subId });
            socketManager.value.subscriptions.set(errorDest, sub);
            console.log(`[ChatStore] 已成功訂閱錯誤隊列 (ID: ${subId})。`);
        } else {
            console.log(`[ChatStore] 已存在錯誤隊列的訂閱: ${errorDest}`);
        }
    }

    /**
    * 設定特定聊天室的訊息訂閱 (供 ChatRoom.vue 使用)
    */
    function setupChatRoomSpecificSubscription(chatRoomId) {
        if (!socketManager.value.stompClient?.connected) {
            console.warn("[ChatStore] WebSocket 未連接，無法訂閱聊天室主題。");
            return;
        }
        const stompClient = socketManager.value.stompClient;
        const destination = `/topic/chat/${chatRoomId}`;

        // 先取消可能存在的舊的聊天室主題訂閱
        socketManager.value.subscriptions.forEach((sub, key) => {
            if (key.startsWith('/topic/chat/')) {
                try {
                    sub.unsubscribe();
                    console.log(`[ChatStore] 已取消舊的聊天室主題訂閱: ${key}`);
                } catch (e) { console.warn(`[ChatStore] 取消舊訂閱 ${key} 失敗:`, e); }
                socketManager.value.subscriptions.delete(key); // 從 Map 中移除
            }
        });

        console.log(`[ChatStore] 準備訂閱聊天室主題: ${destination}`);
        const subId = `chat-sub-${chatRoomId}`;
        const chatSub = stompClient.subscribe(destination, (message) => {
            const receivedMessage = JSON.parse(message.body);
            addMessage(receivedMessage); // 呼叫 addMessage 處理收到的訊息
        }, { id: subId });
        socketManager.value.subscriptions.set(destination, chatSub); // 保存新的訂閱
        console.log(`[ChatStore] 已成功訂閱聊天室主題: ${destination} (ID: ${subId})。`);
    }

    /**
    * 進入聊天室的完整流程 (供 ChatRoom.vue 使用)
    */
    async function enterChatRoom(chatRoomId) {
        if (!userId.value) {
            console.error("[ChatStore] 未登入，無法進入聊天室。");
            // 可能需要導向登入頁
            return;
        }
        console.log(`[ChatStore] 準備進入聊天室: ${chatRoomId}`);
        messages.value = []; // 清空上一聊天室的訊息

        try {

            // --- 獲取 Token 和設定 Axios Config ---
            const currentAuthToken = sessionStorage.getItem('authToken');
            if (!currentAuthToken) {
                throw new Error("缺少認證 Token，無法載入聊天室資料");
            }
            const axiosConfig = {
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            };
            // 載入歷史訊息
            const messagesResponse = await axios.get(`/api/chat/${chatRoomId}/messages`, axiosConfig);
            // 載入後進行排序並更新狀態
            messages.value = messagesResponse.data.map(msg => ({
                ...msg,
                id: msg.id || msg.messageId,
                senderId: msg.senderId ?? msg.sender?.userId,
                senderName: msg.senderName ?? msg.sender?.username ?? '未知用户',
                timestamp: msg.timestamp || msg.createdAt
            })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            console.log(`[ChatStore] 聊天室 ${chatRoomId} 的歷史訊息已載入並排序。`);

            const detailsResponse = await axios.get(`/api/chat/${chatRoomId}`, axiosConfig); // <--- 添加 Config
            activeChatRoom.value = detailsResponse.data; // 直接賦值或在 Store 內部處理

            // 確保 WebSocket 已連接 (如果未連接則嘗試連接)
            if (!socketManager.value.stompClient?.connected) {
                console.log("[ChatStore] WebSocket 未連接，在進入聊天室前嘗試連接...");
                await connectWebSocket(); // 等待連接結果
            }

            // 訂閱該聊天室的主題
            if (socketManager.value.stompClient?.connected) {
                setupChatRoomSpecificSubscription(chatRoomId);
            } else {
                console.error("[ChatStore] WebSocket 連接失敗，無法訂閱聊天室主題。");
                throw new Error("WebSocket 連接失敗"); // 拋出錯誤以便上層處理
            }

        } catch (error) {
            console.error(`[ChatStore] 進入聊天室 ${chatRoomId} 失敗:`, error);
            Swal.fire("錯誤", `無法載入聊天室 ${chatRoomId}`, "error");
            // 可能需要導航回列表或顯示錯誤訊息
        }
    }


    /**
    * 添加或更新訊息列表中的訊息 (來自 WS 或即時發送)
    */
    const addMessage = (message) => {
        console.log('[ChatStore addMessage] 處理訊息:', JSON.stringify(message));
        const finalId = message.id || message.messageId || message.tempId; // 確保有唯一 ID
        if (!finalId) { console.error("[ChatStore addMessage] 訊息缺少 ID (id, messageId, tempId):", message); return; }

        // --- 修改查找邏輯 ---
        const existingIndex = messages.value.findIndex(m => {
            // 1. 如果收到的訊息有 tempId (很可能是伺服器確認)，優先用 tempId 查找已存在的訊息
            if (message.tempId && m.tempId === message.tempId) {
                return true; // 找到了要更新的訊息
            }
            // 2. 如果收到的訊息沒有 tempId (來自他人或歷史)，或者上面的 tempId 沒找到，
            //    則嘗試用最終 ID (非 temp-) 查找 (避免將 tempId 誤判為最終 ID)
            if (!message.tempId && m.id && m.id === finalId && !m.id.toString().startsWith('temp-')) {
                return true; // 找到了已存在的訊息 (例如重新載入)
            }
            // 特殊處理：如果收到的訊息有最終 ID，也檢查是否已有帶此 ID 的訊息（即使它之前是 temp）
            if (message.id && !message.id.toString().startsWith('temp-') && m.id === message.id) {
                return true;
            }

            return false; // 都沒找到
        });

        // 標準化收到的訊息物件
        const processedMessage = {
            ...message,
            id: finalId,
            senderId: message.senderId ?? message.sender?.userId,
            senderName: message.senderName ?? message.sender?.username ?? '未知用户',
            timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
            _status: message.tempId && !message.id ? 'sending' : (message._status || 'received') // 如果只有 tempId 認為是 sending，否則看傳入狀態或設為 received
        };
        // 確保時間戳是可比較格式
        processedMessage.timestamp = new Date(processedMessage.timestamp).toISOString();

        if (!processedMessage.senderId) {
            console.error("[ChatStore addMessage] 處理後的訊息缺少 senderId:", processedMessage);
        }

        if (existingIndex !== -1) {
            console.log(`[ChatStore addMessage] 更新現有訊息於索引 ${existingIndex} (ID: ${finalId}) - Server確認`);
            // 執行更新邏輯
            messages.value[existingIndex] = {
                // 可以考慮只更新必要欄位，而不是完全覆蓋
                ...messages.value[existingIndex], // 保留舊狀態 (例如 _status: 'sending' 會被覆蓋)
                ...processedMessage,           // 應用伺服器數據 (含真實 id, timestamp)
                _status: 'sent'                // 明確設置狀態為 sent
            };
            console.log('[ChatStore addMessage] 更新後的訊息:', messages.value[existingIndex]);
        } else {
            // *** 只有在確實找不到時才添加 ***
            // 檢查是否是因為 tempId 剛被真實 ID 覆蓋導致找不到
            const alreadyHasFinalId = messages.value.some(m => m.id === finalId && !m.id.toString().startsWith('temp-'));
            if (!alreadyHasFinalId) {
                console.log(`[ChatStore addMessage] 添加新訊息 (ID: ${finalId})`);
                messages.value.push(processedMessage);
            } else {
                console.warn(`[ChatStore addMessage] 欲添加的訊息 (ID: ${finalId}) 已存在，可能重複處理，已忽略。`);
            }
        }

        // 保持排序
        messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        console.log('[ChatStore addMessage] 訊息列表已更新。數量:', messages.value.length);
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
        // 給 Content.vue
        conversations,
        isLoadingConversations,
        fetchSellerConversations,
        fetchBuyerConversations, // <-- 導出新的 Action

        // 給 ChatRoom.vue
        activeChatRoom,
        messages,
        displayMessages, // 導出 computed 屬性
        connectionStatus,

        // 給全局 (例如 App.vue)
        connectWebSocket,
        disconnectWebSocket,

        // 給 ChatRoom.vue 的 Actions
        enterChatRoom,
        addMessage,

        currentUser: computed(() => userStore.currentUser),

        unreadCounts,
        createOrJoinChatRoom,
        sendMessage,
        fetchUnreadCounts,
        connectChatRoom,
        fetchCurrentUser,
        messageState,
        updateMessageState,
        enterSellerChat,
        updateReadStatus,
        setupSubscriptions,
        checkConnection, // 新增 checkConnection 方法
        socketManager,
    };
});