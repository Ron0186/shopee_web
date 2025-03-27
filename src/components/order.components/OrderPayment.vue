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
              <div
                v-for="item in order.items"
                :key="item.sku_id"
                class="item-row"
              >
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
                <span
                  >NT${{
                    formatPrice(order.subtotal || order.totalPrice)
                  }}</span
                >
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
          <div
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-method-option"
            :class="{ active: selectedPaymentMethod === method.value }"
            @click="selectedPaymentMethod = method.value"
          >
            <div class="method-icon">
              <i :class="method.icon"></i>
            </div>
            <div class="method-info">
              <span class="method-name">{{ method.name }}</span>
              <span class="method-description">{{ method.description }}</span>
            </div>
            <div class="method-select">
              <input
                type="radio"
                :id="method.value"
                :value="method.value"
                v-model="selectedPaymentMethod"
                name="paymentMethod"
              />
              <label :for="method.value"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 手機轉帳資訊 (僅在選擇手機轉帳時顯示) -->
      <div
        v-if="selectedPaymentMethod === 'MOBILE_TRANSFER'"
        class="bank-transfer-info"
      >
        <h3>手機跨行轉帳資訊</h3>
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
        <button @click="cancelPayment" class="cancel-btn">返回</button>
        <button
          v-if="selectedPaymentMethod === 'CREDIT_CARD'"
          @click="processECPayPayment"
          :disabled="isProcessing"
          class="pay-btn"
        >
          <span v-if="isProcessing">處理中...</span>
          <span v-else
            >前往綠界付款 NT${{ formatPrice(order.totalPrice) }}</span
          >
        </button>
        <button
          v-else-if="selectedPaymentMethod === 'MOBILE_TRANSFER'"
          @click="processMobileTransfer"
          :disabled="isProcessing"
          class="pay-btn"
        >
          <span v-if="isProcessing">處理中...</span>
          <span v-else>確認付款 NT${{ formatPrice(order.totalPrice) }}</span>
        </button>
        <button
          v-else
          @click="processCashOnDelivery"
          :disabled="isProcessing"
          class="pay-btn"
        >
          <span v-if="isProcessing">處理中...</span>
          <span v-else>確認訂單</span>
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
const isProcessing = ref(false);
const selectedPaymentMethod = ref("CREDIT_CARD");
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

// 付款方式選項
const paymentMethods = [
  {
    name: "信用卡付款",
    value: "CREDIT_CARD",
    icon: "bi bi-credit-card",
    description: "支援VISA、MasterCard、JCB",
  },
  {
    name: "手機跨行轉帳",
    value: "MOBILE_TRANSFER",
    icon: "bi bi-phone",
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

// 載入訂單資料
const loadOrderData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const orderId = route.params.orderId || route.params.id;
    console.log("嘗試載入訂單ID:", orderId);

    if (!orderId) {
      error.value = "找不到訂單ID，請返回訂單列表重新選擇";
      loading.value = false;
      return;
    }

    const checkResponse = await axios.get(
      `/api/payment/orders/check-payment/${orderId}`,
      { headers }
    );

    console.log("檢查付款回應:", checkResponse.data);

    if (checkResponse.data.status !== "success") {
      error.value =
        checkResponse.data.message || "此訂單不需要付款或已付款完成";
      loading.value = false;
      return;
    }

    const response = await axios.get(`/api/orders/${orderId}`, { headers });

    console.log("訂單數據回應:", response.data);

    let orderData = {};
    if (response.data) {
      if (response.data.hasOwnProperty("statusCode") && response.data.data) {
        orderData = response.data.data;
      } else if (response.data.data) {
        orderData = response.data.data;
      } else {
        orderData = response.data;
      }
    }

    console.log("處理後的訂單數據:", orderData);

    order.value = {
      orderId: orderData.orderId || orderId,
      status: orderData.status || "未付款",
      totalPrice: orderData.totalPrice || 0,
      items: Array.isArray(orderData.items)
        ? orderData.items
        : Array.isArray(orderData.orderItem)
        ? orderData.orderItem.map((item) => ({
            sku_id: item.sku?.skuId || item.skuId || 0,
            productName:
              item.sku?.product?.productName || item.productName || "未知商品",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            image: item.sku?.product?.image || item.image || null,
            imageUrl: item.sku?.product?.image || item.imageUrl || null,
            specs: item.specs || "",
          }))
        : [],
      createdAt: orderData.createdAt || new Date().toISOString(),
      shipping: {
        recipientName:
          orderData.shipping?.recipientName ||
          orderData.userName ||
          orderData.user?.userName ||
          "",
        recipientPhone:
          orderData.shipping?.recipientPhone ||
          orderData.userPhone ||
          orderData.user?.phone ||
          "",
        address:
          orderData.shipping?.address ||
          orderData.shippingAddress ||
          `${orderData.order?.shipping?.city || ""} ${
            orderData.order?.shipping?.district || ""
          } ${orderData.order?.shipping?.zipCode || ""} ${
            orderData.order?.shipping?.streetEtc || ""
          }`,
      },
      subtotal: orderData.subtotal || orderData.totalPrice || 0,
      shippingFee: orderData.shippingFee || 0,
      discount: orderData.discount || 0,
    };

    console.log("最終處理的訂單數據:", order.value);
  } catch (err) {
    console.error("載入訂單錯誤:", err);
    error.value =
      "載入訂單失敗: " + (err.response?.data?.message || err.message);
  } finally {
    loading.value = false;
  }
};

// 處理綠界付款
// 改進版的 processECPayPayment 函數
const processECPayPayment = async () => {
  isProcessing.value = true;
  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(
      `/api/payment/redirect/${order.value.orderId}`,
      { headers }
    );

    if (response.data && response.data.formHtml) {
      // 創建臨時容器並放入表單
      const container = document.createElement("div");
      container.innerHTML = response.data.formHtml;

      // 獲取表單
      const form = container.querySelector("form");
      if (form) {
        // 檢查必要欄位
        const requiredFields = [
          "MerchantID",
          "MerchantTradeNo",
          "MerchantTradeDate",
          "PaymentType",
          "TotalAmount",
          "TradeDesc",
          "ItemName",
          "ReturnURL",
          "ChoosePayment",
          "CheckMacValue",
        ];

        const missingFields = [];
        requiredFields.forEach((field) => {
          const input = form.querySelector(`input[name="${field}"]`);
          if (!input || !input.value) {
            missingFields.push(field);
            console.error(`表單缺少必要欄位: ${field}`);
          } else {
            console.log(`找到欄位 ${field}: ${input.value}`);
          }
        });

        if (missingFields.length > 0) {
          throw new Error(`表單缺少必要欄位: ${missingFields.join(", ")}`);
        }

        // 強制設置表單方法
        form.setAttribute("method", "POST");

        // 添加到文檔並提交
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error("表單未找到");
      }
    } else if (response.data && response.data.redirectUrl) {
      window.location.href = response.data.redirectUrl;
    } else {
      throw new Error("未獲得有效的付款信息");
    }
  } catch (err) {
    console.error("支付處理失敗:", err);
    isProcessing.value = false;
    alert("支付發起失敗: " + err.message);
  }
};

// 處理手機轉帳
const processMobileTransfer = async () => {
  isProcessing.value = true;
  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const response = await axios.post(
      `/api/payment/orders/${order.value.orderId}/payment`,
      {
        method: "MOBILE_TRANSFER",
      },
      { headers }
    );

    router.push({
      path: `/payment/result/${order.value.orderId}`,
      query: { status: "success", method: "MOBILE_TRANSFER" },
    });
  } catch (err) {
    console.error("處理手機轉帳錯誤:", err);
    alert(
      "處理失敗: " + (err.response?.data?.message || err.message || "未知錯誤")
    );
    isProcessing.value = false;
  }
};

// 處理貨到付款
const processCashOnDelivery = async () => {
  isProcessing.value = true;
  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const response = await axios.post(
      `/api/payment/orders/${order.value.orderId}/payment`,
      {
        method: "CASH_ON_DELIVERY",
      },
      { headers }
    );

    console.log("貨到付款回應:", response.data);

    router.push({
      path: `/payment/result/${order.value.orderId}`,
      query: { status: "success", method: "CASH_ON_DELIVERY" },
    });
  } catch (err) {
    console.error("處理貨到付款錯誤:", err);
    alert(
      "處理失敗: " + (err.response?.data?.message || err.message || "未知錯誤")
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
