<template>
  <div class="checkout-container">
    <h2>💳 立即結帳</h2>

    <div v-if="skuInfo">
      <div class="product-info">
        <p><strong>商品名稱：</strong> {{ skuInfo.productName }}</p>
        <p><strong>單價：</strong> {{ skuInfo.price }} 元</p>
        <p><strong>數量：</strong> {{ quantity }}</p>
        <p><strong>小計：</strong> {{ totalPrice.toLocaleString() }} 元</p>
      </div>

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

        <button type="submit" class="submit-btn">立即送出並付款</button>
      </form>
    </div>

    <div v-else class="loading">載入商品資料中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "@/plugins/axios";
import { taiwanAddress } from "@/assets/taiwanAddress.js";

const route = useRoute();
const skuId = ref(Number(route.query.skuId));
const quantity = ref(Number(route.query.qty || 1));

const skuInfo = ref(null);
const receiverName = ref("");
const receiverPhone = ref("");
const paymentMethod = ref("");
const isSubmitting = ref(false);
const receiverStreet = ref("");

const selectedCity = ref("");
const selectedDistrict = ref("");
const zipCode = ref("");
const cities = Object.keys(taiwanAddress); // 取得所有縣市名稱
const districts = ref([]);

watch(selectedCity, (city) => {
  if (!city) {
    districts.value = [];
    zipCode.value = "";
    selectedDistrict.value = "";
    return;
  }

  const districtsObj = taiwanAddress[city];
  districts.value = Object.entries(districtsObj).map(([name, zip]) => ({
    name,
    zip,
  }));
  selectedDistrict.value = "";
  zipCode.value = "";
});

watch(selectedDistrict, (districtName) => {
  const found = districts.value.find((d) => d.name === districtName);
  zipCode.value = found ? found.zip : "";
});

const totalPrice = computed(() => {
  return skuInfo.value ? skuInfo.value.price * quantity.value : 0;
});

const fetchSkuInfo = async () => {
  try {
    const res = await axios.get(`/api/skus/${skuId.value}`);
    skuInfo.value = res.data;
  } catch (err) {
    alert("❌ 載入商品失敗");
  }
};

const submitOrder = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const orderRequest = {
      amount: totalPrice.value,
      description: `用戶購買商品 SKU ${skuId.value}`,
      itemName: skuInfo.value.productName,
      merchantTradeNo: "ORDER" + Date.now(),
      clientBackUrl: "http://localhost:5173/shop",
      productId: skuInfo.value.productId,
      quantity: quantity.value,
      skuId: skuId.value,
      receiverName: receiverName.value,
      receiverPhone: receiverPhone.value,
      receiverAddress: receiverStreet.value,
      receiverCity: selectedCity.value,
      receiverDistrict: selectedDistrict.value,
      receiverZipCode: zipCode.value,
      paymentMethod: paymentMethod.value,
      price: skuInfo.value.price,
    };

    const orderRes = await axios.post("/api/orders/create", orderRequest);
    const orderId = orderRes.data.orderId;

    if (!orderId) {
      alert("建立訂單失敗，請稍後再試");
      return;
    }

    const paymentRes = await axios.get(`/api/payment/redirect/${orderId}`);
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(paymentRes.data.formHtml);
    newWindow?.document.close();
  } catch (err) {
    console.error("送出訂單失敗：", err);
    alert("送出訂單失敗，請檢查網路或填寫資料");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchSkuInfo);
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  font-family: "Microsoft JhengHei";
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.product-info p {
  margin: 5px 0;
  font-size: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
}
.submit-btn:hover {
  background-color: #e03b4b;
}
</style>
