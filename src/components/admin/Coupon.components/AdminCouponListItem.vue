<template>
  <div class="row coupon-list-item align-items-center py-2 border-bottom">
    <div class="col-md-1 text-center small">{{ coupon.couponId }}</div>
    <div class="col-md-2 text-truncate" :title="coupon.couponName">{{ coupon.couponName }}</div>
    <div class="col-md-2 text-truncate" :title="coupon.couponCode">{{ coupon.couponCode }}</div>
    <div class="col-md-2 text-truncate"
      :title="coupon.shopName ? `${coupon.shopName} (ID: ${coupon.shopId})` : `商店 ID: ${coupon.shopId}`">
      <small v-if="coupon.shopName">{{ coupon.shopName }} ({{ coupon.shopId }})</small>
      <small v-else>ID: {{ coupon.shopId }}</small>
    </div>
    <div class="col-md-3 text-center small">{{ coupon.startDate }} ~ {{ coupon.endDate }}</div>
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
</script>

<style scoped>
.coupon-list-item {
  font-size: 0.9rem;
  /* 列表文字稍微小一點 */
  transition: background-color 0.15s ease-in-out;
  /* 添加 hover 效果 */
}

.coupon-list-item:hover {
  background-color: #f8f9fa;
  /* 滑鼠移過時的背景色 */
}

.col-md-2,
.col-md-3 {
  /* 限制某些欄寬，避免過長 */
  overflow: hidden;
}

.small {
  font-size: 0.85em;
  /* ID 和日期等使用更小的字體 */
  color: #6c757d;
  /* 次要文字顏色 */
}

.btn-sm {
  padding: 0.2rem 0.4rem;
  /* 調整按鈕大小 */
  font-size: 0.75rem;
}

.text-truncate {
  white-space: nowrap;
}
</style>