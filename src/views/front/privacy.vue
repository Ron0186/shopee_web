<template>
  <div class="container policy-container my-5 py-4">
    <!-- 頂部裝飾 -->
    <div class="d-flex justify-content-center mb-4">
      <div class="header-decoration w-25"></div>
      <div class="header-decoration w-50 mx-2"></div>
      <div class="header-decoration w-25"></div>
    </div>

    <!-- 標題 -->
    <h1 class="text-center fw-bold mb-5 text-amber">隱私政策與使用者條款</h1>

    <!-- 隱私政策 -->
    <div class="card policy-section mb-5 shadow-sm">
      <div class="card-body p-4 p-md-5">
        <h2 class="section-heading d-flex align-items-center mb-4">
          <span class="section-icon">
            <i class="bi bi-shield-lock"></i>
          </span>
          一、隱私政策
        </h2>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">1</span>
            資料蒐集
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in dataCollectionItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">2</span>
            資料使用目的
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in dataPurposeItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">3</span>
            資料分享與第三方
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in dataSharingItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">4</span>
            資料保存與安全
          </h3>
          <p class="ms-5">
            我們會採取合理的技術與管理措施，保護您的個資安全。您的資料將於目的達成後保留必要期限，並依法刪除或去識別化處理。
          </p>
        </div>
      </div>
    </div>

    <!-- 使用者條款 -->
    <div class="card policy-section mb-5 shadow-sm">
      <div class="card-body p-4 p-md-5">
        <h2 class="section-heading d-flex align-items-center mb-4">
          <span class="section-icon">
            <i class="bi bi-file-earmark-text"></i>
          </span>
          二、使用者條款
        </h2>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">1</span>
            帳號管理
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in accountManagementItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">2</span>
            使用規範
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in usageRulesItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">3</span>
            購物與交易
          </h3>
          <ul class="list-custom">
            <li v-for="(item, index) in shoppingItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-content p-3 mb-4">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">4</span>
            免責聲明
          </h3>
          <p class="ms-5">
            本平台會盡力維護資料準確性與服務穩定性，但對於因不可抗力（如天災、系統故障）導致的資料損失、交易失誤不負賠償責任。
          </p>
        </div>

        <div class="section-content p-3">
          <h3 class="subtitle d-flex align-items-center mb-3">
            <span class="subtitle-icon">5</span>
            條款修改
          </h3>
          <p class="ms-5">
            本平台保留隨時修改本政策與條款之權利，並會於網站公告。建議您定期查閱最新版本。
          </p>
        </div>
      </div>
    </div>

    <!-- 聯絡方式 -->
    <div class="card policy-section mb-5 shadow-sm">
      <div class="card-body p-4 p-md-5">
        <h2 class="section-heading d-flex align-items-center mb-4">
          <span class="section-icon">
            <i class="bi bi-envelope"></i>
          </span>
          聯絡我們
        </h2>

        <div class="contact-box text-center p-4 rounded-3">
          <p class="mb-3">
            若您對本政策或條款有任何疑問，歡迎聯繫我們的客服信箱：
          </p>
          <p class="fs-5 fw-medium mb-4">
            <i class="bi bi-envelope-fill me-2"></i>support@example.com
          </p>
        </div>
      </div>
    </div>

    <!-- 底部裝飾 -->
    <div class="d-flex justify-content-center my-4">
      <div class="footer-decoration w-25"></div>
      <div class="footer-decoration w-50 mx-2"></div>
      <div class="footer-decoration w-25"></div>
    </div>

    <!-- 版權資訊 -->
    <p class="text-center mt-4 mb-3 copyright">
      © {{ currentYear }} Example Company. 保留所有權利。
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 自動計算當前年份
const currentYear = computed(() => new Date().getFullYear());

// 各項目資料
const dataCollectionItems = [
  "基本資料：姓名、聯絡方式、電子郵件、地址等",
  "帳號與密碼",
  "交易與訂單資訊",
  "裝置與使用行為紀錄（例如：IP位置、裝置型號、瀏覽紀錄等）",
];

const dataPurposeItems = [
  "提供購物、物流與售後服務",
  "確認身分與交易安全",
  "優化網站體驗與個人化推薦",
  "法律要求之配合（如稅務、政府調查等）",
];

const dataSharingItems = [
  "經您同意或授權",
  "法律規定或政府機關要求",
  "為完成付款、物流、客服等必要之委外服務",
];

const accountManagementItems = [
  "請妥善保管您的帳號與密碼，避免轉讓或提供給他人使用。",
  "若發現未經授權使用，請立即通知本平台。",
];

const usageRulesItems = [
  "傳送或散布任何非法、有害、或侵害他人權益的內容",
  "偽造身分、欺騙交易",
  "進行干擾網站正常運作的行為（如攻擊伺服器、散布病毒）",
];

const shoppingItems = [
  "所有商品資訊（包括價格、庫存）以網站公告為準",
  "訂單一經成立即視為您確認購買意願",
  "本平台保留審核、取消或拒絕訂單之權利",
];

// 功能方法
const contactUs = () => {
  // 這裡可以實現聯絡功能，例如打開郵件客戶端或顯示聯絡表單
  alert("即將開啟聯絡表單...");
  // 實際應用中可替換為導航或打開模態框等操作
};
</script>

<style scoped>
/* 主要樣式 */
.policy-container {
  max-width: 1000px;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 裝飾元素 */
.header-decoration,
.footer-decoration {
  height: 5px;
  background: linear-gradient(to right, #f59e0b, #fbbf24, #f59e0b);
  border-radius: 10px;
  margin: 0 3px;
}

/* 標題樣式 */
h1 {
  color: #92400e;
}

.section-heading {
  border-bottom: 2px solid #fde68a;
  padding-bottom: 10px;
  color: #92400e;
  font-weight: 600;
}

.section-icon {
  background-color: #fef3c7;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #b45309;
}

.subtitle {
  color: #b45309;
  font-weight: 500;
}

.subtitle-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #92400e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

/* 列表樣式 */
.list-custom {
  padding-left: 52px; /* 對齊標題內容 */
  list-style-type: none;
}

.list-custom li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  color: #4b5563;
  line-height: 1.7;
}

.list-custom li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #f59e0b;
  font-size: 1.2em;
}

/* 區段樣式 */
.policy-section {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.policy-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.section-content {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.section-content:hover {
  background-color: #fff8e1;
}

/* 聯絡區塊 */
.contact-box {
  background: linear-gradient(to right, #fef3c7, #fff8e1);
  transition: all 0.3s ease;
  border-radius: 12px;
}

.contact-box:hover {
  transform: scale(1.02);
}

/* 按鈕樣式 */
.btn-amber {
  background-color: #f59e0b;
  border-color: #f59e0b;
  color: white;
  transition: all 0.3s ease;
}

.btn-amber:hover {
  background-color: #d97706;
  border-color: #d97706;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transform: translateY(-2px);
}

.btn-amber:active {
  transform: translateY(-1px);
}

/* 文字樣式 */
p {
  color: #4b5563;
  line-height: 1.7;
}

.copyright {
  color: #92400e;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .list-custom {
    padding-left: 30px;
  }

  .ms-5 {
    margin-left: 1rem !important;
  }
}
</style>
