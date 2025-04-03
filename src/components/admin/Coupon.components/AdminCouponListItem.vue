<template>
  <div class="row coupon-list-item align-items-center py-2 border-bottom">
    <div class="col-md-1 text-center small">{{ coupon.couponId }}</div>
    <div class="col-md-2 text-truncate" :title="coupon.couponName">{{ coupon.couponName }}</div>
    <div class="col-md-1 text-center small" :title="coupon.discountType">
      {{ formatDiscountType(coupon.discountType) }}
    </div>
    <div class="col-md-1 text-start small">{{ formatDiscountValue(coupon.discountValue, coupon.discountType) }}</div>
    <div class="col-md-1 text-truncate small ps-3" :title="coupon.couponCode">{{ coupon.couponCode }}</div>
    <div class="col-md-2 text-truncate"
      :title="coupon.shopName ? `${coupon.shopName} (ID: ${coupon.shopId})` : `商店 ID: ${coupon.shopId}`">
      <small v-if="coupon.shopName">{{ coupon.shopName }} ({{ coupon.shopId }})</small>
      <small v-else>ID: {{ coupon.shopId }}</small>
    </div>
    <div class="col-md-2 text-center small">{{ coupon.startDate }} ~ {{ coupon.endDate }}</div>
    <div class="col-md-2 text-center">
      <button class="btn btn-warning btn-sm me-2" @click="emitEditCoupon" title="修改">
        <i class="bi bi-pencil-square"></i>
      </button>
      <button class="btn btn-danger btn-sm" @click="emitDeleteCoupon" title="刪除">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  coupon: { // 應為 AdminCouponDTO
    type: Object,
    required: true
  }
});

const emit = defineEmits(["editCoupon", "deleteCoupon"]);

function emitEditCoupon() {
  emit("editCoupon", props.coupon);
}

function emitDeleteCoupon() {
  emit("deleteCoupon", props.coupon.couponId);
}

// 輔助函數：格式化折扣類型顯示名稱
function formatDiscountType(type) {
  if (type === 'PERCENTAGE') return '% 折扣';
  if (type === 'FIXED_AMOUNT') return '固定金額';
  return type || '未知';
}

// 輔助函數：格式化折扣值顯示
function formatDiscountValue(value, type) {
  if (value == null) return '-';
  if (type === 'PERCENTAGE') return `${value}%`;
  // 可以根據需要格式化貨幣，例如加上 $ 符號或千分位
  return value; // 直接顯示數字
}

</script>

<style scoped>
.coupon-list-item {
  font-size: 0.9rem;
  transition: background-color 0.15s ease-in-out;
}

.coupon-list-item:hover {
  background-color: #f8f9fa;
}

.col-md-1,
.col-md-2,
.col-md-3 {
  overflow: hidden;
}

/* 調整可溢出的欄位 */
.small {
  font-size: 0.85em;
  color: #6c757d;
}

.btn-sm {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}

.text-truncate {
  white-space: nowrap;
}

.text-end {
  text-align: right !important;
}

/* 確保靠右對齊 */
</style>