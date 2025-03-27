<template>
  <div>
    <!-- 付款方式選擇 -->
    <div class="payment-methods">
      <div
        class="method"
        :class="{ active: selectedMethod === 'CREDIT_CARD' }"
        @click="selectMethod('CREDIT_CARD')"
      >
        <div class="icon"><i class="bi bi-credit-card"></i></div>
        <div class="info">
          <h4>信用卡付款</h4>
          <p>支援VISA、MasterCard、JCB</p>
        </div>
      </div>

      <div
        class="method"
        :class="{ active: selectedMethod === 'MOBILE_TRANSFER' }"
        @click="selectMethod('MOBILE_TRANSFER')"
      >
        <div class="icon"><i class="bi bi-phone"></i></div>
        <div class="info">
          <h4>手機跨行轉帳</h4>
          <p>透過行動支付轉帳</p>
        </div>
      </div>

      <div
        class="method"
        :class="{ active: selectedMethod === 'CASH_ON_DELIVERY' }"
        @click="selectMethod('CASH_ON_DELIVERY')"
      >
        <div class="icon"><i class="bi bi-cash"></i></div>
        <div class="info">
          <h4>貨到付款</h4>
          <p>收貨時支付現金</p>
        </div>
      </div>
    </div>

    <!-- 按鈕區域 -->
    <div class="action-buttons">
      <button class="back-btn" @click="goBack">返回</button>
      <button
        v-if="selectedMethod !== 'CASH_ON_DELIVERY'"
        class="confirm-btn"
        @click="confirmPayment"
      >
        確認付款 NT${{ totalAmount }}
      </button>
      <button v-else class="confirm-btn" @click="confirmCashOnDelivery">
        確認訂單
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "PaymentSelection",

  setup() {
    const router = useRouter();
    const route = useRoute();

    return { router, route };
  },

  data() {
    return {
      selectedMethod: "CREDIT_CARD",
      totalAmount: 12000, // 從訂單數據中獲取
      orderId: this.$route.params.id || "",
    };
  },

  methods: {
    selectMethod(method) {
      this.selectedMethod = method;
    },

    goBack() {
      // 返回上一步
      this.$router.push("/checkout/review");
    },

    confirmPayment() {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      if (this.selectedMethod === "CREDIT_CARD") {
        // 使用 axios 發送請求而不是直接重定向
        axios
          .get(`/api/payment/redirect/${this.orderId}`, { headers })
          .then((response) => {
            if (response.data && response.data.redirectUrl) {
              window.location.href = response.data.redirectUrl;
            } else {
              throw new Error("未獲得付款重定向網址");
            }
          })
          .catch((error) => {
            console.error("支付發起失敗:", error);
            alert("支付發起失敗: " + error.message);
          });
      } else if (this.selectedMethod === "MOBILE_TRANSFER") {
        this.createMobileTransferOrder();
      }
    },

    createMobileTransferOrder() {
      axios
        .post(`/api/orders/${this.orderId}/payment`, {
          method: "MOBILE_TRANSFER",
        })
        .then((response) => {
          // 導向到成功頁面，顯示轉帳資訊
          this.$router.push({
            path: `/payment/result/${this.orderId}`,
            query: { status: "success", method: "MOBILE_TRANSFER" },
          });
        })
        .catch((error) => {
          console.error("建立轉帳訂單失敗:", error);
        });
    },

    createCashOnDeliveryOrder() {
      axios
        .post(`/api/orders/${this.orderId}/payment`, {
          method: "CASH_ON_DELIVERY",
        })
        .then((response) => {
          // 導向到成功頁面
          this.$router.push({
            path: `/payment/result/${this.orderId}`,
            query: { status: "success", method: "CASH_ON_DELIVERY" },
          });
        })
        .catch((error) => {
          console.error("建立貨到付款訂單失敗:", error);
        });
    },
  },
};
</script>

<style scoped>
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.method {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method.active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.05);
}

.icon {
  font-size: 24px;
  color: #007bff;
  margin-right: 16px;
}

.info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.back-btn {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
