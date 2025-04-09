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
      <!-- 左側：訂單摘要 -->
      <div class="checkout-summary">
        <h3>訂單摘要</h3>
        <div class="product-list">
          <div class="product-item" v-for="item in cartItems" :key="item.skuId">
            <div class="product-image">
              <img
                :src="getFullImageUrl(item.imageUrl)"
                alt=""
                class="pic-auto"
              />
            </div>
            <div class="product-details">
              <h4>{{ item.name }}</h4>
              <p class="product-price">
                NT$ {{ item.price }} × {{ item.quantity }}
              </p>
            </div>
            <div class="product-subtotal">
              NT$ {{ (item.price * item.quantity).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- 優惠券 -->
        <div class="coupon-section">
          <h4>優惠券</h4>

          <div class="coupon-input-group">
            <input
              v-model="inputCouponCode"
              type="text"
              placeholder="輸入優惠碼享折扣"
              class="coupon-code-input"
            />
            <button
              @click="applyCouponCode"
              :disabled="inputCouponCode === ''"
              class="btn coupon-button"
            >
              使用
            </button>
          </div>

          <!-- 已套用的優惠券 -->
          <div class="btn-cancel-box" v-if="selectedCouponId">
            <div class="btn-cancel" @click="selectedCouponId = null">
              不使用優惠券
            </div>
          </div>
          <!-- 加在 coupon-section 裡面 -->
          <!-- <pre>{{ availableCoupons }}</pre> -->
          <div v-if="availableCoupons.length > 0" class="coupon-select">
            <label class="select-title">選擇已領取的優惠券：</label>
            <div class="coupon-card-group">
              <label
                v-for="coupon in availableCoupons"
                :key="coupon.userCouponId"
                class="coupon-card"
                :class="{
                  selected: selectedCouponId === coupon.userCouponId,
                  disabled: !isCouponValid(coupon),
                }"
              >
                <input
                  type="radio"
                  :value="coupon.userCouponId"
                  v-model="selectedCouponId"
                  class="coupon-radio-input"
                />
                <div class="coupon-content">
                  <span class="coupon-icon">🎟️</span>
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.couponName }}</div>
                    <div class="coupon-value">
                      <template v-if="coupon.discountType === 'PERCENTAGE'">
                        {{ coupon.discountValue }}% 折扣
                      </template>
                      <template v-else>
                        NT$ {{ coupon.discountValue }} 折扣
                      </template>
                    </div>
                    <div class="coupon-date-range">
                      使用期限：{{ formatDate(coupon.startDate) }} ~
                      {{ formatDate(coupon.endDate) }}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div
            class="coupon-reminder"
            v-if="selectedCouponId && totalPrice < selectedCoupon.discountValue"
          >
            折扣金額已達商品總額上限<br />（最多折抵 NT$
            {{ (totalPrice - discountedTotal).toLocaleString() }}）
          </div>

          <!-- <div
            v-else-if="availableCoupons.length === 0 && !isLoading"
            class="no-coupons"
          >
            <p>目前沒有可用的優惠券</p>
          </div> -->

          <!-- 訂單金額計算 - 更突出的設計 -->
          <div class="price-calculation">
            <div class="price-row">
              <span>商品總額</span>
              <span>NT$ {{ totalPrice.toLocaleString() }}</span>
            </div>

            <div v-if="selectedCouponId" class="price-row discount-row">
              <span>優惠折抵</span>
              <span class="discount-amount"
                >- NT$
                {{ (totalPrice - discountedTotal).toLocaleString() }}</span
              >
            </div>

            <div class="price-row grand-total">
              <span>結帳金額</span>
              <span class="final-price"
                >NT$ {{ discountedTotal.toLocaleString() }}</span
              >
            </div>

            <div v-if="selectedCouponId" class="savings-highlight">
              <span class="savings-icon">💰</span>
              <span class="savings-text"
                >恭喜您節省了
                {{ (totalPrice - discountedTotal).toLocaleString() }} 元！</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：收件資訊與付款 -->
      <div class="checkout-form">
        <h3>收件資訊</h3>

        <!-- 地址選擇模式 -->
        <div class="address-selection">
          <div class="address-tabs">
            <button
              :class="{ active: addressMode === 'saved' }"
              @click="addressMode = 'saved'"
            >
              📋 使用已保存地址
            </button>
            <button
              :class="{ active: addressMode === 'new' }"
              @click="addressMode = 'new'"
            >
              ✏️ 手動輸入新地址
            </button>
          </div>

          <!-- 使用已保存地址 -->
          <div v-if="addressMode === 'saved'">
            <div class="address-type-tabs">
              <button
                :class="{ active: addressType === 'home' }"
                @click="addressType = 'home'"
              >
                🏠 宅配地址
              </button>
              <button
                :class="{ active: addressType === 'cvs' }"
                @click="addressType = 'cvs'"
              >
                📦 超商取貨
              </button>
            </div>

            <!-- 地址清單 -->
            <div
              v-if="addressType === 'home' && savedAddresses.home.length > 0"
              class="saved-addresses"
            >
              <div
                v-for="address in savedAddresses.home"
                :key="address.userAddressId"
                class="saved-address-card"
                :class="{
                  selected: selectedAddressId === address.userAddressId,
                }"
                @click="selectAddress(address)"
              >
                <div class="address-radio">
                  <input
                    type="radio"
                    :checked="selectedAddressId === address.userAddressId"
                  />
                </div>
                <div class="address-info">
                  <p class="address-recipient">
                    {{ address.recipientName }} ({{ address.recipientPhone }})
                  </p>
                  <p class="address-full">
                    {{ address.zipCode }} {{ address.city }}{{ address.district
                    }}{{ address.streetEtc }}
                  </p>
                  <span v-if="address.isDefault" class="default-badge"
                    >✅ 預設地址</span
                  >
                </div>
              </div>
              <button class="add-address-btn" @click="goToAddressPage('home')">
                ➕ 新增宅配地址
              </button>
            </div>

            <div
              v-else-if="addressType === 'cvs' && savedAddresses.cvs.length > 0"
              class="saved-addresses"
            >
              <div
                v-for="address in savedAddresses.cvs"
                :key="address.userAddressId"
                class="saved-address-card"
                :class="{
                  selected: selectedAddressId === address.userAddressId,
                }"
                @click="selectAddress(address)"
              >
                <div class="address-radio">
                  <input
                    type="radio"
                    :checked="selectedAddressId === address.userAddressId"
                  />
                </div>
                <div class="address-info">
                  <p class="address-recipient">
                    {{ address.recipientName }} ({{ address.recipientPhone }})
                  </p>
                  <p class="address-full">{{ address.streetEtc }}</p>
                </div>
              </div>
              <button class="add-address-btn" @click="goToAddressPage('cvs')">
                ➕ 新增超商取貨地址
              </button>
            </div>

            <div v-else class="no-addresses">
              <p>
                您尚未保存任何{{
                  addressType === "home" ? "宅配" : "超商取貨"
                }}地址
              </p>
              <button
                class="add-address-btn"
                @click="goToAddressPage(addressType)"
              >
                ➕ 新增{{ addressType === "home" ? "宅配" : "超商取貨" }}地址
              </button>
            </div>
          </div>

          <!-- 手動輸入地址 -->
          <div v-else class="manual-address-form">
            <form>
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
                    <option v-for="city in cities" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>地區</label>
                  <select v-model="selectedDistrict" required>
                    <option disabled value="">請選擇區域</option>
                    <option
                      v-for="d in districts"
                      :key="d.name"
                      :value="d.name"
                    >
                      {{ d.name }}
                    </option>
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
              <div class="form-row">
                <div class="form-group checkbox-group">
                  <label>
                    <input type="checkbox" v-model="saveNewAddress" />
                    保存為我的地址
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- 付款方式 -->
        <div class="payment-section">
          <h3>付款方式</h3>
          <div class="payment-options">
            <div
              class="payment-option"
              :class="{ active: paymentMethod === 'CREDIT' }"
              @click="paymentMethod = 'CREDIT'"
            >
              <span class="payment-icon">💳</span>
              <span class="payment-name">信用卡付款</span>
            </div>
            <div
              class="payment-option"
              :class="{ active: paymentMethod === 'CASH_ON_DELIVERY' }"
              @click="paymentMethod = 'CASH_ON_DELIVERY'"
            >
              <span class="payment-icon">📦</span>
              <span class="payment-name">貨到付款</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="checkout-btn"
          :disabled="isSubmitting"
          @click="submitOrder"
        >
          <span v-if="isSubmitting">處理中...</span>
          <span v-else>
            {{
              paymentMethod === "CASH_ON_DELIVERY"
                ? `送出訂單 NT$ ${discountedTotal.toLocaleString()}`
                : `立即付款 NT$ ${discountedTotal.toLocaleString()}`
            }}
          </span>
        </button>
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
import { useRouter } from "vue-router";

// 選擇優惠券的函數
const selectCoupon = (coupon) => {
  selectedCouponId.value = coupon.userCouponId;
};

// 格式化日期的輔助函數
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};
// 用戶與路由
const userStore = useUserStore();
const router = useRouter();

// 狀態管理
const cartItems = ref([]);
const availableCoupons = ref([]);
const isSubmitting = ref(false);

// 地址模式相關
const addressMode = ref("saved"); // 'saved' 或 'new'
const addressType = ref("home"); // 'home' 或 'cvs'
const savedAddresses = ref({
  home: [],
  cvs: [],
});
const selectedAddressId = ref(null);
const saveNewAddress = ref(false);

// 手動輸入地址相關
const receiverName = ref("");
const receiverPhone = ref("");
const receiverStreet = ref("");
const selectedCity = ref("");
const selectedDistrict = ref("");
const zipCode = ref("");

// 其他參數
const paymentMethod = ref("");
const inputCouponCode = ref("");
const selectedCouponId = ref("");

const BASE_IMAGE_URL = "http://localhost:8081"; // 或部署後的網址
const getFullImageUrl = (url) => `${BASE_IMAGE_URL}${url}`;

const cities = Object.keys(taiwanAddress);
const districts = ref([]);

// 計算屬性
const selectedCoupon = computed(() =>
  availableCoupons.value.find((c) => c.userCouponId === selectedCouponId.value)
);

const totalPrice = computed(() =>
  Math.max(
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
    10
  )
);

const discountedTotal = computed(() => {
  let original = totalPrice.value;
  const coupon = availableCoupons.value.find(
    (c) => c.userCouponId === selectedCouponId.value
  );
  if (!coupon) return original;

  let discounted = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discounted = original * (1 - coupon.discountValue / 100);
  } else {
    discounted = original - coupon.discountValue;
  }

  // 最低限制為 NT$10
  return Math.max(discounted, 10);
});

// 監聽變化
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

// 選擇已保存的地址
const selectAddress = (address) => {
  selectedAddressId.value = address.userAddressId;

  // 如果之後需要用到地址信息，可以將資料填充到表單中
  receiverName.value = address.recipientName;
  receiverPhone.value = address.recipientPhone;

  if (addressType.value === "home") {
    selectedCity.value = address.city;
    selectedDistrict.value = address.district;
    zipCode.value = address.zipCode;
    receiverStreet.value = address.streetEtc;
  }
};

// 獲取保存的地址
const fetchSavedAddresses = async () => {
  try {
    const token = localStorage.getItem("token");

    // 獲取宅配地址 (type=1)
    const homeAddressRes = await axios.get(
      `http://localhost:8081/api/user/address/${userStore.userId}/type/1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 獲取超商取貨地址 (type=2)
    const cvsAddressRes = await axios.get(
      `http://localhost:8081/api/user/address/${userStore.userId}/type/2`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    savedAddresses.value.home = homeAddressRes.data.sort((a) =>
      a.isDefault ? -1 : 1
    );
    savedAddresses.value.cvs = cvsAddressRes.data.sort((a) =>
      a.isDefault ? -1 : 1
    );

    // 如果有默認地址，自動選擇
    const defaultHomeAddress = savedAddresses.value.home.find(
      (a) => a.isDefault
    );
    if (defaultHomeAddress) {
      selectAddress(defaultHomeAddress);
    } else if (savedAddresses.value.home.length > 0) {
      selectAddress(savedAddresses.value.home[0]);
    }
  } catch (error) {
    console.error("獲取地址數據失敗:", error);
  }
};

// 前往地址管理頁面
const goToAddressPage = (type) => {
  if (type === "home") {
    router.push({ name: "HomeAddressCreate" });
  } else {
    router.push({ name: "CVSAddressCreate" });
  }
};

// 獲取購物車
const fetchCart = async () => {
  try {
    const res = await axios.get(`/api/cart/${userStore.userId}`);
    cartItems.value = res.data;
  } catch (err) {
    console.error("❌ 無法取得購物車", err);
  }
};

// 獲取可用優惠券
const fetchAvailableCoupons = async () => {
  try {
    const res = await axios.get(`/api/user-coupons/available`, {
      params: {
        userId: userStore.userId,
        shopId: cartItems.value[0]?.shopId,
      },
    });
    availableCoupons.value = res.data;
    console.log("可用優惠券", availableCoupons.value);
  } catch (err) {
    console.error("❌ 無法取得可用優惠券", err);
  }
};

// 驗證優惠碼是否有效
const isCouponValid = (coupon) => {
  const now = new Date();
  const start = new Date(coupon.startDate);
  const end = new Date(coupon.endDate);
  return now >= start && now <= end;
};

// 套用優惠碼
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

// 保存新地址
const saveAddress = async () => {
  if (!saveNewAddress.value) return null;

  try {
    const token = localStorage.getItem("token");
    const addressData = {
      userId: userStore.userId,
      recipientName: receiverName.value,
      recipientPhone: receiverPhone.value,
      city: selectedCity.value,
      district: selectedDistrict.value,
      zipCode: zipCode.value,
      streetEtc: receiverStreet.value,
      typeId: 1, // 宅配地址
      isDefault: false,
    };

    const response = await axios.post(
      `http://localhost:8081/api/user/address`,
      addressData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.userAddressId;
  } catch (error) {
    console.error("保存地址失敗:", error);
    return null;
  }
};

// 送出訂單
const submitOrder = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // 檢查地址填寫是否完整
    if (addressMode.value === "saved") {
      if (!selectedAddressId.value) {
        alert("請選擇配送地址");
        isSubmitting.value = false;
        return;
      }
    } else {
      if (
        !receiverName.value ||
        !receiverPhone.value ||
        !selectedCity.value ||
        !selectedDistrict.value ||
        !receiverStreet.value
      ) {
        alert("請填寫完整地址信息");
        isSubmitting.value = false;
        return;
      }
    }

    if (!paymentMethod.value) {
      alert("請選擇付款方式");
      isSubmitting.value = false;
      return;
    }

    // 如果選擇保存新地址，先保存地址
    let addressId = selectedAddressId.value;
    if (addressMode.value === "new" && saveNewAddress.value) {
      const newAddressId = await saveAddress();
      if (newAddressId) {
        addressId = newAddressId;
      }
    }

    // 創建訂單請求
    const orderRequest = {
      items: cartItems.value.map((item) => ({
        skuId: item.skuId,
        quantity: item.quantity,
        price: item.price,
      })),
      receiverName:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.recipientName || receiverName.value
          : receiverName.value,
      receiverPhone:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.recipientPhone || receiverPhone.value
          : receiverPhone.value,
      receiverCity:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.city || selectedCity.value
          : selectedCity.value,
      receiverDistrict:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.district || selectedDistrict.value
          : selectedDistrict.value,
      receiverZipCode:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.zipCode || zipCode.value
          : zipCode.value,
      receiverAddress:
        addressMode.value === "saved"
          ? savedAddresses.value.home.find(
              (a) => a.userAddressId === selectedAddressId.value
            )?.streetEtc || receiverStreet.value
          : receiverStreet.value,
      userAddressId: addressId, // 新增地址ID欄位
      paymentMethod: paymentMethod.value,
      userCouponId: selectedCouponId.value || null,
      totalPrice: discountedTotal.value,
      shopId: cartItems.value[0]?.shopId,
      amount: discountedTotal.value,
    };

    const orderRes = await axios.post("/api/orders/create", orderRequest);
    const orderId = orderRes.data.orderId;

    if (paymentMethod.value === "CASH_ON_DELIVERY") {
      // 👉 貨到付款：直接導向完成頁
      router.push({ name: "OrderSuccess", params: { orderId } });
    } else {
      // 👉 信用卡付款：前往綠界表單頁
      const paymentRes = await axios.get(`/api/payment/redirect/${orderId}`);
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(paymentRes.data.formHtml);
      newWindow?.document.close();
    }
    // 延遲一點再清空購物車
    setTimeout(async () => {
      try {
        for (const item of cartItems.value) {
          await axios.delete(`/api/cart2/remove`, {
            params: {
              userId: userStore.userId,
              skuId: item.skuId,
            },
          });
        }
        cartItems.value = [];
        selectedCouponId.value = null;
      } catch (err) {
        console.error("❌ 清空購物車失敗", err);
      }
    }, 500);
    return;
  } catch (error) {
    console.error("❌ 訂單提交失敗", error);
    alert("❌ 訂單提交失敗，請稍後再試！");
  } finally {
    isSubmitting.value = false;
  }
};

// 頁面加載時
onMounted(async () => {
  await fetchCart();
  await fetchAvailableCoupons();
  await fetchSavedAddresses();
});
</script>

<style scoped>
/* 全局樣式改進 */
.checkout-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  font-family: "Noto Sans TC", sans-serif;
}

/* 標題與進度條優化 */
.checkout-header {
  text-align: center;
  margin-bottom: 40px;
}

.checkout-header h2 {
  font-size: 32px;
  margin-bottom: 25px;
  color: #333;
  font-weight: 700;
}

.checkout-progress {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 30px;
  max-width: 500px;
}

.progress-step {
  padding: 10px 18px;
  background-color: #f3f3f3;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.progress-step.active {
  background-color: #ff6b81;
  color: white;
  box-shadow: 0 4px 10px rgba(255, 107, 129, 0.2);
  transform: translateY(-2px);
}

.progress-line {
  width: 60px;
  height: 3px;
  background-color: #e9e9e9;
  margin: 0 5px;
}

/* 主要內容區域佈局 */
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
}

/* 訂單摘要區塊 */
.checkout-summary {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 30px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  height: fit-content;
}

.checkout-summary h3,
.checkout-form h3 {
  font-size: 20px;
  margin-bottom: 25px;
  font-weight: 700;
  color: #333;
  position: relative;
  padding-bottom: 10px;
}

.checkout-summary h3:after,
.checkout-form h3:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 50px;
  background-color: #ff6b81;
  border-radius: 3px;
}

/* 商品列表 */
.product-list {
  margin-bottom: 25px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
}

.product-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff9fa;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-details h4 {
  font-size: 16px;
  margin: 0 0 5px;
  color: #333;
  font-weight: 600;
}

.product-price {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.product-subtotal {
  font-weight: 700;
  color: #ff6b81;
  font-size: 16px;
  text-align: right;
  margin-left: 15px;
}

/* 優惠券區塊樣式 */
.coupon-section {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.coupon-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.coupon-input-group input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
}

.coupon-input-group input:focus {
  border-color: #ff6b81;
  box-shadow: 0 0 0 3px rgba(255, 107, 129, 0.1);
  outline: none;
}

.coupon-button {
  background-color: #ff6b81;
  color: white;
  font-weight: 600;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-button:hover {
  background-color: #ff5a73;
  transform: translateY(-2px);
}

.btn-cancel-box {
  display: flex;
  justify-content: end;
  margin-top: 10px;
}

.btn-cancel {
  background-color: #ddd;
  color: #333;
  font-weight: 600;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-badge {
  display: inline-flex;
  align-items: center;
  background-color: #fff0f3;
  color: #ff6b81;
  padding: 8px 15px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 10px;
  box-shadow: 0 2px 6px rgba(255, 107, 129, 0.15);
  animation: fadeInSlide 0.4s ease;
}

.coupon-badge-icon {
  margin-right: 5px;
  font-size: 16px;
}

.coupon-error {
  color: #e53935;
  background-color: #ffeaea;
  border: 1px solid #ffcdd2;
  padding: 10px 15px;
  border-radius: 10px;
  margin-top: 10px;
  font-size: 14px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

/* 價格計算區塊 */
.price-calculation {
  background-color: white;
  border-radius: 12px;
  padding: 25px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 16px;
  color: #555;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-row.discount-row {
  color: #ff6b81;
  font-weight: 500;
}

.discount-amount {
  color: #ff6b81;
  font-weight: 600;
}

.price-row.grand-total {
  font-size: 20px;
  font-weight: 700;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px dashed #eee;
  color: #333;
}

.final-price {
  color: #ff6b81;
  font-size: 24px;
}

.savings-highlight {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px 15px;
  border-radius: 10px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  animation: pulse 2s infinite;
}

.savings-icon {
  font-size: 20px;
  margin-right: 10px;
}

.savings-text {
  font-weight: 600;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.2);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
  }
}

/* 收件表單樣式 */
.checkout-form {
  padding: 30px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

/* 地址選擇區塊 */
.address-selection {
  margin-bottom: 30px;
  background: #f9f9f9;
  border-radius: 14px;
  padding: 25px;
  border: 1px solid #eee;
}

.address-tabs,
.address-type-tabs {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.address-tabs button,
.address-type-tabs button {
  flex: 1;
  padding: 14px;
  background: #fff;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.25s;
  color: #555;
}

.address-tabs button:hover,
.address-type-tabs button:hover {
  background: #f5f5f5;
  border-color: #ddd;
  transform: translateY(-2px);
}

.address-tabs button.active,
.address-type-tabs button.active {
  background: #04aa6d;
  color: white;
  border-color: #04aa6d;
  box-shadow: 0 4px 10px rgba(4, 170, 109, 0.2);
}

.saved-addresses {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.saved-address-card {
  display: flex;
  padding: 18px;
  background: white;
  border: 2px solid #eee;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.saved-address-card:hover {
  border-color: #ddd;
  background: #f8f8f8;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.saved-address-card.selected {
  border-color: #04aa6d;
  background: #e6f9f0;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(4, 170, 109, 0.1);
}

.address-radio {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.address-radio input {
  transform: scale(1.3);
  cursor: pointer;
  accent-color: #04aa6d;
}

.address-info {
  flex: 1;
  text-align: left;
}

.address-recipient {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
}

.address-full {
  color: #666;
  margin-bottom: 8px;
  font-size: 15px;
}

.default-badge {
  display: inline-block;
  background: #e0f7e6;
  color: #04aa6d;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(4, 170, 109, 0.1);
}

.add-address-btn {
  margin-top: 15px;
  padding: 14px 16px;
  background: #fff;
  border: 2px dashed #04aa6d;
  color: #04aa6d;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
  font-size: 15px;
}

.add-address-btn:hover {
  background: #f0fffa;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(4, 170, 109, 0.1);
}

.no-addresses {
  text-align: center;
  padding: 40px 0;
  color: #777;
  font-size: 16px;
}

/* 表單樣式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  text-align: left;
}

.form-group.wide {
  flex: 2;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 15px;
  color: #444;
}

input,
select {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.25s;
  background: #fafafa;
}

input:hover,
select:hover {
  border-color: #ccc;
  background: #fff;
}

input:focus,
select:focus {
  border-color: #ff6b81;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 107, 129, 0.1);
  outline: none;
}

input.error,
select.error {
  border-color: #f44336;
  background-color: #fff8f8;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  accent-color: #04aa6d;
}

.checkbox-group label {
  margin-bottom: 0;
  cursor: pointer;
}

/* 付款方式部分 */
.payment-section {
  margin-top: 30px;
}

.payment-options {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.payment-option {
  flex: 1;
  padding: 25px 20px;
  border: 2px solid #eee;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: white;
}

.payment-option:hover {
  border-color: #ddd;
  background-color: #f9f9f9;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
}

.payment-option.active {
  border-color: #ff6b81;
  background-color: #fff0f3;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(255, 107, 129, 0.1);
}

.payment-icon {
  display: block;
  font-size: 30px;
  margin-bottom: 12px;
}

.payment-name {
  font-weight: 700;
  font-size: 16px;
  color: #333;
}

/* 結帳按鈕 */
.checkout-btn {
  width: 100%;
  padding: 18px;
  background-color: #ff6b81;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  margin-top: 25px;
  box-shadow: 0 8px 15px rgba(255, 107, 129, 0.2);
  position: relative;
  overflow: hidden;
}

.checkout-btn:hover {
  background-color: #ff5a73;
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 129, 0.25);
}

.checkout-btn:active {
  transform: translateY(-1px);
}

.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkout-btn:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.checkout-btn:hover:before {
  width: 300px;
  height: 300px;
}

/* 載入中狀態 */
.loading-container {
  text-align: center;
  padding: 60px 40px;
}

.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 107, 129, 0.2);
  border-radius: 50%;
  border-top-color: #ff6b81;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 18px;
  color: #666;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 900px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    order: 2;
  }

  .checkout-form {
    order: 1;
  }
}

@media (max-width: 600px) {
  .checkout-container {
    padding: 20px 15px;
    margin: 15px auto;
  }

  .checkout-header h2 {
    font-size: 24px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .payment-options {
    flex-direction: column;
  }

  .address-tabs,
  .address-type-tabs {
    flex-direction: column;
  }

  .progress-step {
    font-size: 13px;
    padding: 8px 12px;
  }

  .progress-line {
    width: 30px;
  }
}

/* 動畫效果 */
@keyframes fadeInSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 可用優惠券列表樣式 */
.available-coupons {
  margin-top: 20px;
}

.available-coupons h5 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #555;
  font-weight: 600;
}

.coupon-select {
  margin-top: 16px;
}

.select-title {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  color: #444;
}

.coupon-card-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background-color: #fefefe;
  cursor: pointer;
  transition: 0.2s;
}

.coupon-card:hover {
  background-color: #f8f8f8;
}

.coupon-card.selected {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.coupon-radio-input {
  margin-right: 12px;
  transform: scale(1.2);
  accent-color: #4caf50;
  width: auto !important;
}

.coupon-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coupon-icon {
  font-size: 24px;
}

.coupon-info {
  display: flex;
  flex-direction: column;
}

.coupon-name {
  font-weight: 600;
  color: #333;
}

.coupon-value {
  font-size: 14px;
  color: #666;
}
.coupon-date-range {
  font-size: 13px;
  color: #999;
}
.coupon-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  background: #e9e9e9;
}

.select-coupon-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-coupon-btn:hover {
  background: #ff6b81;
  color: white;
  border-color: #ff6b81;
}

.no-coupons {
  padding: 20px;
  text-align: center;
  color: #888;
  background: #f9f9f9;
  border-radius: 10px;
  margin-top: 10px;
}
</style>
