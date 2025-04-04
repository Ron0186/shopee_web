<template>
  <div class="checkout-container">
    <h2>💳 立即結帳</h2>

    <div v-if="cartItems.length > 0">
      <div class="product-info" v-for="item in cartItems" :key="item.skuId">
        <p><strong>商品名稱：</strong> {{ item.name }}</p>
        <p><strong>單價：</strong> {{ item.price }} 元</p>
        <p><strong>數量：</strong> {{ item.quantity }}</p>
        <p>
          <strong>小計：</strong>
          {{ (item.price * item.quantity).toLocaleString() }} 元
        </p>
        <hr />
      </div>

      <h3>總計：{{ totalPrice.toLocaleString() }} 元</h3>

      <form @submit.prevent="submitOrder">
        <div class="form-group">
          <label>收件人姓名</label>
          <input v-model="receiverName" type="text" required />
        </div>

        <div class="form-group">
          <label>電話</label>
          <input v-model="receiverPhone" type="tel" required />
        </div>

        <div class="form-group">
          <label>縣市</label>
          <select v-model="selectedCity" required>
            <option disabled value="">請選擇城市</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>地區</label>
          <select v-model="selectedDistrict" required>
            <option disabled value="">請選擇區域</option>
            <option v-for="d in districts" :key="d.name" :value="d.name">
              {{ d.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>郵遞區號</label>
          <input v-model="zipCode" type="text" readonly />
        </div>

        <div class="form-group">
          <label>詳細地址</label>
          <input v-model="receiverStreet" type="text" required />
        </div>

        <div class="form-group">
          <label>付款方式</label>
          <select v-model="paymentMethod" required>
            <option disabled value="">請選擇</option>
            <option value="CREDIT">信用卡</option>
            <option value="CASH_ON_DELIVERY">貨到付款</option>
          </select>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? "處理中..." : "立即送出並付款" }}
        </button>
      </form>
    </div>

    <div v-else class="loading">載入購物車中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "@/plugins/axios";
import { useUserStore } from "@/stores/user";
import { taiwanAddress } from "@/assets/taiwanAddress";

const userStore = useUserStore();
const cartItems = ref([]);
const isSubmitting = ref(false);

// 表單資料
const receiverName = ref("");
const receiverPhone = ref("");
const receiverStreet = ref("");
const selectedCity = ref("");
const selectedDistrict = ref("");
const zipCode = ref("");
const paymentMethod = ref("");

// 地址選項
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

// 取得購物車
const fetchCart = async () => {
  try {
    const res = await axios.get(`/api/cart/${userStore.userId}`);
    cartItems.value = res.data;
  } catch (err) {
    console.error("❌ 無法取得購物車", err);
  }
};

// 提交訂單
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
      amount: totalPrice.value,
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

onMounted(fetchCart);
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  font-family: "Noto Sans TC", sans-serif;
  color: #333;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.product-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #ff6b81;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #e84118;
}
</style>
