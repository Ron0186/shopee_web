<template>
  <div class="side-campaigns-container" :class="{ expanded: isExpanded }">
    <!-- 未展開時只顯示的按鈕 -->
    <button v-if="!isExpanded" class="expand-btn" @click="toggleExpand">
      <span class="marketing-icon">&#9733;</span>
      <span class="marketing-text">優惠</span>
    </button>

    <!-- 展開後的內容 -->
    <div class="campaigns-content" v-if="isExpanded">
      <div class="header">
        <h2 class="campaigns-title">店家活動</h2>
        <button class="close-btn" @click="toggleExpand">&times;</button>
      </div>

      <div v-if="loadingCampaigns" class="loading-spinner">
        <div class="spinner"></div>
        <p>載入活動中...</p>
      </div>

      <div v-else-if="campaigns.length === 0" class="no-campaigns">
        <p>目前沒有進行中的活動</p>
      </div>

      <div v-else class="campaign-list">
        <div
          v-for="campaign in campaigns"
          :key="campaign.campaignId"
          class="campaign-card"
        >
          <img
            :src="
              getImageUrl(
                campaign.bannerImage || '/src/assets/default-campaign.png'
              )
            "
            class="campaign-img"
            alt="活動圖片"
          />
          <div class="campaign-info">
            <h3 class="campaign-name">{{ campaign.campaignName }}</h3>
            <p class="campaign-date">
              {{ formatDate(campaign.startDate) }} -
              {{ formatDate(campaign.endDate) }}
            </p>
            <p class="campaign-description">
              {{ campaign.description || "限時優惠活動" }}
            </p>
          </div>

          <!-- 優惠券直接顯示在活動卡片上 -->
          <div class="campaign-coupons">
            <div
              v-if="loadingCouponStatus[campaign.campaignId]"
              class="loading-spinner-small"
            >
              <div class="spinner-small"></div>
            </div>

            <div
              v-else-if="getCampaignCoupons(campaign.campaignId).length === 0"
              class="no-coupons-label"
            >
              暫無可領取優惠券
            </div>

            <div v-else class="coupon-list-compact">
              <div
                v-for="coupon in getCampaignCoupons(campaign.campaignId)"
                :key="coupon.couponId"
                class="coupon-compact"
              >
                <div class="coupon-info-compact">
                  <p class="coupon-name-compact">{{ coupon.couponName }}</p>
                  <p class="coupon-discount-compact">
                    {{
                      formatDiscount(coupon.discountType, coupon.discountValue)
                    }}
                  </p>
                </div>

                <button
                  class="redeem-btn-compact"
                  :class="{
                    redeemed: coupon.redeemedByCurrentUser,
                    'out-of-stock': coupon.remainingQuantity <= 0,
                    'not-started': !isCampaignStarted(campaign),
                  }"
                  :disabled="
                    coupon.redeemedByCurrentUser ||
                    coupon.remainingQuantity <= 0 ||
                    !isLoggedIn ||
                    !isCampaignStarted(campaign)
                  "
                  @click.stop="redeemCoupon(campaign, coupon)"
                >
                  <span v-if="coupon.redeemedByCurrentUser">已領取</span>
                  <span v-else-if="coupon.remainingQuantity <= 0">已領完</span>
                  <span v-else-if="!isLoggedIn">請先登入</span>
                  <span v-else-if="!isCampaignStarted(campaign)"
                    >活動尚未開始</span
                  >
                  <span v-else>立即領取</span>
                </button>
              </div>
            </div>

            <button
              class="view-details-btn"
              @click="showCampaignDetail(campaign)"
            >
              查看完整活動詳情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 活動詳情彈窗 -->
    <div v-if="showModal" class="campaign-modal" @click="closeModal">
      <div class="campaign-modal-content" @click.stop>
        <span class="close-btn" @click="showModal = false">&times;</span>

        <h2>{{ selectedCampaign.campaignName }}</h2>
        <img
          :src="
            getImageUrl(
              selectedCampaign.bannerImage || '/src/assets/default-campaign.png'
            )
          "
          class="campaign-detail-img"
          alt="活動詳情圖片"
        />

        <div class="campaign-detail-info">
          <p class="campaign-detail-date">
            活動期間: {{ formatDate(selectedCampaign.startDate) }} -
            {{ formatDate(selectedCampaign.endDate) }}
          </p>
          <p class="campaign-detail-description">
            {{ selectedCampaign.description || "暫無活動說明" }}
          </p>
        </div>

        <!-- 優惠券列表 -->
        <div class="campaign-coupons-modal">
          <h3>可領取的優惠券</h3>

          <div
            v-if="loadingCouponStatus[selectedCampaign.campaignId]"
            class="loading-spinner"
          >
            <div class="spinner"></div>
            <p>載入優惠券中...</p>
          </div>

          <div
            v-else-if="
              getCampaignCoupons(selectedCampaign.campaignId).length === 0
            "
            class="no-coupons"
          >
            <p>此活動暫無可領取的優惠券</p>
          </div>

          <div v-else class="coupon-list">
            <div
              v-for="coupon in getCampaignCoupons(selectedCampaign.campaignId)"
              :key="coupon.couponId"
              class="coupon-card"
              :class="{
                redeemed: coupon.redeemedByCurrentUser,
                'out-of-stock': coupon.remainingQuantity <= 0,
              }"
            >
              <div class="coupon-info">
                <h4 class="coupon-name">{{ coupon.couponName }}</h4>
                <p class="coupon-discount">
                  {{
                    formatDiscount(coupon.discountType, coupon.discountValue)
                  }}
                </p>
                <p class="coupon-validity">
                  有效期至: {{ formatDate(coupon.endDate) }}
                </p>
                <p class="coupon-remaining">
                  剩餘: {{ coupon.remainingQuantity }}/{{
                    coupon.totalQuantity
                  }}
                </p>
              </div>

              <button
                class="redeem-btn"
                :class="{
                  redeemed: coupon.redeemedByCurrentUser,
                  'out-of-stock': coupon.remainingQuantity <= 0,
                  'not-started': !isCampaignStarted(selectedCampaign),
                }"
                :disabled="
                  coupon.redeemedByCurrentUser ||
                  coupon.remainingQuantity <= 0 ||
                  !isLoggedIn ||
                  !isCampaignStarted(selectedCampaign)
                "
                @click.stop="redeemCoupon(selectedCampaign, coupon)"
              >
                <span v-if="coupon.redeemedByCurrentUser">已領取</span>
                <span v-else-if="coupon.remainingQuantity <= 0">已領完</span>
                <span v-else-if="!isLoggedIn">請先登入</span>
                <span v-else-if="!isCampaignStarted(selectedCampaign)"
                  >活動尚未開始</span
                >
                <span v-else>立即領取</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const props = defineProps({
  shopId: {
    type: [Number, String],
    required: true,
  },
});

const router = useRouter();
const userStore = useUserStore();

// 側邊欄擴展狀態
const isExpanded = ref(false);

// 狀態變數
const campaigns = ref([]);
const loadingCampaigns = ref(true);
const campaignCoupons = reactive({}); // 存儲每個活動的優惠券
const loadingCouponStatus = reactive({}); // 跟踪每個活動的優惠券載入狀態
const showModal = ref(false);
const selectedCampaign = ref({});

// 計算用戶是否已登入
const isLoggedIn = computed(() => {
  return userStore.isLoggedIn;
});

// 切換側邊欄顯示狀態
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;

  // 如果是展開狀態，則自動獲取活動
  if (isExpanded.value && campaigns.value.length === 0) {
    fetchCampaigns();
  }
};

// 獲取商店的所有活動
const fetchCampaigns = async () => {
  loadingCampaigns.value = true;
  try {
    const response = await axios.get(`/api/campaigns/shop/${props.shopId}`);
    if (response.data.success) {
      // 篩選出活躍的活動 (包括未開始的活動)
      campaigns.value = response.data.data.filter(
        (campaign) =>
          campaign.status === "ACTIVE" &&
          new Date(campaign.endDate) >= new Date()
      );

      // 為每個活動預加載優惠券
      campaigns.value.forEach((campaign) => {
        fetchCampaignCoupons(campaign.campaignId);
      });
    } else {
      console.error("獲取活動失敗:", response.data.message);
    }
  } catch (error) {
    console.error("獲取活動錯誤:", error);
  } finally {
    loadingCampaigns.value = false;
  }
};

// 獲取特定活動的優惠券
const fetchCampaignCoupons = async (campaignId) => {
  loadingCouponStatus[campaignId] = true;
  try {
    const response = await axios.get(`/api/campaigns/${campaignId}/coupons`);
    if (response.data.success) {
      campaignCoupons[campaignId] = response.data.data;
    } else {
      console.error("獲取優惠券失敗:", response.data.message);
      campaignCoupons[campaignId] = [];
    }
  } catch (error) {
    console.error("獲取優惠券錯誤:", error);
    campaignCoupons[campaignId] = [];
  } finally {
    loadingCouponStatus[campaignId] = false;
  }
};

// 獲取特定活動的優惠券
const getCampaignCoupons = (campaignId) => {
  return campaignCoupons[campaignId] || [];
};

// 顯示活動詳情
const showCampaignDetail = (campaign) => {
  selectedCampaign.value = campaign;
  showModal.value = true;
};

// 關閉模態窗
const closeModal = () => {
  showModal.value = false;
};

// 修改 getImageUrl 函數
const getImageUrl = (path) => {
  if (!path) return "";

  // 如果路徑已經是完整 URL，則直接返回
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 如果路徑以 / 開頭，則使用完整路徑
  if (path.startsWith("/")) {
    return import.meta.env.VITE_API_URL + path;
  }

  // 如果是其他形式的相對路徑，確保正確拼接
  return import.meta.env.VITE_API_URL + "/" + path;
};

// 檢查活動是否已經開始
const isCampaignStarted = (campaign) => {
  return new Date(campaign.startDate) <= new Date();
};

// 領取優惠券
const redeemCoupon = async (campaign, coupon) => {
  // 檢查活動是否已開始
  if (!isCampaignStarted(campaign)) {
    Swal.fire({
      title: "活動尚未開始",
      text: `此活動將於 ${formatDate(campaign.startDate)} 開始`,
      icon: "info",
      confirmButtonText: "確定",
    });
    return;
  }

  // 如果用戶未登入，提示登入
  if (!isLoggedIn.value) {
    Swal.fire({
      title: "請先登入",
      text: "您需要登入才能領取優惠券",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "前往登入",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        // 儲存當前頁面 URL，登入後可以返回
        localStorage.setItem("redirectAfterLogin", window.location.href);
        router.push("/login");
      }
    });
    return;
  }

  try {
    const response = await axios.post("/api/campaigns/redeem", {
      campaignId: campaign.campaignId,
      couponId: coupon.couponId,
    });

    if (response.data.success) {
      Swal.fire({
        title: "領取成功",
        text: "優惠券已成功領取",
        icon: "success",
      });

      // 重新獲取優惠券列表，更新狀態
      await fetchCampaignCoupons(campaign.campaignId);
    } else {
      throw new Error(response.data.message || "領取優惠券失敗");
    }
  } catch (error) {
    console.error("領取優惠券失敗:", error);
    Swal.fire({
      title: "錯誤",
      text:
        error.response?.data?.message ||
        error.message ||
        "領取優惠券失敗，請稍後再試",
      icon: "error",
    });
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "未設定";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW");
};

// 格式化折扣
const formatDiscount = (type, value) => {
  if (!type || value === undefined) return "未設定折扣";

  switch (type.toUpperCase()) {
    case "PERCENTAGE":
      return `${value}% 折扣`;
    case "FIXED_AMOUNT":
      return `折抵 $${value}`;
    default:
      return `${type} ${value}`;
  }
};

// 只在用戶點擊展開按鈕時才加載活動數據
onMounted(() => {
  // 不再自動加載數據
  // fetchCampaigns();
});
</script>

<style scoped>
.side-campaigns-container {
  position: fixed;
  right: 0;
  top: 40%;
  z-index: 100;
  transition: all 0.3s ease;
}

/* 未展開時的按鈕樣式 */
.expand-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 70px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background-color: #ff5252;
  width: 65px;
}

.marketing-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.marketing-text {
  font-size: 14px;
  font-weight: bold;
}

/* 展開後的側邊欄樣式 */
.side-campaigns-container.expanded {
  width: 350px;
  max-height: 80vh;
  background-color: white;
  border-radius: 10px 0 0 10px;
  box-shadow: -3px 0 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ff6b6b;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.campaigns-title {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0 5px;
}

/* 活動內容樣式 */
.campaigns-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.campaign-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}

.campaign-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.campaign-card:hover {
  transform: translateY(-3px);
}

.campaign-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.campaign-info {
  padding: 12px;
}

.campaign-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.campaign-date {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.campaign-description {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.6em;
}

/* 活動卡片中直接顯示的優惠券 */
.campaign-coupons {
  padding: 8px 12px 12px;
  border-top: 1px dashed #ddd;
  background-color: #f9f9f9;
}

.coupon-list-compact {
  margin-bottom: 8px;
}

.coupon-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border: 1px dashed #ddd;
  border-radius: 5px;
  padding: 8px;
  margin-bottom: 8px;
}

.coupon-info-compact {
  flex-grow: 1;
}

.coupon-name-compact {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.coupon-discount-compact {
  font-size: 14px;
  color: #e84118;
}

.redeem-btn-compact {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
  min-width: 70px;
  text-align: center;
  white-space: nowrap;
}

.redeem-btn-compact:hover:not(:disabled) {
  background-color: #45a049;
}

.redeem-btn-compact:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.redeem-btn-compact.redeemed {
  background-color: #ff9800;
}

.redeem-btn-compact.out-of-stock {
  background-color: #999;
}

.redeem-btn-compact.not-started {
  background-color: #007bff;
}

.view-details-btn {
  width: 100%;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
  margin-top: 5px;
}

.view-details-btn:hover {
  background-color: #2980b9;
}

.no-coupons-label {
  text-align: center;
  color: #999;
  padding: 8px 0;
  font-size: 13px;
}

/* 小型載入動畫 */
.loading-spinner-small {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.spinner-small {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

/* 模態窗中的優惠券樣式 */
.campaign-coupons-modal {
  margin-top: 20px;
}

.campaign-coupons-modal h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

/* 一般載入動畫 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-campaigns,
.no-coupons {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

/* 模態窗樣式 */
.campaign-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.campaign-modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 22px;
  cursor: pointer;
  color: #333;
}

.campaign-detail-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
}

.campaign-detail-date {
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
}

.campaign-detail-description {
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 15px;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.coupon-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px dashed #ced4da;
  position: relative;
  min-height: 170px;
}

.coupon-card.redeemed {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  opacity: 0.8;
}

.coupon-card.out-of-stock {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  opacity: 0.8;
}

.coupon-card.not-started {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  opacity: 0.9;
}

.redeem-btn.not-started {
  background-color: #007bff;
}

.coupon-info {
  margin-bottom: 12px;
}

.coupon-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.coupon-discount {
  font-size: 20px;
  font-weight: bold;
  color: #e84118;
  margin-bottom: 6px;
}

.coupon-validity {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.coupon-remaining {
  font-size: 13px;
  color: #666;
}

.redeem-btn {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  margin-top: auto;
}

.redeem-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.redeem-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .side-campaigns-container.expanded {
    width: 300px;
  }

  .expand-btn {
    width: 50px;
    height: 60px;
  }

  .coupon-list {
    grid-template-columns: 1fr;
  }

  .campaign-modal-content {
    width: 95%;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .side-campaigns-container.expanded {
    width: 280px;
  }

  .marketing-icon {
    font-size: 20px;
  }

  .marketing-text {
    font-size: 12px;
  }
}
</style>
