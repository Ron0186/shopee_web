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
<<<<<<< HEAD
          <button class="btn btn-chat" v-if="!isOwner">💬 聊聊</button>
=======
          <button class="btn btn-chat" v-if="!isOwner" @click="startChat" :disabled="isCreatingChat">
            {{ isCreatingChat ? '創建中...' : '💬 聊聊' }}
          </button>
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
        </div>
      </div>
    </div>

    <!-- 商品數量 & 加入時間 (中間) -->
    <div class="shop-stats">
      <p><strong>商品數量：</strong> {{ shop.countProducts ?? 0 }}</p>
      <p><strong>加入時間：</strong> {{ shop.createdAt }}</p>
    </div>
<<<<<<< HEAD

    <!-- 編輯按鈕 (右側) -->
    <button class="btn btn-edit-shop" :style="{ visibility: isOwner ? 'visible' : 'hidden' }">
  ⚙️ 編輯賣場資訊
</button>
=======
    <!-- 右側區域：通知 + 編輯按鈕 -->
    <div class="shop-right">

      <!-- 編輯按鈕 (右側) -->
      <button class="btn btn-edit-shop" :style="{ visibility: isOwner ? 'visible' : 'hidden' }">
        ⚙️ 編輯賣場資訊
      </button>

    </div>
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { computed } from 'vue';
import defaultLogo from "@/assets/shop-logo.jpg";
=======
import { ref, computed } from 'vue';
import defaultLogo from "@/assets/shop-logo.jpg";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from 'sweetalert2';  // 引入更美觀的提示套件

const isCreatingChat = ref(false); // 正確定義變量
const props = defineProps({
  shop: Object,
  isOwner: Boolean
});

const router = useRouter();


>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5

const shopLogo = computed(() => {
  return props.shop.logo ? props.shop.logo : defaultLogo;
});

<<<<<<< HEAD
const props = defineProps({
  shop: Object,
  isOwner: Boolean
});
=======
const startChat = async () => {
  try {
    // 驗證參數更嚴謹
    const rawUserId = localStorage.getItem("userId");
    if (!rawUserId) {
      await Swal.fire("需要登入", "請先登入才能使用聊天功能", "warning");
      return router.push('/user/login');
    }
    const buyerId = parseInt(rawUserId);
    if (isNaN(buyerId)) {
      throw new Error("使用者 ID 格式錯誤");
    }

    // 檢查 shopId 是否存在且有效
    if (!props.shop?.shopId || isNaN(parseInt(props.shop.shopId))) {
      throw new Error("商店資訊不完整");
    }

    const shopId = parseInt(props.shop.shopId);
    if (isNaN(shopId)) {
      Swal.fire('錯誤', '商店資訊取得失敗', 'error');
      return;
    }
    console.log("發送請求參數：", {
      buyerId: buyerId,
      shopId: shopId
    });
    isCreatingChat.value = true;  // 開始載入

    // 參數名稱修正為 buyerId
    const response = await axios.post("http://localhost:8081/api/chat/create", {
      buyerId: buyerId,
      shopId: shopId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 強化回應處理
    if (response.data?.chatRoomId) {
      const action = response.data.alreadyExists ? '跳轉至現有' : '進入新';
      Swal.fire({
        icon: 'success',
        title: `${action}聊天室`,
        showConfirmButton: false,
        timer: 1500
      });

      router.push(`/chat/${response.data.chatRoomId}`);
    } else {
      throw new Error('後端未返回聊天室ID');
    }
  } catch (error) {
    console.error('聊天室建立失敗:', error);

    // 分類錯誤處理
    const errorMessage = error.response?.data?.message
      || error.message
      || '未知錯誤';

    Swal.fire({
      icon: 'error',
      title: '操作失敗',
      text: errorMessage.includes('already exists')
        ? '聊天室已存在，正在為您跳轉...'
        : errorMessage,
    });

    // 若後端返回已存在ID但前端未處理
    if (error.response?.status === 409 && error.response.data.chatRoomId) {
      router.push(`/chat/${error.response.data.chatRoomId}`);
      return; // 確保後續代碼不執行
    }
  } finally {
    isCreatingChat.value = false;  // 結束載入
  }
}
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
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
<<<<<<< HEAD
=======

>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
.btn-edit-shop {
  background-color: #3498db;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
<<<<<<< HEAD
  visibility: hidden; /* 隱藏但保留空間 */
=======
  visibility: hidden;
  /* 隱藏但保留空間 */
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
}

.btn-edit-shop:hover {
  background-color: #2980b9;
}

<<<<<<< HEAD
=======
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

>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
/* .btn-chat {
    background-color: #f1c40f;
    color: black;
  } */
</style>
