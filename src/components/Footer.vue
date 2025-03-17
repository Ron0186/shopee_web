<template>
  <footer class="footer">
    <!-- 📢 訂閱新聞區 -->
    <div class="newsletter">
      <h3>訂閱我們的 <span>最新消息</span></h3>
      <div class="newsletter-input">
        <input type="email" placeholder="輸入您的 Email" v-model="email" />
        <button @click="subscribe">📩 訂閱</button>
      </div>
      <div class="social-links">
        <a href="#"><i class="fab fa-facebook-f"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
        <a href="#"><i class="fab fa-pinterest"></i></a>
      </div>
    </div>

    <!-- 📌 底部主要內容 -->
    <div class="footer-content">
      <div class="footer-column">
        <h4>關於我們</h4>
        <p>我們致力於提供優質的購物體驗，讓您輕鬆選購最喜愛的商品。</p>
        <p>📍 地址：台北市中正區某某路 123 號</p>
        <p>📞 電話：+886-987-654-321</p>
        <p>📧 信箱：service@myshop.com</p>
      </div>
      <div class="footer-column">
        <h4>商品分類</h4>
        <ul>
          <li>
            <router-link to="/shop?category=hot" class="footer-link">🔥 熱銷商品</router-link>
          </li>
          <li>
            <router-link to="/shop?category=laptops" class="footer-link">💻 筆記型電腦</router-link>
          </li>
          <li>
            <router-link to="/shop?category=phones" class="footer-link">📱 智慧型手機</router-link>
          </li>
          <li>
            <router-link to="/shop?category=cameras" class="footer-link">📷 攝影器材</router-link>
          </li>
          <li>
            <router-link to="/shop?category=accessories" class="footer-link">🎧 配件</router-link>
          </li>
        </ul>
      </div>
      <div class="footer-column">
        <h4>網站資訊</h4>
        <ul>
          <li>
            <router-link to="/about" class="footer-link">關於我們</router-link>
          </li>
          <li>
            <router-link to="/contact" class="footer-link">聯絡我們</router-link>
          </li>
          <li>
            <router-link to="/privacy" class="footer-link">隱私權政策</router-link>
          </li>
          <li>
            <router-link to="/returns" class="footer-link">退貨與退款</router-link>
          </li>
          <li>
            <router-link to="/terms" class="footer-link">使用條款</router-link>
          </li>
        </ul>
      </div>
      <div class="footer-column">
        <h4>客戶服務</h4>
        <ul>
          <li>
            <router-link to="/account" class="footer-link">我的帳戶</router-link>
          </li>
          <li>
            <router-link to="/cart" class="footer-link">🛒 購物車</router-link>
          </li>
          <li>
            <router-link to="/wishlist" class="footer-link">💖 收藏清單</router-link>
          </li>
          <li>
            <router-link to="/order-tracking" class="footer-link">📦 訂單追蹤</router-link>
          </li>
          <li>
            <router-link to="/HelpCenter" class="footer-link">❓ 幫助中心</router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- 📌 付款方式 -->
    <div class="payment-methods">
      <img src="@/assets/paypal.png" alt="PayPal" />
      <img src="@/assets/visa.png" alt="Visa" />
      <img src="@/assets/Mastercard.png" alt="MasterCard" />
      <img src="@/assets/apple-pay.png" alt="Apple Pay" />
    </div>

    <!-- 📌 版權聲明 -->
    <div class="footer-bottom">
      <p>Copyright &copy; 2025 All rights reserved | MyShop</p>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");

const subscribe = () => {
  if (!email.value) {
    alert("請輸入您的 Email");
  } else {
    alert(`已成功訂閱：${email.value}`);
    email.value = "";
  }
};
</script>

<style scoped>
/* 📢 訂閱新聞區 */
.newsletter {
  text-align: center;
  padding: 40px 20px;
  border-bottom: 3px solid red;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.newsletter h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.newsletter-input input {
  padding: 15px;
  font-size: 18px;
  width: 350px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
}

.newsletter-input button {
  background: #ff9b20;
  padding: 15px 20px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
}

/* ✅ 讓 `footer-column` 的 `ul` 移除預設點點符號 */
.footer-column ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

/* ✅ 讓 `footer-column` 內的 `li` 具有適當的間距 */
.footer-column ul li {
  margin-bottom: 5px;
}

/* ✅ 讓 `footer-content` 水平排列 */
.footer {
  background: #f7e9d2;
  /* ✅ 改成藍色，與 Navbar 一致 */
  color: #000;
  /* ✅ 文字變白色，提高可讀性 */
  padding: 40px 20px;
  width: 100%;
  max-width: 100%;
  margin-top: auto;
  box-sizing: border-box;
  text-align: center;
}

/* ✅ 讓 `footer-content` 內容水平排列 */
.footer-content {
  display: flex;
  /* 設置為 flex 佈局 */
  flex-wrap: wrap;
  /* 若內容超出可換行 */
  justify-content: space-around;
  /* 讓區塊平均分佈 */
  align-items: flex-start;
  /* 讓內容頂端對齊 */
  width: 100%;
  max-width: 1400px;
  /* 限制最大寬度 */
  margin: 0 auto;
  padding: 20px 0;
  box-sizing: border-box;
  text-align: left;
  /* 讓文字靠左對齊 */
}

.footer-column {
  flex: 1;
  /* 讓每個區塊平分空間 */
  min-width: 200px;
  /* 最小寬度，避免太窄 */
  padding: 0 15px;
}

.payment-methods {
  display: flex;
  justify-content: center;
  /* 讓付款方式置中 */
  align-items: center;
  gap: 15px;
  padding-top: 20px;
}

/* ✅ 限制付款方式圖片大小 */
.payment-methods img {
  max-width: 100px;
  /* 限制圖片最大寬度 */
  max-height: 50px;
  /* 限制圖片最大高度 */
  height: auto;
  width: auto;
  object-fit: contain;
  /* 確保圖片不會變形 */
  filter: brightness(0.9);
}

/* ✅ 讓 `footer-bottom` 的版權宣告對齊 */
.footer-bottom {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #333;
  font-size: 12px;
  color: #aaa;
  width: 100%;
}

.footer-link {
  color: #000;
  text-decoration: none;
  transition: color 0.3s ease, border-bottom 0.3s ease;
  border-bottom: 1px solid transparent;
}

.footer-link:hover {
  color: #e7840b;
  border-bottom: 1px solid #e7840b;
}
</style>
