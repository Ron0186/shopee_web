<template>
    <div class="campaigns-container">
      <div class="page-header">
        <h1>我的行銷活動</h1>
        <button class="btn btn-primary" @click="openCreateCampaignModal">
          ➕ 建立新活動
        </button>
      </div>
  
      <!-- 載入中狀態 -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>載入行銷活動中...</p>
      </div>
  
      <!-- 無活動時顯示 -->
      <div v-else-if="campaigns.length === 0" class="no-campaigns">
        <p>尚未建立任何行銷活動</p>
        <button class="btn btn-primary" @click="openCreateCampaignModal">
          立即建立首個行銷活動
        </button>
      </div>
  
      <!-- 活動列表 -->
      <div v-else class="campaigns-list">
        <table class="campaigns-table">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th>狀態</th>
              <th>開始日期</th>
              <th>結束日期</th>
              <th>優惠券種類數</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="campaign in campaigns" :key="campaign.campaignId" :class="{ 'inactive': !isActive(campaign) }">
              <td>{{ campaign.campaignName }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(campaign)">
                  {{ getStatusText(campaign) }}
                </span>
              </td>
              <td>{{ formatDate(campaign.startDate) }}</td>
              <td>{{ formatDate(campaign.endDate) }}</td>
              <td>{{ campaign.couponCount || 0 }}</td>
              <td class="actions">
                <button class="btn btn-sm btn-edit" @click="openEditCampaignModal(campaign)">
                  ✏️ 編輯
                </button>
                <button class="btn btn-sm btn-coupons" @click="openCouponManagementModal(campaign)">
                  🎟️ 優惠券
                </button>
                <button class="btn btn-sm btn-delete" @click="confirmDeleteCampaign(campaign)">
                  🗑️ 刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 建立/編輯活動表單 Modal -->
      <div v-if="showCampaignModal" class="modal-overlay" @click="closeCampaignModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editMode ? '編輯行銷活動' : '建立行銷活動' }}</h2>
          <form @submit.prevent="submitCampaignForm">
            <div class="form-group">
              <label for="campaignName">活動名稱</label>
              <input type="text" id="campaignName" v-model="campaignForm.campaignName" required>
            </div>
            
            <div class="form-group">
              <label for="description">活動描述</label>
              <textarea id="description" v-model="campaignForm.description" rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <label for="bannerImage">活動橫幅圖片</label>
              <div class="image-upload-container">
                <!-- 使用計算屬性來控制預覽區域的顯示 -->
                <div v-if="showImagePreview" class="image-preview">
                  <img 
                    :src="previewImage 
                      ? (previewImage.startsWith('data:') ? previewImage : getImageUrl(previewImage)) 
                      : getImageUrl(campaignForm.bannerImage)" 
                    alt="活動橫幅預覽" 
                  />
                  <button type="button" class="remove-image" @click="removeImage">✕</button>
                </div>
                <!-- 上傳提示區 -->
                <div v-else class="upload-placeholder" @click="triggerFileInput">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>點擊上傳圖片</p>
                  <small>支援 jpg, jpeg, png 格式</small>
                </div>
                <!-- 隱藏的文件選擇器 -->
                <input
                  type="file"
                  ref="fileInput"
                  id="bannerImage"
                  accept="image/jpeg, image/jpg, image/png"
                  style="display: none"
                  @change="handleFileChange"
                />
              </div>
              <!-- 上傳進度條 -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress">
                <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <small v-if="imageError" class="text-danger">{{ imageError }}</small>
            </div>
            
            <div class="form-group date-group">
              <div>
                <label for="startDate">開始日期</label>
                <input type="datetime-local" id="startDate" v-model="campaignForm.startDate" required>
              </div>
              <div>
                <label for="endDate">結束日期</label>
                <input type="datetime-local" id="endDate" v-model="campaignForm.endDate" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="status">活動狀態</label>
              <select id="status" v-model="campaignForm.status">
                <option value="ACTIVE">啟用</option>
                <option value="INACTIVE">停用</option>
                <option value="SCHEDULED">排程中</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeCampaignModal">取消</button>
              <button type="submit" class="btn btn-submit">{{ editMode ? '更新' : '建立' }}</button>
            </div>
          </form>
        </div>
      </div>
    
      <!-- 優惠券管理 Modal -->
      <div v-if="showCouponModal" class="modal-overlay" @click="closeCouponModal">
        <div class="modal-content coupon-modal" @click.stop>
          <h2>優惠券管理 - {{ selectedCampaign.campaignName }}</h2>
          
          <!-- 已綁定的優惠券 -->
          <div class="coupon-section">
            <h3>已綁定的優惠券</h3>
            <div v-if="loading" class="loading-spinner small">
              <div class="spinner"></div>
            </div>
            <div v-else-if="campaignCoupons.length === 0" class="no-coupons">
              <p>此活動尚未綁定任何優惠券</p>
            </div>
            <table v-else class="coupons-table">
              <thead>
                <tr>
                  <th>優惠券名稱</th>
                  <th>折扣類型</th>
                  <th>折扣值</th>
                  <th>總數量</th>
                  <th>剩餘數量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="coupon in campaignCoupons" :key="coupon.couponId">
                  <td>{{ coupon.couponName }}</td>
                  <td>{{ formatDiscountType(coupon.discountType) }}</td>
                  <td>{{ formatDiscountValue(coupon.discountValue, coupon.discountType) }}</td>
                  <td>{{ coupon.totalQuantity }}</td>
                  <td>{{ coupon.remainingQuantity }}</td>
                  <td class="actions">
                    <button class="btn btn-sm btn-delete" @click="removeCouponFromCampaign(coupon)">
                      移除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- 添加新優惠券 -->
          <div class="coupon-section">
            <h3>添加優惠券到活動</h3>
            <div v-if="loadingAvailableCoupons" class="loading-spinner small">
              <div class="spinner"></div>
            </div>
            <div v-else-if="availableCoupons.length === 0" class="no-coupons">
              <p>您還沒有創建優惠券</p>
              <button class="btn btn-sm btn-primary" @click="goToCreateCoupon">
                立即創建新優惠券
              </button>
            </div>
            <div v-else>
              <div class="add-coupon-form">
                <div class="form-group">
                  <label for="couponSelect">選擇優惠券</label>
                  <div class="search-select-container">
                    <input 
                      type="text" 
                      v-model="couponSearchText" 
                      placeholder="搜尋優惠券名稱..." 
                      class="coupon-search"
                      @input="filterCoupons"
                    />
                    <select id="couponSelect" v-model="selectedCouponId">
                      <option value="">-- 請選擇優惠券 --</option>
                      <option 
                        v-for="coupon in filteredCoupons" 
                        :key="coupon.couponId" 
                        :value="coupon.couponId"
                      >
                        {{ coupon.couponName }} - {{ formatDiscountType(coupon.discountType) }} {{ formatDiscountValue(coupon.discountValue, coupon.discountType) }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="couponQuantity">設置數量</label>
                  <input type="number" id="couponQuantity" v-model.number="couponQuantity" min="1" required>
                </div>
                
                <button class="btn btn-primary" @click="addCouponToCampaign" :disabled="!selectedCouponId">
                  添加到活動
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeCouponModal">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, onMounted, computed, watch, nextTick  } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import axios from '@/plugins/axios';
  import Swal from 'sweetalert2';
  import { useUserStore } from '@/stores/user';
  
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const previewImage = ref('');
  const uploadProgress = ref(0);
  const imageError = ref('');
  const fileInput = ref(null);
  
  // 狀態變數
  const loading = ref(false);
  const campaigns = ref([]);
  const campaignCoupons = ref([]);
  const availableCoupons = ref([]);
  const loadingAvailableCoupons = ref(false);
  
  // 選擇的活動和優惠券
  const selectedCampaign = ref({});
  const selectedCouponId = ref('');
  const couponQuantity = ref(10); // 預設數量
  
  // 添加搜尋相關的響應式變數
  const couponSearchText = ref('');
  const filteredCoupons = ref([]);
  
  // 表單相關
  const showCampaignModal = ref(false);
  const showCouponModal = ref(false);
  const editMode = ref(false);
  const campaignForm = ref({
    campaignName: '',
    description: '',
    bannerImage: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });
  
  // 初始化 - 獲取所有活動
  onMounted(async () => {
    await fetchCampaigns();
  });
  
  // 在 script setup 部分添加一個新的計算屬性
  const showImagePreview = computed(() => {
    // 嚴格檢查兩個值是否都為空
    return (previewImage.value && previewImage.value !== '') || 
           (campaignForm.bannerImage && campaignForm.bannerImage !== '');
  });
  
  // 觸發文件輸入點擊
  const triggerFileInput = () => {
    fileInput.value.click();
  };
  
  // 修改 getImageUrl 函數
  const getImageUrl = (path) => {
    // Return early for empty paths
    if (!path) {
      return '/src/assets/default-campaign.png';
    }
    
    // If path is already a data URL (from local preview), return as is
    if (path.startsWith('data:')) {
      return path;
    }
    
    // If path is a complete URL, add timestamp to break cache
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const timestamp = new Date().getTime();
      return `${path}${path.includes('?') ? '&' : '?'}t=${timestamp}`;
    }
    
    // Normalize path and add timestamp parameter to break caching
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const timestamp = new Date().getTime();
    return `${import.meta.env.VITE_API_URL}${normalizedPath}?t=${timestamp}`;
  };
  
  // 當選擇文件時的處理
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Clear previous errors
    imageError.value = '';
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      imageError.value = '請上傳 jpg, jpeg 或 png 格式的圖片';
      return;
    }
    
    // Validate file size, limit to 2MB
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      imageError.value = '圖片大小不能超過 2MB';
      return;
    }
    
    try {
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.value = e.target.result; // Set to Data URL for preview
      };
      reader.readAsDataURL(file);
      
      // Prepare upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file
      uploadProgress.value = 0;
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });
      
      // Handle response
      if (response.data.success) {
        console.log('圖片上傳成功，路徑:', response.data.data);
        
        // Update form data - preserve the local preview for display
        campaignForm.value.bannerImage = response.data.data;
        
        // Log current states for debugging
        console.log('Upload complete - previewImage:', previewImage.value);
        console.log('Upload complete - campaignForm.bannerImage:', campaignForm.value.bannerImage);
      } else {
        imageError.value = response.data.message || '上傳失敗';
        // Clear preview and progress
        previewImage.value = null;
        uploadProgress.value = 0;
      }
    } catch (error) {
      console.error('上傳圖片錯誤:', error);
      imageError.value = error.response?.data?.message || '上傳時發生錯誤';
      // Clear preview and progress
      previewImage.value = null;
      uploadProgress.value = 0;
    }
  };
  
  // 將 removeImage 函數修改為：
  const removeImage = () => {
    console.log('移除前 - previewImage:', previewImage.value);
    console.log('移除前 - campaignForm.bannerImage:', campaignForm.bannerImage);
    
    // 直接設置為 null
    previewImage.value = null;
    campaignForm.value.bannerImage = null;
    
    // 清除文件選擇器
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
    // 重置其他相關狀態
    uploadProgress.value = 0;
    imageError.value = '';
    
    // 強制刷新組件
    nextTick(() => {
      console.log('移除後 - previewImage:', previewImage.value);
      console.log('移除後 - campaignForm.bannerImage:', campaignForm.value.bannerImage);
      console.log('移除後 - showImagePreview:', showImagePreview.value);
    });
  };
  
  // 過濾優惠券的函數
  const filterCoupons = () => {
    if (!couponSearchText.value.trim()) {
      // 如果搜尋文字為空，顯示所有可用的優惠券
      filteredCoupons.value = availableCoupons.value;
    } else {
      // 根據搜尋文字過濾優惠券
      const searchText = couponSearchText.value.toLowerCase().trim();
      filteredCoupons.value = availableCoupons.value.filter(coupon => 
        coupon.couponName.toLowerCase().includes(searchText) ||
        formatDiscountType(coupon.discountType).toLowerCase().includes(searchText) ||
        formatDiscountValue(coupon.discountValue, coupon.discountType).toLowerCase().includes(searchText)
      );
    }
  };
  
  // 監聽 availableCoupons 變化，當它更新時更新 filteredCoupons
  watch(availableCoupons, (newCoupons) => {
    filteredCoupons.value = newCoupons;
  }, { immediate: true });
  
  // 重置搜尋
  const resetCouponSearch = () => {
    couponSearchText.value = '';
    filterCoupons();
  };
  
  // 獲取所有行銷活動
  const fetchCampaigns = async () => {
    loading.value = true;
    try {
      const shopId = route.params.shopId;
      const response = await axios.get(`/api/campaigns/shop/${shopId}`);
      if (response.data.success) {
        campaigns.value = response.data.data || [];
      } else {
        // 處理後端返回的錯誤
        console.error('獲取行銷活動失敗:', response.data.message);
        Swal.fire({
          title: '錯誤',
          text: response.data.message || '無法獲取行銷活動',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('獲取行銷活動請求失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '獲取行銷活動失敗',
        icon: 'error'
      });
    } finally {
      loading.value = false;
    }
  };
  
  // 打開創建活動表單
  const openCreateCampaignModal = () => {
    editMode.value = false;
    resetCampaignForm();
    showCampaignModal.value = true;
  };
  
  // 打開編輯活動表單
  const openEditCampaignModal = async (campaign) => {
    editMode.value = true;
    
    // Reset form and image states first
    resetCampaignForm();
    previewImage.value = null;
    uploadProgress.value = 0;
    imageError.value = '';
    
    // Fetch the latest campaign data from server to ensure we have the most up-to-date info
    try {
      const response = await axios.get(`/api/campaigns/${campaign.campaignId}`);
      if (response.data.success) {
        // Use the fresh campaign data from the server
        const freshCampaign = response.data.data;
        
        // Copy campaign data to form
        campaignForm.value = {
          campaignId: freshCampaign.campaignId,
          campaignName: freshCampaign.campaignName,
          description: freshCampaign.description || '',
          bannerImage: freshCampaign.bannerImage || '',
          startDate: formatDateForInput(freshCampaign.startDate),
          endDate: formatDateForInput(freshCampaign.endDate),
          status: freshCampaign.status,
          shopId: freshCampaign.shopId
        };
        
        // Set preview image with a timestamp to break cache
        if (freshCampaign.bannerImage) {
          previewImage.value = freshCampaign.bannerImage;
        }
        
        showCampaignModal.value = true;
      } else {
        throw new Error(response.data.message || '獲取活動數據失敗');
      }
    } catch (error) {
      console.error('獲取活動數據失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.message || '獲取活動數據失敗',
        icon: 'error'
      });
    }
  };
  
  // 關閉活動表單
  const closeCampaignModal = () => {
    showCampaignModal.value = false;
  };
  
  // 重置活動表單
  const resetCampaignForm = () => {
    campaignForm.value = {
      campaignName: '',
      description: '',
      bannerImage: '',
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 預設一週後結束
      status: 'ACTIVE',
      shopId: route.params.shopId
    };
  
    // 新增這部分：
    previewImage.value = '';
    uploadProgress.value = 0;
    imageError.value = '';
    
    // 如果是編輯模式，需要設置預覽圖片
    if (editMode.value && campaignForm.value.bannerImage) {
      previewImage.value = campaignForm.value.bannerImage;
    }
  };
  
  // 修改提交活動表單的函數
  const submitCampaignForm = async () => {
    try {
      // Check dates
      if (new Date(campaignForm.value.endDate) <= new Date(campaignForm.value.startDate)) {
        Swal.fire({
          title: '錯誤',
          text: '結束日期必須晚於開始日期',
          icon: 'error'
        });
        return;
      }
  
      // Log the form data being submitted (for debugging)
      console.log('提交的表單數據:', campaignForm.value);
  
      const formData = {
        ...campaignForm.value,
        shopId: parseInt(route.params.shopId),
        startDate: new Date(campaignForm.value.startDate).toISOString(),
        endDate: new Date(campaignForm.value.endDate).toISOString()
      };
  
      let response;
      if (editMode.value) {
        // Update campaign
        response = await axios.put(`/api/campaigns/${formData.campaignId}`, formData);
      } else {
        // Create new campaign
        response = await axios.post('/api/campaigns', formData);
      }
  
      if (response.data.success) {
        Swal.fire({
          title: '成功',
          text: editMode.value ? '活動已更新' : '活動已創建',
          icon: 'success',
          confirmButtonText: '確定'
        });
        closeCampaignModal();
        await fetchCampaigns(); // Refresh campaign list with the latest data
      } else {
        // 處理後端返回的錯誤
        Swal.fire({
          title: '操作失敗',
          text: response.data.message || '操作失敗，請檢查表單數據',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('提交活動表單失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '操作失敗，請稍後再試',
        icon: 'error'
      });
    }
  };
  
  // 確認刪除活動
  const confirmDeleteCampaign = (campaign) => {
    Swal.fire({
      title: '確認刪除',
      text: `您確定要刪除「${campaign.campaignName}」活動嗎？此操作無法撤銷。`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是，刪除',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCampaign(campaign.campaignId);
      }
    });
  };
  
  // 修改刪除活動的函數
  const deleteCampaign = async (campaignId) => {
    try {
      const response = await axios.delete(`/api/campaigns/${campaignId}`);
      
      if (response.data.success) {
        // 成功後刷新列表
        fetchCampaigns();
        
        Swal.fire({
          title: '已刪除',
          text: '活動已成功刪除',
          icon: 'success'
        });
      } else {
        // 顯示後端返回的錯誤訊息
        Swal.fire({
          title: '無法刪除',
          text: response.data.message || '刪除活動失敗',
          icon: 'warning'
        });
      }
    } catch (error) {
      console.error('刪除活動請求失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '刪除活動失敗，請稍後再試',
        icon: 'error'
      });
    }
  };
  
  // 修改優惠券管理 Modal 的邏輯
  const openCouponManagementModal = async (campaign) => {
    selectedCampaign.value = campaign;
    showCouponModal.value = true;
    selectedCouponId.value = '';
    couponQuantity.value = 10;
    
    // 獲取該活動的優惠券
    await fetchCampaignCoupons(campaign.campaignId);
    // 獲取商店自己的優惠券
    await fetchAvailableCoupons();
  };
  
  // 更新 closeCouponModal 函數以重置搜尋
  const closeCouponModal = () => {
    showCouponModal.value = false;
    campaignCoupons.value = [];
    availableCoupons.value = [];
    resetCouponSearch();
  };
  
  // 獲取活動的優惠券
  const fetchCampaignCoupons = async (campaignId) => {
    loading.value = true;
    try {
      const response = await axios.get(`/api/campaigns/${campaignId}/coupons`);
      if (response.data.success) {
        campaignCoupons.value = response.data.data || [];
      } else {
        // 處理後端返回的錯誤
        console.error('獲取活動優惠券失敗:', response.data.message);
        Swal.fire({
          title: '錯誤',
          text: response.data.message || '無法獲取優惠券',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('獲取活動優惠券請求失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '獲取優惠券失敗',
        icon: 'error'
      });
    } finally {
      loading.value = false;
    }
  };
  
  // 修改獲取可用的優惠券函數
  const fetchAvailableCoupons = async () => {
    loadingAvailableCoupons.value = true;
    try {
      const shopId = route.params.shopId;
      const sellerId = userStore.userId; // 從用戶存儲中獲取賣家ID
      
      // 使用新的API端點來獲取賣家自己商店的優惠券
      const response = await axios.get(`/coupons/my-active`, {
        params: {
          sellerId: sellerId,
          shopId: shopId
        }
      });
      
      if (response.data.success) {
        // 過濾掉已經綁定到此活動的優惠券
        const alreadyBoundCouponIds = campaignCoupons.value.map(c => c.couponId);
        availableCoupons.value = (response.data.list || []).filter(
          coupon => !alreadyBoundCouponIds.includes(coupon.couponId)
        );
      } else {
        throw new Error(response.data.message || '無法獲取可用優惠券');
      }
    } catch (error) {
      console.error('獲取可用優惠券失敗:', error);
      availableCoupons.value = []; // 確保在錯誤情況下至少有一個空數組
    } finally {
      loadingAvailableCoupons.value = false;
    }
  };
  
  // 修改添加優惠券到活動的函數
  const addCouponToCampaign = async () => {
    if (!selectedCampaign.value || !selectedCampaign.value.campaignId) {
      Swal.fire({
        title: '提示',
        text: '請選擇一個活動',
        icon: 'info'
      });
      return;
    }
    
    try {
      const requestData = {
        campaignId: selectedCampaign.value.campaignId,
        couponId: parseInt(selectedCouponId.value),
        totalQuantity: couponQuantity.value
      };
      console.log('Request data:', requestData);
      console.log('Selected campaign:', selectedCampaign.value);
      const response = await axios.post('/api/campaigns/coupons', requestData);
      
      if (response.data.success) {
        Swal.fire({
          title: '成功',
          text: '優惠券已添加到活動',
          icon: 'success',
          confirmButtonText: '確定'
        });
        
        // 重新獲取活動的優惠券
        await fetchCampaignCoupons(selectedCampaign.value.campaignId);
        // 重新獲取可用的優惠券
        await fetchAvailableCoupons();
        
        // 重置選擇
        selectedCouponId.value = '';
        
        // 更新活動數據中的優惠券數量
        await fetchCampaigns();
      } else {
        // 不拋出異常，而是顯示錯誤信息
        Swal.fire({
          title: '錯誤',
          text: response.data.message || '添加優惠券失敗',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('添加優惠券請求失敗:', error);
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '添加優惠券失敗，請稍後再試',
        icon: 'error'
      });
    }
  };
  
  // 從活動中移除優惠券
  const removeCouponFromCampaign = async (coupon) => {
    try {
      const result = await Swal.fire({
        title: '確認移除',
        text: `您確定要從活動中移除「${coupon.couponName}」優惠券嗎？`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '是，移除',
        cancelButtonText: '取消'
      });
      
      if (result.isConfirmed) {
        try {
          // 調用 API 移除優惠券
          const response = await axios.delete(`/api/campaigns/${selectedCampaign.value.campaignId}/coupons/${coupon.couponId}`);
          
          if (response.data.success) {
            Swal.fire({
              title: '已移除',
              text: '優惠券已從活動中移除',
              icon: 'success'
            });
            
            // 重新獲取活動的優惠券
            await fetchCampaignCoupons(selectedCampaign.value.campaignId);
            // 重新獲取可用的優惠券
            await fetchAvailableCoupons();
            
            // 更新活動數據中的優惠券數量
            await fetchCampaigns();
          } else {
            // 非成功時的錯誤處理
            console.error('移除優惠券失敗:', response.data.message);
            Swal.fire({
              title: '錯誤',
              text: response.data.message || '移除優惠券失敗',
              icon: 'error'
            });
          }
        } catch (error) {
          // 處理 HTTP 錯誤（如 400 Bad Request）
          console.error('移除優惠券請求失敗:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              '移除優惠券失敗，請稍後再試';
          
          Swal.fire({
            title: '錯誤',
            text: errorMessage,
            icon: 'error'
          });
        }
      }
    } catch (outerError) {
      // 捕捉 Swal 或其他外部錯誤
      console.error('顯示確認對話框時發生錯誤:', outerError);
      Swal.fire({
        title: '系統錯誤',
        text: '操作過程中發生未預期的錯誤',
        icon: 'error'
      });
    }
  };
  
  // 跳轉到創建優惠券頁面
  const goToCreateCoupon = () => {
    router.push(`/seller/coupon/apply`);
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 將日期格式化為HTML datetime-local輸入格式
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  
  // 檢查活動是否活躍
  const isActive = (campaign) => {
    if (!campaign) return false;
    
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    return campaign.status === 'ACTIVE' && 
           startDate <= now && 
           endDate >= now;
  };
  
  // 獲取活動狀態文字
  const getStatusText = (campaign) => {
    if (!campaign) return '未知';
    
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (campaign.status !== 'ACTIVE') {
      return campaign.status === 'INACTIVE' ? '已停用' : '排程中';
    }
    
    if (startDate > now) {
      return '未開始';
    } else if (endDate < now) {
      return '已結束';
    } else {
      return '進行中';
    }
  };
  
  // 獲取狀態類名
  const getStatusClass = (campaign) => {
    const status = getStatusText(campaign);
    switch (status) {
      case '進行中': return 'active';
      case '未開始': return 'upcoming';
      case '已結束': return 'ended';
      case '已停用': return 'inactive';
      case '排程中': return 'scheduled';
      default: return '';
    }
  };
  
  // 格式化折扣類型
  const formatDiscountType = (type) => {
    switch (type) {
      case 'PERCENTAGE': return '折扣';
      case 'FIXED': return '固定金額';
      default: return type;
    }
  };
  
  // 格式化折扣值
  const formatDiscountValue = (value, type) => {
    if (type === 'PERCENTAGE') {
      return `${value}%`;
    } else if (type === 'FIXED') {
      return `$${value}`;
    }
    return value;
  };
  </script>
  
  <style scoped>
 .campaigns-container {
  background-color: #f7e9d2;
  padding: 20px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #ff4757;
  color: white;
}

.btn-primary:hover {
  background-color: #ff6b81;
}

.btn-edit {
  background-color: #2980b9;
  color: white;
}

.btn-coupons {
  background-color: #e67e22;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-cancel {
  background-color: #7f8c8d;
  color: white;
}

.btn-submit {
  background-color: #2ecc71;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 表格樣式 */
.campaigns-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.campaigns-table th,
.campaigns-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.campaigns-table th {
  background-color: #f1c40f;
  color: #333;
  font-weight: bold;
}

.campaigns-table tr:last-child td {
  border-bottom: none;
}

.campaigns-table tr:hover {
  background-color: #f5f5f5;
}

.campaigns-table tr.inactive {
  opacity: 0.7;
}

/* 狀態標籤 */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background-color: #2ecc71;
  color: white;
}

.status-badge.upcoming {
  background-color: #3498db;
  color: white;
}

.status-badge.ended {
  background-color: #95a5a6;
  color: white;
}

.status-badge.inactive {
  background-color: #e74c3c;
  color: white;
}

.status-badge.scheduled {
  background-color: #9b59b6;
  color: white;
}

/* 操作按鈕 */
.actions {
  display: flex;
  gap: 5px;
}

/* 模態框樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.coupon-modal {
  width: 700px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.date-group {
  display: flex;
  gap: 10px;
}

.date-group > div {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
}

/* 優惠券管理區域 */
.coupon-section {
  margin-top: 20px;
}

.coupon-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.coupons-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.coupons-table th,
.coupons-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
}

.coupons-table th {
  background-color: #f1c40f;
  color: #333;
}

.add-coupon-form {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
}

/* 載入中動畫 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner.small {
  height: 100px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #f1c40f;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-spinner.small .spinner {
  width: 20px;
  height: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 無活動顯示 */
.no-campaigns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #777;
}

/* 無優惠券顯示 */
.no-coupons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 15px;
  text-align: center;
}

.no-coupons p {
  margin-bottom: 10px;
  color: #666;
  font-size: 15px;
}

/* 優惠券搜尋相關樣式 */
.search-select-container {
  position: relative;
  margin-bottom: 10px;
}

.coupon-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 8px;
}

#couponSelect {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

/* 圖片上傳相關樣式 */
.image-upload-container {
  border: 2px dashed #ddd;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
}

.upload-placeholder {
  text-align: center;
  padding: 30px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-placeholder:hover {
  background-color: #f0f0f0;
}

.upload-placeholder i {
  font-size: 24px;
  color: #95a5a6;
  margin-bottom: 10px;
}

.upload-placeholder p {
  margin: 5px 0;
  color: #7f8c8d;
}

.upload-placeholder small {
  color: #95a5a6;
}

.image-preview {
  position: relative;
  padding: 10px;
  text-align: center;
}

.image-preview img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
}

.progress {
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.3s;
}

.text-danger {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

@media (max-width: 768px) {
  .campaigns-table {
    font-size: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .date-group {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
    gap: 5px;
  }

  .btn-sm {
    width: 100%;
  }
  
  .coupon-modal {
    width: 95%;
  }
}
</style>