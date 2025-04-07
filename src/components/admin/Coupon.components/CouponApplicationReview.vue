<template>
    <div class="container-fluid my-4 px-md-4">
        <h3><i class="bi bi-journal-check me-2"></i>審核優惠券申請</h3>
        <p>請審核以下由賣家提交的優惠券申請。點擊核准將會建立/刪除對應的優惠券。</p>

        <div class="mb-3">
            <button class="btn btn-outline-secondary btn-sm" @click="goBack">
                <router-link to="/coupon/adminCouponManager" style="text-decoration: none;"> <i
                        class="bi bi-arrow-left"></i> 返回優惠券管理列表</router-link>

            </button>
        </div>

        <div v-if="isLoading" class="text-center mt-5">...</div>
        <div v-else-if="loadError" class="alert alert-danger mt-3">...</div>
        <div v-else-if="pendingApplications.length === 0" class="alert alert-light text-center mt-3 border">...</div>

        <div v-else class="table-responsive mt-3">
            <table class="table table-hover table-bordered align-middle review-table caption-top small">
                <caption>待審核申請列表 (共 {{ pendingApplications.length }} 筆)</caption>
                <thead class="table-light sticky-top">
                    <tr>
                        <th scope="col" class="text-center col-1">#ID</th>
                        <th scope="col" class="text-center col-1">類型</th>
                        <th scope="col" class="col-2">申請商店 (ID)</th>
                        <th scope="col" class="col-2">申請人 (ID)</th>
                        <th scope="col" class="text-nowrap col-2">申請日期</th>
                        <th scope="col" class="col-3">建議內容摘要</th>
                        <th scope="col" class="text-center col-1">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="app in pendingApplications" :key="app.applicationId">
                        <td class="text-center">{{ app.applicationId }}</td>
                        <td class="text-center">
                            <span :class="getBadgeClass(app.applicationType)" class="badge">
                                {{ formatApplicationType(app.applicationType) }}
                            </span>
                        </td>
                        <td> <span :title="`商店ID: ${app.requestedShopId}`">
                                {{ app.requestedShopName || `ID: ${app.requestedShopId}` }}
                            </span>
                        </td>
                        <td> <span :title="`用戶ID: ${app.requestedBySellerId}`">
                                {{ app.requestedBySellerName || `ID: ${app.requestedBySellerId}` }}
                            </span>
                        </td>
                        <td class="text-nowrap">{{ formatDateTime(app.applicationDate) }}</td>
                        <td>
                            <ul v-if="app.applicationType !== 'DELETE'" class="list-unstyled mb-0 summary-list">
                                <li v-if="app.couponName"><strong>名稱:</strong> {{ app.couponName }}</li>
                                <li v-if="app.couponCode"><strong>代碼:</strong> {{ app.couponCode }}</li>
                                <li v-if="app.discountType != null"><strong>折扣:</strong> {{
                                    formatDiscountType(app.discountType) }} {{ formatDiscountValue(app.discountValue,
                                        app.discountType) }}</li>
                                <li v-if="app.startDate"><strong>期限:</strong> {{ formatDate(app.startDate) }} ~ {{
                                    formatDate(app.endDate) }}</li>
                                <li v-if="app.usageLimit != null"><strong>限制:</strong> 總 {{ app.usageLimit }} / 每人 {{
                                    app.usagePerUser }}</li>
                                <li v-if="app.description" :title="app.description" class="description-truncate">
                                    <strong>描述:</strong> {{ app.description }}
                                </li>
                            </ul>
                            <span v-else class="text-muted fst-italic"> (刪除申請無建議內容)</span>
                        </td>
                        <td class="text-center action-buttons"> <button class="btn btn-success btn-sm me-1 mb-1"
                                @click="handleApprove(app)" :disabled="isProcessing === app.applicationId"
                                :title="`核准 ${formatApplicationType(app.applicationType)} 申請`">
                                <span v-if="isProcessing === app.applicationId && currentAction === 'approve'"
                                    class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <i v-else class="bi bi-check-lg"></i>
                                <span class="d-none d-md-inline ms-1">核准</span>
                            </button>
                            <button class="btn btn-danger btn-sm mb-1" @click="handleReject(app.applicationId)"
                                :disabled="isProcessing === app.applicationId" title="拒絕申請">
                                <span v-if="isProcessing === app.applicationId && currentAction === 'reject'"
                                    class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <i v-else class="bi bi-x-lg"></i>
                                <span class="d-none d-md-inline ms-1">拒絕</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosapi from '@/plugins/axios';
import Swal from 'sweetalert2';
// import { useUserStore } from '@/stores/user'; // 如果需要 adminId
// const userStore = useUserStore();

const isLoading = ref(false);
const pendingApplications = ref([]); // 存放 AdminCouponApplicationDTO 列表
const loadError = ref(null); // 改名以區分操作錯誤
const isProcessing = ref(null);
const currentAction = ref('');

// --- API 呼叫 ---

// 獲取待審核列表
async function fetchPendingApplications() {
    isLoading.value = true;
    loadError.value = null; // 使用 loadError
    pendingApplications.value = [];
    try {
        console.log("正在獲取待審核申請...");
        const response = await axiosapi.get('/admin/coupons/applications/pending');
        console.log("API 回應:", response.data);
        if (response.data && response.data.success) {
            pendingApplications.value = response.data.list || [];
            console.log("成功獲取申請:", pendingApplications.value.length, "筆");
        } else {
            throw new Error(response.data?.message || '無法載入申請列表 (回應格式錯誤)');
        }
    } catch (error) {
        console.error("載入待審核申請失敗:", error);
        loadError.value = error.response?.data?.message || error.message || '載入資料時發生錯誤';
        Swal.fire('載入失敗', loadError.value, 'error'); // 出錯時提示
    } finally {
        isLoading.value = false;
    }
}

// 核准操作
async function handleApprove(application) {
    const { applicationId, applicationType } = application;
    let endpoint = '';
    let confirmText = '';
    let successText = '';

    switch (applicationType) {
        case 'CREATE':
            endpoint = `/admin/coupons/applications/${applicationId}/approve-create`;
            confirmText = '確定要核准此新增申請並建立優惠券嗎？';
            successText = '新增申請已核准，優惠券已建立。';
            break;
        case 'UPDATE':
            endpoint = `/admin/coupons/applications/${applicationId}/approve-update`;
            confirmText = `確定要核准修改申請 (目標券ID: ${application.targetCouponId}) 嗎？`;
            successText = '修改申請已核准，優惠券已更新。';
            break;
        case 'DELETE':
            endpoint = `/admin/coupons/applications/${applicationId}/approve-delete`;
            confirmText = `確定要核准刪除申請 (目標券ID: ${application.targetCouponId}) 嗎？此操作將刪除目標優惠券！`;
            successText = '刪除申請已核准，優惠券已刪除。';
            break;
        default:
            Swal.fire('錯誤', '未知的申請類型', 'error');
            return;
    }

    const result = await Swal.fire({ /* ... 確認對話框設定 ... */
        title: '確認核准?',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754', // 綠色
        cancelButtonColor: '#6c757d',
        confirmButtonText: '確定核准',
        cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
        isProcessing.value = applicationId;
        currentAction.value = 'approve';
        try {
            console.log(`正在核准 ${applicationType} 申請 ID: ${applicationId}`);
            // 假設後端從 SecurityContext 獲取 adminId
            const response = await axiosapi.post(endpoint);

            if (response.data && response.data.success) {
                Swal.fire('已核准!', successText, 'success');
                // 從列表中移除
                pendingApplications.value = pendingApplications.value.filter(app => app.applicationId !== applicationId);
            } else {
                throw new Error(response.data?.message || '核准操作失敗');
            }
        } catch (error) {
            console.error(`核准申請 ${applicationId} 失敗:`, error);
            Swal.fire('核准失敗!', `操作失敗: ${error.response?.data?.message || error.message}`, 'error');
        } finally {
            isProcessing.value = null;
            currentAction.value = '';
        }
    }
}

// 拒絕操作
async function handleReject(applicationId) {
    const { value: reason } = await Swal.fire({ /* ... 拒絕對話框設定 ... */
        title: '確定拒絕申請?',
        input: 'textarea',
        inputLabel: '拒絕理由 (可選)',
        inputPlaceholder: '請在此輸入拒絕的原因...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // 紅色
        cancelButtonColor: '#6c757d',
        confirmButtonText: '確定拒絕',
        cancelButtonText: '取消',
        inputValidator: (value) => { return null } // 暫不驗證理由
    });

    if (reason !== undefined) {
        isProcessing.value = applicationId;
        currentAction.value = 'reject';
        try {
            console.log(`正在拒絕申請 ID: ${applicationId}, 理由: ${reason}`);
            const endpoint = `/admin/coupons/applications/${applicationId}/reject`;
            const payload = reason ? { reason: reason } : {};
            // 假設後端從 SecurityContext 獲取 adminId
            const response = await axiosapi.post(endpoint, payload);

            if (response.data && response.data.success) {
                Swal.fire('已拒絕!', '申請已被拒絕。', 'success');
                pendingApplications.value = pendingApplications.value.filter(app => app.applicationId !== applicationId);
            } else {
                throw new Error(response.data?.message || '拒絕操作失敗');
            }
        } catch (error) {
            console.error(`拒絕申請 ${applicationId} 失敗:`, error);
            Swal.fire('拒絕失敗!', `操作失敗: ${error.response?.data?.message || error.message}`, 'error');
        } finally {
            isProcessing.value = null;
            currentAction.value = '';
        }
    }
}


// --- 輔助函數 ---
function formatDateTime(dateString) { /* ... */  if (!dateString) return 'N/A'; try { const date = new Date(dateString); return date.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return dateString; } }
function formatDate(dateString) { /* ... */ if (!dateString) return 'N/A'; try { const date = new Date(dateString.split(' ')[0]); const year = date.getFullYear(); const month = (date.getMonth() + 1).toString().padStart(2, '0'); const day = date.getDate().toString().padStart(2, '0'); if (isNaN(year)) return dateString; return `${year}-${month}-${day}`; } catch (e) { return dateString; } }
function formatApplicationType(type) { /* ... */ switch (type) { case 'CREATE': return '新增'; case 'UPDATE': return '修改'; case 'DELETE': return '刪除'; default: return type || '未知'; } }
function getBadgeClass(type) { /* ... */ switch (type) { case 'CREATE': return 'bg-primary'; case 'UPDATE': return 'bg-warning text-dark'; case 'DELETE': return 'bg-danger'; default: return 'bg-secondary'; } }
function formatDiscountType(type) { /* ... */ if (type === 'PERCENTAGE') return '% 折扣'; if (type === 'FIXED_AMOUNT') return '固定金額'; return type || '-'; }
function formatDiscountValue(value, type) { /* ... */ if (value == null) return '-'; if (type === 'PERCENTAGE') return `${value}%`; return value; }

// --- 生命週期 ---
onMounted(() => {
    fetchPendingApplications();
});
</script>

<style scoped>
.container-fluid {
    padding-top: 0px;
}

.review-table th,
.review-table td {
    vertical-align: middle;
    padding: 0.5rem 0.75rem;
}

.review-table th {
    white-space: nowrap;
    background-color: #f8f9fa;
}

.review-table .small {
    font-size: 0.875em;
}

.summary-list {
    padding-left: 0;
    margin-bottom: 0;
    line-height: 1.5;
}

.summary-list li {
    padding: 1px 0;
}

.description-truncate {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
}

/* 可調整寬度 */
.action-buttons button {
    margin-bottom: 0.25rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
}

.action-buttons .btn i {
    margin-right: 0.25rem;
}

.sticky-top {
    position: sticky;
    top: 35px;
    z-index: 900;
}

.badge {
    font-weight: 500;
}

.caption-top {
    caption-side: top;
    text-align: left;
    color: #6c757d;
    padding-bottom: 0.5rem;
}

.table-responsive {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
}
</style>