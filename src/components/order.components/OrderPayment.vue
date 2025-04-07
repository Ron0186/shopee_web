<template>
  <div class="payment-container">
    <!-- 頁面頭部 -->
    <div class="page-header">
      <h1>訂單付款</h1>
      <p>請完成以下付款流程，以確認您的訂單</p>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-message">正在載入訂單資料...</div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
      <button @click="loadOrderData" class="retry-btn">重新載入</button>
    </div>

    <!-- 訂單內容 -->
    <div v-else>
      <!-- 訂單摘要卡片 -->
      <div class="order-summary-card">
        <div class="card-header">
          <h2>訂單摘要</h2>
          <div class="order-status" :class="statusClass">
            {{ order.status || "未付款" }}
          </div>
        </div>

        <div class="card-content">
          <!-- 訂單基本信息 -->
          <table class="order-info-table">
            <tr>
              <td>訂單編號:</td>
              <td>{{ order.orderId }}</td>
            </tr>
            <tr>
              <td>訂單日期:</td>
              <td>{{ formatDate(order.createdAt) }}</td>
            </tr>
            <tr>
              <td>商品數量:</td>
              <td>{{ getTotalItems() }} 件</td>
            </tr>
            <tr>
              <td>總金額:</td>
              <td>NT${{ formatPrice(order.totalPrice) }}</td>
            </tr>
          </table>

          <!-- 商品詳情區塊 -->
          <div class="product-details-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="fa fa-shopping-bag"></i>
              </div>
              <h3 class="section-title">商品明細</h3>
            </div>

            <div
              v-for="item in order.items"
              :key="item.sku_id"
              class="product-item"
            >
              <div class="product-image">
                <img :src="getItemImage(item)" :alt="item.productName" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.productName }}</div>
                <div class="product-meta">x{{ item.quantity }}</div>
              </div>
              <div class="product-price">
                NT${{ formatPrice(item.unitPrice * item.quantity) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收貨資訊 -->
      <div class="shipping-section">
        <div class="section-header">
          <div class="section-icon">
            <i class="fa fa-truck"></i>
          </div>
          <h3 class="section-title">收貨資訊</h3>
        </div>

        <div class="shipping-content">
          <div class="shipping-item">
            <div class="shipping-icon">
              <i class="fa fa-user"></i>
            </div>
            <div class="shipping-info">
              <h4>收件人</h4>
              <p>{{ order.shipping?.recipientName || "無資料" }}</p>
            </div>
          </div>

          <div class="shipping-item">
            <div class="shipping-icon">
              <i class="fa fa-phone"></i>
            </div>
            <div class="shipping-info">
              <h4>聯絡電話</h4>
              <p>{{ order.shipping?.recipientPhone || "無資料" }}</p>
            </div>
          </div>

          <div class="shipping-item">
            <div class="shipping-icon">
              <i class="fa fa-map-marker"></i>
            </div>
            <div class="shipping-info">
              <h4>收貨地址</h4>
              <p>{{ order.shipping?.address || "無資料" }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 金額摘要 -->
      <div class="price-summary-section">
        <div class="section-header">
          <div class="section-icon">
            <i class="fa fa-calculator"></i>
          </div>
          <h3 class="section-title">金額摘要</h3>
        </div>

        <div class="price-rows">
          <div class="price-row">
            <div class="price-label">商品小計:</div>
            <div class="price-value">
              NT${{ formatPrice(order.subtotal || order.totalPrice) }}
            </div>
          </div>
          <div class="price-row" v-if="order.shippingFee">
            <div class="price-label">運費:</div>
            <div class="price-value">
              NT${{ formatPrice(order.shippingFee) }}
            </div>
          </div>
          <div class="price-row" v-if="order.discount">
            <div class="price-label">折扣:</div>
            <div class="price-value">-NT${{ formatPrice(order.discount) }}</div>
          </div>
          <div class="price-row total">
            <div class="price-label">應付金額:</div>
            <div class="price-value">
              NT${{ formatPrice(order.totalPrice) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 付款方式 -->
      <div class="payment-methods-section">
        <div class="section-header">
          <div class="section-icon">
            <i class="fa fa-credit-card"></i>
          </div>
          <h3 class="section-title">選擇付款方式</h3>
        </div>

        <div class="payment-options">
          <!-- 動態生成付款選項 -->
          <div
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-option"
            :class="{ selected: selectedPaymentMethod === method.value }"
            @click="selectedPaymentMethod = method.value"
          >
            <div class="payment-radio">
              <div
                v-if="selectedPaymentMethod === method.value"
                class="radio-inner"
              ></div>
            </div>
            <div class="payment-icon" :class="method.iconClass">
              <i :class="method.icon"></i>
            </div>
            <div class="payment-details">
              <div class="payment-title">{{ method.name }}</div>
              <div class="payment-description">{{ method.description }}</div>
            </div>
          </div>

          <!-- 信用卡資訊 (顯示在選擇信用卡時) -->
          <div v-if="selectedPaymentMethod === 'CREDIT_CARD'" class="card-info">
            <div class="card-brands">
              <span class="card-brand visa">VISA</span>
              <span class="card-brand mastercard">MasterCard</span>
              <span class="card-brand jcb">JCB</span>
            </div>
            <p class="card-note">
              點擊下方按鈕後，您將被導向到綠界支付系統完成付款
            </p>
          </div>

          <!-- 手機轉帳資訊 (顯示在選擇手機轉帳時) -->
          <div
            v-if="selectedPaymentMethod === 'MOBILE_TRANSFER'"
            class="transfer-info"
          >
            <div class="bank-details">
              <p><strong>銀行名稱:</strong> 台灣第一銀行</p>
              <p><strong>銀行代碼:</strong> 007</p>
              <p><strong>帳號:</strong> 123-456-789-000</p>
              <p><strong>戶名:</strong> MyShop 購物網</p>
            </div>
            <p class="transfer-note">
              <i class="fa fa-info-circle"></i>
              請於轉帳完成後保留收據，並在備註欄填寫訂單編號。
            </p>
          </div>
        </div>
      </div>

      <!-- 按鈕區域 -->
      <div class="actions-section">
        <button class="btn-back" @click="cancelPayment">返回</button>
        <button
          class="btn-pay"
          @click="processPayment"
          :disabled="isProcessing"
        >
          <i class="fa fa-lock"></i>
          <span v-if="isProcessing">處理中...</span>
          <span v-else-if="selectedPaymentMethod === 'CREDIT_CARD'"
            >前往綠界付款 NT${{ formatPrice(order.totalPrice) }}</span
          >
          <span v-else-if="selectedPaymentMethod === 'MOBILE_TRANSFER'"
            >確認轉帳付款 NT${{ formatPrice(order.totalPrice) }}</span
          >
          <span v-else>確認訂單</span>
        </button>
      </div>

      <!-- 處理中遮罩 -->
      <div v-if="isProcessing" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-message">正在處理您的付款請求...</div>
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

const statusClass = computed(() => {
  const statusMap = {
    待付款: "status-pending",
    處理中: "status-processing",
    已出貨: "status-shipped",
    已完成: "status-completed",
    已取消: "status-canceled",
  };
  return statusMap[order.value.status] || "status-default";
});

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

const formatPrice = (price) => {
  if (price === undefined || price === null) return "0";
  return Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const getTotalItems = () => {
  if (!order.value.items || !Array.isArray(order.value.items)) return 0;
  return order.value.items.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );
};

const getItemImage = (item) => {
  if (item.image) return `/assets/${item.image}`;
  if (item.imageUrl) return item.imageUrl;
  return "/assets/default-product.png";
};

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
    if (!orderId) {
      error.value = "找不到訂單ID，請返回訂單列表重新選擇";
      loading.value = false;
      return;
    }

    const checkResponse = await axios.get(
      `/api/payment/orders/check-payment/${orderId}`,
      { headers }
    );

    if (checkResponse.data.status !== "success") {
      error.value =
        checkResponse.data.message || "此訂單不需要付款或已付款完成";
      loading.value = false;
      return;
    }

    const response = await axios.get(`/api/orders/${orderId}`, { headers });

    let orderData = response.data?.data || response.data;
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
  } catch (err) {
    error.value =
      "載入訂單失敗: " + (err.response?.data?.message || err.message);
  } finally {
    loading.value = false;
  }
};

const processECPayPayment = async () => {
  if (loading.value) {
    alert("訂單資料尚未載入完成，請稍候...");
    return;
  }
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
      const container = document.createElement("div");
      container.innerHTML = response.data.formHtml;
      const form = container.querySelector("form");
      if (form) {
        form.setAttribute("method", "POST");
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error("表單未找到");
      }
    } else {
      throw new Error("未獲得有效的付款表單");
    }
  } catch (err) {
    alert("支付發起失敗: " + err.message);
  } finally {
    isProcessing.value = false;
  }
};

const processMobileTransfer = async () => {
  isProcessing.value = true;
  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };
    await axios.post(
      `/api/payment/orders/${order.value.orderId}/payment`,
      { method: "MOBILE_TRANSFER" },
      { headers }
    );
    router.push({
      path: `/payment/result/${order.value.orderId}`,
      query: { status: "success", method: "MOBILE_TRANSFER" },
    });
  } catch (err) {
    alert("處理失敗: " + (err.response?.data?.message || err.message));
  } finally {
    isProcessing.value = false;
  }
};

const processCashOnDelivery = async () => {
  isProcessing.value = true;
  try {
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };
    await axios.post(
      `/api/payment/orders/${order.value.orderId}/payment`,
      { method: "CASH_ON_DELIVERY" },
      { headers }
    );
    router.push({
      path: `/payment/result/${order.value.orderId}`,
      query: { status: "success", method: "CASH_ON_DELIVERY" },
    });
  } catch (err) {
    alert("處理失敗: " + (err.response?.data?.message || err.message));
  } finally {
    isProcessing.value = false;
  }
};

const processPayment = async () => {
  if (selectedPaymentMethod.value === "CREDIT_CARD") {
    await processECPayPayment();
  } else if (selectedPaymentMethod.value === "MOBILE_TRANSFER") {
    await processMobileTransfer();
  } else if (selectedPaymentMethod.value === "CASH_ON_DELIVERY") {
    await processCashOnDelivery();
  } else {
    alert("請選擇付款方式");
  }
};

const cancelPayment = () => {
  router.push("/orders");
};

onMounted(() => {
  loadOrderData();
});
</script>

<style scoped>
/* 基本設置 */
.payment-container {
  font-family: "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  color: #333;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

/* 頁面頭部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

/* 載入中狀態 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: white;
  margin-top: 15px;
  font-size: 16px;
}

/* 錯誤狀態 */
.error-section {
  padding: 30px;
  background-color: #fff5f5;
  border-radius: 8px;
  border-left: 4px solid #f56565;
  margin: 20px 0;
  text-align: center;
}

.error-message {
  color: #c53030;
  font-size: 16px;
  margin-bottom: 15px;
}

.retry-btn {
  background-color: #2b6cb0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background-color: #2c5282;
}

/* 訂單摘要卡片 */
.order-summary-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  margin: 0;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-pending,
.status-default {
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

.card-content {
  padding: 20px;
}

/* 訂單基本資訊表格 */
.order-info-table {
  width: 100%;
  margin-bottom: 20px;
}

.order-info-table td {
  padding: 10px 5px;
  border-bottom: 1px solid #f2f2f2;
}

.order-info-table td:first-child {
  width: 40%;
  color: #6c757d;
  font-weight: 500;
}

.order-info-table td:last-child {
  color: #212529;
  font-weight: 500;
}

/* 商品詳情區塊 */
.product-details-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.section-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 50%;
  margin-right: 10px;
  color: #1976d2;
  font-size: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #343a40;
  margin: 0;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.product-image {
  width: 60px;
  height: 60px;
  min-width: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  background-color: white;
  border: 1px solid #e9ecef;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: 14px;
  color: #6c757d;
}

.product-price {
  font-weight: 600;
  color: #2c3e50;
  margin-left: 15px;
  white-space: nowrap;
}

/* 收貨資訊 */
.shipping-section {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  padding: 20px;
}

.shipping-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.shipping-item {
  display: flex;
  align-items: flex-start;
}

.shipping-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8f5e9;
  border-radius: 50%;
  margin-right: 12px;
  color: #43a047;
  font-size: 16px;
}

.shipping-info h4 {
  font-size: 14px;
  margin: 0 0 5px;
  color: #6c757d;
  font-weight: 500;
}

.shipping-info p {
  margin: 0;
  font-size: 15px;
  color: #212529;
  word-break: break-word;
}

/* 金額摘要 */
.price-summary-section {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  padding: 20px;
}

.price-rows {
  margin-top: 15px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f2f2f2;
}

.price-label {
  color: #6c757d;
}

.price-value {
  font-weight: 500;
  color: #212529;
}

.price-row.total {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 2px dashed #e9ecef;
  border-bottom: none;
  font-size: 18px;
  font-weight: 600;
}

.price-row.total .price-value {
  color: #e53e3e;
}

/* 付款方式 */
.payment-methods-section {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  padding: 20px;
}

.payment-options {
  margin-top: 15px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #bee3f8;
  background-color: #ebf8ff;
}

.payment-option.selected {
  border-color: #3182ce;
  background-color: #ebf8ff;
}

.payment-radio {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  margin-right: 15px;
  position: relative;
}

.payment-option.selected .payment-radio {
  border-color: #3182ce;
}

.radio-inner {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #3182ce;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.payment-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 15px;
  font-size: 18px;
}

/* 付款方式圖標顏色 */
.credit-card {
  background-color: #e3f2fd;
  color: #1976d2;
}

.mobile-transfer {
  background-color: #e8f5e9;
  color: #43a047;
}

.cash-delivery {
  background-color: #fff3e0;
  color: #f57c00;
}

.payment-details {
  flex: 1;
  min-width: 0;
}

.payment-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #212529;
}

.payment-description {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

/* 信用卡資訊 */
.card-info {
  margin: -5px 0 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.card-brands {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.card-brand {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.visa {
  background-color: #1a1f71;
  color: white;
}

.mastercard {
  background-color: #eb001b;
  color: white;
}

.jcb {
  background-color: #0f4c81;
  color: white;
}

.card-note {
  font-size: 14px;
  color: #4a5568;
  margin: 0;
}

/* 轉帳資訊 */
.transfer-info {
  margin: -5px 0 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #43a047;
}

.bank-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #4a5568;
}

.bank-details strong {
  font-weight: 600;
  color: #2d3748;
  display: inline-block;
  width: 80px;
}

.transfer-note {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  color: #f57c00;
  margin: 12px 0 0;
  padding: 10px;
  background-color: #fffaf0;
  border-radius: 4px;
}

.transfer-note i {
  margin-right: 8px;
  font-size: 16px;
}

/* 按鈕區域 */
.actions-section {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 15px;
}

.btn-back {
  padding: 12px 24px;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: #cbd5e0;
}

.btn-pay {
  flex: 1;
  padding: 12px 24px;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 300px;
}

.btn-pay:hover {
  background-color: #2c5282;
}

.btn-pay:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .shipping-content {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-back,
  .btn-pay {
    width: 100%;
    max-width: 100%;
  }

  .order-info-table td:first-child {
    width: 35%;
  }

  .product-item {
    flex-wrap: wrap;
  }

  .product-price {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
    text-align: right;
  }
}
</style>
