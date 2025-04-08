<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h2>🛒 完成您的訂單</h2>
      <div class="checkout-progress">
        <div class="progress-step active">購物車</div>
        <div class="progress-line"></div>
        <div class="progress-step active">結帳</div>
        <div class="progress-line"></div>
        <div class="progress-step">完成</div>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="checkout-content">
      <div class="checkout-summary">
        <h3>訂單摘要</h3>
        <div class="product-list">
          <div class="product-item" v-for="item in cartItems" :key="item.skuId">
            <div class="product-details">
              <h4>{{ item.name }}</h4>
              <p class="product-price">NT$ {{ item.price }} × {{ item.quantity }}</p>
            </div>
            <div class="product-subtotal">
              NT$ {{ (item.price * item.quantity).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- 優惠券區塊 - 加強版 -->
        <div class="coupon-section">
          <h3>優惠方式</h3>

          <div class="coupon-input">
            <input v-model="inputCouponCode" type="text" placeholder="輸入優惠碼享折扣" class="coupon-code-input" />
            <button @click="applyCouponCode" class="coupon-apply-btn">
              套用
            </button>
          </div>

          <!-- 已套用的優惠券 -->
          <div v-if="selectedCouponId" class="applied-coupon">
            <div class="coupon-badge">
              <span class="coupon-icon">🎁</span>
              <span class="coupon-name">優惠券已套用</span>
              <button class="remove-coupon" @click="selectedCouponId = null">×</button>
            </div>
          </div>
        </div>

        <!-- 訂單金額計算 - 更突出的設計 -->
        <div class="price-calculation">
          <div class="price-row">
            <span>商品總額</span>
            <span>NT$ {{ totalPrice.toLocaleString() }}</span>
          </div>

          <div v-if="selectedCouponId" class="price-row discount-row">
            <span>優惠折抵</span>
            <span class="discount-amount">- NT$ {{ (totalPrice - discountedTotal).toLocaleString() }}</span>
          </div>

          <div class="price-row grand-total">
            <span>結帳金額</span>
            <span class="final-price">NT$ {{ discountedTotal.toLocaleString() }}</span>
          </div>

          <div v-if="selectedCouponId" class="savings-highlight">
            <span class="savings-icon">💰</span>
            <span class="savings-text">恭喜您節省了 {{ (totalPrice - discountedTotal).toLocaleString() }} 元！</span>
          </div>
        </div>
      </div>

      <div class="checkout-form">
        <h3>收件資訊</h3>
        <form @submit.prevent="submitOrder">
          <div class="form-row">
            <div class="form-group">
              <label>收件人姓名</label>
              <input v-model="receiverName" type="text" required />
            </div>

            <div class="form-group">
              <label>聯絡電話</label>
              <input v-model="receiverPhone" type="tel" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>縣市</label>
              <select v-model="selectedCity" required>
                <option disabled value="">請選擇城市</option>
                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>地區</label>
              <select v-model="selectedDistrict" required>
                <option disabled value="">請選擇區域</option>
                <option v-for="d in districts" :key="d.name" :value="d.name">{{ d.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>郵遞區號</label>
              <input v-model="zipCode" type="text" readonly />
            </div>

            <div class="form-group wide">
              <label>詳細地址</label>
              <input v-model="receiverStreet" type="text" required />
            </div>
          </div>

          <div class="payment-section">
            <h3>付款方式</h3>
            <div class="payment-options">
              <div class="payment-option" :class="{ active: paymentMethod === 'CREDIT' }"
                @click="paymentMethod = 'CREDIT'">
                <span class="payment-icon">💳</span>
                <span class="payment-name">信用卡付款</span>
              </div>

              <div class="payment-option" :class="{ active: paymentMethod === 'CASH_ON_DELIVERY' }"
                @click="paymentMethod = 'CASH_ON_DELIVERY'">
                <span class="payment-icon">📦</span>
                <span class="payment-name">貨到付款</span>
              </div>
            </div>
          </div>

          <button type="submit" class="checkout-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting">處理中...</span>
            <span v-else>
              立即付款 NT$ {{ discountedTotal.toLocaleString() }}
            </span>
          </button>
        </form>
      </div>
    </div>

    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入您的購物車...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "@/plugins/axios";
import { useUserStore } from "@/stores/user";
import { taiwanAddress } from "@/assets/taiwanAddress";

// 狀態與資料
const userStore = useUserStore();
const cartItems = ref([]);
const availableCoupons = ref([]);
const isSubmitting = ref(false);

const receiverName = ref("");
const receiverPhone = ref("");
const receiverStreet = ref("");
const selectedCity = ref("");
const selectedDistrict = ref("");
const zipCode = ref("");
const paymentMethod = ref("");

const inputCouponCode = ref("");
const selectedCouponId = ref("");

const cities = Object.keys(taiwanAddress);
const districts = ref([]);

watch(selectedCity, (city) => {
  if (!city) {
    districts.value = [];
    selectedDistrict.value = "";
    zipCode.value = "";
    return;
  }

  const list = taiwanAddress[city];
  districts.value = Object.entries(list).map(([name, zip]) => ({ name, zip }));
  selectedDistrict.value = "";
  zipCode.value = "";
});

watch(selectedDistrict, (district) => {
  const found = districts.value.find((d) => d.name === district);
  zipCode.value = found ? found.zip : "";
});

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

const discountedTotal = computed(() => {
  let original = totalPrice.value;
  const coupon = availableCoupons.value.find(
    (c) => c.userCouponId === selectedCouponId.value
  );
  if (!coupon) return original;

  return coupon.discountType === "PERCENTAGE"
    ? original * (1 - coupon.discountValue / 100)
    : Math.max(original - coupon.discountValue, 0);
});

const fetchCart = async () => {
  try {
    const res = await axios.get(`/api/cart/${userStore.userId}`);
    cartItems.value = res.data;
  } catch (err) {
    console.error("❌ 無法取得購物車", err);
  }
};

const fetchAvailableCoupons = async () => {
  try {
    const res = await axios.get(`/api/user-coupons/available`, {
      params: {
        userId: userStore.userId,
        shopId: cartItems.value[0]?.shopId,
      },
    });
    availableCoupons.value = res.data;
  } catch (err) {
    console.error("❌ 無法取得可用優惠券", err);
  }
};

const applyCouponCode = async () => {
  if (!inputCouponCode.value) {
    alert("請輸入優惠碼！");
    return;
  }

  try {
    const res = await axios.get(`/api/user-coupons/redeem`, {
      params: {
        userId: userStore.userId,
        code: inputCouponCode.value,
        shopId: cartItems.value[0]?.shopId,
      },
    });

    const matchedCoupon = res.data;
    if (matchedCoupon && matchedCoupon.userCouponId) {
      selectedCouponId.value = matchedCoupon.userCouponId;
      alert("✅ 優惠碼已套用！");
    } else {
      alert("❌ 無效的優惠碼！");
    }
  } catch (err) {
    console.error("❌ 套用優惠碼錯誤", err);
    alert("❌ 優惠碼無效或已使用");
  }
};

const submitOrder = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const orderRequest = {
      items: cartItems.value.map((item) => ({
        skuId: item.skuId,
        quantity: item.quantity,
        price: item.price,
      })),
      receiverName: receiverName.value,
      receiverPhone: receiverPhone.value,
      receiverCity: selectedCity.value,
      receiverDistrict: selectedDistrict.value,
      receiverZipCode: zipCode.value,
      receiverAddress: receiverStreet.value,
      paymentMethod: paymentMethod.value,
      userCouponId: selectedCouponId.value || null,
      totalPrice: discountedTotal.value,
      shopId: cartItems.value[0]?.shopId,
      amount: discountedTotal.value,
    };

    const orderRes = await axios.post("/api/orders/create", orderRequest);
    const orderId = orderRes.data.orderId;

    const paymentRes = await axios.get(`/api/payment/redirect/${orderId}`);
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(paymentRes.data.formHtml);
    newWindow?.document.close();
  } catch (err) {
    console.error("❌ 訂單送出失敗", err);
    alert("訂單送出失敗，請檢查資訊是否正確");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  await fetchCart();
  await fetchAvailableCoupons();
});
</script>


<style scoped>
.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  font-family: "Noto Sans TC", sans-serif;
  color: #333;
}

.checkout-header {
  text-align: center;
  margin-bottom: 30px;
}

.checkout-header h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.checkout-progress {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.progress-step {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.progress-step.active {
  background-color: #ff6b81;
  color: white;
}

.progress-line {
  width: 50px;
  height: 2px;
  background-color: #ddd;
  margin: 0 10px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
}

.checkout-summary {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 24px;
}

.checkout-summary h3,
.checkout-form h3 {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  color: #333;
}

.product-list {
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.product-details h4 {
  font-size: 16px;
  margin-bottom: 4px;
}

.product-price {
  color: #777;
  font-size: 14px;
}

.product-subtotal {
  font-weight: 600;
}

/* 優惠券部分 - 強化設計 */
.coupon-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px dashed #ddd;
}

.coupon-input {
  display: flex;
  margin-bottom: 12px;
}

.coupon-code-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
}

.coupon-apply-btn {
  padding: 0 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.coupon-apply-btn:hover {
  background-color: #222;
}

.applied-coupon {
  margin-top: 12px;
}

.coupon-badge {
  display: flex;
  align-items: center;
  background-color: #e6f7ff;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.coupon-icon {
  margin-right: 8px;
}

.coupon-name {
  flex: 1;
  font-weight: 500;
  color: #1890ff;
}

.remove-coupon {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
}

/* 價格計算部分 - 強化設計 */
.price-calculation {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
}

.discount-row {
  color: #f50;
  font-weight: 500;
}

.discount-amount {
  color: #f50;
}

.grand-total {
  font-size: 20px;
  font-weight: 700;
  padding-top: 16px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.final-price {
  color: #ff6b81;
}

.savings-highlight {
  margin-top: 12px;
  padding: 10px;
  background-color: #fff8e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.savings-icon {
  margin-right: 8px;
}

.savings-text {
  color: #ff8f00;
  font-weight: 500;
}

/* 表單部分 */
.checkout-form {
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
}

.form-group.wide {
  flex: 2;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

input,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  border-color: #ff6b81;
  outline: none;
}

/* 付款方式部分 */
.payment-section {
  margin-top: 24px;
}

.payment-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.payment-option {
  flex: 1;
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  background-color: #f9f9f9;
}

.payment-option.active {
  border-color: #ff6b81;
  background-color: #fff0f3;
}

.payment-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

.payment-name {
  font-weight: 600;
  font-size: 15px;
}

/* 結帳按鈕 */
.checkout-btn {
  width: 100%;
  padding: 16px;
  background-color: #ff6b81;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;
}

.checkout-btn:hover {
  background-color: #ff5a73;
}

.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 載入中狀態 */
.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 107, 129, 0.3);
  border-radius: 50%;
  border-top-color: #ff6b81;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
