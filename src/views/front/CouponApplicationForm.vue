<template>
    <div class="container mt-4 coupon-application-form">
        <h2>申請新的優惠券</h2>
        <p>請填寫您希望建立的優惠券詳細資訊，提交後將由管理員審核。</p>
        <hr>

        <div v-if="!shopId" class="alert alert-warning">
            您似乎尚未擁有商店，無法申請優惠券。請先 <router-link to="/shop/apply">申請成為賣家</router-link>。
        </div>

        <form v-else @submit.prevent="submitApplication">
            <input type="hidden" :value="shopId">
            <input type="hidden" :value="sellerId">

            <div class="row g-3">
                <div class="col-md-6">
                    <label for="appName" class="form-label">優惠券名稱 <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="appName" v-model.trim="applicationData.couponName"
                        required>
                    <div v-if="formSubmitted && !applicationData.couponName" class="text-danger small mt-1">此欄位為必填</div>
                </div>
                <div class="col-md-6">
                    <label for="appCode" class="form-label">優惠券代碼 <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="appCode" v-model.trim="applicationData.couponCode"
                        required @blur="checkDuplicateCode">
                    <div v-if="formSubmitted && !applicationData.couponCode" class="text-danger small mt-1">此欄位為必填</div>
                    <div v-if="duplicateCheckResult.codeExists" class="text-danger small mt-1">此商店已存在相同代碼的有效優惠券，請更換代碼。
                    </div>
                    <div class="form-text">建議使用英文或數字組合，容易記憶。</div>
                </div>

                <div class="col-md-6">
                    <label for="appDiscountType" class="form-label">折扣類型 <span class="text-danger">*</span></label>
                    <select class="form-select" id="appDiscountType" v-model="applicationData.discountType" required>
                        <option value="" disabled>請選擇</option>
                        <option value="PERCENTAGE">百分比折扣 (%)</option>
                        <option value="FIXED_AMOUNT">固定金額折扣</option>
                    </select>
                    <div v-if="formSubmitted && !applicationData.discountType" class="text-danger small mt-1">此欄位為必填
                    </div>
                </div>
                <div class="col-md-6">
                    <label for="appDiscountValue" class="form-label">折扣值 <span class="text-danger">*</span></label>
                    <input type="number" step="0.01" min="0.01" class="form-control" id="appDiscountValue"
                        v-model.number="applicationData.discountValue" required>
                    <div v-if="formSubmitted && (!applicationData.discountValue || applicationData.discountValue <= 0)"
                        class="text-danger small mt-1">折扣值必須大於 0</div>
                    <div class="form-text">百分比請輸入數字(如10代表10%)，固定金額請輸入數值。</div>
                </div>

                <div class="col-md-6">
                    <label for="appStartDate" class="form-label">希望開始日期 <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="appStartDate" v-model="applicationData.startDate"
                        :min="todayDate" required>
                    <div v-if="formSubmitted && !applicationData.startDate" class="text-danger small mt-1">此欄位為必填</div>
                </div>
                <div class="col-md-6">
                    <label for="appEndDate" class="form-label">希望結束日期 <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="appEndDate" v-model="applicationData.endDate"
                        :min="applicationData.startDate || todayDate" required>
                    <div v-if="formSubmitted && !applicationData.endDate" class="text-danger small mt-1">此欄位為必填</div>
                    <div v-if="applicationData.startDate && applicationData.endDate && new Date(applicationData.endDate) < new Date(applicationData.startDate)"
                        class="text-danger small mt-1">
                        結束日期不能早於開始日期。
                    </div>
                </div>

                <div class="col-md-6">
                    <label for="appUsageLimit" class="form-label">總使用次數限制 <span class="text-danger">*</span></label>
                    <input type="number" min="1" class="form-control" id="appUsageLimit"
                        v-model.number="applicationData.usageLimit" required>
                    <div v-if="formSubmitted && (!applicationData.usageLimit || applicationData.usageLimit < 1)"
                        class="text-danger small mt-1">總使用次數必須至少為 1</div>
                </div>
                <div class="col-md-6">
                    <label for="appUsagePerUser" class="form-label">每位用戶使用次數限制 <span
                            class="text-danger">*</span></label>
                    <input type="number" min="1" class="form-control" id="appUsagePerUser"
                        v-model.number="applicationData.usagePerUser" required>
                    <div v-if="formSubmitted && (!applicationData.usagePerUser || applicationData.usagePerUser < 1)"
                        class="text-danger small mt-1">每人使用次數必須至少為 1</div>
                </div>

                <div class="col-12">
                    <label for="appDescription" class="form-label">描述 <span class="text-danger">*</span></label>
                    <textarea class="form-control" id="appDescription" rows="3"
                        v-model.trim="applicationData.description" required></textarea>
                    <div v-if="formSubmitted && !applicationData.description" class="text-danger small mt-1">此欄位為必填
                    </div>
                </div>
            </div>

            <hr class="my-4">

            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary me-2" @click="resetForm">重設表單</button>
                <button type="submit" class="btn btn-primary"
                    :disabled="isSubmitting || duplicateCheckResult.codeExists || duplicateCheckResult.nameExists">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span v-else>提交申請</span>
                </button>
            </div>

            <div v-if="submitError" class="alert alert-danger mt-3" role="alert">
                提交失敗：{{ submitError }}
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user'; // 匯入 Pinia Store
import axiosapi from '@/plugins/axios';     // 匯入你的 axios 實例
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 從 Store 取得 Seller ID 和 Shop ID
const sellerId = computed(() => userStore.userId);
const shopId = computed(() => userStore.shopId);

const applicationData = reactive({
    couponCode: '',
    couponName: '',
    discountType: '',
    discountValue: null,
    startDate: '',
    endDate: '',
    usageLimit: 100,
    usagePerUser: 1,
    description: '',
});

const isSubmitting = ref(false);
const submitError = ref(null);
const formSubmitted = ref(false); // 用於觸發驗證訊息顯示
const duplicateCheckResult = reactive({ codeExists: false, nameExists: false });

// 計算今天日期用於日期選擇器 min 屬性
const todayDate = computed(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
});

// 檢查優惠券代碼/名稱是否重複 (呼叫 Seller API)
async function checkDuplicate(field) {
    if (!shopId.value || !sellerId.value) return; // 確保有必要資訊

    const params = {
        shopId: shopId.value,
        sellerId: sellerId.value, // 傳遞 sellerId 以供後端驗證（雖然此 API 可能不需要）
    };

    if (field === 'code' && applicationData.couponCode) {
        params.code = applicationData.couponCode;
        duplicateCheckResult.codeExists = false; // 先重設
    } else if (field === 'name' && applicationData.couponName) {
        params.name = applicationData.couponName;
        duplicateCheckResult.nameExists = false; // 先重設
    } else {
        return; // 沒有內容可檢查
    }

    try {
        const response = await axiosapi.get('/coupons/check-duplicate', { params });
        if (response.data && response.data.success) {
            if (field === 'code') {
                duplicateCheckResult.codeExists = response.data.exists.codeExists;
            } else if (field === 'name') {
                // 注意：目前後端檢查名稱可能還未實現或有誤，先假設有回傳
                duplicateCheckResult.nameExists = response.data.exists.nameExists;
            }
        }
    } catch (error) {
        console.error(`檢查重複 ${field} 時發生錯誤:`, error);
        // 不阻擋用戶提交，讓後端再次驗證
    }
}
// 失焦時檢查
const checkDuplicateCode = () => checkDuplicate('code');
// const checkDuplicateName = () => checkDuplicate('name'); // 名稱通常不需要失焦檢查

// 表單驗證函數
function validateForm() {
    submitError.value = null; // 清除舊錯誤
    // 可以在這裡加入更詳細的客戶端驗證
    if (!applicationData.couponName || !applicationData.couponCode || !applicationData.discountType ||
        !applicationData.discountValue || applicationData.discountValue <= 0 ||
        !applicationData.startDate || !applicationData.endDate ||
        new Date(applicationData.endDate) < new Date(applicationData.startDate) ||
        !applicationData.usageLimit || applicationData.usageLimit < 1 ||
        !applicationData.usagePerUser || applicationData.usagePerUser < 1 ||
        !applicationData.description) {
        submitError.value = "請檢查所有必填欄位 (*) 並確保格式正確。";
        return false;
    }
    if (duplicateCheckResult.codeExists) {
        submitError.value = "優惠券代碼已存在，請更換。";
        return false;
    }
    if (duplicateCheckResult.nameExists) {
        submitError.value = "優惠券名稱已存在，請更換。";
        return false;
    }
    return true;
}

// 提交申請
async function submitApplication() {
    formSubmitted.value = true; // 標記已提交以顯示驗證錯誤
    if (!validateForm()) {
        return; // 驗證失敗則停止
    }

    isSubmitting.value = true;
    submitError.value = null;

    try {
        // 使用 Seller 的申請 API
        const url = `/coupons/applications/new?sellerId=${sellerId.value}&shopId=${shopId.value}`;
        const response = await axiosapi.post(url, applicationData);

        if (response.data && response.data.success) {
            await Swal.fire({
                title: '申請已提交!',
                text: '您的優惠券申請已成功提交，請等候管理員審核。',
                icon: 'success',
                confirmButtonText: '好的'
            });
            // 提交成功後可以考慮跳轉頁面或清空表單
            router.push(`/shop`); // 例如跳回賣家商店頁
            // resetForm(); // 或者只清空表單
        } else {
            throw new Error(response.data?.message || '提交失敗，未知錯誤');
        }
    } catch (error) {
        console.error('提交申請失敗:', error);
        submitError.value = error.response?.data?.message || error.message || '提交申請時發生錯誤，請稍後再試。';
        Swal.fire('提交失敗', submitError.value, 'error');
    } finally {
        isSubmitting.value = false;
    }
}

// 重設表單
function resetForm() {
    Object.assign(applicationData, {
        couponCode: '', couponName: '', discountType: '', discountValue: null,
        startDate: '', endDate: '', usageLimit: 100, usagePerUser: 1, description: '',
    });
    formSubmitted.value = false;
    submitError.value = null;
    duplicateCheckResult.codeExists = false;
    duplicateCheckResult.nameExists = false;
}

// 如果用戶未登入或不是賣家，理論上路由守衛會處理，但可以加個檢查
onMounted(() => {
    if (!userStore.isSeller || !userStore.shopId) {
        // 可以顯示提示或導向其他頁面
        console.warn("當前使用者不是賣家或沒有商店 ID");
    }
});

</script>

<style scoped>
.coupon-application-form {
    max-width: 800px;
    /* 限制最大寬度 */
    margin: 2rem auto;
    /* 上下邊距，左右自動居中 */
    padding: 2rem;
    background-color: #f8f9fa;
    /* 淡灰色背景 */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
}

h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #343a40;
}

.form-text {
    font-size: 0.8em;
    color: #6c757d;
}

.text-danger.small {
    font-size: 0.75em;
    /* 讓驗證錯誤文字更小 */
}

hr {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
</style>