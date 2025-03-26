<template>
  <div class="order-payment-container">
    <div class="payment-header">
      <h2>訂單付款</h2>
      <p class="subtitle">請完成以下付款流程，以確認您的訂單</p>
    </div>

    <!-- 訂單摘要信息 -->
    <div v-if="loading" class="loading-section">
      <p>載入訂單資料中...</p>
    </div>
    <div v-else-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
      <button @click="loadOrderData" class="retry-btn">重新載入</button>
    </div>
    <div v-else class="payment-content">
      <!-- 訂單信息卡片 -->
      <div class="order-summary-card">
        <div class="card-header">
          <h3>訂單摘要 (編號: {{ order.orderId }})</h3>
          <span class="order-status" :class="statusClass">{{
            order.status
          }}</span>
        </div>
        <div class="card-body">
          <div class="order-info">
            <p><strong>訂單日期:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>商品數量:</strong> {{ getTotalItems() }} 件</p>
            <p>
              <strong>總金額:</strong>
              <span class="price">NT${{ formatPrice(order.totalPrice) }}</span>
            </p>
          </div>

          <!-- 商品列表 -->
          <div class="order-items">
            <h4>商品明細</h4>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.sku_id" class="item-row">
                <div class="item-image">
                  <img :src="getItemImage(item)" :alt="item.productName" />
                </div>
                <div class="item-details">
                  <p class="item-name">{{ item.productName }}</p>
                  <p class="item-specs" v-if="item.specs">{{ item.specs }}</p>
                </div>
                <div class="item-quantity">x{{ item.quantity }}</div>
                <div class="item-price">
                  NT${{ formatPrice(item.unitPrice) }}
                </div>
                <div class="item-total">
                  NT${{ formatPrice(item.unitPrice * item.quantity) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 收貨資訊 -->
          <div class="shipping-info">
            <h4>收貨資訊</h4>
            <div class="info-box">
              <p>
                <strong>收件人:</strong>
                {{ order.shipping?.recipientName || "無資料" }}
              </p>
              <p>
                <strong>聯絡電話:</strong>
                {{ order.shipping?.recipientPhone || "無資料" }}
              </p>
              <p>
                <strong>收貨地址:</strong>
                {{ order.shipping?.address || "無資料" }}
              </p>
            </div>
          </div>

          <!-- 價格摘要 -->
          <div class="price-summary">
            <h4>金額摘要</h4>
            <div class="summary-table">
              <div class="summary-row">
                <span>商品小計:</span>
                <span>NT${{
                  formatPrice(order.subtotal || order.totalPrice)
                }}</span>
              </div>
              <div class="summary-row" v-if="order.shippingFee">
                <span>運費:</span>
                <span>NT${{ formatPrice(order.shippingFee) }}</span>
              </div>
              <div class="summary-row" v-if="order.discount">
                <span>折扣:</span>
                <span>-NT${{ formatPrice(order.discount) }}</span>
              </div>
              <div class="summary-row total">
                <span>應付金額:</span>
                <span>NT${{ formatPrice(order.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 付款方式選擇 -->
      <div class="payment-method-card">
        <h3>選擇付款方式</h3>
        <div class="payment-methods">
          <div v-for="method in paymentMethods" :key="method.value" class="payment-method-option"
            :class="{ active: selectedPaymentMethod === method.value }" @click="selectedPaymentMethod = method.value">
            <div class="method-icon">
              <i :class="method.icon"></i>
            </div>
            <div class="method-info">
              <span class="method-name">{{ method.name }}</span>
              <span class="method-description">{{ method.description }}</span>
            </div>
            <div class="method-select">
              <input type="radio" :id="method.value" :value="method.value" v-model="selectedPaymentMethod"
                name="paymentMethod" />
              <label :for="method.value"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 信用卡表單 (僅在選擇信用卡時顯示) -->
      <div v-if="selectedPaymentMethod === 'CREDIT_CARD'" class="credit-card-form">
        <h3>請輸入信用卡資料</h3>
        <div class="form-group">
          <label for="cardNumber">卡號</label>
          <input type="text" id="cardNumber" v-model="cardInfo.cardNumber" placeholder="請輸入16位卡號" maxlength="19"
            @input="formatCardNumber" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cardExpiry">有效期限 (MM/YY)</label>
            <input type="text" id="cardExpiry" v-model="cardInfo.cardExpiry" placeholder="MM/YY" maxlength="5"
              @input="formatCardExpiry" />
          </div>
          <div class="form-group">
            <label for="cardCVC">安全碼</label>
            <input type="text" id="cardCVC" v-model="cardInfo.cardCVC" placeholder="CVC" maxlength="3" />
          </div>
        </div>
        <div class="form-group">
          <label for="cardHolder">持卡人姓名</label>
          <input type="text" id="cardHolder" v-model="cardInfo.cardHolder" placeholder="請輸入持卡人姓名" />
        </div>
      </div>

      <!-- ATM 轉帳資訊 (僅在選擇 ATM 轉帳時顯示) -->
      <div v-if="selectedPaymentMethod === 'BANK_TRANSFER'" class="bank-transfer-info">
        <h3>ATM 轉帳資訊</h3>
        <div class="info-box">
          <p><strong>銀行名稱:</strong> 台灣第一銀行</p>
          <p><strong>銀行代碼:</strong> 007</p>
          <p><strong>帳號:</strong> 123-456-789-000</p>
          <p><strong>戶名:</strong> MyShop 購物網</p>
          <p class="note">
            <i class="bi bi-info-circle"></i>
            請於轉帳完成後保留收據，並在備註欄填寫訂單編號。
          </p>
        </div>
      </div>

      <!-- 付款按鈕 -->
      <div class="payment-actions">
        <button @click="cancelPayment" class="cancel-btn">取消</button>
        <button @click="processPayment" :disabled="isProcessing" class="pay-btn">
          <span v-if="isProcessing">處理中...</span>
          <span v-else>確認付款 NT${{ formatPrice(order.totalPrice) }}</span>
        </button>
      </div>

      <!-- 付款處理中彈窗 -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-modal">
          <div class="spinner"></div>
          <p>正在處理您的付款...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 狀態變數
const loading = ref(true);
const error = ref(null);
const order = ref({
  orderId: "",
  status: "",
  totalPrice: 0,
  items: [],
  createdAt: "",
  shipping: null,
  subtotal: 0,
  shippingFee: 0,
  discount: 0,
});

// 付款相關變數
const selectedPaymentMethod = ref("CREDIT_CARD");
const isProcessing = ref(false);
const cardInfo = ref({
  cardNumber: "",
  cardExpiry: "",
  cardCVC: "",
  cardHolder: "",
});

// 付款方式選項
const paymentMethods = [
  {
    name: "信用卡付款",
    value: "CREDIT_CARD",
    icon: "bi bi-credit-card",
    description: "支援VISA、MasterCard、JCB",
  },
  {
    name: "ATM轉帳",
    value: "BANK_TRANSFER",
    icon: "bi bi-bank",
    description: "請於3日內完成轉帳",
  },
  {
    name: "貨到付款",
    value: "CASH_ON_DELIVERY",
    icon: "bi bi-cash",
    description: "收到商品時付款",
  },
];

// 計算訂單狀態的樣式類
const statusClass = computed(() => {
  const statusMap = {
    待付款: "status-pending",
    處理中: "status-processing",
    已出貨: "status-shipped",
    已完成: "status-completed",
    已取消: "status-canceled",
    PENDING: "status-pending",
    PROCESSING: "status-processing",
    SHIPPED: "status-shipped",
    COMPLETED: "status-completed",
    CANCELLED: "status-canceled",
  };
  return statusMap[order.value.status] || "status-default";
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 格式化價格
const formatPrice = (price) => {
  if (price === undefined || price === null) return "0";
  return Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 計算訂單總商品數量
const getTotalItems = () => {
  if (!order.value.items || !Array.isArray(order.value.items)) return 0;
  return order.value.items.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );
};

// 獲取商品圖片URL
const getItemImage = (item) => {
  if (item.image) return `/assets/${item.image}`;
  if (item.imageUrl) return item.imageUrl;
  return "/assets/default-product.png";
};

// 格式化信用卡卡號
const formatCardNumber = () => {
  let value = cardInfo.value.cardNumber.replace(/\D/g, "");
  let formattedValue = "";

  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += " ";
    }
    formattedValue += value[i];
  }

  cardInfo.value.cardNumber = formattedValue;
};

// 格式化信用卡有效期限
const formatCardExpiry = () => {
  let value = cardInfo.value.cardExpiry.replace(/\D/g, "");

  if (value.length > 2) {
    cardInfo.value.cardExpiry =
      value.substring(0, 2) + "/" + value.substring(2);
  } else {
    cardInfo.value.cardExpiry = value;
  }
};

// 載入訂單資料
const loadOrderData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 從路由參數獲取訂單ID (檢查orderId或id)
    const orderId = route.params.orderId || route.params.id;

    if (!orderId) {
      error.value = "找不到訂單ID，請返回訂單列表重新選擇";
      loading.value = false;
      return;
    }

    if (!userStore.token) {
      error.value = "您尚未登入或登入已過期，請重新登入";
      loading.value = false;
      return;
    }

    console.log("開始載入訂單ID:", orderId);

    // 首先檢查訂單是否可以付款
    try {
      const checkResponse = await axios.get(
        `/api/orders/check-payment/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${userStore.token}`,
          },
        }
      );

      console.log("檢查付款狀態回應:", checkResponse);

      // 檢查API回應格式是否為字符串
      if (typeof checkResponse.data === "string") {
        try {
          checkResponse.data = JSON.parse(checkResponse.data);
        } catch (parseError) {
          console.error("API回應不是有效的JSON:", parseError);
        }
      }

      // 處理不同的API回應格式
      let paymentCheckStatus = "error";
      let paymentCheckMessage = "";

      if (checkResponse.data) {
        if (checkResponse.data.status) {
          paymentCheckStatus = checkResponse.data.status;
          paymentCheckMessage = checkResponse.data.message || "";
        } else if (checkResponse.data.statusCode === 200) {
          paymentCheckStatus = "success";
          paymentCheckMessage = checkResponse.data.message || "";
        }
      }

      // 如果API返回訂單不可付款
      if (paymentCheckStatus === "error") {
        error.value = paymentCheckMessage || "此訂單不需要付款或已付款完成";
        loading.value = false;
        return;
      }
    } catch (checkErr) {
      console.error("檢查付款狀態錯誤:", checkErr);

      // 如果API尚未實現，忽略此錯誤並繼續
      if (checkErr.response && checkErr.response.status === 404) {
        console.log("付款檢查API未實現，繼續處理");
      } else {
        error.value = "檢查付款狀態時出錯，請稍後再試";
        loading.value = false;
        return;
      }
    }

    // 獲取訂單數據
    const apiUrl = `/api/orders/${orderId}`;
    console.log("獲取訂單數據:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
        Accept: "application/json",
      },
    });

    console.log("訂單數據回應:", response);

    // 檢查是否收到HTML而非JSON
    if (typeof response.data === "string") {
      if (response.data.includes("<!DOCTYPE html>")) {
        console.error("API返回了HTML而非JSON");
        error.value = "伺服器返回了無效的數據格式";
        loading.value = false;
        return;
      }

      // 嘗試解析字符串為JSON
      try {
        const jsonData = JSON.parse(response.data);
        console.log("成功解析字符串為JSON:", jsonData);
        response.data = jsonData;
      } catch (parseError) {
        console.error("解析字符串到JSON失敗:", parseError);
        error.value = "服務器返回了無效的數據格式";
        loading.value = false;
        return;
      }
    }

    // 處理API回應
    let orderData = null;
    if (response.data) {
      // 根據API回應格式處理
      if (response.data.statusCode === 200 && response.data.data) {
        // 新的API格式 {statusCode, status, message, data}
        orderData = response.data.data;
      } else if (response.data.data) {
        // 回應數據在data字段
        orderData = response.data.data;
      } else {
        // 直接使用回應數據
        orderData = response.data;
      }

      // 賦值給訂單ref
      order.value = orderData;
      console.log("處理後的訂單數據:", order.value);

      // 確保訂單有必要的欄位
      if (!order.value.items || !Array.isArray(order.value.items)) {
        order.value.items = [];
      }

      // 如果有orderItem但沒有items，將orderItem轉換為items
      if (
        order.value.orderItem &&
        Array.isArray(order.value.orderItem) &&
        order.value.orderItem.length > 0
      ) {
        order.value.items = order.value.orderItem.map((item) => {
          return {
            productId: item.sku?.product?.productId || item.productId || 0,
            productName: item.sku?.product?.productName || item.sku?.product?.name || "未知商品",
            sku_id: item.sku?.skuId || item.skuId || 0,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            price: item.unitPrice || item.price || 0,
            // 嘗試獲取商品圖片
            image: item.sku?.product?.image || item.image || "",
            imageUrl: item.sku?.product?.imageUrl || item.imageUrl || "",
            // 嘗試構建規格文本
            specs: item.sku
              ? `${item.sku.colorName || ""} ${item.sku.sizeName || ""}`.trim()
              : item.specs || "",
          };
        });
        console.log("從orderItem轉換的items:", order.value.items);
      }

      order.value.totalPrice = parseFloat(order.value.totalPrice) || 0;
      order.value.subtotal =
        parseFloat(order.value.subtotal) || order.value.totalPrice;

      // 檢查訂單狀態和支付狀態
      const orderStatus =
        order.value.status || order.value.orderStatusCorrespond?.name || "";
      const paymentStatus = order.value.paymentStatus || "";

      console.log("訂單狀態:", orderStatus);
      console.log("支付狀態:", paymentStatus);

      // 只有當訂單狀態為待付款且支付狀態不是已付款時，才需要顯示付款頁面
      const isPendingPayment =
        orderStatus === "PENDING" ||
        orderStatus === "待付款" ||
        orderStatus === "pending";
      const isUnpaid =
        !paymentStatus ||
        paymentStatus === "未付款" ||
        paymentStatus === "UNPAID";

      if (!isPendingPayment || !isUnpaid) {
        error.value = "此訂單不需要付款或已經付款完成";
        console.log(
          `訂單狀態 "${orderStatus}" 或支付狀態 "${paymentStatus}" 表示不需付款`
        );
      }
    } else {
      error.value = "無法載入訂單資料";
    }
  } catch (err) {
    console.error("載入訂單錯誤:", err);

    // 檢查錯誤是否包含回應數據
    if (err.response) {
      // 檢查是否收到HTML而非JSON
      const responseData = err.response.data;
      if (
        typeof responseData === "string" &&
        responseData.includes("<!DOCTYPE html>")
      ) {
        console.error("API錯誤回應是HTML");
        error.value = "伺服器返回了無效的錯誤格式";
      } else {
        const statusCode = err.response.status;
        if (statusCode === 401) {
          error.value = "登入已過期，請重新登入";
        } else if (statusCode === 403) {
          error.value = "您沒有權限查看此訂單";
        } else if (statusCode === 404) {
          error.value = "找不到此訂單";
        } else {
          const errorMessage =
            typeof responseData === "object" && responseData.message
              ? responseData.message
              : "未知錯誤";
          error.value = `伺服器錯誤 (${statusCode}): ${errorMessage}`;
        }
      }
    } else if (err.request) {
      error.value = "無法連接到伺服器，請檢查網絡連接";
    } else {
      error.value = err.message || "發生未知錯誤";
    }
  } finally {
    loading.value = false;
  }
};
// 處理付款
const processPayment = async () => {
  // 驗證付款信息
  if (selectedPaymentMethod.value === "CREDIT_CARD") {
    if (
      !cardInfo.value.cardNumber ||
      cardInfo.value.cardNumber.replace(/\s/g, "").length !== 16
    ) {
      alert("請輸入有效的信用卡號碼");
      return;
    }

    if (
      !cardInfo.value.cardExpiry ||
      !cardInfo.value.cardExpiry.includes("/")
    ) {
      alert("請輸入有效的到期日期");
      return;
    }

    if (!cardInfo.value.cardCVC || cardInfo.value.cardCVC.length !== 3) {
      alert("請輸入有效的安全碼");
      return;
    }

    if (!cardInfo.value.cardHolder) {
      alert("請輸入持卡人姓名");
      return;
    }
  }

  isProcessing.value = true;

  try {
    // 構建付款數據
    const paymentData = {
      orderId: order.value.orderId,
      paymentMethod: selectedPaymentMethod.value,
      amount: order.value.totalPrice,
    };

    // 如果是信用卡付款，添加卡信息
    if (selectedPaymentMethod.value === "CREDIT_CARD") {
      paymentData.cardInfo = {
        cardNumber: cardInfo.value.cardNumber.replace(/\s/g, ""),
        cardExpiry: cardInfo.value.cardExpiry,
        cardCVC: cardInfo.value.cardCVC,
        cardHolder: cardInfo.value.cardHolder,
      };
    }

    // 發送付款請求
    const response = await axios.post("/api/payments/process", paymentData, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    // 處理付款結果
    if (
      response.data &&
      (response.data.success || response.data.status === "success")
    ) {
      // 跳轉到付款成功頁面
      router.push({
        name: "PaymentResult",
        params: {
          id: order.value.orderId,
        },
        query: {
          status: "success",
          method: selectedPaymentMethod.value,
        },
      });
    } else {
      throw new Error(response.data?.message || "付款處理失敗");
    }
  } catch (err) {
    console.error("付款處理錯誤:", err);
    alert(
      "付款處理失敗: " +
      (err.response?.data?.message || err.message || "未知錯誤")
    );
    isProcessing.value = false;
  }
};

// 取消付款並返回
const cancelPayment = () => {
  router.push("/orders");
};

// 組件掛載時載入訂單資料
onMounted(() => {
  loadOrderData();
});
</script>

<style scoped>
.order-payment-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Microsoft JhengHei", Arial, sans-serif;
}

.payment-header {
  text-align: center;
  margin-bottom: 30px;
}

.payment-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

/* 載入和錯誤區域 */
.loading-section,
.error-section {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
}

.retry-btn {
  background-color: #6c757d;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* 內容區域 */
.payment-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片樣式 */
.order-summary-card,
.payment-method-card,
.credit-card-form,
.bank-transfer-info {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 卡片標題 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-body {
  padding: 20px;
}

/* 訂單狀態標籤 */
.order-status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-shipped {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-canceled {
  background-color: #f8d7da;
  color: #721c24;
}

/* 價格顯示 */
.price {
  color: #28a745;
  font-weight: bold;
}

/* 商品列表 */
.order-items {
  margin-top: 20px;
}

.order-items h4 {
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 15px;
  background-color: white;
  border: 1px solid #eee;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: bold;
  margin: 0 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-specs {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.item-quantity,
.item-price,
.item-total {
  padding: 0 10px;
  text-align: right;
  min-width: 80px;
}

.item-total {
  font-weight: bold;
  color: #28a745;
}

/* 收貨資訊和價格摘要 */
.shipping-info,
.price-summary {
  margin-top: 20px;
}

.shipping-info h4,
.price-summary h4 {
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-box {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
}

.summary-table {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  font-weight: bold;
  font-size: 18px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

/* 付款方式選擇 */
.payment-method-card {
  padding: 20px;
}

.payment-method-card h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-method-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method-option:hover {
  border-color: #aaa;
  background-color: #f9f9f9;
}

.payment-method-option.active {
  border-color: #28a745;
  background-color: #f9fff9;
}

.method-icon {
  font-size: 24px;
  color: #333;
  width: 40px;
  text-align: center;
  margin-right: 15px;
}

.method-info {
  flex: 1;
}

.method-name {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.method-description {
  font-size: 13px;
  color: #666;
}

.method-select {
  width: 20px;
}

/* 信用卡表單 */
.credit-card-form {
  padding: 20px;
}

.credit-card-form h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* ATM 轉帳資訊 */
.bank-transfer-info {
  padding: 20px;
}

.bank-transfer-info h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.note {
  margin-top: 15px;
  color: #856404;
  background-color: #fff3cd;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 付款按鈕 */
.payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px 24px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.pay-btn {
  padding: 12px 24px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
}

.pay-btn:hover {
  background-color: #218838;
}

.pay-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* 處理中彈窗 */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.processing-modal {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  max-width: 300px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .item-row {
    flex-wrap: wrap;
  }

  .item-image {
    margin-bottom: 10px;
  }

  .item-details {
    width: 100%;
    margin-bottom: 10px;
  }

  .item-quantity,
  .item-price,
  .item-total {
    width: 33.33%;
    text-align: center;
    padding: 5px 0;
  }

  .form-row {
    flex-direction: column;
  }

  .payment-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .pay-btn {
    width: 100%;
  }
}
</style>
```
