<template>
  <div class="col-md-4 mb-4">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">ID: {{ coupon.couponId }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">名稱: {{ coupon.couponName }}</h6>
        <p class="card-text mb-1">代碼: {{ coupon.couponCode }}</p>
        <p v-if="coupon.shopName" class="card-text mb-1">
          <small>商店: {{ coupon.shopName }} (ID: {{ coupon.shopId }})</small>
        </p>
        <p class="card-text mb-1">
          類型: {{ coupon.discountType }} | 值: {{ coupon.discountValue }}
        </p>
        <p class="card-text mb-1">
          限制: 總 {{ coupon.usageLimit }} / 每人 {{ coupon.usagePerUser }}
        </p>
        <p class="card-text mb-1">
          狀態: <span :class="coupon.redeemed ? 'text-danger' : 'text-success'">{{ coupon.redeemed ? '已(部分)兌換' : '可兌換'
          }}</span>
        </p>
        <p class="card-text">
          有效期限: {{ coupon.startDate }} ~ {{ coupon.endDate }}
        </p>
        <p class="card-text" v-if="coupon.description"
          style="font-size: 0.9em; max-height: 3em; overflow: hidden; text-overflow: ellipsis;"
          :title="coupon.description">
          描述: {{ coupon.description }}
        </p>
      </div>

      <div class="card-footer d-flex justify-content-between align-items-center">
        <button class="btn btn-warning btn-sm" @click="emitEditCoupon">
          <i class="bi bi-pencil-square"></i> 修改
        </button>
        <button class="btn btn-danger btn-sm" @click="emitDeleteCoupon">
          <i class="bi bi-trash"></i> 刪除
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { defineProps, defineEmits } from "vue";

// props 接收的 coupon 應為後端回傳的 AdminCouponDTO 格式
const props = defineProps({
  coupon: {
    type: Object,
    required: true
  }
});

// 定義向上層發送的事件
const emit = defineEmits(["editCoupon", "deleteCoupon"]);


// 觸發編輯事件，將當前 coupon 資料傳給父元件
function emitEditCoupon() {
  // 直接傳遞 coupon DTO 物件
  emit("editCoupon", props.coupon);
}

// 觸發刪除事件，只傳遞 ID
function emitDeleteCoupon() {
  emit("deleteCoupon", props.coupon.couponId);
}

// 日期格式化 (如果 DTO 已是字串則不需要)
// function formatDate(dateString) {
//   if (!dateString) return "N/A";
//   // 假設 DTO 中的日期已是 YYYY-MM-DD 格式
//   return dateString;
// }

</script>

<style scoped>
.card-text {
  font-size: 0.9rem;
  /* 調整文字大小讓卡片更緊湊 */
}

.card-footer {
  background-color: rgba(0, 0, 0, .03);
  padding: 0.5rem 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
</style>