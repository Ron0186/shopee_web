import { defineStore } from 'pinia';
import axiosapi from '@/plugins/axios'; // 你的 axios 實例

export const useCouponApplicationStore = defineStore('couponApplication', {
    state: () => ({
        pendingCount: 0, // 待審核數量
        isLoadingCount: false,
        errorCount: null,
    }),
    actions: {
        // 從後端獲取待審核數量
        async fetchPendingCount() {
            if (this.isLoadingCount) return; // 防止重複請求
            this.isLoadingCount = true;
            this.errorCount = null;
            try {
                console.log("Pinia Store: Fetching pending application count...");
                // ** 確保 API 路徑正確 **
                const response = await axiosapi.get('/admin/coupons/applications/pending/count');
                if (response.data && response.data.success) {
                    this.pendingCount = response.data.count ?? 0;
                    console.log("Pinia Store: Pending count updated to:", this.pendingCount);
                } else {
                    throw new Error(response.data?.message || '無法獲取待審核數量');
                }
            } catch (error) {
                console.error("Pinia Store: Error fetching pending count:", error);
                this.errorCount = error.response?.data?.message || error.message || '獲取數量時出錯';
                this.pendingCount = 0; // 出錯時歸零
            } finally {
                this.isLoadingCount = false;
            }
        },
        // 當一個申請被處理後，減少計數
        decrementPendingCount(amount = 1) {
            if (this.pendingCount > 0) {
                this.pendingCount -= amount;
                console.log("Pinia Store: Pending count decremented to:", this.pendingCount);
            }
        },
        // 如果有 WebSocket 或其他方式得知有新申請，可以增加計數
        incrementPendingCount(amount = 1) {
            this.pendingCount += amount;
            console.log("Pinia Store: Pending count incremented to:", this.pendingCount);
        }
    },
    getters: {
        // 可以添加 getter，例如顯示 loading 狀態等
        getCountLoading: (state) => state.isLoadingCount,
    }
});