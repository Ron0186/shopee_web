<template>
    <div class="shop-campaigns">
      <h2 class="campaigns-title">店家活動</h2>
      
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
          @click="showCampaignDetail(campaign)"
        >
          <img 
            :src="campaign.bannerImage || '/src/assets/default-campaign.png'" 
            class="campaign-img" 
            alt="活動圖片"
          />
          <div class="campaign-info">
            <h3 class="campaign-name">{{ campaign.campaignName }}</h3>
            <p class="campaign-date">{{ formatDate(campaign.startDate) }} - {{ formatDate(campaign.endDate) }}</p>
            <p v-if="campaign.couponCount > 0" class="campaign-coupons-available">
              可領取 {{ campaign.couponCount }} 種優惠券
            </p>
            <p v-else class="campaign-no-coupons">
              暫無可領取優惠券
            </p>
          </div>
        </div>
      </div>
      
      <!-- 活動詳情彈窗 -->
      <div v-if="showModal" class="campaign-modal">
        <div class="campaign-modal-content">
          <span class="close-btn" @click="showModal = false">&times;</span>
          
          <h2>{{ selectedCampaign.campaignName }}</h2>
          <img 
            :src="selectedCampaign.bannerImage || '/src/assets/default-campaign.png'" 
            class="campaign-detail-img" 
            alt="活動詳情圖片"
          />
          
          <div class="campaign-detail-info">
            <p class="campaign-detail-date">
              活動期間: {{ formatDate(selectedCampaign.startDate) }} - {{ formatDate(selectedCampaign.endDate) }}
            </p>
            <p class="campaign-detail-description">{{ selectedCampaign.description || '暫無活動說明' }}</p>
          </div>
          
          <!-- 優惠券列表 -->
          <div class="campaign-coupons">
            <h3>可領取的優惠券</h3>
            
            <div v-if="loadingCoupons" class="loading-spinner">
              <div class="spinner"></div>
              <p>載入優惠券中...</p>
            </div>
            
            <div v-else-if="coupons.length === 0" class="no-coupons">
              <p>此活動暫無可領取的優惠券</p>
            </div>
            
            <div v-else class="coupon-list">
              <div 
                v-for="coupon in coupons" 
                :key="coupon.couponId" 
                class="coupon-card"
                :class="{ 'redeemed': coupon.redeemedByCurrentUser, 'out-of-stock': coupon.remainingQuantity <= 0 }"
              >
                <div class="coupon-info">
                  <h4 class="coupon-name">{{ coupon.couponName }}</h4>
                  <p class="coupon-discount">
                    {{ formatDiscount(coupon.discountType, coupon.discountValue) }}
                  </p>
                  <p class="coupon-validity">
                    有效期至: {{ formatDate(coupon.endDate) }}
                  </p>
                  <p class="coupon-remaining">
                    剩餘: {{ coupon.remainingQuantity }}/{{ coupon.totalQuantity }}
                  </p>
                </div>
                
                <button 
                  class="redeem-btn" 
                  :disabled="coupon.redeemedByCurrentUser || coupon.remainingQuantity <= 0 || !isLoggedIn"
                  @click.stop="redeemCoupon(coupon)"
                >
                  <span v-if="coupon.redeemedByCurrentUser">已領取</span>
                  <span v-else-if="coupon.remainingQuantity <= 0">已領完</span>
                  <span v-else-if="!isLoggedIn">請先登入</span>
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
  import { ref, onMounted, computed } from 'vue';
  import axios from '@/plugins/axios';
  import Swal from 'sweetalert2';
  import { useUserStore } from '@/stores/user';
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
    shopId: {
      type: [Number, String],
      required: true
    }
  });
  
  const router = useRouter();
  const userStore = useUserStore();
  
  // 狀態變數
  const campaigns = ref([]);
  const loadingCampaigns = ref(true);
  const coupons = ref([]);
  const loadingCoupons = ref(false);
  const showModal = ref(false);
  const selectedCampaign = ref({});
  
  // 計算用戶是否已登入
  const isLoggedIn = computed(() => {
    return userStore.isLoggedIn;
  });
  
  // 獲取商店的所有活動
  const fetchCampaigns = async () => {
    loadingCampaigns.value = true;
    try {
      const response = await axios.get(`/api/campaigns/shop/${props.shopId}`);
      if (response.data.success) {
        // 篩選出活躍的活動
        campaigns.value = response.data.data.filter(campaign => 
          campaign.status === 'ACTIVE' && new Date(campaign.endDate) >= new Date()
        );
      } else {
        console.error('獲取活動失敗:', response.data.message);
      }
    } catch (error) {
      console.error('獲取活動錯誤:', error);
    } finally {
      loadingCampaigns.value = false;
    }
  };
  
  // 獲取特定活動的優惠券
  const fetchCampaignCoupons = async (campaignId) => {
    loadingCoupons.value = true;
    try {
      const response = await axios.get(`/api/campaigns/${campaignId}/coupons`);
      if (response.data.success) {
        coupons.value = response.data.data;
      } else {
        console.error('獲取優惠券失敗:', response.data.message);
        coupons.value = [];
      }
    } catch (error) {
      console.error('獲取優惠券錯誤:', error);
      coupons.value = [];
    } finally {
      loadingCoupons.value = false;
    }
  };
  
  // 顯示活動詳情
  const showCampaignDetail = async (campaign) => {
    selectedCampaign.value = campaign;
    showModal.value = true;
    await fetchCampaignCoupons(campaign.campaignId);
  };
  
  // 領取優惠券
  const redeemCoupon = async (coupon) => {
    // 如果用戶未登入，提示登入
    if (!isLoggedIn.value) {
      Swal.fire({
        title: '請先登入',
        text: '您需要登入才能領取優惠券',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '前往登入',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          // 儲存當前頁面 URL，登入後可以返回
          localStorage.setItem('redirectAfterLogin', window.location.href);
          router.push('/login');
        }
      });
      return;
    }
    
    try {
      const response = await axios.post('/api/campaigns/redeem', {
        campaignId: selectedCampaign.value.campaignId,
        couponId: coupon.couponId
      });
      
      if (response.data.success) {
        Swal.fire({
          title: '領取成功',
          text: '優惠券已成功領取',
          icon: 'success'
        });
        
        // 重新獲取優惠券列表，更新狀態
        await fetchCampaignCoupons(selectedCampaign.value.campaignId);
      } else {
        throw new Error(response.data.message || '領取優惠券失敗');
      }
    } catch (error) {
      console.error('領取優惠券失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || error.message || '領取優惠券失敗，請稍後再試',
        icon: 'error'
      });
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };
  
  // 格式化折扣
  const formatDiscount = (type, value) => {
    if (!type || value === undefined) return '未設定折扣';
    
    switch (type.toUpperCase()) {
      case 'PERCENTAGE':
        return `${value}% 折扣`;
      case 'FIXED_AMOUNT':
        return `折抵 $${value}`;
      default:
        return `${type} ${value}`;
    }
  };
  
  onMounted(() => {
    fetchCampaigns();
  });
  </script>
  
  <style scoped>
  .shop-campaigns {
    max-width: 1600px;
    margin: 20px auto;
    padding: 0 20px;
  }
  
  .campaigns-title {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
  }
  
  .campaign-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .campaign-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .campaign-card:hover {
    transform: translateY(-5px);
  }
  
  .campaign-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  
  .campaign-info {
    padding: 15px;
  }
  
  .campaign-name {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
  }
  
  .campaign-date {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }
  
  .campaign-coupons-available {
    font-size: 14px;
    color: #4CAF50;
    margin-top: 10px;
  }
  
  .campaign-no-coupons {
    font-size: 14px;
    color: #999;
    margin-top: 10px;
  }
  
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .no-campaigns, .no-coupons {
    text-align: center;
    padding: 30px;
    color: #666;
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
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 20px;
    position: relative;
  }
  
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  }
  
  .campaign-detail-img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .campaign-detail-date {
    font-size: 16px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .campaign-detail-description {
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    margin-bottom: 20px;
  }
  
  .campaign-coupons h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #333;
  }
  
  .coupon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .coupon-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px dashed #ced4da;
    position: relative;
    min-height: 180px;
  }
  
  .coupon-card.redeemed {
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
    opacity: 0.8;
  }
  
  .coupon-card.out-of-stock {
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
    opacity: 0.8;
  }
  
  .coupon-info {
    margin-bottom: 15px;
  }
  
  .coupon-name {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
  }
  
  .coupon-discount {
    font-size: 22px;
    font-weight: bold;
    color: #e84118;
    margin-bottom: 8px;
  }
  
  .coupon-validity {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }
  
  .coupon-remaining {
    font-size: 14px;
    color: #666;
  }
  
  .redeem-btn {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
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
    .coupon-list {
      grid-template-columns: 1fr;
    }
    
    .campaign-modal-content {
      width: 95%;
      padding: 15px;
    }
  }
  </style>