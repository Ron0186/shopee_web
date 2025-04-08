<template>
    <div class="container-fluid  px-0">
        <div class="px-3 px-md-4">
            <h3>後台管理者優惠券管理</h3>

            <div class="row mb-4">
                <div class="col-md-auto mb-2 mb-md-0">
                    <div class="position-relative d-inline-block me-3"> <button class="btn btn-secondary text-nowrap"
                            @click="navigateToApplicationReview">
                            <i class="bi bi-list-check"></i> 前往審核優惠券申請
                        </button>
                        <span v-if="pendingCount > 0"
                            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {{ pendingCount }}
                            <span class="visually-hidden">筆待審核申請</span>
                        </span>
                    </div>

                    <button class="btn btn-primary text-nowrap" style="margin-left:15px ;" @click="openModal('insert')">
                        <i class="bi bi-plus-lg"></i> 直接新增優惠券
                    </button>
                </div>
            </div>

            <div class="row mb-4 align-items-center">
                <div class="col-md-4 mb-2 mb-md-0">
                    <input type="text" class="form-control" placeholder="搜尋名稱/代碼/商店ID" v-model="searchQuery.text"
                        @keyup.enter="callFind(0)" />
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <button class="btn btn-info w-50" @click="callFind(0)"> <i class="bi bi-search"></i> 搜尋 </button>
                </div>
                <div class="col-md-4 text-nowrap px-0 text-md-end">
                    <CouponSelect :total="pagination.totalItems" :options="[4, 8, 12, 16]" v-model="pagination.size"
                        @change="callFind(0)" />
                </div>
            </div>
        </div>
        <CouponChart :chart-data-prop="monthlyStats" ref="chartRef" />

        <div class="px-3 px-md-4">
            <div class="row coupon-list-header py-2 fw-bold border-bottom mt-3 d-none d-md-flex align-items-center">
                <div class="col-md-1 text-center">ID</div>
                <div class="col-md-2">名稱</div>
                <div class="col-md-1 text-center">類型</div>
                <div class="col-md-1 text-start">折扣值</div>
                <div class="col-md-1 ps-3">代碼</div>
                <div class="col-md-2">商店</div>
                <div class="col-md-2 text-center">有效期限</div>
                <div class="col-md-2 text-center">操作</div>
            </div>

            <div v-if="isLoading" class="text-center mt-3"> /* ... spinner ... */ </div>
            <div v-else-if="coupons.length === 0 && !isLoading" class="alert alert-light text-center mt-3">
                目前沒有符合條件的優惠券。
            </div>

            <div v-else class="coupon-list-container mt-1">
                <AdminCouponListItem v-for="coupon in coupons" :key="coupon.couponId" :coupon="coupon"
                    @editCoupon="openModal('update', coupon)" @deleteCoupon="confirmDelete" />
            </div>

            <nav v-if="pagination.totalPages > 1 && !isLoading" class="mt-4">
                <ul class="pagination justify-content-center">
                    <li v-for="page in visiblePages" :key="page" class="page-item"
                        :class="{ active: page === pagination.currentPage }">
                        <a class="page-link" href="#" @click.prevent="callFind(page)">{{ page + 1 }}</a>
                    </li>
                </ul>
            </nav>
        </div>

        <AdminCouponModal :isVisible="isModalVisible" :isInsert="isInsert" :coupon="selectedCoupon"
            @closeModal="closeModal" @createCoupon="handleCreateCoupon" @modifyCoupon="handleModifyCoupon" />
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import axiosapi from "@/plugins/axios"; // 假設這是你配置好的 axios 實例
import Swal from "sweetalert2";
import AdminCouponListItem from "./AdminCouponListItem.vue";
import AdminCouponModal from "./AdminCouponModal.vue";
import CouponSelect from "./CouponSelect.vue";
import CouponChart from "./CouponChart.vue";
import { useRouter } from 'vue-router'; // 如果需要導航
import { storeToRefs } from 'pinia'; // *** 匯入 storeToRefs ***
import { useCouponApplicationStore } from '@/stores/couponApplicationStore';

const router = useRouter(); // 用於導航
const applicationStore = useCouponApplicationStore();
const { pendingCount } = storeToRefs(applicationStore);

// --- 狀態管理 ---
const coupons = ref([]); // 儲存從後端獲取的優惠券列表 (AdminCouponDTO)
const isLoading = ref(false);
const isModalVisible = ref(false);
const isInsert = ref(false);     // true: 新增 Modal, false: 編輯 Modal
const selectedCoupon = ref(null); // 傳遞給 Modal 的資料

// --- 搜尋與分頁 ---
const searchQuery = reactive({ text: '' }); // 搜尋條件
const pagination = reactive({
    currentPage: 0,  // API 通常從 0 開始
    size: 4,        // 每頁筆數
    totalItems: 0,
    totalPages: 0
});

// --- 圖表數據 ---
const chartRef = ref(null); // CouponChart 元件的引用
const monthlyStats = ref({ // 傳遞給圖表的數據結構
    labels: [], // 月份 ['1月', '2月', ...]
    newCounts: [], // 新增數量 [10, 15, ...]
    currentCounts: [] // 目前數量 [50, 60, ...]
});


// --- Modal 控制 ---
function openModal(action, couponData = null) {
    isInsert.value = (action === 'insert');
    if (isInsert.value) {
        // 新增模式：提供一個空的結構，包含 shop 物件
        selectedCoupon.value = { shop: { shopId: null } };
    } else {
        // 編輯模式：傳遞從 Card 來的 coupon DTO
        selectedCoupon.value = couponData ? { ...couponData } : null;
    }
    isModalVisible.value = true;
}

function closeModal() {
    isModalVisible.value = false;
    selectedCoupon.value = null; // 清除選中數據
}

// --- API 呼叫 ---

// 讀取/搜尋優惠券列表 (Admin API)
const callFind = async (page = 0) => {
    // 防止無效頁碼
    if (page < 0 || (pagination.totalPages > 0 && page >= pagination.totalPages)) {
        console.warn(`請求的頁碼 ${page} 無效。`);
        return;
    }

    isLoading.value = true;
    pagination.currentPage = page;
    try {
        // *** 修改：組合查詢參數，使用 searchText ***
        const params = {
            page: pagination.currentPage,
            size: pagination.size,
            // 將搜尋框內容作為通用 searchText 傳遞
            searchText: searchQuery.text || null,
        };

        // *** 呼叫 Admin 的查詢 API ***
        // GET /admin/coupons?page=0&size=4&couponName=xxx
        const response = await axiosapi.get("/admin/coupons", { params });

        if (response.data && response.data.success && response.data.data) {
            const data = response.data.data;
            coupons.value = data.list || [];
            pagination.totalItems = data.totalItems;
            pagination.totalPages = data.totalPages;
        } else {
            throw new Error(response.data?.message || "查詢回應格式錯誤");
        }
    } catch (error) {
        console.error("查詢優惠券失敗:", error);
        Swal.fire("錯誤!", `查詢優惠券失敗: ${error.response?.data?.message || error.message}`, "error");
        coupons.value = []; // 清空
        pagination.totalItems = 0;
        pagination.totalPages = 0;
    } finally {
        isLoading.value = false;
    }
};

// 處理來自 Modal 的新增事件
async function handleCreateCoupon(newCouponData) {
    try {
        // *** 呼叫 Admin 的直接新增 API ***
        // POST /admin/coupons
        // newCouponData 應包含 shop: { shopId: xxx }
        const response = await axiosapi.post("/admin/coupons", newCouponData);

        if (response.data && response.data.success) {
            Swal.fire("成功!", "優惠券已新增", "success");
            closeModal();
            callFind(0); // 新增後回到第一頁
            fetchMonthlyStats(); // 更新圖表
        } else {
            throw new Error(response.data?.message || "新增失敗");
        }
    } catch (error) {
        console.error("新增優惠券失敗:", error);
        Swal.fire("錯誤!", `新增優惠券失敗: ${error.response?.data?.message || error.message}`, "error");
        // 不關閉 Modal，讓使用者可以修正
    }
}

// 處理來自 Modal 的修改事件
async function handleModifyCoupon(updatedCouponDataFromModal) {
    try {
        const couponId = updatedCouponDataFromModal.couponId;
        if (!couponId) {
            throw new Error("缺少 couponId 無法更新");
        }

        // *** 建立一個只包含可更新欄位的 payload ***
        const payload = {
            // 從 Modal 傳來的資料中挑選需要的欄位
            couponName: updatedCouponDataFromModal.couponName,
            couponCode: updatedCouponDataFromModal.couponCode,
            description: updatedCouponDataFromModal.description,
            discountType: updatedCouponDataFromModal.discountType,
            discountValue: updatedCouponDataFromModal.discountValue,
            startDate: updatedCouponDataFromModal.startDate, // 應為 'yyyy-MM-dd'
            endDate: updatedCouponDataFromModal.endDate,     // 應為 'yyyy-MM-dd'
            usageLimit: updatedCouponDataFromModal.usageLimit,
            usagePerUser: updatedCouponDataFromModal.usagePerUser,
            // shopId 通常不修改，或後端根據 couponId 自行處理
            // shop: { shopId: updatedCouponDataFromModal.shop.shopId } // 如果後端需要傳遞 shopId
        };
        // *** 不要包含 createdAt 和 updatedAt ***

        // *** 呼叫 Admin 的直接修改 API ***
        const response = await axiosapi.put(`/admin/coupons/${couponId}`, payload); // *** 發送清理過的 payload ***

        if (response.data && response.data.success) {
            Swal.fire("成功!", "優惠券已更新", "success");
            closeModal();
            callFind(pagination.currentPage);
        } else {
            throw new Error(response.data?.message || "更新失敗");
        }
    } catch (error) {
        console.error("更新優惠券失敗:", error);
        Swal.fire("錯誤!", `更新優惠券失敗: ${error.response?.data?.message || error.message}`, "error");
    }
}

// 處理來自 Card 的刪除請求 (確認)
async function confirmDelete(couponId) {
    const result = await Swal.fire({
        title: "確定要刪除嗎?",
        text: `即將刪除優惠券 ID: ${couponId}，此動作無法復原!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "確定刪除",
        cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
        deleteCoupon(couponId);
    }
}

// 實際執行刪除
async function deleteCoupon(couponId) {
    try {
        // *** 呼叫 Admin 的直接刪除 API ***
        // DELETE /admin/coupons/{couponId}
        const response = await axiosapi.delete(`/admin/coupons/${couponId}`);
        if (response.data && response.data.success) {
            Swal.fire("已刪除!", "優惠券已成功刪除。", "success");
            // 判斷刪除後是否需要跳轉頁面
            const isLastItemOnPage = coupons.value.length === 1 && pagination.currentPage > 0;
            callFind(isLastItemOnPage ? pagination.currentPage - 1 : pagination.currentPage);
            fetchMonthlyStats(); // 更新圖表
        } else {
            throw new Error(response.data?.message || "刪除失敗");
        }
    } catch (error) {
        console.error("刪除優惠券失敗:", error);
        Swal.fire("錯誤!", `刪除優惠券失敗: ${error.response?.data?.message || error.message}`, "error");
    }
}


// --- 圖表相關 ---
// 取得每月統計數據 (需要後端提供新 API)
async function fetchMonthlyStats() {
    try {
        // *** 假設後端有一個 API 回傳統計數據 ***
        //GET / admin / coupons / stats / monthly
        const response = await axiosapi.get("/admin/coupons/stats/monthly");
        if (response.data && response.data.success) {
            monthlyStats.value = response.data.stats; // 更新響應式數據
            // 如果 chartRef.value 存在，可以調用其更新方法
            // if(chartRef.value) chartRef.value.updateChart(monthlyStats.value);
        }



    } catch (error) {
        console.error("取得統計數據失敗:", error);
        // 可以顯示錯誤訊息
    }
}

// --- 導航 ---
function navigateToApplicationReview() {
    router.push('/admin/coupon/applicationReview');

}


// --- 分頁計算 ---
// *** 用 ref 取代 computed ***
const visiblePages = ref([]); // 初始化為空陣列

// --- *** 使用 watch 監聽分頁數據變化，手動更新 visiblePages *** ---
watch([() => pagination.totalPages, () => pagination.currentPage], ([newTotalPages, newCurrentPage]) => {
    const total = Number(newTotalPages);
    const current = Number(newCurrentPage);
    const maxVisible = 5;
    console.log(`WATCH triggered: total=${total}, current=${current}`);

    let pages = [];

    if (isNaN(total) || total <= 1) {
        console.log('WATCH: Setting visiblePages to [] because total is NaN or <= 1');
    } else if (total <= maxVisible) {
        for (let i = 0; i < total; i++) {
            pages.push(i);
        }
        console.log('WATCH: Setting visiblePages (<= maxVisible):', pages);
    } else {
        let startPage = Math.max(0, current - Math.floor(maxVisible / 2));
        let endPage = startPage + maxVisible - 1;
        if (endPage >= total) {
            endPage = total - 1;
            startPage = Math.max(0, endPage - maxVisible + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        console.log('WATCH: Setting visiblePages (> maxVisible):', pages);
    }
    visiblePages.value = pages; // *** 更新 ref 的值 ***
}, { immediate: true }); // immediate: true 確保初始載入時也計算一次


// --- 生命週期鉤子 ---
onMounted(() => {
    callFind(0); // 初始載入第一頁
    fetchMonthlyStats(); // 初始載入圖表數據
    applicationStore.fetchPendingCount(); // *** 載入待審核數量 ***
});
console.log('Visible Pages:', visiblePages.value);
</script>

<style scoped>
/* 可選: 添加特定樣式 */
.pagination .page-link {
    cursor: pointer;
}

.pagination .page-item.disabled .page-link {
    pointer-events: none;
    opacity: 0.6;
}

.col-md-4.text-nowrap {
    white-space: nowrap;
    overflow: visible;
}

.container-fluid {
    padding-top: 0px;
}


.coupon-list-header {
    background-color: #e9ecef;
    /* 淺灰色背景 */
    font-size: 0.9rem;
    color: #495057;
}

/* 調整 Badge 位置可能需要微調 */
.position-absolute.badge {
    font-size: 0.7em;
    padding: 0.25em 0.4em;

}
</style>