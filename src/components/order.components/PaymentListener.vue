<template>
  <div class="payment-listener">
    <div class="payment-processing">
      <div class="spinner"></div>
      <h2>{{ processingText }}</h2>
      <p>{{ processingSubtext }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const processingText = ref("處理付款結果中...");
const processingSubtext = ref("請稍候，系統正在驗證您的付款狀態");

// 導向到付款結果頁面
const goToResultPage = (
  orderId,
  status = "success",
  method = "CREDIT_CARD"
) => {
  router.push({
    path: `/payment/result/${orderId}`,
    query: { status, method },
  });
};

// 處理付款回傳的邏輯
const handlePaymentReturn = () => {
  const pendingOrderId = localStorage.getItem("pendingPaymentOrderId");

  if (!pendingOrderId) {
    // 若沒有 pending 訂單，回到訂單列表
    processingText.value = "無法確認訂單資訊";
    processingSubtext.value = "即將導回訂單頁...";
    setTimeout(() => router.push("/orders"), 2000);
    return;
  }

  try {
    // 移除 pending 訂單
    localStorage.removeItem("pendingPaymentOrderId");

    // 讀取付款狀態（如有）
    const statusKey = `payment_status_${pendingOrderId}`;
    const storedStatus = sessionStorage.getItem(statusKey);

    // 延遲執行以處理狀態
    setTimeout(() => {
      if (storedStatus) {
        sessionStorage.removeItem(statusKey);
        try {
          const parsed = JSON.parse(storedStatus);
          goToResultPage(pendingOrderId, parsed.status, parsed.method);
        } catch (e) {
          console.error("解析付款狀態失敗", e);
          goToResultPage(pendingOrderId); // fallback 成功信用卡
        }
      } else {
        // 無明確狀態，預設為信用卡付款成功
        goToResultPage(pendingOrderId);
      }
    }, 1500);
  } catch (err) {
    console.error("付款處理錯誤:", err);
    processingText.value = "付款處理異常";
    processingSubtext.value = "系統遇到問題，請聯繫客服或稍後再試";

    // 延遲返回訂單列表
    setTimeout(() => router.push("/orders"), 3000);
  }
};

// 組件掛載時處理付款回傳
onMounted(() => {
  handlePaymentReturn();
});
</script>

<style scoped>
.payment-listener {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.payment-processing {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  transition: all 0.3s ease;
}

.spinner {
  display: inline-block;
  width: 60px;
  height: 60px;
  border: 5px solid rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 22px;
}

p {
  color: #666;
  font-size: 16px;
}
</style>
