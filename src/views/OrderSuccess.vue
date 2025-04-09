<template>
  <div class="success-container">
    <div class="success-card">
      <div class="success-icon-container">
        <div class="success-icon-circle">
          <div class="checkmark">✓</div>
        </div>
        <div class="success-confetti left"></div>
        <div class="success-confetti right"></div>
      </div>

      <h2 class="success-title">訂單已完成</h2>
      <p class="success-message">感謝您的訂購！我們會盡快為您處理。</p>

      <div class="order-details">
        <span class="order-label">訂單編號</span>
        <span class="order-number">#{{ orderId }}</span>
      </div>

      <div class="action-buttons">
        <router-link class="btn view-order-btn" to="/user/orders">
          <span class="btn-icon">📋</span>
          <span class="btn-text">查看我的訂單</span>
        </router-link>

        <router-link class="btn home-btn" to="/shop">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">返回首頁</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const orderId = route.params.orderId;
</script>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background-color: #f9f7f6;
  padding: 20px;
  font-family: "Noto Sans TC", sans-serif;
}

.success-card {
  background-color: #ffffff;
  padding: 40px 30px;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon-container {
  position: relative;
  height: 100px;
  margin-bottom: 30px;
}

.success-icon-circle {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #32d74b, #4cd964);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(76, 217, 100, 0.3);
  animation: pulse 2s infinite;
  z-index: 2;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 217, 100, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(76, 217, 100, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 217, 100, 0);
  }
}

.checkmark {
  color: white;
  font-size: 40px;
  font-weight: bold;
  line-height: 1;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-confetti {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 0;
  z-index: 1;
  opacity: 0.5;
}

.success-confetti.left {
  left: 80px;
  background: radial-gradient(
    circle,
    rgba(255, 107, 129, 0.2) 10%,
    transparent 70%
  );
  animation: float 6s infinite alternate ease-in-out;
}

.success-confetti.right {
  right: 80px;
  background: radial-gradient(
    circle,
    rgba(76, 217, 100, 0.2) 10%,
    transparent 70%
  );
  animation: float 5s 0.5s infinite alternate ease-in-out;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.success-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 700;
}

.success-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}

.order-details {
  background-color: #f9f7f6;
  border-radius: 14px;
  padding: 16px;
  margin: 25px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.order-label {
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

.order-number {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b81;
  letter-spacing: 1px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn:before {
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

.btn:hover:before {
  width: 300px;
  height: 300px;
}

.btn-icon {
  margin-right: 10px;
  font-size: 18px;
}

.view-order-btn {
  background-color: #ff6b81;
  color: white;
  box-shadow: 0 8px 20px rgba(255, 107, 129, 0.15);
}

.view-order-btn:hover {
  background-color: #ff5a73;
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(255, 107, 129, 0.25);
}

.home-btn {
  background-color: #f1f1f1;
  color: #555;
}

.home-btn:hover {
  background-color: #e5e5e5;
  color: #333;
  transform: translateY(-2px);
}

.support-info {
  margin-top: 30px;
  font-size: 14px;
  color: #888;
}

.support-link {
  color: #ff6b81;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.support-link:hover {
  color: #ff5a73;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .success-card {
    padding: 30px 20px;
    border-radius: 20px;
  }

  .success-title {
    font-size: 24px;
  }

  .success-icon-circle {
    width: 70px;
    height: 70px;
  }

  .checkmark {
    font-size: 35px;
  }

  .btn {
    padding: 14px 16px;
  }
}
</style>
