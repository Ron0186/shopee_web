<template>
  <div class="product-detail-container">
    <!-- 商品圖片區域 -->
    <div class="product-gallery">
      <div
        v-if="hasProductImages"
        id="productImagesCarousel"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <div class="carousel-inner">
          <div
            v-for="(image, index) in allProductImages"
            :key="index"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <img
              :src="getImageUrl(image)"
              class="d-block w-100"
              alt="商品圖片"
              @error="handleImageError"
            />
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#productImagesCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#productImagesCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
        <div class="carousel-indicators">
          <button
            v-for="(image, index) in allProductImages"
            :key="index"
            type="button"
            data-bs-target="#productImagesCarousel"
            :data-bs-slide-to="index"
            :class="{ active: index === 0 }"
            :aria-current="index === 0"
            :aria-label="'Slide ' + (index + 1)"
          ></button>
        </div>
      </div>
      <img
        v-else
        src="/assets/default-image.png"
        class="d-block w-100"
        alt="商品圖片預設"
      />

      <!-- 縮圖區域 -->
      <div v-if="allProductImages.length > 1" class="image-thumbnails mt-2">
        <img
          v-for="(image, index) in allProductImages"
          :key="index"
          :src="getImageUrl(image)"
          class="thumbnail-img"
          :class="{ active: index === currentSlideIndex }"
          @click="goToSlide(index)"
          @error="handleImageError"
        />
      </div>
    </div>

    <!-- 商品主要資訊 -->
    <div class="product-info">
      <h1>{{ productDetail.name }}</h1>
      <div class="product-id">商品編號: {{ productDetail.productId }}</div>

      <!-- 商品評分 -->
      <div class="product-rating">
        <span
          v-for="i in 5"
          :key="i"
          :class="i <= productDetail.avgRating ? 'star-filled' : 'star-empty'"
          >★</span
        >
        <span class="rating-count"
          >{{ productDetail.reviewCount || 0 }} 評價</span
        >
      </div>

      <!-- 商品價格 -->
      <div class="product-price">
        <span v-if="productDetail.minPrice === productDetail.maxPrice">
          NT${{ formatPrice(productDetail.minPrice) }}
        </span>
        <span v-else>
          NT${{ formatPrice(productDetail.minPrice) }} - NT${{
            formatPrice(productDetail.maxPrice)
          }}
        </span>
      </div>

      <!-- 顏色選擇 -->
      <div
        class="selection-area"
        v-if="productDetail.colors && productDetail.colors.length > 0"
      >
        <div class="selection-label">顏色：</div>
        <div class="color-options">
          <div
            v-for="color in productDetail.colors"
            :key="color.id"
            class="color-option"
            :class="{ active: selectedColor && selectedColor.id === color.id }"
            @click="selectColor(color)"
          >
            <div
              class="color-circle"
              :style="{ backgroundColor: color.code }"
            ></div>
            <div class="color-name">{{ color.name }}</div>
          </div>
        </div>
      </div>

      <!-- 尺寸選擇 -->
      <div
        class="selection-area"
        v-if="productDetail.sizes && productDetail.sizes.length > 0"
      >
        <div class="selection-label">
          尺寸：<a
            href="#"
            @click.prevent="showSizeChart"
            class="size-chart-link"
            >尺寸相關資訊</a
          >
        </div>
        <div class="size-options">
          <button
            v-for="size in productDetail.sizes"
            :key="size.id"
            class="size-option"
            :class="{
              active: selectedSize && selectedSize.id === size.id,
              disabled: !isSizeAvailable(size),
            }"
            :disabled="!isSizeAvailable(size)"
            @click="selectSize(size)"
          >
            {{ size.name }}
          </button>
        </div>
      </div>

      <!-- 數量選擇 -->
      <div class="quantity-section">
        <div class="quantity-control">
          <button
            @click="decreaseQuantity"
            class="qty-btn"
            :disabled="quantity <= 1"
          >
            －
          </button>
          <input
            type="number"
            v-model="quantity"
            min="1"
            :max="currentStock"
            class="qty-input"
          />
          <button
            @click="increaseQuantity"
            class="qty-btn"
            :disabled="quantity >= currentStock"
          >
            ＋
          </button>
        </div>
        <div class="stock-info" v-if="currentStock > 0">庫存充足</div>
        <div class="stock-info out-of-stock" v-else>庫存不足</div>
      </div>

      <!-- 操作按鈕區域 -->
      <div class="action-buttons">
        <button
          @click="addToCart"
          class="btn btn-add-cart"
          :disabled="!canAddToCart"
        >
          加入購物車
        </button>
      </div>
    </div>
  </div>

  <!-- 商品詳細資訊標籤頁 -->
  <div class="product-tabs">
    <ul class="nav nav-tabs" id="productTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="details-tab"
          data-bs-toggle="tab"
          data-bs-target="#details"
          type="button"
          role="tab"
          aria-controls="details"
          aria-selected="true"
        >
          商品詳情
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="reviews-tab"
          data-bs-toggle="tab"
          data-bs-target="#reviews"
          type="button"
          role="tab"
          aria-controls="reviews"
          aria-selected="false"
        >
          顧客評價
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="shipping-tab"
          data-bs-toggle="tab"
          data-bs-target="#shipping"
          type="button"
          role="tab"
          aria-controls="shipping"
          aria-selected="false"
        >
          配送與退貨
        </button>
      </li>
    </ul>
    <div class="tab-content" id="productTabsContent">
      <!-- 商品詳情內容 -->
      <div
        class="tab-pane fade show active"
        id="details"
        role="tabpanel"
        aria-labelledby="details-tab"
      >
        <div
          class="product-description"
          v-html="productDetail.description"
        ></div>

        <div class="product-specifications">
          <h4>商品規格</h4>
          <table class="specs-table">
            <tr v-for="(value, key) in productSpecs" :key="key">
              <th>{{ key }}</th>
              <td>{{ value }}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 顧客評價內容 -->
      <div
        class="tab-pane fade"
        id="reviews"
        role="tabpanel"
        aria-labelledby="reviews-tab"
      >
        <div class="reviews-summary">
          <div class="average-rating">
            <div class="rating-number">{{ productDetail.avgRating || 0 }}</div>
            <div class="rating-stars">
              <span
                v-for="i in 5"
                :key="i"
                :class="
                  i <= productDetail.avgRating ? 'star-filled' : 'star-empty'
                "
                >★</span
              >
            </div>
            <div class="rating-count">
              {{ productDetail.reviewCount || 0 }} 個評價
            </div>
          </div>

          <div class="rating-bars">
            <div v-for="i in 5" :key="i" class="rating-bar-item">
              <div class="rating-label">{{ 6 - i }}星</div>
              <div class="rating-bar">
                <div
                  class="rating-bar-fill"
                  :style="{ width: getRatingPercentage(6 - i) + '%' }"
                ></div>
              </div>
              <div class="rating-percentage">
                {{ getRatingPercentage(6 - i) }}%
              </div>
            </div>
          </div>
        </div>

        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">目前尚無評價</div>
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-name">{{ review.userName }}</div>
              <div class="review-date">{{ formatDate(review.createdAt) }}</div>
            </div>
            <div class="review-rating">
              <span
                v-for="i in 5"
                :key="i"
                :class="i <= review.rating ? 'star-filled' : 'star-empty'"
                >★</span
              >
            </div>
            <div class="review-content">{{ review.content }}</div>
            <div
              v-if="review.images && review.images.length > 0"
              class="review-images"
            >
              <img
                v-for="(image, index) in review.images"
                :key="index"
                :src="image"
                alt="評價圖片"
                class="review-image"
                @click="openReviewImage(image)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 配送與退貨內容 -->
      <div
        class="tab-pane fade"
        id="shipping"
        role="tabpanel"
        aria-labelledby="shipping-tab"
      >
        <div class="shipping-info">
          <h4>配送資訊</h4>
          <p>我們提供以下配送方式：</p>
          <ul>
            <li>宅配到府：3-5 個工作天</li>
            <li>超商取貨：3-5 個工作天</li>
            <li>門市自取：商品備妥後會通知取貨</li>
          </ul>

          <h4>退換貨政策</h4>
          <p>
            收到商品後，您可以在 7 天內申請退換貨。以下情況不適用於退換貨政策：
          </p>
          <ul>
            <li>商品已拆封使用或受損</li>
            <li>商品配件、贈品或包裝不完整</li>
            <li>客製化或特殊訂製商品</li>
          </ul>

          <p>如需退換貨，請先聯繫客服取得退貨授權。</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 尺寸表Modal -->
  <div
    class="modal fade"
    id="sizeChartModal"
    tabindex="-1"
    aria-labelledby="sizeChartModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="sizeChartModalLabel">尺寸對照表</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="size-chart-container">
            <!-- 尺寸表內容將根據商品類型顯示不同的表格 -->
            <table class="size-chart-table">
              <thead>
                <tr>
                  <th>尺寸</th>
                  <th>胸圍 (cm)</th>
                  <th>腰圍 (cm)</th>
                  <th>臀圍 (cm)</th>
                  <th>建議身高 (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="size in productDetail.sizes" :key="size.id">
                  <td>{{ size.name }}</td>
                  <td>{{ size.chest || "-" }}</td>
                  <td>{{ size.waist || "-" }}</td>
                  <td>{{ size.hip || "-" }}</td>
                  <td>{{ size.height || "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 圖片畫廊Modal -->
  <div
    class="modal fade"
    id="inlineGalleryModal"
    tabindex="-1"
    aria-labelledby="galleryModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="galleryModalLabel">商品圖片集</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="gallery-navigation">
            <button @click="galleryPrevImage" class="gallery-nav-btn prev">
              <i class="bi bi-chevron-left"></i>
            </button>

            <div class="gallery-main-image">
              <img
                :src="getImageUrl(allProductImages[galleryActiveIndex])"
                alt="商品圖片"
                @error="handleImageError"
              />
            </div>

            <button @click="galleryNextImage" class="gallery-nav-btn next">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <div class="gallery-thumbnails">
            <div
              v-for="(image, index) in allProductImages"
              :key="index"
              class="gallery-thumbnail"
              :class="{ active: index === galleryActiveIndex }"
              @click="galleryActiveIndex = index"
            >
              <img
                :src="getImageUrl(image)"
                alt="縮圖"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/userStore"; // 假設有用戶存儲

// 路由相關
const route = useRoute();
const router = useRouter();
const productId = parseInt(route.params.productId) || null;
const userStore = useUserStore();

// 基本設定
const baseUrl = ref(import.meta.env.VITE_API_URL || "");
const defaultImage = "/assets/default-image.png";

// 商品數據
const productDetail = ref({});

// 打開評價圖片
const openReviewImage = (imageUrl) => {
  Swal.fire({
    imageUrl,
    imageAlt: "評價圖片",
    showCloseButton: true,
    showConfirmButton: false,
  });
};

// 追踪轮播图滑动事件
const trackCarouselSlide = () => {
  const carouselElement = document.getElementById("productImagesCarousel");
  if (!carouselElement) return;

  carouselElement.addEventListener("slid.bs.carousel", (event) => {
    currentSlideIndex.value = event.to;
  });
};

// 元件掛載時獲取商品詳情
onMounted(async () => {
  if (!productId) {
    console.error("無效的商品 ID");
    router.push("/");
    return;
  }

  await fetchProductDetail();

  // 確保 Bootstrap 可用
  setTimeout(() => {
    if (typeof bootstrap === "undefined") {
      console.error("Bootstrap 未加載!");
      try {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js";
        script.integrity =
          "sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p";
        script.crossOrigin = "anonymous";
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          console.log("Bootstrap 已手動加載");
          initBootstrapComponents();
        };
      } catch (e) {
        console.error("嘗試手動加載 Bootstrap 失敗", e);
      }
    } else {
      initBootstrapComponents();
    }
  }, 500);
});

// 初始化 Bootstrap 組件
const initBootstrapComponents = () => {
  try {
    // 初始化輪播
    const carouselElement = document.getElementById("productImagesCarousel");
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        touch: true,
        ride: false, // 允許手動控制
      });

      // 添加輪播事件監聽
      trackCarouselSlide();
    }
  } catch (error) {
    console.error("初始化 Bootstrap 組件時出錯:", error);
  }
};
const reviews = ref([]);
const currentSlideIndex = ref(0);
const galleryActiveIndex = ref(0);

// 用戶選擇
const selectedColor = ref(null);
const selectedSize = ref(null);
const quantity = ref(1);
const currentStock = ref(0);
const selectedSku = ref(null);

// 獲取商品資訊
const fetchProductDetail = async () => {
  try {
    // 使用 public API 端點獲取商品詳情
    const response = await axios.get(`/api/front/products/${productId}`);

    if (response.data) {
      productDetail.value = response.data;
      console.log("獲取到商品詳情:", productDetail.value);

      // 獲取商品的評價
      fetchProductReviews();

      // 獲取商品圖片
      if (
        !productDetail.value.productImages ||
        productDetail.value.productImages.length === 0
      ) {
        fetchProductImages();
      }

      // 獲取商品的 SKUs
      fetchProductSkus();

      // 初始化選擇項（如果有顏色和尺寸）
      if (productDetail.value.colors && productDetail.value.colors.length > 0) {
        selectedColor.value = productDetail.value.colors[0];
      }

      if (productDetail.value.sizes && productDetail.value.sizes.length > 0) {
        selectedSize.value = productDetail.value.sizes[0];
      }

      // 更新庫存
      updateCurrentStock();
    }
  } catch (error) {
    console.error("獲取商品詳情錯誤:", error);
    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取商品詳情",
      icon: "error",
    });
  }
};

// 獲取商品圖片
const fetchProductImages = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}/images`);

    if (response.data && Array.isArray(response.data)) {
      console.log("獲取到的商品圖片:", response.data);
      productDetail.value.productImages = response.data;
    } else {
      console.error("獲取商品圖片格式錯誤:", response.data);
    }
  } catch (error) {
    console.error("獲取商品圖片錯誤:", error);
  }
};

// 獲取商品 SKUs
const fetchProductSkus = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}/skus`);

    if (response.data && Array.isArray(response.data)) {
      productDetail.value.skus = response.data;
      console.log("獲取到商品 SKUs:", productDetail.value.skus);

      // 更新庫存
      updateCurrentStock();
    }
  } catch (error) {
    console.error("獲取商品 SKUs 錯誤:", error);
  }
};

// 獲取商品評價
const fetchProductReviews = async () => {
  try {
    const response = await axios.get(`/api/review/product/${productId}`);

    if (response.data && Array.isArray(response.data)) {
      reviews.value = response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      reviews.value = response.data.content;
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error("獲取商品評價錯誤:", error);
    reviews.value = [];
  }
};

// 計算各星級評價的百分比
const getRatingPercentage = (stars) => {
  if (!reviews.value.length) return 0;

  const count = reviews.value.filter(
    (review) => review.rating === stars
  ).length;
  return Math.round((count / reviews.value.length) * 100);
};

// 從各種來源獲取所有商品圖片
const allProductImages = computed(() => {
  if (!productDetail.value) return [];

  // 如果有 productImages 數組，優先使用它
  if (
    productDetail.value.productImages &&
    productDetail.value.productImages.length > 0
  ) {
    return productDetail.value.productImages;
  }

  // 使用可能的其他圖片來源
  const images = [];

  // 檢查 primaryImageUrl
  if (productDetail.value.primaryImageUrl) {
    images.push({
      imagePath: productDetail.value.primaryImageUrl,
      isPrimary: true,
    });
  }

  // 檢查 image
  if (
    productDetail.value.image &&
    productDetail.value.image !== productDetail.value.primaryImageUrl
  ) {
    images.push({
      imagePath: productDetail.value.image,
      isPrimary: !productDetail.value.primaryImageUrl,
    });
  }

  return images;
});

// 判斷是否有商品圖片
const hasProductImages = computed(() => {
  return allProductImages.value.length > 0;
});

// 獲取主圖
const primaryImage = computed(() => {
  // 查找標記為主圖的圖片
  const primary = allProductImages.value.find((img) => img.isPrimary);
  if (primary) return primary;

  // 如果沒有標記主圖，使用第一張圖片
  return allProductImages.value.length > 0 ? allProductImages.value[0] : null;
});

// 獲取非主圖的圖片
const nonPrimaryImages = computed(() => {
  if (!primaryImage.value) return allProductImages.value;

  return allProductImages.value.filter((img) => !isPrimaryImage(img));
});

// 總圖片數
const totalImages = computed(() => {
  return allProductImages.value.length;
});

// 判斷是否為主圖
const isPrimaryImage = (image) => {
  if (!image) return false;

  // 直接檢查 isPrimary 屬性
  if (image.isPrimary !== undefined) return image.isPrimary;

  // 如果沒有 isPrimary 屬性，與主圖比較路徑
  if (primaryImage.value) {
    return image.imagePath === primaryImage.value.imagePath;
  }

  return false;
};

// 獲取圖片 URL
const getImageUrl = (image) => {
  if (!image) return defaultImage;

  const imagePath = image.imagePath || image.path || image.url;
  if (!imagePath) return defaultImage;

  return imagePath.startsWith("http")
    ? imagePath
    : `${baseUrl.value}${imagePath}`;
};

// 處理圖片加載錯誤
const handleImageError = (e) => {
  console.log("圖片載入失敗，使用預設圖片");
  e.target.src = defaultImage;
};

// 輪播控制
const goToSlide = (index) => {
  // 獲取輪播組件實例
  const carousel = bootstrap?.Carousel?.getInstance("#productImagesCarousel");
  if (carousel) {
    carousel.to(index);
    currentSlideIndex.value = index;
  } else {
    console.warn("Bootstrap Carousel 實例未找到");
  }
};

// 畫廊導航 - 上一張圖片
const galleryPrevImage = () => {
  if (galleryActiveIndex.value > 0) {
    galleryActiveIndex.value--;
  } else {
    galleryActiveIndex.value = totalImages.value - 1;
  }
};

// 畫廊導航 - 下一張圖片
const galleryNextImage = () => {
  if (galleryActiveIndex.value < totalImages.value - 1) {
    galleryActiveIndex.value++;
  } else {
    galleryActiveIndex.value = 0;
  }
};

// 打開圖片畫廊
const openGalleryView = () => {
  try {
    // 設置畫廊當前索引與輪播同步
    galleryActiveIndex.value = currentSlideIndex.value;

    const modalElement = document.getElementById("inlineGalleryModal");
    if (!modalElement) {
      console.error("未找到圖片畫廊模態框元素");
      return;
    }

    // 嘗試獲取或創建 Modal 實例
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }

    // 顯示模態框
    modal.show();
  } catch (error) {
    console.error("打開圖片模態框時出錯:", error);
  }
};

// 打開尺寸表
const showSizeChart = () => {
  try {
    const modalElement = document.getElementById("sizeChartModal");
    if (!modalElement) {
      console.error("未找到尺寸表模態框元素");
      return;
    }

    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }

    modal.show();
  } catch (error) {
    console.error("打開尺寸表模態框時出錯:", error);
  }
};

// 選擇顏色
const selectColor = (color) => {
  selectedColor.value = color;
  updateCurrentStock();
};

// 選擇尺寸
const selectSize = (size) => {
  selectedSize.value = size;
  updateCurrentStock();
};

// 判斷尺寸是否可選
const isSizeAvailable = (size) => {
  // 根據已選顏色檢查庫存
  return true; // 示例：暫時所有尺寸都可選
};

// 更新當前可用庫存和選中的 SKU
const updateCurrentStock = () => {
  if (
    !selectedColor.value ||
    !selectedSize.value ||
    !productDetail.value.skus
  ) {
    currentStock.value = 0;
    selectedSku.value = null;
    return;
  }

  // 尋找匹配的 SKU
  const matchingSku = productDetail.value.skus.find(
    (sku) =>
      sku.colorId === selectedColor.value.id &&
      sku.sizeId === selectedSize.value.id
  );

  if (matchingSku) {
    currentStock.value = matchingSku.stock || 0;
    selectedSku.value = matchingSku;
  } else {
    currentStock.value = 0;
    selectedSku.value = null;
  }
};

// 商品規格信息
const productSpecs = computed(() => {
  if (!productDetail.value || !productDetail.value.specifications) return {};
  try {
    return JSON.parse(productDetail.value.specifications || "{}");
  } catch (e) {
    console.error("解析商品規格錯誤:", e);
    return {};
  }
});

// 格式化價格顯示
const formatPrice = (price) => {
  if (!price) return "0";
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 格式化日期顯示
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW");
};

// 增加數量
const increaseQuantity = () => {
  if (quantity.value < currentStock.value) {
    quantity.value++;
  }
};

// 減少數量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 檢查是否可以加入購物車
const canAddToCart = computed(() => {
  return (
    selectedColor.value &&
    selectedSize.value &&
    selectedSku.value &&
    currentStock.value > 0 &&
    quantity.value <= currentStock.value &&
    userStore.isLoggedIn
  );
});

// 加入購物車
const addToCart = async () => {
  if (!canAddToCart.value) {
    let errorMessage = "無法加入購物車";

    if (!userStore.isLoggedIn) {
      errorMessage = "請先登入再加入購物車";
      Swal.fire({
        title: "請先登入",
        text: "請登入後再加入購物車",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "前往登入",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login?redirect=" + encodeURIComponent(route.fullPath));
        }
      });
      return;
    }

    if (!selectedColor.value || !selectedSize.value) {
      errorMessage = "請選擇顏色和尺寸";
    } else if (currentStock.value <= 0) {
      errorMessage = "商品庫存不足";
    }

    Swal.fire({
      title: "無法加入購物車",
      text: errorMessage,
      icon: "warning",
    });
    return;
  }

  try {
    // 構建購物車項目數據
    const cartRequest = {
      userId: userStore.userId,
      skuId: selectedSku.value.skuId,
      quantity: quantity.value,
    };

    // 調用加入購物車 API
    const response = await axios.post("/api/cart/add", cartRequest);

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "加入成功",
        text: "商品已加入購物車",
        icon: "success",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("加入購物車失敗:", error);
    Swal.fire({
      title: "加入失敗",
      text: error.response?.data || "無法加入購物車，請稍後再試",
      icon: "error",
    });
  }
};
</script>
