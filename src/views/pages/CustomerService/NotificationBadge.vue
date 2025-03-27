<template>
    <div class="notification-badge">
        <button @click="toggleNotifications" class="notification-icon">
            🔔 聊天通知<span v-if="unreadCount">{{ unreadCount }}</span>
        </button>
        <div v-if="showNotifications" class="notification-list">
            <div v-for="notice in notifications" :key="notice.id" class="notification-item" @click="openChat(notice)">
                {{ notice.message }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from "@/plugins/axios";

const props = defineProps({
    userId: {
        type: Number,
        required: true
    }
});
const emit = defineEmits(['notification-click']);

const showNotifications = ref(false);
const notifications = ref([]);

// 取得未讀通知，請確保後端 API 能根據 userId 回傳資料
const fetchUnreadNotifications = async () => {
    try {
        const response = await axios.get(`http://localhost:8081/api/notifications/unread/${props.userId}`);
        notifications.value = response.data;
    } catch (error) {
        console.error("載入通知失敗:", error);
    }
};

// 初始化載入通知
onMounted(fetchUnreadNotifications);

// 未讀通知數量
const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
);

// 切換通知列表顯示
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
};

// 點擊通知：呼叫 API 更新通知狀態後，emit 通知點擊事件
const openChat = async (notice) => {
    console.log("點擊通知，資料：", notice);
    try {
        // 更新通知狀態為已讀（依後端 API 規範設計）
        await axios.post(`http://localhost:8081/api/notifications/unread/${userId}`);
        // 更新前端通知狀態
        notice.isRead = true;
    } catch (error) {
        console.error("更新通知狀態失敗:", error);
    }
    emit('notification-click', notice.chatRoom.id);
    showNotifications.value = false;
};
</script>

<style scoped>
.notification-badge {
    position: relative;
}

.notification-icon {
    background: #f7e9d2;
    color: rgb(26, 25, 25);
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s;

}

.notification-icon:hover {
    background: #f7e9d2;
}

.notification-list {
    position: absolute;
    right: 0;
    top: 40px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 250px;
    z-index: 100;
}

.notification-item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}

.notification-item:hover {
    background: #f5f5f5;
}
</style>
