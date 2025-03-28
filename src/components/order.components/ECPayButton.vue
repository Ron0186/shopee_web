<template>
  <div class="ecpay-button-container">
    <button @click="redirectToECPay" :disabled="isLoading" class="pay-btn">
      前往綠界付款
    </button>

    <div v-if="isLoading" class="overlay">
      <div class="spinner"></div>
      <p>正在連接到綠界支付，請稍候...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const isLoading = ref(false);
const router = useRouter();

// 透過後端生成綠界付款 HTML 表單
const redirectToECPay = () => {
  isLoading.value = true;

  // 儲存付款中的訂單 ID
  localStorage.setItem("pendingPaymentOrderId", props.orderId);

  // 讓後端產生 HTML 表單 → 綠界
  window.location.href = `http://localhost:8081/api/payment/redirect-html/${props.orderId}`;
};

// 進入付款結果頁面
const goToPaymentResult = (
  orderId,
  status = "success",
  method = "CREDIT_CARD"
) => {
  const frontendUrl = window.location.origin;
  window.location.href = `${frontendUrl}/payment/result/${orderId}?status=${status}&method=${method}`;
};

// 檢查是否從綠界返回
const checkIfReturnedFromECPay = () => {
  const currentUrl = window.location.href;

  if (
    currentUrl.includes("MockScanCodePay") ||
    (currentUrl.includes("payment-stage.ecpay.com.tw") &&
      currentUrl.includes("Paid"))
  ) {
    const orderId = localStorage.getItem("pendingPaymentOrderId");
    if (orderId) {
      localStorage.removeItem("pendingPaymentOrderId");
      goToPaymentResult(orderId);
    }
  }
};

// 檢查是否有未完成的付款
const checkIncompletePayment = () => {
  const attemptedOrderId = sessionStorage.getItem("ecpay_payment_attempted");

  if (attemptedOrderId) {
    sessionStorage.removeItem("ecpay_payment_attempted");
    if (confirm("您有一筆未完成付款，是否查看訂單狀態？")) {
      router.push({
        path: `/payment/result/${attemptedOrderId}`,
        query: { status: "pending", method: "CREDIT_CARD" },
      });
    }
  }
};

// 監控頁面離開時記錄未完成的付款
const watchUserLeavePage = () => {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      const pendingId = localStorage.getItem("pendingPaymentOrderId");
      if (pendingId) {
        sessionStorage.setItem("ecpay_payment_attempted", pendingId);
      }
    }
  });
};

// 組件掛載時執行初始化檢查
onMounted(() => {
  checkIfReturnedFromECPay();
  checkIncompletePayment();
  watchUserLeavePage();
});
</script>

<style scoped>
.ecpay-button-container {
  position: relative;
  margin: 15px 0;
}
.pay-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.pay-btn:disabled {
  background-color: #7f8c8d;
  cursor: not-allowed;
}
.pay-btn:hover:not(:disabled) {
  background-color: #2ecc71;
}
.overlay {
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
  z-index: 1000;
}
.spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid white;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
