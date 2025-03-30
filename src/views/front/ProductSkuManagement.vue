<template>
  <div class="container mt-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="`/store/${shopId}`">賣家中心</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="`/seller/shops/${shopId}/products`"
            >商品管理</router-link
          >
        </li>
        <li class="breadcrumb-item active" aria-current="page">SKU 管理</li>
      </ol>
    </nav>

    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h3 class="mb-0">SKU 管理 - {{ productInfo.productName }}</h3>
        <router-link
          :to="`/seller/shops/${shopId}/products`"
          class="btn btn-outline-secondary"
        >
          返回商品列表
        </router-link>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="table-responsive">
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 150px">商品 ID</th>
                    <td>{{ productInfo.productId }}</td>
                  </tr>
                  <tr>
                    <th>商品名稱</th>
                    <td>{{ productInfo.productName }}</td>
                  </tr>
                  <tr>
                    <th>狀態</th>
                    <td>
                      <span
                        :class="
                          productInfo.active ? 'text-success' : 'text-warning'
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
          <div class="col-md-6 text-center">
            <!-- 图片轮播 -->
            <div v-if="hasProductImages" class="card h-100">
              <div class="position-relative">
                <!-- 主轮播区域 -->
                <div
                  id="productImagesCarousel"
                  class="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div class="carousel-inner">
                    <!-- 显示主图 -->
                    <div v-if="primaryImage" class="carousel-item active">
                      <img
                        :src="getImageUrl(primaryImage)"
                        alt="商品主图"
                        class="d-block mx-auto product-thumbnail"
                        style="
                          height: 280px;
                          object-fit: contain;
                          max-width: 100%;
                        "
                        @error="handleImageError"
                      />
                      <div class="position-absolute top-0 start-0 m-2">
                        <span class="badge bg-primary">主图</span>
                      </div>
                    </div>

                    <!-- 显示其他图片 -->
                    <div
                      v-for="(image, index) in nonPrimaryImages"
                      :key="index"
                      class="carousel-item"
                    >
                      <img
                        :src="getImageUrl(image)"
                        alt="商品图片"
                        class="d-block w-100 product-thumbnail"
                        style="height: 250px; object-fit: contain"
                        @error="handleImageError"
                      />
                    </div>
                  </div>

                  <!-- 图片计数指示器 -->
                  <div
                    class="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
                    style="background-color: rgba(0, 0, 0, 0.5)"
                  >
                    <small class="text-white"
                      >{{ currentSlideIndex + 1 }} / {{ totalImages }}</small
                    >
                  </div>

                  <!-- 轮播控制按钮 (只有当有多张图片时才显示) -->
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
                    <span class="visually-hidden">上一张</span>
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
                    <span class="visually-hidden">下一张</span>
                  </button>
                </div>
              </div>

              <!-- 缩略图导航 -->
              <div v-if="totalImages > 1" class="thumbnail-nav mt-2 px-2">
                <div
                  class="d-flex gap-2 overflow-auto py-2"
                  style="scrollbar-width: thin"
                >
                  <div
                    v-for="(image, index) in allProductImages"
                    :key="index"
                    @click="goToSlide(index)"
                    class="thumbnail-item"
                    :class="{ 'active-thumbnail': index === currentSlideIndex }"
                    style="cursor: pointer; flex: 0 0 auto; position: relative"
                  >
                    <img
                      :src="getImageUrl(image)"
                      alt="商品缩略图"
                      style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 4px;
                      "
                      :style="{
                        border:
                          index === currentSlideIndex
                            ? '2px solid var(--bs-primary)'
                            : '1px solid #dee2e6',
                      }"
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
                      主图
                    </span>
                  </div>
                </div>
              </div>

              <!-- 底部控制区 -->
              <div
                class="card-footer bg-light p-2 d-flex justify-content-between align-items-center"
              >
                <small class="text-muted">共 {{ totalImages }} 张图片</small>
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
                    查看所有图片
                  </button>
                </div>
              </div>
            </div>

            <!-- 无图片时显示 -->
            <div v-else class="no-image card h-100">
              <div
                class="card-body d-flex align-items-center justify-content-center"
              >
                <span>無商品圖片</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SKU 管理區域 -->
        <div class="sku-management-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>SKU 列表</h4>
            <div>
              <button
                class="btn btn-outline-primary me-2"
                @click="fetchSkuList"
                title="重新整理"
              >
                <i class="bi bi-arrow-clockwise"></i> 重新整理
              </button>
              <button class="btn btn-success" @click="showAddModal = true">
                新增 SKU
              </button>
            </div>
          </div>

          <!-- 分頁控制 -->
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <span>每頁顯示：</span>
              <select
                v-model="pageSize"
                class="form-select form-select-sm d-inline-block ms-2"
                style="width: auto"
                @change="onPageSizeChange"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>

          <!-- SKU 列表 -->
          <div v-if="skuList.length > 0">
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>SKU ID</th>
                    <th>規格</th>
                    <th>庫存</th>
                    <th>價格</th>
                    <th style="width: 220px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sku in skuList" :key="sku.id || sku.skuId">
                    <td>{{ sku.id || sku.skuId }}</td>
                    <td>
                      <div
                        v-for="(value, key) in sku.specPairs"
                        :key="key"
                        class="sku-spec"
                      >
                        <span class="spec-key">{{ key }}:</span>
                        <span class="spec-value">{{ value }}</span>
                      </div>
                    </td>
                    <td>{{ sku.stock }}</td>
                    <td>NT$ {{ formatPrice(sku.price) }}</td>
                    <td>
                      <button
                        class="btn btn-outline-primary btn-sm me-1"
                        @click="openStockModal(sku)"
                        title="調整庫存"
                      >
                        <i class="bi bi-box"></i>
                      </button>
                      <button
                        class="btn btn-outline-success btn-sm me-1"
                        @click="openPriceModal(sku)"
                        title="調整價格"
                      >
                        <i class="bi bi-currency-dollar"></i>
                      </button>
                      <button
                        class="btn btn-primary btn-sm me-1"
                        @click="openEditModal(sku)"
                        title="編輯SKU"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        @click="deleteSku(sku)"
                        title="刪除SKU"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分頁導航 -->
            <nav v-if="totalPages > 1" aria-label="SKU list pagination">
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
            該商品尚未設定 SKU。請點擊「新增 SKU」按鈕建立規格。
          </div>
        </div>
      </div>
    </div>

    <!-- 内联图片画廊模态框 -->
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
            <h5 class="modal-title" id="galleryModalLabel">商品图片库</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- 大图预览区域 -->
            <div class="text-center mb-4 position-relative">
              <img
                :src="getImageUrl(allProductImages[galleryActiveIndex])"
                class="img-fluid"
                alt="商品图片预览"
                style="max-height: 300px; object-fit: contain"
              />
              <!-- 导航箭头 -->
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
              <!-- 图片计数 -->
              <div
                class="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
                style="background-color: rgba(0, 0, 0, 0.5)"
              >
                <small class="text-white"
                  >{{ galleryActiveIndex + 1 }} / {{ totalImages }}</small
                >
              </div>
            </div>

            <!-- 缩略图网格 -->
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
                      alt="商品图片"
                      style="height: 80px; object-fit: cover"
                    />
                    <span
                      v-if="isPrimaryImage(image)"
                      class="position-absolute top-0 start-0 badge bg-primary"
                      style="border-radius: 0 0 4px 0"
                      >主图</span
                    >
                  </div>
                  <div
                    class="card-footer p-1 d-flex justify-content-between align-items-center"
                  >
                    <small class="text-muted">图 {{ index + 1 }}</small>
                    <button
                      v-if="!isPrimaryImage(image)"
                      class="btn btn-sm btn-outline-primary py-0 px-1"
                      style="font-size: 0.7rem"
                      @click.stop="setPrimaryImage({ image, index })"
                    >
                      设主图
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
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 SKU Modal -->
    <sku-add-modal
      :is-open="showAddModal"
      :product-id="productId"
      @close="showAddModal = false"
      @refresh="fetchSkuList"
    />

    <!-- 編輯 SKU Modal -->
    <sku-edit-modal
      :is-open="showEditModal"
      :sku-data="selectedSku"
      @close="showEditModal = false"
      @refresh="fetchSkuList"
    />

    <!-- 調整庫存 Modal -->
    <stock-update-modal
      :is-open="showStockModal"
      :sku-data="selectedSku"
      @close="showStockModal = false"
      @refresh="fetchSkuList"
    />

    <!-- 調整價格 Modal -->
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

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;
const baseUrl = ref(import.meta.env.VITE_API_URL);
const defaultImage = "/assets/default-image.png"; // 默認圖片路徑

// 數據狀態
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
const currentSlideIndex = ref(0); // 当前显示的轮播图索引

// 獲取商品圖片來源
const fetchProductImages = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}/images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      console.log("獲取到的商品圖片:", response.data);
      productInfo.value.productImages = response.data;
    } else {
      console.error("獲取商品圖片格式錯誤:", response.data);
    }
  } catch (error) {
    console.error("獲取商品圖片錯誤:", error);
  }
};

// 從各種來源獲取所有商品圖片
const allProductImages = computed(() => {
  if (!productInfo.value) return [];

  // 如果有 productImages 數組，優先使用它
  if (
    productInfo.value.productImages &&
    productInfo.value.productImages.length > 0
  ) {
    return productInfo.value.productImages;
  }

  // 使用可能的其他圖片來源
  const images = [];

  // 檢查 primaryImageUrl
  if (productInfo.value.primaryImageUrl) {
    images.push({
      imagePath: productInfo.value.primaryImageUrl,
      isPrimary: true,
    });
  }

  // 檢查 image
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
  if (!image) return null;

  const imagePath = image.imagePath || image.path || image.url;
  if (!imagePath) return defaultImage;

  return imagePath.startsWith("http")
    ? imagePath
    : `${baseUrl.value}${imagePath}`;
};

// 追踪轮播图滑动事件
const trackCarouselSlide = () => {
  const carouselElement = document.getElementById("productImagesCarousel");
  if (!carouselElement) return;

  carouselElement.addEventListener("slid.bs.carousel", (event) => {
    currentSlideIndex.value = event.to;
  });
};

// 全屏查看方法
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
    console.error("全屏查看时出错:", error);
  }
};

// 輪播控制
const goToSlide = (index) => {
  // 獲取輪播組件實例
  const carousel = bootstrap?.Carousel?.getInstance("#productImagesCarousel");
  if (carousel) {
    carousel.to(index);
  } else {
    console.warn("Bootstrap Carousel 實例未找到");
  }
};

// 修改 openGalleryView 函数为使用原生 DOM 操作方式
const openGalleryView = () => {
  try {
    console.log("查看所有图片按钮被点击");

    // 设置画廊当前索引与轮播同步
    galleryActiveIndex.value = currentSlideIndex.value;

    if (typeof bootstrap === "undefined") {
      console.error("Bootstrap 未加载，无法打开模态框");
      alert("无法打开图片库，系统出现错误");
      return;
    }

    const modalElement = document.getElementById("inlineGalleryModal");
    if (!modalElement) {
      console.error("未找到图片画廊模态框元素");
      alert("无法打开图片库，请刷新页面后重试");
      return;
    }

    // 尝试获取或创建 Modal 实例
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }

    // 显示模态框
    modal.show();
    console.log("图片模态框已打开");
  } catch (error) {
    console.error("打开图片模态框时出错:", error);
    alert("无法打开图片库，发生未知错误");
  }
};

// 打開大圖查看
const openLightbox = (index) => {
  // 可以在此實現燈箱效果，或直接跳轉到對應的輪播索引
  goToSlide(index);

  // 關閉畫廊模態框
  const galleryModal = bootstrap.Modal.getInstance(
    document.getElementById("imageGalleryModal")
  );
  if (galleryModal) {
    galleryModal.hide();
  }
};

// 添加设置主图的处理函数
const setPrimaryImage = async ({ image, index }) => {
  try {
    // 获取正确的图片ID
    const imageId = image.id || image.imageId || index + 1; // 假设后端 ID 从 1 开始，而不是 0

    console.log("准备设置主图:", { imageId, image });

    // 修正 API 路径，将 set-primary 改为 primary
    const apiPath = `/api/products/${productId}/images/${imageId}/primary`;
    console.log("使用API路径:", apiPath);

    const response = await axios.put(
      apiPath,
      {}, // 请求体保持为空对象
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // 更新本地图片状态
      allProductImages.value = allProductImages.value.map((img) => ({
        ...img,
        isPrimary: img === image,
      }));

      // 重新获取商品信息
      await fetchProductInfo();
      Swal.fire({
        title: "設置成功",
        text: "已成功设置主图",
        icon: "success",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("设置主图失败:", error);
    console.error("详细错误信息:", error.response || error.message);

    Swal.fire({
      title: "設置失敗",
      text: error.response?.data?.message || "无法设置主图，请稍后再试",
      icon: "error",
    });
  }
};

// 獲取商品圖片 URL 的函數 (保留原有函數為了兼容性)
const getProductImageUrl = (product) => {
  if (!product) return null;

  // 檢查 primaryImageUrl
  if (product.primaryImageUrl) {
    return product.primaryImageUrl.startsWith("http")
      ? product.primaryImageUrl
      : `${baseUrl.value}${product.primaryImageUrl}`;
  }

  // 檢查 image 屬性
  if (product.image) {
    return product.image.startsWith("http")
      ? product.image
      : `${baseUrl.value}${product.image}`;
  }

  // 檢查 productImages 數組
  if (product.productImages && product.productImages.length > 0) {
    // 優先使用主圖
    const primaryImage = product.productImages.find((img) => img.isPrimary);
    if (primaryImage) {
      const imagePath = primaryImage.imagePath;
      return imagePath.startsWith("http")
        ? imagePath
        : `${baseUrl.value}${imagePath}`;
    }

    // 如果沒有主圖，使用第一張
    const imagePath = product.productImages[0].imagePath;
    return imagePath.startsWith("http")
      ? imagePath
      : `${baseUrl.value}${imagePath}`;
  }

  return null;
};

// 處理圖片加載錯誤
const handleImageError = (e) => {
  console.log("圖片載入失敗，使用預設圖片");
  e.target.src = defaultImage;
};

// 画廊当前显示的图片索引
const galleryActiveIndex = ref(0);

// 画廊导航 - 上一张图片
const galleryPrevImage = () => {
  if (galleryActiveIndex.value > 0) {
    galleryActiveIndex.value--;
  } else {
    galleryActiveIndex.value = totalImages.value - 1;
  }
};

// 画廊导航 - 下一张图片
const galleryNextImage = () => {
  if (galleryActiveIndex.value < totalImages.value - 1) {
    galleryActiveIndex.value++;
  } else {
    galleryActiveIndex.value = 0;
  }
};

// 分頁導航
const paginationItems = computed(() => {
  const items = [];
  const maxVisible = 5; // 最多顯示的頁碼數
  let startPage = Math.max(
    0,
    Math.min(
      currentPage.value - Math.floor(maxVisible / 2),
      totalPages.value - maxVisible
    )
  );
  if (startPage < 0) startPage = 0;

  const endPage = Math.min(startPage + maxVisible - 1, totalPages.value - 1);

  // 第一頁
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

  // 中間頁
  for (let i = startPage; i <= endPage; i++) {
    items.push({
      value: i,
      label: (i + 1).toString(),
      active: currentPage.value === i,
      disabled: false,
    });
  }

  // 最後頁
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

// 格式化價格顯示
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 獲取商品詳情
const fetchProductInfo = async () => {
  try {
    const response = await axios.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      console.log("商品 API 原始回應:", response.data);
      productInfo.value = response.data;
      console.log("獲取到商品詳情:", productInfo.value);

      // 記錄圖片相關欄位
      console.log("商品圖片資訊:", {
        image: productInfo.value.image,
        primaryImageUrl: productInfo.value.primaryImageUrl,
        hasProductImages:
          productInfo.value.productImages &&
          productInfo.value.productImages.length > 0,
        imageUrl: getProductImageUrl(productInfo.value),
      });
    } else {
      console.error("獲取商品詳情格式錯誤:", response.data);
      router.push(`/seller/shops/${shopId}/products`);
    }
  } catch (error) {
    console.error("獲取商品詳情錯誤:", error);
    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取商品詳情",
      icon: "error",
    });
    router.push(`/seller/shops/${shopId}/products`);
  }
};

// 獲取商品的 SKU 列表 (分頁)
const fetchSkuList = async () => {
  try {
    console.log(
      "正在獲取 SKU 列表，商品ID:",
      productId,
      "頁碼:",
      currentPage.value,
      "每頁數量:",
      pageSize.value
    );

    const response = await axios.get(`/api/products/${productId}/skus/paged`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        _t: Date.now(), // 防止緩存
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("SKU 分頁響應:", response);

    if (response.data) {
      // 更新SKU列表和分頁資訊
      skuList.value = response.data.content || [];
      totalItems.value = response.data.totalElements || 0;
      totalPages.value = response.data.totalPages || 0;

      console.log("SKU 數據條數:", skuList.value.length);
      console.log("總項目數:", totalItems.value);
      console.log("總頁數:", totalPages.value);

      // 確保當前頁碼合法
      if (currentPage.value >= totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value - 1;
        fetchSkuList(); // 重新獲取正確頁碼的數據
      }
    } else {
      console.error("獲取 SKU 資料格式不符合預期:", response.data);
      skuList.value = [];
      totalItems.value = 0;
      totalPages.value = 0;
    }
  } catch (error) {
    console.error("獲取 SKU 列表錯誤:", error);
    console.error("錯誤詳情:", error.response || error.message);
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

// 更換頁碼
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchSkuList();
  }
};

// 更改每頁數量
const onPageSizeChange = () => {
  currentPage.value = 0; // 重置到第一頁
  fetchSkuList();
};

// 開啟編輯 Modal
const openEditModal = (sku) => {
  selectedSku.value = { ...sku };
  showEditModal.value = true;
};

// 開啟調整庫存 Modal
const openStockModal = (sku) => {
  selectedSku.value = { ...sku };
  showStockModal.value = true;
};

// 開啟調整價格 Modal
const openPriceModal = (sku) => {
  selectedSku.value = { ...sku };
  showPriceModal.value = true;
};

// 刪除 SKU
const deleteSku = async (sku) => {
  try {
    // 確保 skuId 是有效的
    const skuId = sku.skuId; // 使用 skuId 而不是 id

    if (!skuId) {
      console.error("無效的 SKU ID:", sku);
      Swal.fire({
        title: "刪除失敗",
        text: "無法獲取有效的 SKU ID",
        icon: "error",
      });
      return;
    }

    console.log("準備刪除的 SKU:", { skuId, sku });

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
      console.log("正在刪除 SKU ID:", skuId);

      const response = await axios.delete(`/api/skus/${skuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("刪除 SKU 響應:", response);

      if (response.status >= 200 && response.status < 300) {
        // 顯示成功消息
        Swal.fire({
          title: "刪除成功",
          icon: "success",
        });

        // 刷新列表數據
        fetchSkuList();
      }
    }
  } catch (error) {
    console.error("刪除 SKU 錯誤:", error);
    Swal.fire({
      title: "刪除失敗",
      text: error.response?.data?.message || "無法刪除 SKU",
      icon: "error",
    });
  }
};

// 元件掛載時獲取商品詳情和 SKU 列表，在 onMounted 中确保 Bootstrap 加载
onMounted(async () => {
  if (!productId || !shopId) {
    console.error("無效的商品 ID 或商店 ID");
    router.push("/seller/dashboard");
    return;
  }

  await fetchProductInfo();

  if (
    (!productInfo.value.productImages ||
      productInfo.value.productImages.length === 0) &&
    !productInfo.value.primaryImageUrl &&
    !productInfo.value.image
  ) {
    await fetchProductImages();
  }

  await fetchSkuList();

  // 确保 Bootstrap 可用
  setTimeout(() => {
    if (typeof bootstrap === "undefined") {
      console.error("Bootstrap 未加载!");

      // 如果您使用的是旧版 Bootstrap，可能需要手动初始化
      // 在 Vue 3 中，通常建议在 main.js 中全局导入 Bootstrap
      console.warn("请确保在项目中正确导入 Bootstrap JavaScript");

      // 可选: 尝试手动加载 Bootstrap (仅作为应急方案)
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
          console.log("Bootstrap 已手动加载");
          initBootstrapComponents();
        };
      } catch (e) {
        console.error("尝试手动加载 Bootstrap 失败", e);
      }
    } else {
      initBootstrapComponents();
    }
  }, 500);
});

// 修改 initBootstrapComponents 函数，增加轮播事件监听
const initBootstrapComponents = () => {
  try {
    // 初始化轮播
    const carouselElement = document.getElementById("productImagesCarousel");
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        touch: true,
        ride: false, // 允许手动控制
      });

      // 添加轮播事件监听
      trackCarouselSlide();
    }

    // 预初始化图片画廊模态框
    const modalElement = document.getElementById("inlineGalleryModal");
    if (modalElement) {
      new bootstrap.Modal(modalElement);
    }
  } catch (error) {
    console.error("初始化 Bootstrap 组件时出错:", error);
  }
};

const adjustCarouselHeight = () => {
  // 获取轮播容器元素
  const carousel = document.getElementById("productImagesCarousel");
  if (!carousel) return;

  // 根据容器宽度动态调整高度
  if (window.innerWidth < 768) {
    // 移动设备设置
    carousel.style.minHeight = "220px";
  } else {
    // 桌面设备设置 - 自适应高度
    const optimalHeight = Math.max(280, Math.min(350, containerWidth * 0.75));
    carousel.style.minHeight = `${optimalHeight}px`;
  }

  // 调整图片高度...
};
</script>

<style scoped>
.product-thumbnail {
  max-height: 200px;
  max-width: 100%;
  object-fit: contain;
}

.no-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.sku-spec {
  margin-bottom: 3px;
}

.spec-key {
  font-weight: 500;
  margin-right: 5px;
}

.pagination {
  margin-top: 1rem;
}
</style>

<style scoped>
.product-thumbnail {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.no-image {
  width: 200px;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin: 0 auto;
}

.sku-spec {
  display: inline-block;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 2px 8px;
  margin-right: 5px;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.spec-key {
  font-weight: bold;
  margin-right: 4px;
}

.spec-value {
  color: #0d6efd;
}

/* 轮播区域样式 */
.carousel {
  border-radius: 4px;
  overflow: hidden;
}

.carousel-item img {
  transition: transform 0.3s ease;
}

.carousel-item img:hover {
  transform: scale(1.02);
}

/* 缩略图导航样式 */
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

/* 导航按钮样式 */
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

/* 模态框内图片样式 */
.modal-body .card {
  transition: all 0.2s ease;
}

.modal-body .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
</style>
