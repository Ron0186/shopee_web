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
          <div class="col-md-8">
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
          <div class="col-md-4 text-center">
            <!-- 圖片輪播 -->
            <div v-if="hasProductImages" class="card h-100">
              <div
                id="productImagesCarousel"
                class="carousel slide"
                data-bs-ride="carousel"
              >
                <div class="carousel-inner">
                  <!-- 顯示主圖 -->
                  <div v-if="primaryImage" class="carousel-item active">
                    <img
                      :src="getImageUrl(primaryImage)"
                      alt="商品主圖"
                      class="d-block w-100 product-thumbnail"
                      style="max-height: 200px; object-fit: contain"
                      @error="handleImageError"
                    />
                    <div class="carousel-caption d-none d-md-block">
                      <span class="badge bg-primary">主圖</span>
                    </div>
                  </div>

                  <!-- 顯示其他圖片 -->
                  <div
                    v-for="(image, index) in nonPrimaryImages"
                    :key="index"
                    class="carousel-item"
                  >
                    <img
                      :src="getImageUrl(image)"
                      alt="商品圖片"
                      class="d-block w-100 product-thumbnail"
                      style="max-height: 200px; object-fit: contain"
                      @error="handleImageError"
                    />
                  </div>
                </div>

                <!-- 輪播控制按鈕 (只有當有多張圖片時才顯示) -->
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

                <!-- 輪播指示器 -->
                <div v-if="totalImages > 1" class="carousel-indicators">
                  <button
                    v-for="(_, index) in totalImages"
                    :key="index"
                    type="button"
                    data-bs-target="#productImagesCarousel"
                    :data-bs-slide-to="index"
                    :class="{ active: index === 0 }"
                    :aria-current="index === 0 ? 'true' : 'false'"
                    :aria-label="`Slide ${index + 1}`"
                  ></button>
                </div>
              </div>

              <!-- 圖片計數 -->
              <div
                class="card-footer bg-light p-2 d-flex justify-content-between align-items-center"
              >
                <small class="text-muted">共 {{ totalImages }} 張圖片</small>
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

            <!-- 沒有圖片時顯示 -->
            <div v-else class="no-image card h-100">
              <div
                class="card-body d-flex align-items-center justify-content-center"
              >
                <span>無商品圖片</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 縮略圖預覽 (僅在有多張圖片時顯示) -->
        <div v-if="totalImages > 1" class="mb-4">
          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <div
              v-for="(image, index) in allProductImages"
              :key="index"
              class="position-relative thumbnail-container"
              style="cursor: pointer"
              @click="goToSlide(index)"
            >
              <img
                :src="getImageUrl(image)"
                alt="商品圖片"
                class="img-thumbnail"
                style="width: 60px; height: 60px; object-fit: cover"
                :class="{ 'border-primary': isPrimaryImage(image) }"
              />
              <span
                v-if="isPrimaryImage(image)"
                class="position-absolute top-0 start-0 badge bg-primary"
                style="font-size: 0.6rem"
              >
                主圖
              </span>
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
            <div class="row">
              <div
                v-for="(image, index) in allProductImages"
                :key="index"
                class="col-md-4 mb-3"
              >
                <div class="card h-100">
                  <img
                    :src="getImageUrl(image)"
                    class="card-img-top"
                    alt="商品图片"
                    style="height: 150px; object-fit: contain; padding: 10px"
                  />
                  <div class="card-body d-flex flex-column align-items-center">
                    <p class="card-text mb-2">图片 {{ index + 1 }}</p>
                    <div>
                      <span
                        v-if="isPrimaryImage(image)"
                        class="badge bg-primary"
                        >主图</span
                      >
                      <button
                        v-else
                        class="btn btn-sm btn-outline-primary"
                        @click="setPrimaryImage({ image, index })"
                      >
                        设为主图
                      </button>
                    </div>
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
const showGalleryModal = ref(false);

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

// 抽取初始化 Bootstrap 组件的函数
const initBootstrapComponents = () => {
  try {
    // 初始化轮播
    const carouselElement = document.getElementById("productImagesCarousel");
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        touch: true,
      });
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
</style>
