// stores/chatStore.js
import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
    state: () => ({
        activeChatRoom: null,      // 當前聊天室 { id, buyer, seller }
        messages: [],              // 當前聊天室訊息列表
        notifications: [],         // 未讀通知列表
        stompClient: null,         // WebSocket 連接實例
    }),
    actions: {
        // 初始化 WebSocket 連接
        async connectWebSocket(userId) {
            const socket = new SockJS('http://localhost:8081/ws');
            this.stompClient = Stomp.over(socket);

            this.stompClient.connect({}, () => {
                // 訂閱個人通知頻道
                this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
                    this.notifications.push(JSON.parse(message.body));
                });
            }, (error) => {
                console.error('WebSocket 連接失敗:', error);
            });
        },

        // 發送訊息
        async sendMessage(content) {
            if (!this.activeChatRoom) return;

            const message = {
                senderId: this.activeChatRoom.buyer.id, // 假設當前用戶是買家
                content: content,
            };

            this.stompClient.send(
                `/app/chat/${this.activeChatRoom.id}/send`,
                {},
                JSON.stringify(message)
            );
        },

        // 載入聊天室訊息
        async loadMessages(chatRoomId) {
            try {
                const response = await axios.get(`/api/chat/${chatRoomId}/messages`);
                this.messages = response.data;
            } catch (error) {
                console.error('載入訊息失敗:', error);
            }
        },
    },
});