<template>
    <div class="container my-4 shop-list-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2><i class="bi bi-shop-window me-2"></i> 商店列表</h2>
        </div>
        <p>點擊商店名稱或資訊區域可以選中該行，再點擊「進入」按鈕前往商店頁面。</p>

        <div class="row g-2 mb-3">
            <div class="col flex-grow-1">
                <input type="text" class="form-control" placeholder="搜尋商店或賣家名稱..." v-model="searchQuery.text"
                    @keyup.enter="searchShops" />
            </div>
            <div class="col-auto">
                <button class="btn btn-info" @click="searchShops" :disabled="isLoading">
                    <i class="bi bi-search"></i>
                    <span class="d-none d-sm-inline ms-1">搜尋</span>
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">載入中...</span>
            </div>
        </div>
        <div v-else-if="errorMessage" class="alert alert-danger">
            載入商店列表失敗：{{ errorMessage }}
        </div>
        <div v-else-if="shops.length === 0" class="alert alert-light text-center border">
            找不到符合條件的商店。
        </div>

        <div v-else class="list-group shop-list mt-3">
            <a href="#" v-for="shop in shops" :key="shop.shopId"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                :class="{ active: selectedShopId === shop.shopId }" @click.prevent="selectShop(shop.shopId)">
                <div class="shop-info text-truncate me-3">
                    <span class="fw-bold me-2">#{{ shop.shopId }}</span>
                    <span class="me-3" :title="shop.shopName">{{ shop.shopName }}</span>
                    <small class="text-muted" :title="shop.userName"> (賣家: {{ shop.userName || 'N/A' }})</small>
                </div>
                <button class="btn btn-primary btn-sm flex-shrink-0" @click.stop="navigateToShop(shop.shopId)"
                    :disabled="selectedShopId !== shop.shopId" title="進入商店頁面">
                    <i class="bi bi-box-arrow-in-right"></i>
                    <span class="d-none d-sm-inline ms-1">進入</span>
                </button>
            </a>
        </div>

        <nav v-if="pagination.totalPages > 1 && !isLoading" class="mt-4 d-flex justify-content-center">
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: pagination.currentPage === 0 }">
                    <a class="page-link" href="#" @click.prevent="fetchShops(0)" aria-label="First">«</a>
                </li>
                <li class="page-item" :class="{ disabled: pagination.currentPage === 0 }">
                    <a class="page-link" href="#" @click.prevent="fetchShops(pagination.currentPage - 1)"
                        aria-label="Previous">‹</a>
                </li>
                <li v-for="page in visiblePages" :key="page" class="page-item"
                    :class="{ active: page === pagination.currentPage }">
                    <a class="page-link" href="#" @click.prevent="fetchShops(page)">{{ page + 1 }}</a>
                </li>
                <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages - 1 }">
                    <a class="page-link" href="#" @click.prevent="fetchShops(pagination.currentPage + 1)"
                        aria-label="Next">›</a>
                </li>
                <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages - 1 }">
                    <a class="page-link" href="#" @click.prevent="fetchShops(pagination.totalPages - 1)"
                        aria-label="Last">»</a>
                </li>
            </ul>
            <div v-if="pagination.totalItems > 0 && !isLoading" class="text-muted small ms-3 align-self-center">
                共 {{ pagination.totalItems }} 筆資料
            </div>
        </nav>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'; // 移除 watch (除非有特殊需求)
import { useRouter } from 'vue-router';
import axiosapi from '@/plugins/axios';


const router = useRouter();
const shops = ref([]);
const isLoading = ref(false);
const errorMessage = ref(null);
const searchQuery = reactive({ text: '' });
const pagination = reactive({
    currentPage: 0,
    size: 10, // 頁面列表可以顯示多一點
    totalItems: 0,
    totalPages: 0
});
const selectedShopId = ref(null);

// --- API 呼叫 ---
async function fetchShops(page = 0) {
    const targetPage = page < 0 ? 0 : page;
    if (pagination.totalPages > 0 && targetPage >= pagination.totalPages) {
        if (pagination.totalPages === 0 && targetPage === 0) { }
        else { return; }
    }
    isLoading.value = true;
    errorMessage.value = null;
    pagination.currentPage = targetPage;
    const params = {
        page: pagination.currentPage,
        size: pagination.size,
        searchText: searchQuery.text || null,
    };
    try {
        const response = await axiosapi.get('/api/shop/list', { params });
        if (response.data && response.data.success && response.data.data) {
            const data = response.data.data;
            shops.value = data.list || [];
            pagination.totalItems = data.totalItems ?? 0;
            pagination.totalPages = data.totalPages ?? 0;
            if (targetPage >= pagination.totalPages && pagination.totalPages > 0 && targetPage > 0) {
                fetchShops(pagination.totalPages - 1);
                return;
            }
        } else { throw new Error(response.data?.message || "無法獲取商店列表"); }
    } catch (error) {
        console.error("獲取商店列表失敗:", error);
        errorMessage.value = error.response?.data?.message || error.message || '載入資料時發生錯誤';
        shops.value = []; pagination.totalItems = 0; pagination.totalPages = 0;
    } finally { isLoading.value = false; }
}

// --- 事件處理 ---
function searchShops() {
    selectedShopId.value = null;
    fetchShops(0);
}
function selectShop(shopId) { selectedShopId.value = shopId; }
function navigateToShop(shopId) {
    if (!shopId) return;
    router.push({ name: 'Store', params: { shopId: shopId } });
}

// --- 分頁計算 ---
const visiblePages = computed(() => { /* ... 計算邏輯不變 ... */
    const total = pagination.totalPages; const current = pagination.currentPage; const maxVisible = 5; // 頁面可以顯示多一點
    if (total <= 1) return [];
    if (total <= maxVisible) { return Array.from({ length: total }, (_, i) => i); }
    else { let startPage = Math.max(0, current - Math.floor(maxVisible / 2)); let endPage = startPage + maxVisible - 1; if (endPage >= total) { endPage = total - 1; startPage = Math.max(0, endPage - maxVisible + 1); } return Array.from({ length: Math.min(maxVisible, endPage - startPage + 1) }, (_, i) => startPage + i); }
});

// --- 生命週期 ---
onMounted(() => {
    fetchShops(0); // 頁面載入時獲取第一頁數據
});
</script>

<style scoped>
.shop-list-page {
    padding-bottom: 3rem;
    /* 確保底部有足夠空間給分頁 */
}

.shop-list .list-group-item {
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    font-size: 0.95rem;
    /* 調整字體大小 */
}

.shop-list .list-group-item.active {
    z-index: 2;
    background-color: #cfe2ff;
    border-color: #9ec5fe;
    color: #0a58ca;
}

.shop-info {
    min-width: 0;
    padding-right: 1rem;
}

.pagination {
    margin-bottom: 0;
}

.pagination-sm .page-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
}

/* 縮小分頁按鈕 */
</style>