
import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
    state: () => ({
        activeMessages: {},  // 結構：{ chatRoomId: [messages] }
    }),
    actions: {
        addMessage(chatRoomId, message) {
            if (!this.activeMessages[chatRoomId]) {
                this.activeMessages[chatRoomId] = [];
            }
            this.activeMessages[chatRoomId].push(message);
        },
        setMessages(chatRoomId, messages) {
            this.activeMessages[chatRoomId] = messages;
        }
    }
});