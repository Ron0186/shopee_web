<template>
    <button @click="startChat">聯絡客服</button>
</template>

<script setup>
import { useChatStore } from '@/stores/chatStore';
import { useRouter } from 'vue-router';
import axios from "@/plugins/axios"; // 關鍵修正：導入 axios

const chatStore = useChatStore();
const router = useRouter();
const props = defineProps({
    shop: Object,
    isOwner: Boolean
});
const startChat = async () => {
    try {
        const userId = localStorage.getItem('userId');
        const shopId = props.shop.shopId;

        if (!userId || !shopId) {
            alert("已有買家存在聊天室");
            return;
        }

        const response = await axios.post("/api/chat/start", {
            shopId: shopId,
            userId: userId,
            shopName: props.shop.shopName
        });

        if (response.data.success) {
            router.push(`/chat/${response.data.chatRoomId}`);
        } else {
            alert("無法開啟聊天室：" + response.data.message);
        }
    } catch (error) {
        console.error("開啟聊天室失敗:", error);
        alert("聊天室開啟失敗，請稍後再試");
    }
};
</script>