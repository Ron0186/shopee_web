<template>
  <div class="modal fade show d-block" tabindex="-1" v-if="isVisible" @click.self="closeModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isInsert ? "新增優惠券" : "編輯優惠券" }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3" v-if="!isInsert">
              <label class="form-label">優惠券 ID</label>
              <input type="text" class="form-control" :value="localCoupon.couponId" disabled />
            </div>

            <div class="mb-3">
              <label for="shopId" class="form-label">所屬商店 ID <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="shopId" v-model.number="localCoupon.shop.shopId" required
                :disabled="!isInsert">
              <div v-if="!localCoupon.shop.shopId" class="text-danger">商店 ID 不得為空</div>
            </div>


            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="couponName" class="form-label">優惠券名稱 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="couponName" v-model.trim="localCoupon.couponName"
                  required />
                <div v-if="!localCoupon.couponName" class="text-danger">優惠券名稱不得為空</div>
              </div>

              <div class="col-md-6 mb-3">
                <label for="couponCode" class="form-label">優惠券代碼 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="couponCode" v-model.trim="localCoupon.couponCode"
                  required />
                <div v-if="!localCoupon.couponCode" class="text-danger">優惠券代碼不得為空</div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="discountType" class="form-label">折扣類型 <span class="text-danger">*</span></label>
                <select class="form-select" id="discountType" v-model="localCoupon.discountType" required>
                  <option value="" disabled>請選擇</option>
                  <option value="PERCENTAGE">百分比折扣 (%)</option>
                  <option value="FIXED_AMOUNT">固定金額折扣</option>
                </select>
                <div v-if="!localCoupon.discountType" class="text-danger">折扣類型不得為空</div>
              </div>

              <div class="col-md-6 mb-3">
                <label for="discountValue" class="form-label">折扣值 <span class="text-danger">*</span></label>
                <input type="number" step="0.01" min="0.01" class="form-control" id="discountValue"
                  v-model.number="localCoupon.discountValue" required />
                <div v-if="!localCoupon.discountValue || localCoupon.discountValue <= 0" class="text-danger">折扣值必須大於 0
                </div>
              </div>
            </div>


            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">開始日期 <span class="text-danger">*</span></label>
                <flat-pickr v-model="localCoupon.startDate" class="form-control"
                  :config="datePickerConfig"></flat-pickr>
                <div v-if="!localCoupon.startDate" class="text-danger">開始日期不得為空</div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">結束日期 <span class="text-danger">*</span></label>
                <flat-pickr v-model="localCoupon.endDate" class="form-control"
                  :config="endDatePickerConfig"></flat-pickr>
                <div v-if="!localCoupon.endDate" class="text-danger">結束日期不得為空</div>
                <div
                  v-if="localCoupon.startDate && localCoupon.endDate && new Date(localCoupon.endDate) < new Date(localCoupon.startDate)"
                  class="text-danger">
                  結束日期不能早於開始日期
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">總使用次數限制 <span class="text-danger">*</span></label>
                <input type="number" min="1" class="form-control" v-model.number="localCoupon.usageLimit" required />
                <div v-if="!localCoupon.usageLimit || localCoupon.usageLimit < 1" class="text-danger">總使用次數必須至少為 1</div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">每人使用次數限制 <span class="text-danger">*</span></label>
                <input type="number" min="1" class="form-control" v-model.number="localCoupon.usagePerUser" required />
                <div v-if="!localCoupon.usagePerUser || localCoupon.usagePerUser < 1" class="text-danger">每人使用次數必須至少為 1
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">優惠券描述 <span class="text-danger">*</span></label>
              <textarea class="form-control" v-model.trim="localCoupon.description" rows="3" required></textarea>
              <div v-if="!localCoupon.description" class="text-danger">描述不得為空</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
              <button type="submit" class="btn btn-primary">
                {{ isInsert ? "新增" : "儲存更新" }}
              </button>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
              {{ errorMessage }}
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>
<script setup>
import { ref, computed, watch, reactive } from "vue";

import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";


// Props 定義
const props = defineProps({
  isVisible: Boolean,
  isInsert: Boolean,
  coupon: {
    type: Object,
    default: () => ({ shop: { shopId: null } })
  }
});

// Emits 定義
const emit = defineEmits(["closeModal", "createCoupon", "modifyCoupon"]);

const errorMessage = ref(null);
const formSubmitted = ref(false); // 標記是否已嘗試提交

// 本地響應式物件，用於表單綁定
const localCoupon = reactive({
  couponId: null,
  couponName: '',
  couponCode: '',
  description: '',
  discountType: '',
  discountValue: null,
  startDate: '',
  endDate: '',
  usageLimit: 100,
  usagePerUser: 1,
  shop: { shopId: null } // 初始化 shop 物件和 shopId
});

// 日期選擇器設定
const datePickerConfig = ref({
  enableTime: false,
  dateFormat: "Y-m-d", // 使用 YYYY-MM-DD 格式
  minDate: "today" // 可以限制只能選今天之後
});

const endDatePickerConfig = computed(() => ({
  ...datePickerConfig.value,
  minDate: localCoupon.startDate || undefined, // 結束日期最早是開始日期
}));

// 監聽 props.coupon 變化，更新本地表單資料
// *** 注意：watch 應放在所有依賴的 ref/reactive 宣告之後 ***
watch(() => props.coupon, (newVal) => {
  console.log("Modal received coupon prop:", newVal);
  formSubmitted.value = false; // 重置提交狀態
  errorMessage.value = null;  // 清除錯誤
  if (!props.isInsert && newVal && newVal.couponId) { // 編輯模式
    Object.assign(localCoupon, {
      ...newVal,
      startDate: newVal.startDate ? formatDateForPicker(newVal.startDate) : '',
      endDate: newVal.endDate ? formatDateForPicker(newVal.endDate) : '',
      shop: { shopId: newVal.shopId || null }
    });
    console.log("Modal localCoupon updated (Edit):", JSON.parse(JSON.stringify(localCoupon)));
  } else if (props.isInsert) { // 新增模式
    resetForm();
    console.log("Modal localCoupon reset (Insert):", JSON.parse(JSON.stringify(localCoupon)));
  }
}, { immediate: true, deep: true });

// 格式化日期給 flatpickr (YYYY-MM-DD)
function formatDateForPicker(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.split(' ')[0]);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if (isNaN(year)) return ''; // 如果日期無效，回傳空
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date for picker:", e);
    return '';
  }
}

// 重設表單
function resetForm() {
  Object.assign(localCoupon, {
    couponId: null, couponName: '', couponCode: '', description: '',
    discountType: '', discountValue: null, startDate: '', endDate: '',
    usageLimit: 100, usagePerUser: 1, shop: { shopId: null }
  });
  errorMessage.value = null;
  formSubmitted.value = false; // 重置提交狀態
}

// 表單驗證邏輯
function validateForm() {
  errorMessage.value = null; // 清除舊錯誤
  if (!localCoupon.shop?.shopId) { errorMessage.value = '必須指定商店 ID'; return false; }
  if (!localCoupon.couponName) { errorMessage.value = '優惠券名稱不得為空'; return false; }
  if (!localCoupon.couponCode) { errorMessage.value = '優惠券代碼不得為空'; return false; }
  if (!localCoupon.discountType) { errorMessage.value = '折扣類型不得為空'; return false; }
  if (localCoupon.discountValue == null || localCoupon.discountValue <= 0) { errorMessage.value = '折扣值必須大於 0'; return false; } // == null 檢查 undefined 和 null
  if (!localCoupon.startDate) { errorMessage.value = '開始日期不得為空'; return false; }
  if (!localCoupon.endDate) { errorMessage.value = '結束日期不得為空'; return false; }
  // 確保比較的是 Date 物件
  const startDate = localCoupon.startDate ? new Date(localCoupon.startDate) : null;
  const endDate = localCoupon.endDate ? new Date(localCoupon.endDate) : null;
  if (startDate && endDate && endDate < startDate) { errorMessage.value = '結束日期不能早於開始日期'; return false; }
  if (localCoupon.usageLimit == null || localCoupon.usageLimit < 1) { errorMessage.value = '總使用次數必須至少為 1'; return false; }
  if (localCoupon.usagePerUser == null || localCoupon.usagePerUser < 1) { errorMessage.value = '每人使用次數必須至少為 1'; return false; }
  if (!localCoupon.description) { errorMessage.value = '描述不得為空'; return false; }
  return true; // 所有檢查通過
}

// 提交表單
function submitForm() {
  formSubmitted.value = true; // 標記已嘗試提交，觸發驗證訊息顯示
  if (validateForm()) { // 在提交時才進行驗證
    // 初始 payload 包含所有 localCoupon 屬性
    const payload = {
      ...localCoupon,
    };

    if (props.isInsert) {
      // *** 新增模式：明確移除不應由前端設定的欄位 ***
      delete payload.couponId;
      delete payload.createdAt; // <-- 新增移除
      delete payload.updatedAt; // <-- 新增移除
      emit("createCoupon", payload);
    } else {
      // *** 編輯模式：也可以考慮移除，讓後端處理 updatedAt ***
      // delete payload.createdAt; // createdAt 通常不應更改
      // delete payload.updatedAt; // 讓後端設為當前時間
      emit("modifyCoupon", payload); // 傳遞包含 couponId 的 payload
    }
  } else {
    console.log("表單驗證失敗:", errorMessage.value);
  }
}

// 關閉 Modal
function closeModal() {
  // 不需要 resetForm()，因為 watch 會在 isVisible 變 false 時處理 (如果需要的話)
  // 或者在父元件關閉時清除 selectedCoupon
  errorMessage.value = null;
  formSubmitted.value = false;
  emit('closeModal');
}

</script>

<style scoped>
.modal.show {
  display: block;
  /* 移除背景色，由 backdrop 處理 */
}

.modal-backdrop {
  /* 確保背景層存在 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  /* 比 modal 低一層 */
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.text-danger {
  font-size: 0.8em;
}

/* Flatpickr focus style if needed */
.flatpickr-input:focus {
  outline: none;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  /* Bootstrap focus style */
}
</style>