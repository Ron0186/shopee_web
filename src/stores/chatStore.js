// stores/chatStore.js
import { defineStore } from 'pinia';
import axios from "@/plugins/axios";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
export const useChatStore = defineStore('chat', {
    state: () => ({
        activeChatRoom: null,      // 當前聊天室 { id, buyer, seller }
        messages: [],              // 當前聊天室訊息列表
        notifications: [],         // 未讀通知列表
        stompClient: null,
        currentUser: {
            id: localStorage.getItem("userId") || null,     // 從 localStorage 讀取
            name: localStorage.getItem("username") || null
        }
    }),
    actions: {
        setActiveChatRoom(chatRoomData) {
            this.activeChatRoom = {
                id: chatRoomData.chatRoomId,
                seller: {
                    id: chatRoomData.seller.userId,
                    name: chatRoomData.seller.username,
                    shopName: chatRoomData.seller.shopName || '個人賣家'
                },
                shop: chatRoomData.shop || null,
                shopId: chatRoomData.shop?.shopId || null
            };
        },
        setCurrentUser(userData) {
            this.currentUser = {
                id: data?.id || localStorage.getItem("userId") || null,
                name: data?.name || localStorage.getItem("username") || '未知使用者'
            };
            localStorage.setItem("userId", this.currentUser.id);
            localStorage.setItem("userName", this.currentUser.name);
        },
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
            if (!this.activeChatRoom || !this.currentUser) {
                console.error("無法發送訊息，聊天室或用戶未初始化");
                return;
            }

            const message = {
                senderId: this.currentUser.id, // 當前用戶是買家
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
                if (Array.isArray(response.data)) {
                    this.messages = response.data;
                } else {
                    console.error("後端返回的訊息格式錯誤:", response.data);
                }
            } catch (error) {
                console.error("載入訊息失敗:", error);
            }
        },
        async disconnectWebSocket() {
            if (this.stompClient) {
                this.stompClient.disconnect(() => {
                    console.log("WebSocket 斷開連接");
                });
            }
        }

    },
});