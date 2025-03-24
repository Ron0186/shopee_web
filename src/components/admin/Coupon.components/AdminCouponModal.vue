<template>
  <div class="modal fade show d-block" tabindex="-1" v-if="isModalVisible">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isInsert ? "新增優惠券" : "編輯優惠券" }}</h5>
          <button type="button" class="btn-close" @click="$emit('closeModal')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <!-- 優惠券 ID -->
            <div class="mb-3">
              <label class="form-label">優惠券 ID</label>
              <input type="text" class="form-control" v-model="couponId" required />
              <small v-if="isDuplicate" class="text-danger">此優惠券 ID 已存在，請使用其他 ID</small>
              <small v-if="isInvalidId" class="text-danger">請輸入數字</small>
            </div>

            <div class="row">
              <!-- 優惠券名稱 -->
              <div class="col-md-6">
                <label class="form-label">優惠券名稱</label>
                <input type="text" class="form-control" v-model="localCoupon.couponName" required />
              </div>

              <!-- 優惠券代碼 -->
              <div class="col-md-6">
                <label class="form-label">優惠券代碼</label>
                <input type="text" class="form-control" v-model="localCoupon.couponCode" required />
              </div>
            </div>

            <div class="row">
              <!-- 開始日期 -->
              <div class="col-md-6">
                <label class="form-label">開始日期</label>
                <flat-pickr v-model="localCoupon.startDate" class="form-control"
                  :config="startDatePickerConfig"></flat-pickr>
                <small v-if="startDateError" class="text-danger">開始日期不能早於今天</small>
              </div>

              <!-- 結束日期 -->
              <div class="col-md-6">
                <label class="form-label">結束日期</label>
                <flat-pickr v-model="localCoupon.endDate" class="form-control"
                  :config="endDatePickerConfig"></flat-pickr>
                <small v-if="endDateError" class="text-danger">結束日期不能早於開始日期</small>
              </div>
            </div>

            <div class="row">
              <!-- 折扣類型 -->
              <div class="col-md-6">
                <label class="form-label">折扣類型</label>
                <select class="form-select" v-model="localCoupon.discountType" required>
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed">固定金額折扣</option>
                </select>
              </div>

              <!-- 折扣值 -->
              <div class="col-md-6">
                <label class="form-label">折扣值</label>
                <input type="number" class="form-control" v-model.number="discountValue" @input="validateDiscountValue"
                  required />
                <small v-if="isInvalidDiscount" class="text-danger">輸入值要大於 0</small>
              </div>
            </div>

            <div class="row">
              <!-- 使用數量限制 -->
              <div class="col-md-6">
                <label class="form-label">使用數量限制</label>
                <input type="number" class="form-control" v-model="localCoupon.usageLimit" required />
              </div>

              <!-- 每人持有數量 -->
              <div class="col-md-6">
                <label class="form-label">每人持有數量</label>
                <input type="number" class="form-control" v-model="localCoupon.usagePerUser" required />
              </div>
            </div>

            <!-- 優惠券描述 -->
            <div class="mb-3">
              <label class="form-label">優惠券描述</label>
              <textarea class="form-control" v-model="localCoupon.description" rows="3" required></textarea>
            </div>


            <!-- 圖片上傳，不顯示 photoId -->
            <div class="mb-3">
              <label class="form-label">上傳圖片</label>
              <input type="file" class="form-control" @change="handleImageUpload" />
              <!-- 圖片預覽 -->
              <img v-if="imagePreview" :src="imagePreview" alt="預覽" style="max-width: 150px; margin-top: 5px;" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('closeModal')">取消</button>
              <!--
                ✅ 若表單驗證通過、且 couponId 沒重複時，才能點擊「新增/更新」
                若一直顯示灰色(無法點擊)，代表 isFormValid 或 couponIdExists 仍為 false
              -->
              <button type="submit" class="btn btn-primary"
                :disabled="!isFormValid || isDuplicate || isInvalidId || isInvalidDiscount">
                {{ isInsert ? "新增" : "更新" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axiosapi from "@/plugins/axios";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { debounce } from "lodash";

// ✅ 接收父層的 props
const props = defineProps({
  isModalVisible: Boolean,
  isInsert: Boolean,
  coupon: Object
});
const isInvalidDiscount = ref(false); // 折扣值驗證
const discountValue = ref(props.coupon?.discountValue ?? 0); // 預設為 0
const isInvalidId = ref(false); // 是否為非法 ID（非數字）
// ✅ 向父層發事件
const emit = defineEmits(["closeModal", "createCoupon", "modifyCoupon"]);

// ✅ localCoupon 儲存其他欄位
const localCoupon = ref({ ...props.coupon, photo: null });
const imagePreview = ref(null); // 用於顯示圖片預覽

// ✅ 分開儲存 couponId，用來自動檢查
const couponId = ref(localCoupon.value.couponId || "");

// ✅ 檢查中 / 重複標記
const isChecking = ref(false);
const isDuplicate = ref(false);

// ✅ 取得今天 0:00
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

// ✅ 日期設定
const startDatePickerConfig = {
  enableTime: false,
  dateFormat: "Y/m/d",
  minDate: currentDate,
};
const endDatePickerConfig = computed(() => ({
  enableTime: false,
  dateFormat: "Y/m/d",
  minDate: localCoupon.value.startDate || currentDate,
}));

// ✅ 日期錯誤判斷
const startDateError = computed(() => {
  return localCoupon.value.startDate && new Date(localCoupon.value.startDate) < currentDate;
});
const endDateError = computed(() => {
  return (
    localCoupon.value.endDate &&
    localCoupon.value.startDate &&
    new Date(localCoupon.value.endDate) < new Date(localCoupon.value.startDate)
  );
});
// ✅ 驗證是否輸入了非數字
function validateCouponId() {
  const regex = /^\d*$/; // 只允許數字
  isInvalidId.value = !regex.test(couponId.value);
}
// ✅ 折扣值驗證
function validateDiscountValue() {
  isInvalidDiscount.value = discountValue.value <= 0; // 必須大於 0
}
// ✅ 自動檢查 couponId
const checkCouponId = debounce(async () => {
  if (!couponId.value) {
    isDuplicate.value = false;
    return;
  }

  isChecking.value = true;
  try {
    // 請確保有設定 axios baseURL 或使用完整 URL
    // e.g. axios.get(`http://localhost:8080/coupons/check/${couponId.value}`)
    const response = await axiosapi.get(`/coupons/check/${couponId.value}`);
    // 後端回傳 JSON 字串
    // e.g. {"duplicate":true}
    const data = response.data;
    isDuplicate.value = data.duplicate === true;
  } catch (error) {
    console.error("API 請求錯誤:", error);
    // 🔻 省略 Swal，直接 console 或做其他處理
  } finally {
    isChecking.value = false;
  }
}, 500);

// ✅ watch couponId，若 isInsert 才檢查
watch(couponId, () => {
  validateCouponId();
  if (!isInvalidId.value) {
    checkCouponId();
  }
});
// ✅ 當 props.coupon 改變時，更新 localCoupon / couponId
watch(
  () => props.coupon,
  (newVal) => {
    localCoupon.value = { ...newVal, photo: null };
    couponId.value = newVal.couponId || "";
    discountValue.value = newVal.discountValue ?? 0;

  }
);

// ✅ 處理圖片上傳
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    // e.g. "data:image/png;base64,xxx..."
    const base64Full = reader.result; // 整個 Base64 Data URL
    // 去掉 "data:image/png;base64,"
    localCoupon.value.photo = base64Full.split(",")[1];
    imagePreview.value = base64Full; // 給預覽
  };
  reader.readAsDataURL(file);
}

// ✅ 表單驗證
const isFormValid = computed(() => {
  return (
    couponId.value &&
    localCoupon.value.couponName && // couponId 不能空
    localCoupon.value.startDate &&
    localCoupon.value.endDate &&
    !startDateError.value &&
    !endDateError.value &&
    discountValue.value > 0
  );
});

// ✅ 提交表單
function submitForm() {
  if (!isDuplicate.value && isFormValid.value && !isInvalidId.value && !isInvalidDiscount.value) {
    // 將 couponId 帶回 localCoupon
    localCoupon.value.couponId = couponId.value;
    if (props.isInsert) {
      emit("createCoupon", localCoupon.value);
    } else {
      emit("modifyCoupon", localCoupon.value);
    }
  }
}

</script>
