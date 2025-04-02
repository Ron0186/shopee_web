<template>
  <div class="product-review-management p-4">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold text-primary">商品審核管理</h5>
      </div>
      
      <div class="card-body">
        <!-- 搜尋和過濾區 -->
        <div class="filter-section mb-4">
          <div class="row g-3">
            <!-- 關鍵字搜尋和進階搜尋切換 -->
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text bg-light">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  v-model="filters.keyword" 
                  type="text" 
                  class="form-control" 
                  placeholder="搜尋商品名稱..."
                >
                <button class="btn btn-primary" @click="searchProducts">搜尋</button>
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="toggleAdvancedSearch">
                  {{ showAdvancedSearch ? '收起進階搜尋' : '進階搜尋' }}
                  <i class="bi" :class="showAdvancedSearch ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>
              </div>
            </div>

            <!-- 進階搜尋區塊 -->
            <div v-if="showAdvancedSearch" class="advanced-search-container mb-4 p-3 border rounded bg-light">
              <div class="row g-3">
                <h6 class="fw-bold mb-2">搜尋條件</h6>
                
                <!-- 店鋪搜尋 -->
                <div class="col-md-4">
                  <label class="form-label">店鋪</label>
                  <div class="position-relative">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="輸入店鋪名稱..."
                      v-model="shopSearchQuery"
                      @input="handleShopSearch"
                      @focus="showShopSearchResults = true"
                    >
                    <div class="position-absolute w-100 search-results" v-show="showShopSearchResults && shopSearchQuery">
                      <div class="list-group shadow-sm">
                        <button
                          v-for="shop in filteredShops"
                          :key="shop.id"
                          class="list-group-item list-group-item-action"
                          @click="selectShop(shop)"
                        >
                          {{ shop.name }}
                        </button>
                        <div v-if="filteredShops.length === 0 && shopSearchQuery" class="list-group-item text-muted">
                          找不到相符的店鋪
                        </div>
                      </div>
                    </div>
                    <div v-if="filters.shopId" class="mt-1">
                      <span class="badge bg-primary d-inline-flex align-items-center">
                        {{ selectedShopName }}
                        <button class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;" @click="clearShopSelection"></button>
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 價格範圍 -->
                <div class="col-md-4">
                  <label class="form-label">價格範圍</label>
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control"
                      placeholder="最低價"
                      v-model="advancedFilters.minPrice"
                    >
                    <span class="input-group-text">-</span>
                    <input
                      type="number"
                      class="form-control"
                      placeholder="最高價"
                      v-model="advancedFilters.maxPrice"
                    >
                  </div>
                </div>
                
<!-- 修改日期范围输入框，添加变化事件 -->
<div class="col-md-4">
  <label class="form-label">建立時間</label>
  <div class="input-group">
    <input
      type="date"
      class="form-control"
      v-model="advancedFilters.startDate"
      @change="handleStartDateChange"
    >
    <span class="input-group-text">至</span>
    <input
      type="date"
      class="form-control"
      v-model="advancedFilters.endDate"
      @change="handleEndDateChange"
      :min="advancedFilters.startDate"
    >
  </div>
</div>
                
                <!-- 分類選擇 -->
                <div class="col-md-4">
                  <label class="form-label">商品分類</label>
                  <div class="row g-2">
                    <div class="col-6">
                      <select v-model="filters.category1Id" class="form-select" @change="handleCategory1Change">
                        <option :value="null">全部一級分類</option>
                        <option v-for="category in category1Options" :key="category.id" :value="category.id">
                          {{ category.name }}
                        </option>
                      </select>
                    </div>
                    <div class="col-6">
                      <select v-model="filters.category2Id" class="form-select" @change="handleCategory2Change">
                        <option :value="null">全部二級分類</option>
                        <option v-for="category in filteredCategory2Options" :key="category.id" :value="category.id">
                          {{ category.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- 商品狀態與審核狀態 -->
                <div class="col-md-8">
                  <label class="form-label">商品狀態</label>
                  <div class="row g-2">
                    <div class="col-md-6">
                      <div class="btn-group w-100">
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.active === null ? 'btn-primary' : 'btn-outline-primary'"
                          @click="filters.active = null">
                          全部
                        </button>
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.active === true ? 'btn-primary' : 'btn-outline-primary'"
                          @click="filters.active = true">
                          已上架
                        </button>
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.active === false ? 'btn-primary' : 'btn-outline-primary'"
                          @click="filters.active = false">
                          未上架
                        </button>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="btn-group w-100">
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.reviewStatus === null ? 'btn-info' : 'btn-outline-info'"
                          @click="filters.reviewStatus = null">
                          全部
                        </button>
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.reviewStatus === true ? 'btn-info' : 'btn-outline-info'"
                          @click="filters.reviewStatus = true">
                          已審核
                        </button>
                        <button 
                          type="button" 
                          class="btn" 
                          :class="filters.reviewStatus === false ? 'btn-info' : 'btn-outline-info'"
                          @click="filters.reviewStatus = false">
                          已拒絕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 搜尋按鈕區域 -->
                <div class="col-12 mt-3">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-outline-secondary" @click="resetAdvancedFilters">
                      <i class="bi bi-arrow-counterclockwise me-1"></i>重置條件
                    </button>
                    <button class="btn btn-primary" @click="applyAdvancedSearch">
                      <i class="bi bi-search me-1"></i>進階搜尋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 顯示已選擇的篩選條件 -->
            <div v-if="hasActiveFilters" class="active-filters mb-3 p-2 border rounded bg-white">
              <div class="d-flex align-items-center mb-1">
                <small class="text-muted me-2">已選擇的篩選條件：</small>
                <button class="btn btn-sm btn-link text-decoration-none" @click="resetAllFilters">
                  <small>清除全部</small>
                </button>
              </div>
              <div class="d-flex flex-wrap gap-1">
                <span v-if="filters.keyword" class="badge bg-light text-dark d-inline-flex align-items-center">
                  關鍵字: {{ filters.keyword }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="filters.keyword = ''"></button>
                </span>
                <span v-if="selectedShopName" class="badge bg-light text-dark d-inline-flex align-items-center">
                  店鋪: {{ selectedShopName }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="clearShopSelection"></button>
                </span>
                <span v-if="selectedCategory1Name" class="badge bg-light text-dark d-inline-flex align-items-center">
                  一級分類: {{ selectedCategory1Name }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="clearCategory1Selection"></button>
                </span>
                <span v-if="selectedCategory2Name" class="badge bg-light text-dark d-inline-flex align-items-center">
                  二級分類: {{ selectedCategory2Name }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="clearCategory2Selection"></button>
                </span>
                <span v-if="advancedFilters.minPrice || advancedFilters.maxPrice" class="badge bg-light text-dark d-inline-flex align-items-center">
                  價格: {{ advancedFilters.minPrice || '0' }} - {{ advancedFilters.maxPrice || '不限' }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="clearPriceRange"></button>
                </span>
                <span v-if="advancedFilters.startDate || advancedFilters.endDate" class="badge bg-light text-dark d-inline-flex align-items-center">
                  日期: {{ formatSimpleDate(advancedFilters.startDate) || '不限' }} - {{ formatSimpleDate(advancedFilters.endDate) || '不限' }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="clearDateRange"></button>
                </span>
                <span v-if="filters.active !== null" class="badge bg-light text-dark d-inline-flex align-items-center">
                  上架狀態: {{ filters.active ? '已上架' : '未上架' }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="filters.active = null"></button>
                </span>
                <span v-if="filters.reviewStatus !== null" class="badge bg-light text-dark d-inline-flex align-items-center">
                  審核狀態: {{ getReviewStatusText(filters.reviewStatus) }}
                  <button class="btn-close ms-1" style="font-size: 0.5rem;" @click="filters.reviewStatus = null"></button>
                </span>
              </div>
            </div>
            
            <!-- 分頁大小選擇 -->
            <div class="col-md-2">
              <select v-model="pageSize" class="form-select" @change="searchProducts">
                <option :value="10">每頁 10 筆</option>
                <option :value="20">每頁 20 筆</option>
                <option :value="50">每頁 50 筆</option>
              </select>
            </div>
            
            <!-- 排序選擇 -->
            <div class="col-md-3">
              <select v-model="sortBy" class="form-select" @change="searchProducts">
                <option value="productId,desc">ID (從大到小)</option>
                <option value="productId,asc">ID (從小到大)</option>
                <option value="productName,asc">商品名稱 (A 到 Z)</option>
                <option value="productName,desc">商品名稱 (Z 到 A)</option>
                <option value="createdAt,desc">建立時間 (最新)</option>
                <option value="createdAt,asc">建立時間 (最舊)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 商品表格 -->
        <div class="table-container position-relative">
          <!-- 表格加載指示器 -->
          <div v-if="loading" class="table-overlay">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
          </div>
          
          <div class="table-responsive">
            <table class="table table-hover table-bordered">
              <thead class="table-light">
                <tr>
                  <th style="width: 80px;" class="text-center">ID</th>
                  <th style="width: 150px;">縮圖</th>
                  <th>商品名稱</th>
                  <th style="width: 120px;">價格</th>
                  <th style="width: 150px;">店鋪</th>
                  <th style="width: 120px;">分類</th>
                  <th style="width: 100px;">上架狀態</th>
                  <th style="width: 100px;">審核狀態</th>
                  <th style="width: 180px;" class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="products.length === 0">
                  <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                      <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                      <p>查無商品資料</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="product in products" :key="product.productId">
                  <td class="text-center">{{ product.productId }}</td>
                  <td>
                    <img 
                      v-if="product.imageUrls && product.imageUrls.length > 0" 
                      :src="getImageUrl(product.imageUrls[0])" 
                      alt="商品縮圖" 
                      class="product-thumbnail"
                    >
                    <div v-else class="no-image-placeholder">
                      <i class="fas fa-image"></i>
                    </div>
                  </td>
                  <td>
                    <div class="product-title">{{ product.productName }}</div>
                    <!-- <div class="product-meta text-muted">
                      <small>ID: {{ product.productId }}</small>
                    </div> -->
                  </td>
                  <td>${{ formatPrice(product.lowestPrice) }}</td>
                  <td>
                    <div>{{ product.sellerName || '無店鋪資訊' }}</div>
                  </td>
                  <td>
                    <div class="category-badges">
                      <span v-if="product.category1" class="badge bg-secondary mb-1">
                        {{ product.category1.name }}
                      </span>
                      <span v-if="product.category2" class="badge bg-info">
                        {{ product.category2.name }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span 
                      class="badge" 
                      :class="product.active ? 'bg-success' : 'bg-danger'"
                    >
                      {{ product.active ? '已上架' : '未上架' }}
                    </span>
                  </td>
                  <td>
                    <span 
                      class="badge" 
                      :class="getReviewStatusBadgeClass(product.reviewStatus)"
                    >
                      {{ getReviewStatusText(product.reviewStatus) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <button 
                        class="btn btn-sm btn-outline-primary me-1" 
                        @click="viewProductDetail(product)"
                        title="查看詳情"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-success me-1" 
                        @click="openReviewModal(product, true)"
                        title="通過審核"
                        :disabled="product.reviewStatus === true"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-danger" 
                        @click="openReviewModal(product, false)"
                        title="拒絕審核"
                        :disabled="product.reviewStatus === false"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 分頁 -->
        <div class="pagination-container mt-4" v-if="totalItems > 0">
          <div class="d-flex justify-content-between align-items-center">
            <div class="pagination-info">
              顯示 {{ products.length }} 筆，共 {{ totalItems }} 筆商品
            </div>
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(0)">
                    <i class="fas fa-angle-double-left"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
                    <i class="fas fa-angle-left"></i>
                  </a>
                </li>
                <li class="page-item disabled">
                  <span class="page-link">
                    第 {{ currentPage + 1 }} 頁 / 共 {{ totalPages }} 頁
                  </span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
                    <i class="fas fa-angle-right"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(totalPages - 1)">
                    <i class="fas fa-angle-double-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 審核 Modal -->
    <div class="modal fade" id="reviewModal" tabindex="-1" ref="reviewModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ reviewData.isApproved ? '通過審核' : '拒絕審核' }}
            </h5>
            <button type="button" class="btn-close" @click="closeReviewModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <p>
                <strong>商品：</strong> {{ reviewData.product?.productName }}
              </p>
              <p>
                <strong>商品ID：</strong> {{ reviewData.product?.productId }}
              </p>
              <p>
                <strong>審核操作：</strong>
                <span :class="reviewData.isApproved ? 'text-success' : 'text-danger'">
                  {{ reviewData.isApproved ? '通過審核' : '拒絕審核' }}
                </span>
              </p>
            </div>
            <div class="mb-3">
              <label for="reviewComment" class="form-label">審核意見</label>
              <textarea 
                id="reviewComment" 
                v-model="reviewData.comment" 
                class="form-control" 
                rows="3"
                :placeholder="reviewData.isApproved ? '通過審核意見...' : '請說明拒絕的原因...'"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeReviewModal">取消</button>
            <button 
              type="button" 
              class="btn" 
              :class="reviewData.isApproved ? 'btn-success' : 'btn-danger'"
              @click="submitReview"
              :disabled="reviewLoading"
            >
              <span v-if="reviewLoading" class="spinner-border spinner-border-sm me-1"></span>
              {{ reviewData.isApproved ? '確認通過' : '確認拒絕' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 商品詳情 Modal -->
    <div class="modal fade" id="productDetailModal" tabindex="-1" ref="productDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">商品詳情</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedProduct">
            <div class="row">
              <div class="col-md-6">
                <div id="productImageCarousel" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner">
                    <div 
                      v-for="(imageUrl, index) in selectedProduct.imageUrls" 
                      :key="index"
                      class="carousel-item"
                      :class="{ active: index === 0 }"
                    >
                      <img :src="getImageUrl(imageUrl)" class="d-block w-100" alt="商品圖片">
                    </div>
                    <div v-if="!selectedProduct.imageUrls || selectedProduct.imageUrls.length === 0" class="carousel-item active">
                      <div class="no-image-placeholder-large">
                        <i class="fas fa-image fa-3x"></i>
                        <p>無商品圖片</p>
                      </div>
                    </div>
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#productImageCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">上一張</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#productImageCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">下一張</span>
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <h4>{{ selectedProduct.productName }}</h4>
                <p class="text-primary fs-4">${{ formatPrice(selectedProduct.lowestPrice) }}</p>
                
                <div class="product-detail-info mb-3">
                  <div class="row g-2">
                    <div class="col-6">
                      <div class="detail-label">商品ID</div>
                      <div class="detail-value">{{ selectedProduct.productId }}</div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">店鋪</div>
                      <div class="detail-value">{{ selectedProduct.sellerName || '無店鋪資訊' }}</div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">一級分類</div>
                      <div class="detail-value">{{ selectedProduct.category1?.name || '無分類' }}</div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">二級分類</div>
                      <div class="detail-value">{{ selectedProduct.category2?.name || '無分類' }}</div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">上架狀態</div>
                      <div class="detail-value">
                        <span 
                          class="badge" 
                          :class="selectedProduct.active ? 'bg-success' : 'bg-danger'"
                        >
                          {{ selectedProduct.active ? '已上架' : '未上架' }}
                        </span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">審核狀態</div>
                      <div class="detail-value">
                        <span 
                          class="badge" 
                          :class="getReviewStatusBadgeClass(selectedProduct.reviewStatus)"
                        >
                          {{ getReviewStatusText(selectedProduct.reviewStatus) }}
                        </span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">創建時間</div>
                      <div class="detail-value">{{ formatDate(selectedProduct.createdAt) }}</div>
                    </div>
                    <div class="col-6">
                      <div class="detail-label">更新時間</div>
                      <div class="detail-value">{{ formatDate(selectedProduct.updatedAt) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="product-description mb-3">
                  <h5>商品描述</h5>
                  <p>{{ selectedProduct.description || '無商品描述' }}</p>
                </div>
              </div>
            </div>
            
            <div class="review-history mt-4" v-if="selectedProduct.reviewComment">
              <h5>審核記錄</h5>
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <span>
                      <strong>審核狀態：</strong>
                      <span 
                        class="badge" 
                        :class="getReviewStatusBadgeClass(selectedProduct.reviewStatus)"
                      >
                        {{ getReviewStatusText(selectedProduct.reviewStatus) }}
                      </span>
                    </span>
                    <span>
                      <strong>審核時間：</strong>
                      {{ formatDate(selectedProduct.reviewAt) }}
                    </span>
                  </div>
                  <div class="mt-2">
                    <strong>審核意見：</strong>
                    <p>{{ selectedProduct.reviewComment }}</p>
                  </div>
                  <div>
                    <strong>審核人員：</strong>
                    {{ selectedProduct.reviewerUsername || '無審核人員資訊' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from '@/plugins/axios';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle';

// 商品資料
const products = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);
const loading = ref(false);

// 進階搜尋相關
const showAdvancedSearch = ref(false);
const shopSearchQuery = ref('');
const showShopSearchResults = ref(false);
const filteredShops = ref([]);
const selectedShopName = ref('');
const selectedCategory1Name = ref('');
const selectedCategory2Name = ref('');

// 進階篩選條件
const advancedFilters = reactive({
  minPrice: null,
  maxPrice: null,
  startDate: null,
  endDate: null
});

// URL 處理函數
const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // 明確設置 API 基礎 URL，與您的後端一致
  const apiBaseUrl = 'http://localhost:8081'; // 請確保這是正確的後端地址
  
  // 確保路徑格式正確
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  // 處理 URL 中的中文和特殊字符
  return `${apiBaseUrl}${encodeURI(cleanPath)}`;
};

// 過濾條件
const filters = reactive({
  keyword: '',
  shopId: null,
  category1Id: null,
  category2Id: null,
  active: null,
  reviewStatus: null
});

// 選項資料
const shopOptions = ref([]);
const category1Options = ref([]);
const category2Options = ref([]);
const filteredCategory2Options = ref([]);

// 排序設定
const sortBy = ref('productId,desc');

// 審核相關
const reviewModal = ref(null);
const reviewData = reactive({
  product: null,
  isApproved: true,
  comment: '',
  adminId: 1 // 假設有固定的管理員ID，實際應從認證系統獲取
});
const reviewLoading = ref(false);

// 商品詳情
const productDetailModal = ref(null);
const selectedProduct = ref(null);

// 功能方法

// 切換進階搜尋顯示
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value;
};

// 處理店鋪搜尋
const handleShopSearch = () => {
  if (shopSearchQuery.value.trim() === '') {
    filteredShops.value = shopOptions.value;
  } else {
    const query = shopSearchQuery.value.toLowerCase().trim();
    filteredShops.value = shopOptions.value.filter(shop => 
      shop.name.toLowerCase().includes(query)
    );
  }
};

// 選擇店鋪
const selectShop = (shop) => {
  filters.shopId = shop.id;
  selectedShopName.value = shop.name;
  shopSearchQuery.value = '';
  showShopSearchResults.value = false;
};

// 清除店鋪選擇
const clearShopSelection = () => {
  filters.shopId = null;
  selectedShopName.value = '';
  shopSearchQuery.value = '';
};

// 清除一級分類選擇
const clearCategory1Selection = () => {
  filters.category1Id = null;
  selectedCategory1Name.value = '';
  // 如果有選擇二級分類但清除了一級分類，也一併清除二級分類
  if (filters.category2Id) {
    clearCategory2Selection();
  } else {
    // 重置二級分類選項
    filteredCategory2Options.value = category2Options.value;
  }
};

// 清除二級分類選擇
const clearCategory2Selection = () => {
  filters.category2Id = null;
  selectedCategory2Name.value = '';
};

// 清除價格範圍
const clearPriceRange = () => {
  advancedFilters.minPrice = null;
  advancedFilters.maxPrice = null;
};

// 清除日期範圍
const clearDateRange = () => {
  advancedFilters.startDate = null;
  advancedFilters.endDate = null;
};

// 重置進階篩選條件
const resetAdvancedFilters = () => {
  // 重置進階搜尋相關條件
  clearPriceRange();
  clearDateRange();
  clearShopSelection();
  clearCategory1Selection();
  clearCategory2Selection();
  
  // 重置基本篩選條件
  filters.keyword = '';
  filters.active = null;
  filters.reviewStatus = null;
};

// 重置所有篩選條件
const resetAllFilters = () => {
  resetAdvancedFilters();
  currentPage.value = 0;
  searchProducts();
};

// 應用進階搜尋
const applyAdvancedSearch = () => {
  currentPage.value = 0;
  searchProducts();
};

// 一級分類選擇處理
const handleCategory1Change = async () => {
  // 重置二級分類選擇
  filters.category2Id = null;
  selectedCategory2Name.value = '';
  
  if (filters.category1Id) {
    // 更新選中的一級分類名稱
    const selectedCategory = category1Options.value.find(c => c.id === filters.category1Id);
    if (selectedCategory) {
      selectedCategory1Name.value = selectedCategory.name;
    }
    
    // 過濾二級分類
    try {
      // 使用前端過濾 (根據 category1Ids 屬性)
      filteredCategory2Options.value = category2Options.value.filter(cat => 
        cat.category1Ids && cat.category1Ids.includes(filters.category1Id)
      );
    } catch (error) {
      console.error('獲取二級分類失敗:', error);
      filteredCategory2Options.value = [];
    }
  } else {
    selectedCategory1Name.value = '';
    // 如果沒有選擇一級分類，顯示所有二級分類
    filteredCategory2Options.value = category2Options.value;
  }
};

// 二級分類選擇處理
const handleCategory2Change = () => {
  // 更新選中的二級分類名稱
  if (filters.category2Id) {
    const selectedCategory = filteredCategory2Options.value.find(c => c.id === filters.category2Id);
    if (selectedCategory) {
      selectedCategory2Name.value = selectedCategory.name;
    }
  } else {
    selectedCategory2Name.value = '';
  }
};

// 监听开始日期变化
const handleStartDateChange = () => {
  // 如果结束日期存在且小于开始日期，则清空结束日期
  if (advancedFilters.endDate && advancedFilters.startDate && advancedFilters.endDate < advancedFilters.startDate) {
    advancedFilters.endDate = null;
    // 显示提示消息
    showWarningMessage('日期范围无效', '结束日期不能小于开始日期，已重置结束日期');
  }
};

// 监听结束日期变化
const handleEndDateChange = () => {
  // 如果开始日期存在且结束日期小于开始日期，则显示错误提示
  if (advancedFilters.startDate && advancedFilters.endDate && advancedFilters.endDate < advancedFilters.startDate) {
    advancedFilters.endDate = null;
    // 显示提示消息
    showWarningMessage('日期范围无效', '结束日期不能小于开始日期，已重置结束日期');
  }
};

// 添加警告消息函数（与已有的成功和错误消息类似）
const showWarningMessage = (title, message) => {
  // 这里可以使用您偏好的通知库，如 SweetAlert2, Toast 等
  alert(`${title}: ${message}`);
};

// 添加日期输入验证方法
const validateDateRange = () => {
  if (advancedFilters.startDate && advancedFilters.endDate) {
    if (advancedFilters.endDate < advancedFilters.startDate) {
      return false;
    }
  }
  return true;
};

// 修改搜尋商品方法，支持進階搜尋條件
const searchProducts = async () => {
  loading.value = true;
  try {
    // 解析排序參數
    const [sortField, direction] = sortBy.value.split(',');
    
    // 構建 API 請求參數
    let endpoint = '/api/admin/products';
    let params = {
      page: currentPage.value,
      size: pageSize.value,
      sortBy: sortField,
      direction: direction
    };
    
    // 檢查是否有進階搜尋條件
    const hasAdvancedFilters = 
      advancedFilters.minPrice || 
      advancedFilters.maxPrice || 
      advancedFilters.startDate || 
      advancedFilters.endDate || 
      filters.shopId || 
      filters.category1Id || 
      filters.category2Id || 
      filters.active !== null || 
      filters.reviewStatus !== null || 
      filters.keyword;
    
    // 如果有進階搜尋條件，使用進階搜尋 API
    if (hasAdvancedFilters) {
      endpoint += '/advanced-search';
      
      // 添加各種進階篩選條件
      if (filters.keyword) {
        params.keyword = filters.keyword;
      }
      
      if (advancedFilters.minPrice) {
        params.minPrice = advancedFilters.minPrice;
      }
      
      if (advancedFilters.maxPrice) {
        params.maxPrice = advancedFilters.maxPrice;
      }
      
      if (advancedFilters.startDate) {
        params.startDate = advancedFilters.startDate;
      }
      
      if (advancedFilters.endDate) {
        params.endDate = advancedFilters.endDate;
      }
      
      if (filters.shopId) {
        params.shopId = filters.shopId;
      }
      
      if (filters.category1Id) {
        params.category1Id = filters.category1Id;
      }
      
      if (filters.category2Id) {
        params.category2Id = filters.category2Id;
      }
      
      if (filters.active !== null) {
        params.active = filters.active;
      }
      
      if (filters.reviewStatus !== null) {
        params.reviewStatus = filters.reviewStatus;
      }
    } else {
      // 使用基本搜尋 API (保留原有邏輯)
      if (filters.keyword) {
        endpoint += '/search';
        params.keyword = filters.keyword;
      } else if (filters.active !== null && filters.reviewStatus !== null) {
        endpoint += '/status/combined';
        params.active = filters.active;
        params.reviewStatus = filters.reviewStatus;
      } else if (filters.active !== null) {
        endpoint += '/status/active';
        params.active = filters.active;
      } else if (filters.reviewStatus !== null) {
        endpoint += '/status/review';
        params.reviewStatus = filters.reviewStatus;
      } else if (filters.shopId && filters.category2Id) {
        endpoint += `/shop/${filters.shopId}/category2/${filters.category2Id}`;
      } else if (filters.shopId && filters.category1Id) {
        endpoint += `/shop/${filters.shopId}/category1/${filters.category1Id}`;
      } else if (filters.category2Id) {
        endpoint += `/category2/${filters.category2Id}`;
      } else if (filters.category1Id) {
        endpoint += `/category1/${filters.category1Id}`;
      } else if (filters.shopId) {
        endpoint += `/shop/${filters.shopId}`;
      }
    }
    
    console.log('API 請求:', endpoint, params);
    
    const response = await axios.get(endpoint, { params });
    
    console.log('API 響應:', response.data);
    
    // 處理 API 響應 - 更新為處理 DTO 結構
    if (response.data) {
      if (response.data.products && Array.isArray(response.data.products)) {
        // 使用更新過的 Controller 返回格式
        products.value = response.data.products;
        totalItems.value = response.data.totalItems || 0;
        totalPages.value = response.data.totalPages || 1;
        currentPage.value = response.data.currentPage || 0;
      } else {
        // 其他可能的格式，保留原有的處理邏輯
        console.error('API 返回格式與預期不符:', response.data);
        products.value = [];
        totalItems.value = 0;
        totalPages.value = 0;
        currentPage.value = 0;
      }
    } else {
      products.value = [];
      totalItems.value = 0;
      totalPages.value = 0;
      currentPage.value = 0;
    }
  } catch (error) {
    console.error('獲取商品列表失敗:', error);
    // 顯示錯誤通知
    showErrorMessage('獲取商品列表失敗', error.response?.data?.message || '發生未知錯誤');
  } finally {
    loading.value = false;
  }
};

const fetchInitialData = async () => {
  try {
    // 獲取店鋪列表
    const shopsResponse = await axios.get('/api/shop/allShop');
    if (shopsResponse.data && shopsResponse.data.data) {
      shopOptions.value = shopsResponse.data.data.map(shop => ({
        id: shop.shopId,
        name: shop.shopName
      }));
    }
    
    // 獲取一級分類列表
    const category1Response = await axios.get('/api/category1/all');
    if (category1Response.data) {
      category1Options.value = category1Response.data.map(cat => ({
        id: cat.id,
        name: cat.name
      }));
    }
    
    // 獲取二級分類列表
    const category2Response = await axios.get('/api/category2/all');
    if (category2Response.data) {
      category2Options.value = category2Response.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        category1Ids: cat.category1Ids // 保存關聯的一級分類IDs
      }));
    }
    
    // 初始化 filteredCategory2Options
    filteredCategory2Options.value = category2Options.value;
  } catch (error) {
    console.error('獲取初始數據失敗:', error);
  }
};

const goToPage = (page) => {
  if (page < 0 || (totalPages.value > 0 && page >= totalPages.value)) {
    return;
  }
  currentPage.value = page;
  searchProducts();
};

// 商品審核相關方法
const openReviewModal = (product, isApproved) => {
  reviewData.product = product;
  reviewData.isApproved = isApproved;
  reviewData.comment = '';
  
  // 使用 Bootstrap 5 的 Modal API
  const modal = new bootstrap.Modal(reviewModal.value);
  modal.show();
};

const closeReviewModal = () => {
  const modal = bootstrap.Modal.getInstance(reviewModal.value);
  if (modal) {
    modal.hide();
  }
};

const submitReview = async () => {
  if (!reviewData.product || reviewLoading.value) return;
  
  reviewLoading.value = true;
  try {
    const response = await axios.put(`/api/admin/products/${reviewData.product.productId}/review`, {
      reviewStatus: reviewData.isApproved,
      reviewComment: reviewData.comment,
      adminId: reviewData.adminId
    });
    
    if (response.data && response.data.success) {
      showSuccessMessage(
        reviewData.isApproved ? '審核通過成功' : '審核拒絕成功',
        response.data.message || '商品審核狀態已更新'
      );
      
      // 關閉 Modal 並重新獲取商品列表
      closeReviewModal();
      searchProducts();
    } else {
      throw new Error(response.data?.message || '操作失敗');
    }
  } catch (error) {
    console.error('商品審核操作失敗:', error);
    showErrorMessage(
      '審核操作失敗', 
      error.response?.data?.message || error.message || '發生未知錯誤'
    );
  } finally {
    reviewLoading.value = false;
  }
};

// 商品詳情
const viewProductDetail = (product) => {
  selectedProduct.value = product;
  
  // 使用 Bootstrap 5 的 Modal API
  const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
  modal.show();
  
  // 初始化輪播圖（如果有）
  setTimeout(() => {
    const carousel = document.querySelector('#productImageCarousel');
    if (carousel) {
      new bootstrap.Carousel(carousel);
    }
  }, 100);
};

// 工具函數
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00';
  return parseFloat(price).toFixed(2);
};

const formatDate = (dateString) => {
  if (!dateString) return '無記錄';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 簡單日期格式化，只顯示年月日
const formatSimpleDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getReviewStatusText = (status) => {
  if (status === true) return '已通過';
  if (status === false) return '已拒絕';
  return '待審核';
};

const getReviewStatusBadgeClass = (status) => {
  if (status === true) return 'bg-success';
  if (status === false) return 'bg-danger';
  return 'bg-warning text-dark';
};

const showSuccessMessage = (title, message) => {
  // 這裡可以使用您偏好的通知庫，如 SweetAlert2, Toast 等
  alert(`${title}: ${message}`);
};

const showErrorMessage = (title, message) => {
  // 這裡可以使用您偏好的通知庫
  alert(`${title}: ${message}`);
};

// 計算是否有任何活躍的篩選條件
const hasActiveFilters = computed(() => {
  return filters.keyword ||
    filters.shopId ||
    filters.category1Id ||
    filters.category2Id ||
    filters.active !== null ||
    filters.reviewStatus !== null ||
    advancedFilters.minPrice ||
    advancedFilters.maxPrice ||
    advancedFilters.startDate ||
    advancedFilters.endDate;
});

// 生命週期鉤子
onMounted(() => {
  // 添加調試信息
  console.log('商品審核管理頁面已加載');
  
  // 獲取初始數據
  fetchInitialData();
  
  // 獲取商品列表
  searchProducts();
  
  // 點擊頁面其他地方關閉搜尋結果
  document.addEventListener('click', (e) => {
    const shopSearchContainer = document.querySelector('.search-results');
    const shopSearchInput = document.querySelector('[placeholder="輸入店鋪名稱..."]');
    
    if (shopSearchContainer && shopSearchInput) {
      if (!shopSearchContainer.contains(e.target) && e.target !== shopSearchInput) {
        showShopSearchResults.value = false;
      }
    }
  });
  
  // 在控制台輸出 API 路徑提示
  console.log('API 端點參考:');
  console.log('- 所有商品: /api/admin/products');
  console.log('- 搜尋商品: /api/admin/products/search?keyword=xxx');
  console.log('- 按店鋪查詢: /api/admin/products/shop/{shopId}');
  console.log('- 按分類查詢: /api/admin/products/category1/{category1Id} 或 /category2/{category2Id}');
});
</script>

<style scoped>
.product-review-management {
  background-color: #f8f9fc;
  min-height: 100vh;
}

.filter-section {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

.table-container {
  position: relative;
  min-height: 300px;
}

.table-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border-radius: 0.25rem;
}

.product-thumbnail {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image-placeholder {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #aaa;
  border-radius: 4px;
}

.no-image-placeholder-large {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #aaa;
  border-radius: 4px;
}

.product-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-meta {
  font-size: 0.8rem;
}

.category-badges {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  color: #6c757d;
}

.detail-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.detail-value {
  font-weight: 500;
}

.sku-list {
  margin-top: 10px;
}

.sku-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  background-color: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
}

.sku-price {
  font-weight: 500;
  color: #dc3545;
}

.btn-group .btn:focus {
  box-shadow: none;
}

.btn-sm {
  min-width: 32px;
  min-height: 32px;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-sm i {
  font-size: 1rem;
  line-height: 1;
}

/* 確保圖標在禁用狀態下仍然可見 */
.btn:disabled i {
  opacity: 0.65;
}

/* 改善圖片佔位符樣式 */
.no-image-placeholder, .no-image-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  border-radius: 0.25rem;
}

.no-image-placeholder {
  width: 100%;
  height: 80px;
}

.no-image-placeholder-large {
  width: 100%;
  height: 300px;
}

.no-image-placeholder i, .no-image-placeholder-large i {
  margin-bottom: 0.5rem;
}

/* 進階搜尋相關樣式 */
.advanced-search-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.active-filters {
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.25rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
}

.search-results .list-group {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.search-results .list-group-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.search-results .list-group-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-weight: normal;
}

.badge .btn-close {
  font-size: 0.5rem;
  padding: 0.2rem;
}

/* 增加表單元素間距 */
.form-label {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}

/* 改善下拉選單和按鈕樣式 */
.form-select, .form-control, .btn {
  font-size: 0.875rem;
}

/* 縮小按鈕內部間距 */
.btn-group .btn {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* 添加滑鼠懸停效果 */
.btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}

/* 添加過渡效果 */
.btn, .form-control, .form-select, .badge {
  transition: all 0.2s ease;
}

/* 改善輸入框樣式 */
.form-control:focus, .form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

/* 避免進階搜尋和篩選條件顯示的跳動感 */
.mb-4 {
  margin-bottom: 1.5rem !important;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

/* 讓按鈕更緊湊 */
.gap-2 {
  gap: 0.5rem !important;
}

/* 讓標籤更緊湊 */
.gap-1 {
  gap: 0.25rem !important;
}
</style>
