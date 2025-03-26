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
          <button class="btn btn-chat" v-if="!isOwner">💬 聊聊</button>
        </div>
      </div>
    </div>

    <!-- 商品數量 & 加入時間 (中間) -->
    <div class="shop-stats">
      <p><strong>商品數量：</strong> {{ shop.countProducts ?? 0 }}</p>
      <p><strong>加入時間：</strong> {{ shop.createdAt }}</p>
    </div>

    <!-- 編輯按鈕 (右側) -->
    <button class="btn btn-edit-shop" :style="{ visibility: isOwner ? 'visible' : 'hidden' }">
  ⚙️ 編輯賣場資訊
</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import defaultLogo from "@/assets/shop-logo.jpg";

const shopLogo = computed(() => {
  return props.shop.logo ? props.shop.logo : defaultLogo;
});

const props = defineProps({
  shop: Object,
  isOwner: Boolean
});
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
  visibility: hidden; /* 隱藏但保留空間 */
}

.btn-edit-shop:hover {
  background-color: #2980b9;
}

/* .btn-chat {
    background-color: #f1c40f;
    color: black;
  } */
</style>
