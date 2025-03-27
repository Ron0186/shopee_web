<template>
  <div class="payment-button-container">
    <button
      class="payment-button"
      :class="{ loading: isLoading }"
      @click="initiatePayment"
      :disabled="isLoading"
    >
      {{ isLoading ? "處理中..." : "前往 ECPay 付款" }}
    </button>

    <div v-if="isLoading" class="payment-overlay">
      <div class="spinner"></div>
      <p>正在連接到綠界支付系統，請稍候...</p>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios"; // 假設您使用自定義的 axios 實例

export default {
  name: "PaymentButton",
  props: {
    orderId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    async checkOrderPayment() {
      try {
        // 使用自定義的 axios 實例，會自動攜帶 token
        const response = await axios.get(
          `/api/payment/orders/check-payment/${this.orderId}`
        );

        if (response.data.status === "error") {
          throw new Error(
            response.data.message || "此訂單不需要付款或已付款完成"
          );
        }

        return true;
      } catch (error) {
        console.error("檢查付款狀態錯誤:", error);
        this.$alert(error.message || "付款檢查失敗，請稍後再試");
        return false;
      }
    },

    async initiatePayment() {
      this.isLoading = true;

      try {
        // 直接導向到後端的重定向端點
        window.location.href = `/api/payment/redirect/${this.orderId}`;
      } catch (error) {
        console.error("支付發起失敗:", error);
        this.isLoading = false;
        alert("支付發起失敗: " + error.message);
      }
    },
  },
};
</script>

<style scoped>
.payment-button-container {
  position: relative;
  margin: 20px 0;
}

.payment-button {
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

.payment-button:hover {
  background-color: #2ecc71;
}

.payment-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.payment-button.loading {
  background-color: #7f8c8d;
}

.payment-overlay {
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

.payment-overlay p {
  color: white;
  font-size: 18px;
  margin-top: 20px;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
