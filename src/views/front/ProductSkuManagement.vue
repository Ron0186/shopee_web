<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="`/store/${shopId}`" class="text-primary"
            >賣家中心</router-link
          >
        </li>
        <li class="breadcrumb-item">
          <router-link
            :to="`/seller/shops/${shopId}/products`"
            class="text-primary"
            >商品管理</router-link
          >
        </li>
        <li class="breadcrumb-item active" aria-current="page">SKU 管理</li>
      </ol>
    </nav>

    <!-- Main Card -->
    <div class="card shadow-sm mb-4">
      <div
        class="card-header d-flex justify-content-between align-items-center py-3 bg-white"
      >
        <h3 class="mb-0 fs-4 fw-bold text-dark">
          SKU 管理 - {{ productInfo.productName }}
        </h3>
        <router-link
          :to="`/seller/shops/${shopId}/products`"
          class="btn btn-outline-secondary d-flex align-items-center"
        >
          <i class="bi bi-arrow-left me-1"></i> 返回商品列表
        </router-link>
      </div>
      <div class="card-body">
        <div class="row g-4 mb-4">
          <!-- Product Info -->
          <div class="col-md-6">
            <div class="card border h-100">
              <div class="table-responsive">
                <table class="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <th class="bg-light w-25 py-3">商品 ID</th>
                      <td class="py-3">{{ productInfo.productId }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light py-3">商品名稱</th>
                      <td class="py-3">{{ productInfo.productName }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light py-3">狀態</th>
                      <td class="py-3">
                        <span
                          class="badge"
                          :class="
                            productInfo.active ? 'bg-success' : 'bg-warning'
                          "
                        >
                          {{ productInfo.active ? "上架" : "審核中" }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Image Gallery -->
          <div class="col-md-6">
            <div v-if="hasProductImages" class="card border h-100">
              <div class="position-relative">
                <!-- Main Carousel -->
                <div
                  id="productImagesCarousel"
                  class="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div class="carousel-inner">
                    <!-- Primary Image -->
                    <div v-if="primaryImage" class="carousel-item active">
                      <div
                        class="d-flex justify-content-center align-items-center bg-light"
                        style="height: 320px"
                      >
                        <img
                          :src="getImageUrl(primaryImage)"
                          alt="商品主图"
                          class="d-block product-thumbnail"
                          style="
                            max-height: 300px;
                            max-width: 90%;
                            object-fit: contain;
                          "
                          @error="handleImageError"
                        />
                      </div>
                      <div class="position-absolute top-0 start-0 m-2">
                        <span class="badge bg-primary">主圖</span>
                      </div>
                    </div>

                    <!-- Other Images -->
                    <div
                      v-for="(image, index) in nonPrimaryImages"
                      :key="index"
                      class="carousel-item"
                    >
                      <div
                        class="d-flex justify-content-center align-items-center bg-light"
                        style="height: 320px"
                      >
                        <img
                          :src="getImageUrl(image)"
                          alt="商品圖片"
                          class="d-block product-thumbnail"
                          style="
                            max-height: 300px;
                            max-width: 90%;
                            object-fit: contain;
                          "
                          @error="handleImageError"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Image Counter -->
                  <div
                    class="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
                    style="background-color: rgba(0, 0, 0, 0.5)"
                  >
                    <small class="text-white"
                      >{{ currentSlideIndex + 1 }} / {{ totalImages }}</small
                    >
                  </div>

                  <!-- Carousel Controls -->
                  <button
                    v-if="totalImages > 1"
                    class="carousel-control-prev"
                    type="button"
                    data-bs-target="#productImagesCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      class="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span class="visually-hidden">上一張</span>
                  </button>
                  <button
                    v-if="totalImages > 1"
                    class="carousel-control-next"
                    type="button"
                    data-bs-target="#productImagesCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      class="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span class="visually-hidden">下一張</span>
                  </button>
                </div>
              </div>

              <!-- Thumbnails -->
              <div v-if="totalImages > 1" class="thumbnail-nav p-2 border-top">
                <div class="d-flex gap-2 overflow-auto py-2 px-1">
                  <div
                    v-for="(image, index) in allProductImages"
                    :key="index"
                    @click="goToSlide(index)"
                    class="thumbnail-item position-relative cursor-pointer"
                    :class="{ 'active-thumbnail': index === currentSlideIndex }"
                  >
                    <img
                      :src="getImageUrl(image)"
                      alt="商品縮略圖"
                      style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 4px;
                      "
                      :class="
                        index === currentSlideIndex
                          ? 'border border-2 border-primary'
                          : 'border'
                      "
                    />
                    <span
                      v-if="isPrimaryImage(image)"
                      class="position-absolute top-0 start-0 p-1"
                      style="
                        font-size: 8px;
                        line-height: 1;
                        border-radius: 0 0 4px 0;
                        background-color: var(--bs-primary);
                        color: white;
                      "
                    >
                      主圖
                    </span>
                  </div>
                </div>
              </div>

              <!-- Gallery Controls -->
              <div
                class="card-footer bg-light d-flex justify-content-between align-items-center py-2"
              >
                <small class="text-muted">共 {{ totalImages }} 張圖片</small>
                <div class="btn-group" role="group">
                  <button
                    v-if="totalImages > 1"
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="openFullscreenView"
                    title="全屏查看"
                  >
                    <i class="bi bi-fullscreen"></i>
                  </button>
                  <button
                    v-if="totalImages > 1"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="openGalleryView"
                  >
                    查看所有圖片
                  </button>
                </div>
              </div>
            </div>

            <!-- No Image Placeholder -->
            <div v-else class="card border h-100">
              <div
                class="d-flex align-items-center justify-content-center h-100 bg-light"
              >
                <div class="text-center text-muted">
                  <i class="bi bi-image fs-1"></i>
                  <p class="mt-2">無商品圖片</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SKU Management Section -->
        <div class="sku-management-section">
          <div
            class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3"
          >
            <h4 class="mb-0">SKU 列表</h4>
            <div>
              <button class="btn btn-success" @click="showAddModal = true">
                <i class="bi bi-plus-lg"></i> 新增 SKU
              </button>
            </div>
          </div>

          <!-- Page Size Control -->
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <span class="me-2">每頁顯示：</span>
              <select
                v-model="pageSize"
                class="form-select form-select-sm"
                style="width: auto"
                @change="onPageSizeChange"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>

          <!-- SKU List -->
          <div v-if="skuList.length > 0">
            <div class="table-responsive">
              <table class="table table-hover border">
                <thead class="table-light">
                  <tr>
                    <th class="py-3">SKU ID</th>
                    <th class="py-3">規格</th>
                    <th class="py-3">庫存</th>
                    <th class="py-3">價格</th>
                    <th class="py-3 text-center" style="width: 180px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sku in skuList" :key="sku.id || sku.skuId">
                    <td class="py-3">{{ sku.id || sku.skuId }}</td>
                    <td class="py-3">
                      <div
                        v-for="(value, key) in sku.specPairs"
                        :key="key"
                        class="badge bg-light text-dark me-1 mb-1 p-2"
                      >
                        <span class="fw-bold">{{ key }}:</span>
                        <span>{{ value }}</span>
                      </div>
                    </td>
                    <td class="py-3">{{ sku.stock }}</td>
                    <td class="py-3">NT$ {{ formatPrice(sku.price) }}</td>
                    <td class="py-3">
                      <div class="d-flex justify-content-center gap-1">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          @click="openStockModal(sku)"
                          title="調整庫存"
                        >
                          <i class="bi bi-box"></i>
                        </button>
                        <button
                          class="btn btn-outline-success btn-sm"
                          @click="openPriceModal(sku)"
                          title="調整價格"
                        >
                          <i class="bi bi-currency-dollar"></i>
                        </button>
                        <button
                          class="btn btn-danger btn-sm"
                          @click="deleteSku(sku)"
                          title="刪除SKU"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav
              v-if="totalPages > 1"
              aria-label="SKU list pagination"
              class="mt-3"
            >
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="changePage(currentPage - 1)"
                    >上一頁</a
                  >
                </li>
                <li
                  v-for="page in paginationItems"
                  :key="page.value"
                  class="page-item"
                  :class="{ active: page.active, disabled: page.disabled }"
                >
                  <a
                    v-if="!page.disabled"
                    class="page-link"
                    href="#"
                    @click.prevent="changePage(page.value)"
                  >
                    {{ page.label }}
                  </a>
                  <span v-else class="page-link">{{ page.label }}</span>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages - 1 }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="changePage(currentPage + 1)"
                    >下一頁</a
                  >
                </li>
              </ul>
            </nav>
          </div>
          <div v-else class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i> 該商品尚未設定
            SKU。請點擊「新增 SKU」按鈕建立規格。
          </div>
        </div>
      </div>
    </div>

    <!-- Image Gallery Modal -->
    <div
      class="modal fade"
      id="inlineGalleryModal"
      tabindex="-1"
      aria-labelledby="galleryModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="galleryModalLabel">商品圖片庫</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Large Image Preview -->
            <div class="text-center mb-4 position-relative">
              <img
                :src="getImageUrl(allProductImages[galleryActiveIndex])"
                class="img-fluid"
                alt="商品圖片預覽"
                style="max-height: 300px; object-fit: contain"
              />
              <!-- Navigation Arrows -->
              <button
                v-if="totalImages > 1"
                class="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle p-1"
                @click="galleryPrevImage"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button
                v-if="totalImages > 1"
                class="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle p-1"
                @click="galleryNextImage"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <!-- Image Counter -->
              <div
                class="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
                style="background-color: rgba(0, 0, 0, 0.5)"
              >
                <small class="text-white"
                  >{{ galleryActiveIndex + 1 }} / {{ totalImages }}</small
                >
              </div>
            </div>

            <!-- Thumbnail Grid -->
            <div class="row g-2">
              <div
                v-for="(image, index) in allProductImages"
                :key="index"
                class="col-4 col-md-3 col-lg-2"
              >
                <div
                  class="card h-100"
                  :class="{ 'border-primary': index === galleryActiveIndex }"
                  style="cursor: pointer"
                  @click="galleryActiveIndex = index"
                >
                  <div class="position-relative">
                    <img
                      :src="getImageUrl(image)"
                      class="card-img-top"
                      alt="商品圖片"
                      style="height: 80px; object-fit: cover"
                    />
                    <span
                      v-if="isPrimaryImage(image)"
                      class="position-absolute top-0 start-0 badge bg-primary"
                      style="border-radius: 0 0 4px 0"
                      >主圖</span
                    >
                  </div>
                  <div
                    class="card-footer p-1 d-flex justify-content-between align-items-center"
                  >
                    <small class="text-muted">圖 {{ index + 1 }}</small>
                    <button
                      v-if="!isPrimaryImage(image)"
                      class="btn btn-sm btn-outline-primary py-0 px-1"
                      style="font-size: 0.7rem"
                      @click.stop="setPrimaryImage({ image, index })"
                    >
                      設主圖
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (unchanged - just references) -->
    <sku-add-modal
      :is-open="showAddModal"
      :product-id="productId"
      @close="showAddModal = false"
      @refresh="fetchSkuList"
    />
    <sku-edit-modal
      :is-open="showEditModal"
      :sku-data="selectedSku"
      @close="showEditModal = false"
      @refresh="fetchSkuList"
    />
    <stock-update-modal
      :is-open="showStockModal"
      :sku-data="selectedSku"
      @close="showStockModal = false"
      @refresh="fetchSkuList"
    />
    <price-update-modal
      :is-open="showPriceModal"
      :sku-data="selectedSku"
      @close="showPriceModal = false"
      @refresh="fetchSkuList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import SkuAddModal from "@/components/sku.components/SkuAddModal.vue";
import SkuEditModal from "@/components/sku.components/SkuEditModal.vue";
import StockUpdateModal from "@/components/sku.components/StockUpdateModal.vue";
import PriceUpdateModal from "@/components/sku.components/PriceUpdateModal.vue";

const route = useRoute();
const router = useRouter();
const productId = parseInt(route.params.productId) || null;
const shopId = parseInt(route.params.shopId) || null;

// User info
const userStore = useUserStore();
const token = userStore.token;
const baseUrl = ref(import.meta.env.VITE_API_URL);
const defaultImage = "/assets/default-image.png"; // Default image path

// Data states
const productInfo = ref({});
const skuList = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showStockModal = ref(false);
const showPriceModal = ref(false);
const selectedSku = ref(null);
const currentSlideIndex = ref(0); // Current carousel index
const galleryActiveIndex = ref(0); // Gallery modal index

// Get product image source
const fetchProductImages = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}/images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      console.log("Retrieved product images:", response.data);
      productInfo.value.productImages = response.data;
    } else {
      console.error("Product image format error:", response.data);
    }
  } catch (error) {
    console.error("Error fetching product images:", error);
  }
};

// Get all product images from various sources
const allProductImages = computed(() => {
  if (!productInfo.value) return [];

  // If productImages array exists, use it first
  if (
    productInfo.value.productImages &&
    productInfo.value.productImages.length > 0
  ) {
    return productInfo.value.productImages;
  }

  // Use other possible image sources
  const images = [];

  // Check primaryImageUrl
  if (productInfo.value.primaryImageUrl) {
    images.push({
      imagePath: productInfo.value.primaryImageUrl,
      isPrimary: true,
    });
  }

  // Check image
  if (
    productInfo.value.image &&
    productInfo.value.image !== productInfo.value.primaryImageUrl
  ) {
    images.push({
      imagePath: productInfo.value.image,
      isPrimary: !productInfo.value.primaryImageUrl,
    });
  }

  return images;
});

// Check if product has images
const hasProductImages = computed(() => {
  return allProductImages.value.length > 0;
});

// Get primary image
const primaryImage = computed(() => {
  // Find image marked as primary
  const primary = allProductImages.value.find((img) => img.isPrimary);
  if (primary) return primary;

  // If no primary image marked, use first image
  return allProductImages.value.length > 0 ? allProductImages.value[0] : null;
});

// Get non-primary images
const nonPrimaryImages = computed(() => {
  if (!primaryImage.value) return allProductImages.value;

  return allProductImages.value.filter((img) => !isPrimaryImage(img));
});

// Total image count
const totalImages = computed(() => {
  return allProductImages.value.length;
});

// Check if image is primary
const isPrimaryImage = (image) => {
  if (!image) return false;

  // Check isPrimary property
  if (image.isPrimary !== undefined) return image.isPrimary;

  // Compare with primary image path
  if (primaryImage.value) {
    return image.imagePath === primaryImage.value.imagePath;
  }

  return false;
};

// Get image URL
const getImageUrl = (image) => {
  if (!image) return defaultImage;

  const imagePath = image.imagePath || image.path || image.url;
  if (!imagePath) return defaultImage;

  return imagePath.startsWith("http")
    ? imagePath
    : `${baseUrl.value}${imagePath}`;
};

// Track carousel slide events
const trackCarouselSlide = () => {
  const carouselElement = document.getElementById("productImagesCarousel");
  if (!carouselElement) return;

  carouselElement.addEventListener("slid.bs.carousel", (event) => {
    currentSlideIndex.value = event.to;
  });
};

// Fullscreen view method
const openFullscreenView = () => {
  try {
    const carouselElement = document.getElementById("productImagesCarousel");

    if (carouselElement.requestFullscreen) {
      carouselElement.requestFullscreen();
    } else if (carouselElement.webkitRequestFullscreen) {
      /* Safari */
      carouselElement.webkitRequestFullscreen();
    } else if (carouselElement.msRequestFullscreen) {
      /* IE11 */
      carouselElement.msRequestFullscreen();
    }
  } catch (error) {
    console.error("Error in fullscreen view:", error);
  }
};

// Carousel control
const goToSlide = (index) => {
  // Get carousel instance
  const carousel = bootstrap?.Carousel?.getInstance("#productImagesCarousel");
  if (carousel) {
    carousel.to(index);
  } else {
    console.warn("Bootstrap Carousel instance not found");
  }
};

// Open gallery view
const openGalleryView = () => {
  try {
    console.log("View all images button clicked");

    // Sync gallery index with carousel
    galleryActiveIndex.value = currentSlideIndex.value;

    if (typeof bootstrap === "undefined") {
      console.error("Bootstrap not loaded, cannot open modal");
      alert("Cannot open image gallery, system error");
      return;
    }

    const modalElement = document.getElementById("inlineGalleryModal");
    if (!modalElement) {
      console.error("Gallery modal element not found");
      alert("Cannot open image gallery, please refresh and try again");
      return;
    }

    // Get or create Modal instance
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }

    // Show modal
    modal.show();
    console.log("Image modal opened");
  } catch (error) {
    console.error("Error opening image modal:", error);
    alert("Cannot open image gallery, unknown error occurred");
  }
};

// Gallery navigation - previous image
const galleryPrevImage = () => {
  if (galleryActiveIndex.value > 0) {
    galleryActiveIndex.value--;
  } else {
    galleryActiveIndex.value = totalImages.value - 1;
  }
};

// Gallery navigation - next image
const galleryNextImage = () => {
  if (galleryActiveIndex.value < totalImages.value - 1) {
    galleryActiveIndex.value++;
  } else {
    galleryActiveIndex.value = 0;
  }
};

// Set primary image
const setPrimaryImage = async ({ image, index }) => {
  try {
    // Get correct image ID
    const imageId = image.id || image.imageId || index + 1;

    console.log("Preparing to set primary image:", { imageId, image });

    const apiPath = `/api/products/${productId}/images/${imageId}/primary`;
    console.log("Using API path:", apiPath);

    const response = await axios.put(
      apiPath,
      {}, // Empty request body
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // Update local image state
      allProductImages.value = allProductImages.value.map((img) => ({
        ...img,
        isPrimary: img === image,
      }));

      // Refresh product info
      await fetchProductInfo();
      Swal.fire({
        title: "設置成功",
        text: "已成功设置主图",
        icon: "success",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Failed to set primary image:", error);
    Swal.fire({
      title: "設置失敗",
      text: error.response?.data?.message || "无法设置主图，请稍后再试",
      icon: "error",
    });
  }
};

// Handle image load error
const handleImageError = (e) => {
  console.log("Image loading failed, using default image");
  e.target.src = defaultImage;
};

// Pagination navigation items
const paginationItems = computed(() => {
  const items = [];
  const maxVisible = 5; // Maximum visible page numbers
  let startPage = Math.max(
    0,
    Math.min(
      currentPage.value - Math.floor(maxVisible / 2),
      totalPages.value - maxVisible
    )
  );
  if (startPage < 0) startPage = 0;

  const endPage = Math.min(startPage + maxVisible - 1, totalPages.value - 1);

  // First page
  if (startPage > 0) {
    items.push({
      value: 0,
      label: "1",
      active: currentPage.value === 0,
      disabled: false,
    });
    if (startPage > 1) {
      items.push({ value: null, label: "...", active: false, disabled: true });
    }
  }

  // Middle pages
  for (let i = startPage; i <= endPage; i++) {
    items.push({
      value: i,
      label: (i + 1).toString(),
      active: currentPage.value === i,
      disabled: false,
    });
  }

  // Last page
  if (endPage < totalPages.value - 1) {
    if (endPage < totalPages.value - 2) {
      items.push({ value: null, label: "...", active: false, disabled: true });
    }
    items.push({
      value: totalPages.value - 1,
      label: totalPages.value.toString(),
      active: currentPage.value === totalPages.value - 1,
      disabled: false,
    });
  }

  return items;
});

// Format price display
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Get product details
const fetchProductInfo = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      console.log("Product API original response:", response.data);
      productInfo.value = response.data;
      console.log("Retrieved product details:", productInfo.value);

      // Log image-related fields
      console.log("Product image information:", {
        image: productInfo.value.image,
        primaryImageUrl: productInfo.value.primaryImageUrl,
        hasProductImages:
          productInfo.value.productImages &&
          productInfo.value.productImages.length > 0,
      });
    } else {
      console.error("Error in product details format:", response.data);
      router.push(`/seller/shops/${shopId}/products`);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取商品詳情",
      icon: "error",
    });
    router.push(`/seller/shops/${shopId}/products`);
  }
};

// Get product SKU list (paginated)
const fetchSkuList = async () => {
  try {
    console.log(
      "Fetching SKU list, Product ID:",
      productId,
      "Page:",
      currentPage.value,
      "Page size:",
      pageSize.value
    );

    const response = await axios.get(`/api/products/${productId}/skus/paged`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        _t: Date.now(), // Prevent caching
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("SKU pagination response:", response);

    if (response.data) {
      // Update SKU list and pagination info
      skuList.value = response.data.content || [];
      totalItems.value = response.data.totalElements || 0;
      totalPages.value = response.data.totalPages || 0;

      console.log("SKU data count:", skuList.value.length);
      console.log("Total items:", totalItems.value);
      console.log("Total pages:", totalPages.value);

      // Ensure current page is valid
      if (currentPage.value >= totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value - 1;
        fetchSkuList(); // Refetch with correct page
      }
    } else {
      console.error("SKU data format unexpected:", response.data);
      skuList.value = [];
      totalItems.value = 0;
      totalPages.value = 0;
    }
  } catch (error) {
    console.error("Error fetching SKU list:", error);
    console.error("Error details:", error.response || error.message);
    skuList.value = [];
    totalItems.value = 0;
    totalPages.value = 0;

    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取 SKU 列表",
      icon: "error",
    });
  }
};

// Change page
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchSkuList();
  }
};

// Change page size
const onPageSizeChange = () => {
  currentPage.value = 0; // Reset to first page
  fetchSkuList();
};

// Open edit modal
const openEditModal = (sku) => {
  selectedSku.value = { ...sku };
  showEditModal.value = true;
};

// Open stock adjustment modal
const openStockModal = (sku) => {
  selectedSku.value = { ...sku };
  showStockModal.value = true;
};

// Open price adjustment modal
const openPriceModal = (sku) => {
  selectedSku.value = { ...sku };
  showPriceModal.value = true;
};

// Delete SKU
const deleteSku = async (sku) => {
  try {
    // Ensure skuId is valid
    const skuId = sku.id || sku.skuId;

    if (!skuId) {
      console.error("Invalid SKU ID:", sku);
      Swal.fire({
        title: "刪除失敗",
        text: "無法獲取有效的 SKU ID",
        icon: "error",
      });
      return;
    }

    console.log("Preparing to delete SKU:", { skuId, sku });

    const result = await Swal.fire({
      title: "確定要刪除此 SKU?",
      text: "此操作不可逆，刪除後將無法恢復",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      console.log("Deleting SKU ID:", skuId);

      const response = await axios.delete(`/api/skus/${skuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete SKU response:", response);

      if (response.status >= 200 && response.status < 300) {
        // Show success message
        Swal.fire({
          title: "刪除成功",
          icon: "success",
        });

        // Refresh list data
        fetchSkuList();
      }
    }
  } catch (error) {
    console.error("Error deleting SKU:", error);
    Swal.fire({
      title: "刪除失敗",
      text: error.response?.data?.message || "無法刪除 SKU",
      icon: "error",
    });
  }
};

// Initialize Bootstrap components
const initBootstrapComponents = () => {
  try {
    // Initialize carousel
    const carouselElement = document.getElementById("productImagesCarousel");
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        touch: true,
        ride: false, // Allow manual control
      });

      // Add carousel event listener
      trackCarouselSlide();
    }

    // Pre-initialize gallery modal
    const modalElement = document.getElementById("inlineGalleryModal");
    if (modalElement) {
      new bootstrap.Modal(modalElement);
    }
  } catch (error) {
    console.error("Error initializing Bootstrap components:", error);
  }
};

// Component mounted - fetch product details and SKU list
onMounted(async () => {
  if (!productId || !shopId) {
    console.error("Invalid product ID or shop ID");
    router.push("/seller/dashboard");
    return;
  }

  await fetchProductInfo();

  // Fetch images if not already loaded
  if (
    (!productInfo.value.productImages ||
      productInfo.value.productImages.length === 0) &&
    !productInfo.value.primaryImageUrl &&
    !productInfo.value.image
  ) {
    await fetchProductImages();
  }

  await fetchSkuList();

  // Ensure Bootstrap is available
  setTimeout(() => {
    if (typeof bootstrap === "undefined") {
      console.error("Bootstrap not loaded!");

      // Optional: Try manually loading Bootstrap (emergency backup)
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
          console.log("Bootstrap manually loaded");
          initBootstrapComponents();
        };
      } catch (e) {
        console.error("Failed to manually load Bootstrap", e);
      }
    } else {
      initBootstrapComponents();
    }
  }, 500);
});
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.table th {
  font-weight: 600;
  color: #495057;
}

.breadcrumb {
  background-color: transparent;
  padding: 0.5rem 0;
}

.breadcrumb-item a {
  color: var(--bs-primary);
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

/* Product image and gallery styling */
.product-thumbnail {
  transition: transform 0.3s ease;
}

.product-thumbnail:hover {
  transform: scale(1.02);
}

.thumbnail-nav {
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 white;
}

.thumbnail-nav::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-nav::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.thumbnail-nav::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 10px;
}

.thumbnail-nav::-webkit-scrollbar-thumb:hover {
  background: #c1c1c1;
}

.thumbnail-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.thumbnail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.active-thumbnail {
  transform: translateY(-2px);
}

/* Carousel controls */
.carousel-control-prev,
.carousel-control-next {
  width: 10%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel:hover .carousel-control-prev,
.carousel:hover .carousel-control-next {
  opacity: 0.8;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 10px;
}

/* Modal gallery styling */
.modal-body .card {
  transition: all 0.2s ease;
}

.modal-body .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

/* Operation buttons */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* SKU specification tags */
.badge.bg-light {
  border: 1px solid #e9ecef;
}

/* Cursor pointer for interactive elements */
.cursor-pointer {
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .card-header .btn {
    margin-top: 0.5rem;
    align-self: flex-start;
  }

  .sku-management-section .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .sku-management-section .d-flex .btn-group {
    margin-top: 0.5rem;
  }
}
</style>
