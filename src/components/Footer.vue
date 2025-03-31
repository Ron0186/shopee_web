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
                    <li><router-link to="/shop?category=hot">🔥 熱銷商品</router-link></li>
                    <li><router-link to="/shop?category=laptops">💻 筆記型電腦</router-link></li>
                    <li><router-link to="/shop?category=phones">📱 智慧型手機</router-link></li>
                    <li><router-link to="/shop?category=cameras">📷 攝影器材</router-link></li>
                    <li><router-link to="/shop?category=accessories">🎧 配件</router-link></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>網站資訊</h4>
                <ul>
                    <li><router-link to="/about">關於我們</router-link></li>
                    <li><router-link to="/contact">聯絡我們</router-link></li>
                    <li><router-link to="/privacy">隱私權政策</router-link></li>
                    <li><router-link to="/returns">退貨與退款</router-link></li>
                    <li><router-link to="/terms">使用條款</router-link></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>客戶服務</h4>
                <ul>
                    <li><router-link to="/account">我的帳戶</router-link></li>
                    <li><router-link to="/cart">🛒 購物車</router-link></li>
                    <li><router-link to="/wishlist">💖 收藏清單</router-link></li>
                    <li><router-link to="/order-tracking">📦 訂單追蹤</router-link></li>
                    <li>
                        <router-link to="/helpCenter">❓ 幫助中心</router-link>
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
import { RouterLink } from "vue-router";

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
/* 主要颜色变量 */
:root {
    --primary-color: #d9a76a;
    --secondary-color: #5a4d3e;
    --bg-color: #f8f5eb;
    --border-color: #e6e1d3;
    --text-color: #5a4d3e;
    --light-text: #666;
}

/* 整体页脚风格 */
.footer {
    background-color: #f8f5eb;
    color: #5a4d3e;
    padding: 40px 20px;
    width: 100%;
    max-width: 100%;
    margin-top: auto;
    box-sizing: border-box;
    text-align: center;
    border-top: 1px solid #e6e1d3;
}

/* 📢 訂閱新聞區 */
.newsletter {
    text-align: center;
    padding: 40px 20px;
    border-bottom: 1px solid #e6e1d3;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    background-color: #f0ece0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 40px;
}

.newsletter h3 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #5a4d3e;
}

.newsletter h3 span {
    color: #d9a76a;
}

.newsletter-input {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.newsletter-input input {
    padding: 15px;
    font-size: 16px;
    width: 350px;
    border-radius: 4px 0 0 4px;
    border: 1px solid #d6ceb8;
    outline: none;
    background-color: #fff;
}

.newsletter-input button {
    background: #d9a76a;
    color: white;
    padding: 15px 20px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    transition: background-color 0.3s;
}

.newsletter-input button:hover {
    background-color: #c69155;
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
}

.social-links a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #f0ece0;
    border: 1px solid #d6ceb8;
    border-radius: 50%;
    color: #d9a76a;
    transition: all 0.3s ease;
}

.social-links a:hover {
    background-color: #d9a76a;
    color: white;
    transform: translateY(-3px);
}

.social-links i {
    font-size: 18px;
}

/* ✅ 讓 `footer-content` 內容水平排列 */
.footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: flex-start;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 0;
    box-sizing: border-box;
    text-align: left;
}

.footer-column {
    flex: 1;
    min-width: 200px;
    padding: 0 15px;
    margin-bottom: 30px;
}

.footer-column h4 {
    color: #5a4d3e;
    margin-bottom: 20px;
    font-size: 18px;
    position: relative;
    padding-bottom: 10px;
}

.footer-column h4::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #d9a76a;
}

.footer-column p {
    margin-bottom: 10px;
    color: #666;
    line-height: 1.6;
}

/* ✅ 讓 `footer-column` 的 `ul` 移除預設點點符號 */
.footer-column ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

/* ✅ 讓 `footer-column` 內的 `li` 具有適當的間距 */
.footer-column ul li {
    margin-bottom: 12px;
}

.footer-column a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s;
    position: relative;
    padding-left: 5px;
}

.footer-column a:hover {
    color: #d9a76a;
}

.footer-column a:before {
    content: "›";
    position: absolute;
    left: -5px;
    color: #d9a76a;
    opacity: 0;
    transition: all 0.3s;
}

.footer-column a:hover:before {
    opacity: 1;
    left: 0;
}

/* 付款方式 */
.payment-methods {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 20px 0;
    border-top: 1px solid #e6e1d3;
    margin-top: 20px;
}

.payment-methods img {
    max-width: 70px;
    max-height: 40px;
    height: auto;
    width: auto;
    object-fit: contain;
    opacity: 0.7;
    transition: opacity 0.3s;
}

.payment-methods img:hover {
    opacity: 1;
}

/* 版权信息 */
.footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e6e1d3;
    font-size: 14px;
    color: #888;
    width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .newsletter-input {
        flex-direction: column;
        align-items: center;
    }

    .newsletter-input input {
        width: 100%;
        max-width: 350px;
        border-radius: 4px;
        margin-bottom: 10px;
    }

    .newsletter-input button {
        width: 100%;
        max-width: 350px;
        border-radius: 4px;
    }

    .footer-content {
        flex-direction: column;
    }

    .footer-column {
        width: 100%;
        padding: 0 20px;
        text-align: center;
    }

    .footer-column h4::after {
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>