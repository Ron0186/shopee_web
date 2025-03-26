<template>
  <div class="shop-header">
    <!-- 商店資訊 (左側) -->
    <div class="shop-info">
      <img :src="shopLogo" class="shop-logo" alt="商店 Logo">
      <div class="shop-details">
        <h2 class="shop-name">
          <span class="highlight">{{ shop.shopName }}</span>
        </h2>
        <div class="shop-actions">
          <button class="btn btn-chat" v-if="!isOwner" @click="startChat">💬 聊聊</button>
        </div>
      </div>
    </div>

    <!-- 商品數量 & 加入時間 (中間) -->
    <div class="shop-stats">
      <p><strong>商品數量：</strong> {{ shop.countProducts ?? 0 }}</p>
      <p><strong>加入時間：</strong> {{ shop.createdAt }}</p>
    </div>
    <!-- 右側區域：通知 + 編輯按鈕 -->
    <div class="shop-right">
      <NotificationBadge v-if="isOwner" :userId="currentUserId" @notification-click="handleNotificationClick" />
      <!-- 編輯按鈕 (右側) -->
      <button class="btn btn-edit-shop" :style="{ visibility: isOwner ? 'visible' : 'hidden' }">
        ⚙️ 編輯賣場資訊
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import defaultLogo from "@/assets/shop-logo.jpg";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import NotificationBadge from "@/views/pages/CustomerService/NotificationBadge.vue"; // 導入通知組件

const props = defineProps({
  shop: Object,
  isOwner: Boolean
});

const router = useRouter();

// 假設當前用戶 ID 存在於 localStorage 或 Pinia Store
const currentUserId = ref(localStorage.getItem('userId'));

const shopLogo = computed(() => {
  return props.shop.logo ? props.shop.logo : defaultLogo;
});
// 處理通知點擊事件（跳轉到聊天室）
const handleNotificationClick = (chatRoomId) => {
  router.push(`/chat/${chatRoomId}`);
};
const startChat = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const shopId = props.shop.shopId;

    console.log("userId:", userId);
    console.log("shopId:", shopId);

    if (!userId || !shopId) {
      alert("無法獲取使用者或商店資訊");
      return;
    }

    // 準備請求資料
    const chatRequest = {
      userId: userId,
      shopId: shopId,
      shopName: props.shop.shopName
    };

    // 直接發送請求，後端會自行檢查聊天室是否已存在
    const response = await axios.post("http://localhost:8081/api/chat/create", chatRequest);
    const data = response.data;

    if (data.success) {
      if (data.alreadyExists) {
        console.log("聊天室已存在，直接跳轉 ID:", data.chatRoomId);
      } else {
        console.log("成功建立新聊天室，ID:", data.chatRoomId);
      }
      // 不論是新建還是已存在，都直接跳轉
      router.push(`/chat/${data.chatRoomId}`);
    } else {
      alert("建立聊天室失敗：" + data.message);
    }
  } catch (error) {
    console.error("開啟聊天室失敗:", error);
    alert("聊天室開啟失敗，請稍後再試");
  }
};

</script>

<style scoped>
.shop-header {
  background: linear-gradient(90deg, #8d6e63, #a1887f);
  color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-info {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.shop-logo {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3);
  margin-right: 15px;
}

.shop-details {
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 26px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.shop-name .highlight {
  background: linear-gradient(45deg, #ff9800, #ff5722);
  color: white;
  padding: 5px 12px;
  border-radius: 8px;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
}

.btn-chat {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-chat:hover {
  background-color: #388E3C;
}

.btn-edit-shop {
  background-color: #3498db;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  visibility: hidden;
  /* 隱藏但保留空間 */
}

.btn-edit-shop:hover {
  background-color: #2980b9;
}

/* 新增右側區域樣式 */
.shop-right {
  display: flex;
  align-items: center;
  gap: 15px;
  /* 控制通知組件與編輯按鈕間距 */
}

/* 調整編輯按鈕樣式 */
.btn-edit-shop {
  margin-left: 0;
  /* 移除原有左邊距 */
}

/* .btn-chat {
    background-color: #f1c40f;
    color: black;
  } */
</style>
