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
        currentUser: { // ✅ 直接初始化
            id: localStorage.getItem("userId") || null,
            username: localStorage.getItem("username") || null, // 注意 key 名稱一致性
            roles: JSON.parse(localStorage.getItem("roles") || "[]")
        }
    }),
    actions: {


        setCurrentUser(userData) {
            this.currentUser = {
                userId: userData.id,
                username: userData.username, // 確保使用正確字段名稱
                roles: userData.roles
            };
            localStorage.setItem("userId", userData.id);
            localStorage.setItem("userName", userData.username); // 修正 key 名稱
            localStorage.setItem("roles", JSON.stringify(userData.roles));
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
                content: content,
                sender: { // 發送完整用戶資訊
                    userId: this.currentUser.userId,
                    username: this.currentUser.username,
                    role: this.currentUser.roles[0] // 假設第一個角色是主要身份
                },
                chatRoomId: this.activeChatRoom.id,
                timestamp: new Date().toISOString()
            };


            this.stompClient.send(
                `/app/chat/${this.activeChatRoom.id}/send`,
                {},
                JSON.stringify(message)
            );
            // 本地預先添加訊息
            this.messages.push({
                ...message,
                id: Date.now() // 臨時唯一ID
            });
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