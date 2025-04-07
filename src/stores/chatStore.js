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

    const totalUnreadCount = computed(() => {
        console.log("[ChatStore Computed] Recalculating totalUnreadCount based on conversations:", JSON.stringify(conversations.value.map(c => ({ id: c.chatRoomId, count: c.unreadCount }))));
        const total = conversations.value.reduce((sum, conversation) => {
            const count = Number(conversation.unreadCount) || 0;
            return sum + count;
        }, 0);
        console.log(`[ChatStore Computed] Calculated total: ${total}`);
        return total;
    });

    // --- >>> 新增：標記對話為已讀 Action 的實作 <<< ---
    async function markConversationAsRead(chatRoomId) {
        console.log(`[ChatStore] 嘗試標記 ChatRoom ${chatRoomId} 為已讀`);
        const currentAuthToken = getCurrentAuthToken();
        // 確保使用者已登入且有 Token
        if (!currentAuthToken || !userId.value) {
            console.error("[ChatStore] 無法標記已讀：缺少 Token 或 User ID。");
            return;
        }

        // 1. 前端狀態立即更新 (Optimistic Update) - 讓 UI 立即反應
        const conversationIndex = conversations.value.findIndex(c => c.chatRoomId === chatRoomId);
        if (conversationIndex !== -1) {
            // 只有在原本未讀數大於 0 時才更新，避免不必要的計算觸發
            if (conversations.value[conversationIndex].unreadCount > 0) {
                console.log(`[ChatStore] Optimistic Update: 將聊天室 ${chatRoomId} 的未讀數設為 0`);
                conversations.value[conversationIndex].unreadCount = 0;
                // 因為 conversations 是 ref，且 totalUnreadCount computed 依賴它，
                // totalUnreadCount 應該會自動重新計算。
            }
        } else {
            console.warn(`[ChatStore] markConversationAsRead: 在列表中未找到 ChatRoom ID ${chatRoomId}`);
            // 即使沒找到也要嘗試通知後端，以防列表尚未更新
        }

        // 2. 非同步發送請求到後端標記已讀
        try {
            // *** 確認你的後端 API 路徑是 POST /api/chat/{chatRoomId}/mark-read ***
            await axios.post(`/api/chat/${chatRoomId}/mark-read`, {}, { // Body 通常為空，看後端如何設計
                headers: { 'Authorization': `Bearer ${currentAuthToken}` }
            });
            console.log(`[ChatStore] 後端已成功標記 ChatRoom ${chatRoomId} 為已讀`);
            // 後端成功後，前端不需要做額外的事，因為已經 Optimistic Update 了
            // 注意：如果後端標記已讀後 *還會* 推送 unread-update 訊息將該房間設為0，
            // 確保 updateUnreadCountForRoom 函數能正確處理（即 count 沒變時不做事）
        } catch (error) {
            console.error(`[ChatStore] 調用後端 API 標記 ChatRoom ${chatRoomId} 為已讀失敗:`, error);
            // 可選：錯誤處理，例如如果後端失敗，是否要將前端的未讀數恢復？
            // 這會讓邏輯變複雜，通常 Optimistic Update 後如果失敗，會在下次刷新時修正
            // 也可以考慮彈出提示告知用戶更新失敗
            // if (conversationIndex !== -1) {
            //     // 可以在這裡嘗試重新獲取該對話的真實未讀數來恢復狀態
            //     // fetchSpecificConversationUnreadCount(chatRoomId);
            // }
        }
    }
    // --- >>> 新增 Action 實作結束 <<< ---

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
        // *** 使用從 userStore 獲取的響應式 ref 的值 ***
        const currentUserIdValue = userId.value;
        const currentUsernameValue = username.value;
        const currentAuthTokenValue = sessionStorage.getItem('authToken'); // 確保每次都從 sessionStorage 讀取最新

        // 1. 檢查必要資訊
        if (!currentUserIdValue) {
            console.error("[ChatStore] 無法連接 WebSocket：缺少 User ID (來自 userStore)。");
            // 不再 reject Promise，避免未捕捉的錯誤，返回 false 表示失敗
            return false;
        }
        if (!currentAuthTokenValue) {
            console.error("[ChatStore] 無法連接 WebSocket：缺少 Auth Token (來自 sessionStorage)。");
            return false;
        }

        // 2. 防止重複連接
        // *** 修改判斷條件，如果 stompClient 存在且已連接，直接返回 true ***
        if (socketManager.value.stompClient?.connected) {
            console.log(`[ChatStore] WebSocket 已連接，跳過。 (User ID: ${currentUserIdValue})`);
            return true; // 已經是連接狀態，返回成功
        }
        // 如果正在連接中，也跳過
        if (socketManager.value.isConnecting) {
            console.log(`[ChatStore] WebSocket 正在連接中，跳過。 (User ID: ${currentUserIdValue})`);
            // 可以選擇等待一小段時間再檢查，或直接返回 false/true
            return false; // 暫時返回 false 表示未完成連接
        }


        socketManager.value.isConnecting = true;
        connectionStatus.value = 'connecting';
        console.log(`[ChatStore] 嘗試建立 WebSocket 連接 for user: ${currentUsernameValue} (ID: ${currentUserIdValue})`);

        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = Stomp.over(socket);
        // stompClient.debug = null; // 在生產環境關閉

        try {
            // 使用 Promise 確保異步操作完成
            await new Promise((resolve, reject) => {
                // ** 在 connect 內部再次確認 token **
                const latestAuthToken = sessionStorage.getItem('authToken');
                console.log(">>> connectWebSocket: Calling stompClient.connect with headers:", latestAuthToken); // 新增
                if (!latestAuthToken) {
                    console.error("[ChatStore connect] Error: Auth token missing right before connect.");
                    reject(new Error("Auth token missing"));
                    return;
                }

                stompClient.connect(
                    { // STOMP Headers
                        'Authorization': `Bearer ${latestAuthToken}`, // 使用最新的 Token
                        // 'userId': String(currentUserIdValue) // 後端應從 Token 解析，通常不用客戶端傳
                    },
                    (frame) => { // 連接成功回調
                        console.log('[ChatStore] WebSocket 連接成功:', frame);
                        socketManager.value.stompClient = stompClient;
                        connectionStatus.value = 'connected';
                        socketManager.value.isConnecting = false;
                        setupAppSubscriptions(); // 設定應用級訂閱
                        resolve(true); // Promise 成功
                    },
                    (error) => { // 連接失敗回調
                        console.error('[ChatStore] WebSocket 連接失敗:', error);
                        socketManager.value.stompClient = null;
                        connectionStatus.value = 'disconnected';
                        socketManager.value.isConnecting = false;
                        reject(error); // Promise 失敗
                    }
                );
            });
            return true; // Promise 成功後返回 true
        } catch (error) {
            // 確保 isConnecting 在任何錯誤情況下都被重置
            socketManager.value.isConnecting = false;
            connectionStatus.value = 'disconnected'; // 出錯時確保狀態是 disconnected
            socketManager.value.stompClient = null; // 清理 client
            console.error("[ChatStore] WebSocket connect Promise 執行失敗:", error);
            return false; // 返回 false 表示連接失敗
        }
    }

    /**
     * 斷開 WebSocket 連接
     */
    function disconnectWebSocket() {
        if (socketManager.value.stompClient?.connected) {
            console.log("[ChatStore] 正在斷開 WebSocket 連接。");
            socketManager.value.subscriptions.forEach((sub, key) => {
                try {
                    sub.unsubscribe();
                    console.log(`[ChatStore] 已取消訂閱: ${key}`);
                } catch (e) { console.warn(`[ChatStore] 取消訂閱 ${key} 失敗`, e); }
            });
            socketManager.value.subscriptions.clear();

            // disconnect 可能需要一點時間，但我們先把狀態設為 disconnected
            connectionStatus.value = 'disconnected';
            socketManager.value.isConnecting = false; // 確保 isConnecting 也為 false

            socketManager.value.stompClient.disconnect(() => {
                console.log("[ChatStore] WebSocket disconnect 回調執行。");
                // 再次確認狀態
                connectionStatus.value = 'disconnected';
                socketManager.value.stompClient = null;
                socketManager.value.isConnecting = false;
            }, {}); // 可以傳遞一個空的 header 物件
            // 即使 disconnect 是異步，立即清理 stompClient 引用
            // socketManager.value.stompClient = null; // <-- 移到回調或下面

        } else {
            console.log("[ChatStore] WebSocket 未連接或已在斷開，無需執行斷開操作。");
        }
        // 無論如何都確保狀態乾淨
        socketManager.value.stompClient = null;
        connectionStatus.value = 'disconnected';
        socketManager.value.isConnecting = false;
        socketManager.value.subscriptions.clear();
        console.log("[ChatStore] disconnectWebSocket: 狀態已強制清理。");
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



    const createOrJoinChatRoom = async (shopId) => {
        try {
            // *** 假設 userStore.userId 在此之前已經被正確填充 ***
            if (!userId.value) {
                console.error("[ChatStore createOrJoinChatRoom] User ID not found in userStore.");
                // 可能需要提示用戶重新登入或處理錯誤
                throw new Error("User not logged in");
            }
            const currentAuthTokenValue = getCurrentAuthToken(); // 獲取 token
            if (!currentAuthTokenValue) {
                throw new Error("Auth token not found");
            }

            const response = await axios.post(
                'http://localhost:8081/api/chat/create',
                { shopId },
                { headers: { Authorization: `Bearer ${currentAuthTokenValue}` } }
            );
            activeChatRoom.value = response.data; // 假設後端返回 { chatRoomId: xxx, ... }



            // *** 改為直接設定聊天室訂閱 (如果 WebSocket 已連接) ***
            if (checkConnection()) {
                setupChatRoomSpecificSubscription(response.data.chatRoomId);
            } else {
                console.warn("[ChatStore createOrJoinChatRoom] WebSocket not connected after creating room. Subscription might be delayed.");

            }

        } catch (error) {
            console.error('創建或加入聊天室失敗:', error.response?.data?.error || error.message);
            // Handle error appropriately, e.g., show message to user
        }
    };
    const sendMessage = (content, tempId) => {
        if (!socketManager.value.stompClient?.connected) {
            console.warn("[ChatStore sendMessage] WebSocket not connected. Message not sent.");
            Swal.fire("錯誤", "連線已中斷，無法發送訊息。", "error");
            return;
        }
        if (!activeChatRoom.value?.chatRoomId) {
            console.warn("[ChatStore sendMessage] No active chat room ID. Message not sent.");
            return;
        }

        // *** 使用從 userStore 獲取的響應式 userId ***
        const currentSenderId = userId.value;

        if (!currentSenderId) {
            console.error("[ChatStore sendMessage] 無法發送：缺少 User ID。");
            Swal.fire("錯誤", "無法識別用戶身份，請重新登入。", "error");
            // 可能需要強制登出或導向登入
            // userStore.logout(); // 假設 userStore 有 logout action
            return;
        }

        console.log(`[ChatStore sendMessage] 使用 UserStore ID 發送: ${currentSenderId}`);
        const payload = {
            content: content,
            senderId: String(currentSenderId), // *** 使用正確的 ID ***
            tempId: tempId,
            // type: 'TEXT_MESSAGE' // 如果後端需要，加上 type
        };

        // --- 發送前創建臨時訊息用於 UI ---
        const messageToAdd = {
            ...payload,
            senderName: username.value || '我', // 使用 userStore 的 username
            timestamp: new Date().toISOString(),
            chatRoomId: activeChatRoom.value.chatRoomId, // 確保訊息帶有 room ID
            _status: 'sending' // 標記為發送中
        };
        // ---

        try {
            // --- 立即更新 UI (Optimistic Update) ---
            addMessage(messageToAdd);
            // ---

            // 發送訊息
            socketManager.value.stompClient.send(
                `/app/chat/${activeChatRoom.value.chatRoomId}/send`,
                {},
                JSON.stringify(payload)
            );
        } catch (error) {
            console.error("[ChatStore sendMessage] Error sending message via WebSocket:", error);
            // 可以考慮將剛才添加的訊息標記為失敗
            // updateMessageStatus(tempId, 'failed'); // 需要實現 updateMessageStatus
            Swal.fire("錯誤", "訊息發送失敗，請檢查連線。", "error");
        }
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

    function resetChatState() {
        console.log("[ChatStore] Resetting chat state...");
        // 斷開可能存在的連接 (包含清理訂閱和 stompClient)
        disconnectWebSocket();

        // 清理狀態
        conversations.value = [];
        isLoadingConversations.value = false;
        activeChatRoom.value = null;
        messages.value = [];
        connectionStatus.value = 'disconnected'; // 確保狀態為 disconnected
        unreadCounts.value = {};
        authToken.value = null; // 清理 token ref (雖然主要靠 sessionStorage)

        // 確保 socketManager 內部狀態也乾淨
        socketManager.value = {
            stompClient: null,
            subscriptions: new Map(),
            isConnecting: false
        };
        console.log("[ChatStore] Chat state reset complete.");
    }

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
        unreadCounts,
        createOrJoinChatRoom,
        sendMessage,
        fetchUnreadCounts,
        connectChatRoom,

        messageState,
        updateMessageState,
        enterSellerChat,
        updateReadStatus,
        setupSubscriptions,
        checkConnection, // 新增 checkConnection 方法
        socketManager,
        markConversationAsRead,
        totalUnreadCount
    };
});