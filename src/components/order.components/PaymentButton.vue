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
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        };

        const response = await axios.get(
          `/api/payment/orders/check-payment/${this.orderId}`,
          { headers }
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
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        };

        // 先檢查訂單是否可以付款
        const canPay = await this.checkOrderPayment();
        if (!canPay) {
          this.isLoading = false;
          return;
        }

        // 使用相對路徑
        const response = await axios.get(
          `/api/payment/redirect/${this.orderId}`,
          {
            headers,
            // 明確指定響應類型
            responseType: "json",
          }
        );

        console.log("付款響應:", response.data); // 新增日誌

        if (response.data && response.data.formHtml) {
          // 創建一個臨時div來插入HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = response.data.formHtml;

          const form = tempDiv.querySelector("form");
          if (form) {
            document.body.appendChild(form);
            form.submit();
          } else {
            throw new Error("未找到支付表單");
          }
        } else if (response.data && response.data.redirectUrl) {
          // 如果有重定向URL，直接跳轉
          window.location.href = response.data.redirectUrl;
        } else {
          throw new Error("未獲得付款重定向信息");
        }
      } catch (error) {
        console.error("支付發起失敗:", error);
        this.isLoading = false;

        // 更詳細的錯誤處理
        if (error.response) {
          // 伺服器返回了錯誤響應
          alert(`支付發起失敗: ${error.response.data.error || error.message}`);
        } else if (error.request) {
          // 請求已發出，但沒有收到響應
          alert("網絡錯誤：未收到伺服器響應");
        } else {
          // 在設置請求時發生了錯誤
          alert("支付發起失敗: " + error.message);
        }
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
