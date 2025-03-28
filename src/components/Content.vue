<template>
    <div v-if="selectedArticle">
        <h3 class="fw-bold">{{ selectedArticle.question }}</h3>
        <p class="lead">{{ selectedArticle.answer }}</p>
    </div>
    <div v-else class="help-center">
        <div class="d-flex align-items-center mb-4">
            <svg fill="none" height="25" viewBox="0 0 24 24" width="25" xmlns="http://www.w3.org/2000/svg" class="me-2">
                <path
                    d="M17.5001 11.9998C20.5377 11.9998 23.0001 14.4622 23.0001 17.4998C23.0001 20.5373 20.5377 22.9998 17.5001 22.9998C14.4626 22.9998 12.0001 20.5373 12.0001 17.4998C12.0001 14.4622 14.4626 11.9998 17.5001 11.9998ZM17.5001 19.7507C17.1552 19.7507 16.8756 20.0303 16.8756 20.3753C16.8756 20.7202 17.1552 20.9998 17.5001 20.9998C17.845 20.9998 18.1246 20.7202 18.1246 20.3753C18.1246 20.0303 17.845 19.7507 17.5001 19.7507ZM17.5002 13.8738C16.4522 13.8738 15.6359 14.6912 15.6468 15.8281C15.6494 16.1043 15.8754 16.326 16.1516 16.3233C16.4277 16.3207 16.6494 16.0947 16.6467 15.8185C16.6412 15.2395 17.0064 14.8738 17.5002 14.8738C17.9725 14.8738 18.3536 15.2657 18.3536 15.8233C18.3536 16.0156 18.2983 16.1656 18.1296 16.3848L18.0356 16.5007L17.9366 16.614L17.6712 16.9041L17.5348 17.0612C17.1515 17.518 17.0002 17.8537 17.0002 18.3713C17.0002 18.6475 17.224 18.8713 17.5002 18.8713C17.7763 18.8713 18.0002 18.6475 18.0002 18.3713C18.0002 18.1681 18.0587 18.0124 18.239 17.7811L18.3239 17.677L18.4249 17.5615L18.6906 17.271L18.8252 17.116C19.2035 16.6651 19.3536 16.3327 19.3536 15.8233C19.3536 14.7196 18.5312 13.8738 17.5002 13.8738ZM12.0224 13.9991C11.7257 14.4624 11.4862 14.9658 11.3137 15.4994L4.25254 15.4997C3.83895 15.4997 3.50366 15.835 3.50366 16.2486V16.8262C3.50366 17.3619 3.69477 17.88 4.04263 18.2874C5.29594 19.755 7.26182 20.5008 10.0001 20.5008C10.5966 20.5008 11.1564 20.4655 11.6804 20.3949C11.9255 20.8898 12.2331 21.3484 12.5919 21.7613C11.7964 21.9215 10.9315 22.0008 10.0001 22.0008C6.85426 22.0008 4.46825 21.0957 2.90194 19.2614C2.32218 18.5825 2.00366 17.719 2.00366 16.8262V16.2486C2.00366 15.0065 3.01052 13.9997 4.25254 13.9997L12.0224 13.9991ZM10.0001 2.00439C12.7615 2.00439 15.0001 4.24297 15.0001 7.00439C15.0001 9.76582 12.7615 12.0044 10.0001 12.0044C7.2387 12.0044 5.00012 9.76582 5.00012 7.00439C5.00012 4.24297 7.2387 2.00439 10.0001 2.00439ZM10.0001 3.50439C8.06712 3.50439 6.50012 5.0714 6.50012 7.00439C6.50012 8.93739 8.06712 10.5044 10.0001 10.5044C11.9331 10.5044 13.5001 8.93739 13.5001 7.00439C13.5001 5.0714 11.9331 3.50439 10.0001 3.50439Z"
                    fill="#212121" />
            </svg>
            <h1 class="fs-3 mb-0">歡迎來到幫助中心——解決您的問題，讓使用更輕鬆！</h1>
        </div>

        <p class="mb-4">
            感謝您來到我們的幫助中心！這裡是您獲取支援、尋找解決方案和學習如何更有效使用我們產品與服務的最佳場所。無論您是新用戶，還是已經熟悉我們平台的資深使用者，幫助中心都能為您提供有價值的資訊，協助您快速解決各種問題，讓您的使用體驗更加順暢，如果有和賣家相關問題，請由此路徑進入
            <!-- 聊天客服按鈕 -->
            <button class="btn btn-primary" @click="openModal">聊天客服</button>
        </p>

        <!-- 商店列表 Modal -->
        <div v-if="showStoreList" class="modal fade show d-block" tabindex="-1"
            style="background-color: rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">選擇商店</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row row-cols-1 row-cols-md-2 g-4">
                            <div class="col" v-for="store in stores" :key="store.id">
                                <div class="card h-100">
                                    <div class="card-body d-flex align-items-center">
                                        <img :src="store.logo" class="rounded-circle me-3" width="80" height="80">
                                        <div class="flex-grow-1">
                                            <h5 class="card-title mb-1">{{ store.name }}</h5>
                                            <p class="card-text text-muted mb-1">
                                                <i class="bi bi-star-fill text-warning"></i> 評價: {{ store.rating }}/5
                                            </p>
                                        </div>
                                        <!-- 根據登入者身份決定顯示哪個聊天按鈕 -->
                                        <button v-if="isShopOwner" class="btn btn-primary"
                                            @click.stop="sellerChat(store.id)">
                                            賣家聊天
                                        </button>
                                        <button v-else class="btn btn-primary" @click.stop="buyerChat(store.shopId)">
                                            買家聊天
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 可選的 Modal Footer -->
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHelpStore } from "../stores/HelpStore";
import { useUserStore } from '../stores/user';
import { fetchStores, fetchUnreadCounts } from '../stores/chatApi';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const helpStore = useHelpStore();
const userStore = useUserStore();
const showStoreList = ref(false);
const stores = ref([]);
const selectedArticle = computed(() =>
    helpStore.faqCategories.flatMap(category => category.items)
        .find(item => item.id === route.params.id)
);

watch(() => route.params.id, newId => {
    helpStore.setSelectedArticle(newId);
}, { immediate: true });
const isShopOwner = computed(() => userStore.isSeller);

const loadStores = async () => {
    try {
        const { data } = await fetchStores();
        if (!data) {
            console.error('API 返回空數據');
            stores.value = [];
            return;
        }
        // 根據 API 回傳格式處理數據
        let storesData = [];
        if (Array.isArray(data)) {
            storesData = data;
        } else if (data.stores && Array.isArray(data.stores)) {
            storesData = data.stores;
        } else if (data.data && Array.isArray(data.data)) {
            storesData = data.data;
        } else {
            console.warn('無法識別的 API 響應格式:', data);
            storesData = [];
        }
        stores.value = data.map(store => ({
            ...store,
            isSeller: store.sellerId === userStore.userId
        }));
    } catch (error) {
        console.error('載入商店失敗:', error);
        stores.value = [];
    }
};

const openModal = () => {
    showStoreList.value = true;
    loadStores();
    loadUnreadCounts();
};

const closeModal = () => {
    showStoreList.value = false;
    router.push('/helpCenter');
};

const getShopInfo = async (storeId, isSellerChat = false) => {
    try {
        const response = await axios.get("http://localhost:8081/api/shop/allShop");
        console.log("API 回傳的商店資料:", response.data);
        const shops = response.data?.data || [];
        let shop = null;
        if (isSellerChat) {
            shop = shops.find(s => parseInt(s.userId) === parseInt(userStore.userId));
        } else {
            shop = shops.find(s => parseInt(s.shopId) === parseInt(storeId));
        }
        return shop;
    } catch (error) {
        console.error('取得商店資訊失敗:', error);
        return null;
    }
};

const setupChatUpdates = (chatRoomId) => {
    const eventSource = new EventSource(`http://localhost:8081/api/chat/updates?roomId=${chatRoomId}`);
    eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        console.log('新訊息:', newMessage);
        // 可根據需求更新聊天 store（例如 chatStore.addMessage(newMessage)）
    };
    eventSource.onerror = () => {
        console.error('聊天室更新連線錯誤');
    };
    onUnmounted(() => {
        eventSource.close();
    });
};

const sellerChat = async () => {
    const shop = await getShopInfo(null, true);
    if (!shop) {
        console.error('找不到符合的商店資訊');
        return;
    }
    try {
        const response = await axios.post('http://localhost:8081/api/chat/create', {

            shopId: shop.shopId
        },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // <span style="color:red;">【修改處】帶上正確的 Authorization header】</span>
            });
        if (response.data?.chatRoomId) {
            router.push(`/chat/${response.data.chatRoomId}`);
            setupChatUpdates(response.data.chatRoomId);
        }
    } catch (error) {
        console.error('賣家聊天室建立失敗:', error);
    }
};

const buyerChat = async (storeId) => {
    const shop = await getShopInfo(storeId, false);
    if (!shop) {
        console.error(`找不到 shopId 為 ${storeId} 的商店資訊`);
        return;
    }
    try {
        const response = await axios.post('http://localhost:8081/api/chat/create', {

            shopId: shop.shopId
        },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // <span style="color:red;">【修改處】帶上正確的 Authorization header】</span>
            });
        if (response.data?.chatRoomId) {
            router.push(`/chat/${response.data.chatRoomId}`);
            setupChatUpdates(response.data.chatRoomId);
        }
    } catch (error) {
        console.error('買家聊天室建立失敗:', error);
    }
};

const loadUnreadCounts = async () => {
    if (!userStore.userId) return;
    try {
        const response = await fetchUnreadCounts(userStore.userId);
        console.log('未讀訊息計數:', response.data);
    } catch (error) {
        console.error('載入未讀訊息計數失敗:', error);
    }
};

onMounted(() => {
    // 可根據需求初始化設定
});
</script>

<style scoped>
h3 {
    margin-bottom: 10px;
    font-size: 30px;
}

p {
    line-height: 2.5;
    font-size: 20px;
}
</style>
