<template>
    <div class="notification-badge">
        <button @click="toggleNotifications">
            🔔 {{ unreadCount }}
        </button>
        <div v-if="showNotifications" class="notification-list">
            <div v-for="notice in notifications" :key="notice.id" @click="openChat(notice.chatRoom.id)">
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

// 獲取未讀通知
const fetchUnreadNotifications = async () => {
    try {
        const response = await axios.get(`/api/notifications/unread/${props.userId}`);
        notifications.value = response.data;
    } catch (error) {
        console.error("載入通知失敗:", error);
    }
};

// 初始化載入通知
onMounted(fetchUnreadNotifications);

// 計算未讀數量
const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
);

// 切換通知列表顯示
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
};

// 點擊通知處理
const openChat = (chatRoomId) => {
    emit('notification-click', chatRoomId);
    showNotifications.value = false;
};
</script>

<style scoped>
.notification-badge {
    position: relative;
}

.notification-icon {
    background: #ff5722;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s;
}

.notification-icon:hover {
    background: #e64a19;
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