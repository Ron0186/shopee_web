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
    const stores = ref([]); // 存放商店列表 { shopId, name, ..., unreadCount, hasActiveChat }
    const isLoadingStores = ref(false);
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


    // Action: 獲取商店列表和初始未讀數
    async function fetchStoresAndUnreadCounts() {
        // 只在賣家登入時執行
        if (!userId.value) {
            console.log("[ChatStore] 未登入，不載入商店列表及未讀數。");
            stores.value = []; // 清空列表
            return;
        }
        isLoadingStores.value = true;
        console.log("[ChatStore] 載入商店列表及初始未讀數 for sellerId:", userId.value);
        try {
            // 1. 獲取商店列表 API
            const storesResponse = await axios.get('/api/shop/allShop'); // 假設 axios 已設定 baseURL
            let storesData = storesResponse.data?.data || storesResponse.data || [];
            if (!Array.isArray(storesData)) storesData = [];
            console.log("[ChatStore] 商店列表 API 回應:", storesData);

            // 2. 獲取初始未讀數 API
            let initialUnreadData = {};
            try {
                // *** 從 sessionStorage 或 userStore 獲取當前的 Auth Token ***
                const currentAuthToken = sessionStorage.getItem('authToken'); // 或者從 userStore 獲取 (如果有的話)

                if (!currentAuthToken) {
                    // 如果沒有 token，可以選擇拋出錯誤或直接返回空數據
                    console.warn("[ChatStore] 無法獲取未讀數：缺少 Auth Token。");
                    // throw new Error("缺少 Auth Token 無法獲取未讀數"); // 或者讓後續流程使用空數據
                } else {
                    // *** 在 axios.get 的第二個參數中傳入 headers ***
                    const unreadResponse = await axios.get(
                        `/api/chat/unread?sellerId=${userId.value}`,
                        { // <-- 加入 axios 配置物件
                            headers: {
                                'Authorization': `Bearer ${currentAuthToken}`
                            }
                        }
                    );
                    initialUnreadData = unreadResponse.data || {};
                    console.log("[ChatStore] 初始未讀數 API 回應:", initialUnreadData);
                }
            } catch (unreadError) {
                console.error("[ChatStore] 獲取初始未讀數失敗:", unreadError);
                // *** 建議加入更詳細的錯誤日誌 ***
                if (unreadError.response) {
                    // 請求已發出，伺服器回應了非 2xx 的狀態碼
                    console.error("錯誤狀態碼:", unreadError.response.status);
                    console.error("錯誤回應數據:", unreadError.response.data);
                } else if (unreadError.request) {
                    // 請求已發出，但沒有收到回應
                    console.error("未收到伺服器回應:", unreadError.request);
                } else {
                    // 設定請求時發生錯誤
                    console.error('請求設定錯誤:', unreadError.message);
                }
                // 保持原有邏輯：忽略錯誤，未讀數會是 0
            }

            // 3. 合併數據並更新 stores 狀態
            stores.value = storesData.map(store => {
                const shopId = Number(store.shopId);
                const currentUserIdNum = Number(userId.value);
                // 處理後端 Map 的 key 可能是數字或字串
                const unreadCount = Number(initialUnreadData[shopId] ?? initialUnreadData[String(shopId)] ?? 0);
                return {
                    id: shopId,
                    name: store.shopName?.trim() || '未命名店铺',
                    sellerId: Number(store.userId),
                    shopId: shopId,
                    isCurrentUserStore: Number(store.userId) === currentUserIdNum,
                    unreadCount: unreadCount,
                    // 根據未讀數判斷是否有活躍對話 (你也可以根據後端回傳的其他欄位判斷)
                    hasActiveChat: unreadCount > 0,
                };
            });
            console.log("[ChatStore] 初始化/更新後的 stores 狀態:", JSON.stringify(stores.value));

        } catch (error) {
            console.error('[ChatStore] 載入商店列表失敗:', error);
            stores.value = []; // 清空以表示錯誤
            // Swal.fire("錯誤", "無法載入商店列表", "error"); // 考慮是否在 Component 層提示
        } finally {
            isLoadingStores.value = false;
        }
    }


    /**
      * 根據 WebSocket 推送更新 stores 列表中的未讀計數
      * @param {Object} unreadDataMap - 從後端收到的 { shopId: count } 格式的 Map
      */
    function updateUnreadCountsInStore(unreadDataMap) {
        console.log("[ChatStore] 收到 WebSocket 未讀數更新:", unreadDataMap);
        if (!unreadDataMap || typeof unreadDataMap !== 'object') {
            console.warn("[ChatStore] 收到的未讀數更新格式不正確，已忽略。");
            return;
        }

        let changed = false;
        stores.value = stores.value.map(store => {
            const shopId = store.shopId;
            // 檢查後端 Map 中是否有此 shopId 的 key (數字或字串)
            const newCount = unreadDataMap[shopId] !== undefined
                ? Number(unreadDataMap[shopId])
                : (unreadDataMap[String(shopId)] !== undefined
                    ? Number(unreadDataMap[String(shopId)])
                    : undefined);

            // 如果找到了新的計數，並且與舊的不同，則更新
            if (newCount !== undefined && !isNaN(newCount) && store.unreadCount !== newCount) {
                console.log(`[ChatStore] Store 更新: Shop ID ${shopId} 未讀數從 ${store.unreadCount} 改為 ${newCount}`);
                changed = true;
                return { ...store, unreadCount: newCount, hasActiveChat: newCount > 0 };
            }
            return store; // 保持不變
        });

        if (changed) {
            console.log("[ChatStore] 應用 WebSocket 更新後的 stores 狀態:", JSON.stringify(stores.value));
            // 如果需要，可以在這裡觸發額外的事件或通知
        } else {
            console.log("[ChatStore] WebSocket 更新未導致 stores 狀態變化。");
        }
    }

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
        if (!socketManager.value.stompClient || !socketManager.value.stompClient.connected) return;
        const stompClient = socketManager.value.stompClient;
        const destination = `/topic/chat/${chatRoomId}`;

        // 取消舊的聊天室訂閱 (如果需要切換聊天室)
        socketManager.value.subscriptions.forEach((sub, key) => {
            if (key.startsWith('/topic/chat/')) {
                try { sub.unsubscribe(); } catch (e) { }
                socketManager.value.subscriptions.delete(key);
            }
        });


        console.log(`準備訂閱聊天室主題: ${destination}`);
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
                    updateUnreadCountsInStore(updatedCounts); // 呼叫 Action 更新狀態
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

        const existingIndex = messages.value.findIndex(m =>
            (m.id && m.id === finalId) || // 優先匹配後端 ID
            (m.tempId && m.tempId === message.tempId && m.id === finalId) // 也考慮 tempId 匹配 (用於更新狀態)
        );

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
            console.log(`[ChatStore addMessage] 更新現有訊息於索引 ${existingIndex} (ID: ${finalId})`);
            // 更新現有訊息，特別是 id, timestamp, _status, isRead
            messages.value[existingIndex] = {
                ...messages.value[existingIndex], // 保留可能存在的本地狀態
                ...processedMessage, // 用處理過的伺服器數據覆蓋
                _status: 'sent' // 標記為已送達
            };
        } else {
            console.log(`[ChatStore addMessage] 添加新訊息 (ID: ${finalId})`);
            messages.value.push(processedMessage);
        }

        // 保持訊息按時間排序
        messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // 確保 Vue 偵測到陣列變化 (雖然 push 和直接修改索引應該會觸發)
        // messages.value = [...messages.value];
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
        stores,
        isLoadingStores,
        fetchStoresAndUnreadCounts,

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