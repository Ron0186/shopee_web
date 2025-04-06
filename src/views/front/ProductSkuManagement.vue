<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb bg-transparent p-0">
        <li class="breadcrumb-item">
          <router-link :to="`/store/${shopId}`" class="text-primary fw-medium"
            >賣家中心</router-link
          >
        </li>
        <li class="breadcrumb-item">
          <router-link
            :to="`/seller/shops/${shopId}/products`"
            class="text-primary fw-medium"
            >商品管理</router-link
          >
        </li>
        <li class="breadcrumb-item active fw-medium" aria-current="page">
          SKU 管理
        </li>
      </ol>
    </nav>

    <!-- Main Card -->
    <div class="card main-card border-0 rounded-4 mb-4">
      <div
        class="card-header d-flex justify-content-between align-items-center py-3 bg-white border-0"
      >
        <h3 class="mb-0 fs-4 fw-bold text-dark d-flex align-items-center">
          <span
            class="badge rounded-circle bg-primary-subtle p-2 me-2 d-flex align-items-center justify-content-center"
          >
            <i class="bi bi-box-seam fs-5 text-primary"></i>
          </span>
          SKU 管理 - {{ productInfo.productName }}
        </h3>
        <router-link
          :to="`/seller/shops/${shopId}/products`"
          class="btn btn-outline-primary d-flex align-items-center btn-sm px-3 py-2 rounded-pill"
        >
          <i class="bi bi-arrow-left me-1"></i> 返回商品列表
        </router-link>
      </div>
      <div class="card-body p-4">
        <div class="row g-4 mb-4">
          <!-- Product Info -->
          <div class="col-md-6">
            <div
              class="product-info-card card border-0 h-100 rounded-4 overflow-hidden"
            >
              <div
                class="card-header bg-white py-3 border-0 d-flex align-items-center"
              >
                <span
                  class="badge rounded-circle bg-info-subtle p-2 me-2 d-flex align-items-center justify-content-center"
                >
                  <i class="bi bi-info-circle fs-5 text-info"></i>
                </span>
                <h5 class="mb-0">商品資訊</h5>
              </div>
              <div class="table-responsive">
                <table class="table align-middle mb-0 info-table">
                  <tbody>
                    <tr class="border-bottom">
                      <th
                        class="py-3 ps-4 bg-light text-secondary fw-medium w-25"
                      >
                        商品 ID
                      </th>
                      <td class="py-3 ps-3 pe-4">
                        <span
                          class="badge bg-light text-dark border px-3 py-2 rounded-pill"
                        >
                          {{ productInfo.productId }}
                        </span>
                      </td>
                    </tr>
                    <tr class="border-bottom">
                      <th class="py-3 ps-4 bg-light text-secondary fw-medium">
                        商品名稱
                      </th>
                      <td class="py-3 ps-3 pe-4 fw-medium text-dark">
                        {{ productInfo.productName }}
                      </td>
                    </tr>
                    <tr>
                      <th class="py-3 ps-4 bg-light text-secondary fw-medium">
                        狀態
                      </th>
                      <td class="py-3 ps-3 pe-4">
                        <span
                          class="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                          :class="
                            productInfo.active
                              ? 'bg-success-subtle text-success'
                              : 'bg-warning-subtle text-warning'
                          "
                        >
                          <i
                            class="bi"
                            :class="
                              productInfo.active
                                ? 'bi-check-circle-fill'
                                : 'bi-hourglass-split'
                            "
                          ></i>
                          {{ productInfo.active ? "上架中" : "審核中" }}
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
            <div
              v-if="hasProductImages"
              class="gallery-card card border-0 h-100 rounded-4 overflow-hidden"
            >
              <div
                class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0 d-flex align-items-center">
                  <span
                    class="badge rounded-circle bg-primary-subtle p-2 me-2 d-flex align-items-center justify-content-center"
                  >
                    <i class="bi bi-images fs-5 text-primary"></i>
                  </span>
                  商品圖片
                </h5>
                <span
                  class="badge bg-light text-secondary border rounded-pill px-3 py-1"
                >
                  <i class="bi bi-image me-1"></i> {{ totalImages }} 張圖片
                </span>
              </div>
              <div class="position-relative">
                <!-- Main Carousel -->
                <div
                  id="productImagesCarousel"
                  class="carousel slide bg-light carousel-fade"
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
                        <span
                          class="badge bg-gradient-primary text-white rounded-pill px-3 py-2 shadow-sm"
                        >
                          <i class="bi bi-star-fill me-1"></i> 主圖
                        </span>
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
                    class="position-absolute top-0 end-0 m-2 px-3 py-1 rounded-pill shadow-sm"
                    style="background-color: rgba(0, 0, 0, 0.5)"
                  >
                    <small class="text-white d-flex align-items-center">
                      <i class="bi bi-image me-1"></i
                      >{{ currentSlideIndex + 1 }} / {{ totalImages }}
                    </small>
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
                      class="carousel-control-prev-icon rounded-circle shadow p-3"
                      style="
                        backdrop-filter: blur(8px);
                        background-color: rgba(33, 37, 41, 0.5);
                      "
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
                      class="carousel-control-next-icon rounded-circle shadow p-3"
                      style="
                        backdrop-filter: blur(8px);
                        background-color: rgba(33, 37, 41, 0.5);
                      "
                      aria-hidden="true"
                    ></span>
                    <span class="visually-hidden">下一張</span>
                  </button>
                </div>
              </div>

              <!-- Thumbnails -->
              <div
                v-if="totalImages > 1"
                class="thumbnail-nav p-3 border-top bg-white"
              >
                <div class="d-flex gap-2 overflow-auto py-1 px-1">
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
                      style="width: 64px; height: 64px; object-fit: cover"
                      class="rounded-3"
                      :class="
                        index === currentSlideIndex
                          ? 'border border-3 border-primary shadow'
                          : 'border opacity-75 hover-opacity-100'
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
                class="card-footer bg-white d-flex justify-content-end align-items-center py-3 gap-2 border-0"
              >
                <button
                  v-if="totalImages > 1"
                  type="button"
                  class="btn btn-sm btn-light"
                  @click="openFullscreenView"
                  title="全屏查看"
                >
                  <i class="bi bi-fullscreen me-1"></i> 全屏查看
                </button>
                <button
                  v-if="totalImages > 1"
                  type="button"
                  class="btn btn-sm btn-primary"
                  @click="openGalleryView"
                >
                  <i class="bi bi-grid-3x3-gap me-1"></i> 查看所有圖片
                </button>
              </div>
            </div>

            <!-- No Image Placeholder -->
            <div v-else class="card border-0 h-100 rounded-4 overflow-hidden">
              <div class="card-header bg-white py-3 border-0">
                <h5 class="mb-0 d-flex align-items-center">
                  <span
                    class="badge rounded-circle bg-primary-subtle p-2 me-2 d-flex align-items-center justify-content-center"
                  >
                    <i class="bi bi-images fs-5 text-primary"></i>
                  </span>
                  商品圖片
                </h5>
              </div>
              <div
                class="d-flex flex-column align-items-center justify-content-center h-100 bg-light"
                style="min-height: 300px"
              >
                <div class="text-center text-muted py-5">
                  <div class="empty-image-icon mb-3">
                    <i class="bi bi-image fs-1 text-secondary opacity-50"></i>
                  </div>
                  <p class="mb-1 fw-medium">尚無商品圖片</p>
                  <small class="d-block text-secondary"
                    >可在商品編輯頁面上傳商品圖片</small
                  >
                  <button
                    class="btn btn-outline-primary btn-sm mt-3 rounded-pill"
                  >
                    <i class="bi bi-upload me-1"></i> 上傳圖片
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SKU Management Section -->
        <div class="sku-management-section">
          <div
            class="section-header p-3 bg-white rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center"
          >
            <h4 class="mb-0 fw-bold d-flex align-items-center">
              <span
                class="badge rounded-circle bg-success-subtle p-2 me-2 d-flex align-items-center justify-content-center"
              >
                <i class="bi bi-list-check fs-5 text-success"></i>
              </span>
              SKU 列表
            </h4>
            <div>
              <button
                class="btn btn-success px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                @click="showAddModal = true"
              >
                <i class="bi bi-plus-lg"></i>
                <span>新增 SKU</span>
              </button>
            </div>
          </div>

          <!-- Filter and Page Size Control -->
          <div
            class="mb-4 p-3 bg-light rounded-4 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3"
          >
            <div class="d-flex align-items-center">
              <span class="me-2 text-secondary fw-medium">每頁顯示：</span>
              <select
                v-model="pageSize"
                class="form-select form-select-sm rounded-pill border"
                style="width: auto"
                @change="onPageSizeChange"
              >
                <option :value="10">10 筆</option>
                <option :value="20">20 筆</option>
                <option :value="50">50 筆</option>
              </select>
            </div>

            <div class="d-flex align-items-center gap-3">
              <div
                class="input-group input-group-sm flex-nowrap search-group"
                style="width: 200px"
              >
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="SKU ID 搜尋..."
                />
              </div>

              <div
                class="text-muted small d-flex align-items-center"
                v-if="skuList.length > 0"
              >
                <span
                  class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1"
                >
                  <i class="bi bi-database me-1"></i> 共 {{ totalItems }} 個 SKU
                </span>
              </div>
            </div>
          </div>

          <!-- SKU List -->
          <div v-if="skuList.length > 0">
            <div class="table-responsive">
              <table
                class="table table-hover align-middle rounded-4 overflow-hidden shadow-sm"
              >
                <thead class="bg-light">
                  <tr>
                    <th class="py-3 ps-4 text-secondary border-0">SKU ID</th>
                    <th class="py-3 text-secondary border-0">規格</th>
                    <th class="py-3 text-secondary border-0">庫存</th>
                    <th class="py-3 text-secondary border-0">價格</th>
                    <th
                      class="py-3 text-center text-secondary border-0"
                      style="width: 240px"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="sku in skuList"
                    :key="sku.id || sku.skuId"
                    class="border-bottom transition-bg"
                  >
                    <td class="py-3 ps-4 align-middle">
                      <span
                        class="badge bg-light text-dark border px-3 py-2 rounded-pill"
                      >
                        {{ sku.id || sku.skuId }}
                      </span>
                    </td>
                    <td class="py-3 align-middle">
                      <div class="d-flex flex-wrap gap-1">
                        <div
                          v-for="(value, key) in sku.specPairs"
                          :key="key"
                          class="badge bg-light text-dark border me-1 mb-1 p-2 rounded-pill"
                        >
                          <span class="fw-medium text-primary">{{ key }}:</span>
                          <span>{{ value }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 align-middle">
                      <div class="d-flex align-items-center">
                        <div v-if="sku.stock < 10" class="stock-warning me-2">
                          <i
                            class="bi bi-exclamation-triangle-fill text-warning"
                          ></i>
                        </div>
                        <span
                          class="stock-value"
                          :class="getStockClass(sku.stock)"
                        >
                          {{ sku.stock }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3 align-middle">
                      <span
                        class="price-badge badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold"
                      >
                        NT$ {{ formatPrice(sku.price) }}
                      </span>
                    </td>
                    <td class="py-3 align-middle">
                      <div class="d-flex justify-content-center gap-2">
                        <button
                          class="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                          @click="openStockModal(sku)"
                          title="調整庫存"
                        >
                          <i class="bi bi-box"></i>
                          <span>庫存</span>
                        </button>
                        <button
                          class="btn btn-outline-success btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                          @click="openPriceModal(sku)"
                          title="調整價格"
                        >
                          <i class="bi bi-currency-dollar"></i>
                          <span>價格</span>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                          @click="deleteSku(sku)"
                          title="刪除SKU"
                          style="width: 32px; height: 32px"
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
              class="mt-4 d-flex justify-content-center"
            >
              <ul class="pagination pagination-sm">
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <a
                    class="page-link rounded-start-pill px-3 d-flex align-items-center gap-1"
                    href="#"
                    @click.prevent="changePage(currentPage - 1)"
                  >
                    <i class="bi bi-chevron-left"></i>
                    <span>上一頁</span>
                  </a>
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
                    class="page-link rounded-end-pill px-3 d-flex align-items-center gap-1"
                    href="#"
                    @click.prevent="changePage(currentPage + 1)"
                  >
                    <span>下一頁</span>
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div
            v-else
            class="empty-sku-state p-5 bg-white rounded-4 shadow-sm text-center"
          >
            <div class="empty-state-icon mb-3">
              <span
                class="badge rounded-circle bg-info-subtle p-3 d-inline-flex align-items-center justify-content-center"
              >
                <i class="bi bi-info-circle fs-1 text-info"></i>
              </span>
            </div>
            <h5 class="fw-bold mb-3">尚未設定 SKU</h5>
            <p class="text-secondary mb-4">
              該商品尚未設定 SKU。請點擊「新增 SKU」按鈕建立規格。
            </p>
            <button
              class="btn btn-success px-4 py-2 rounded-pill"
              @click="showAddModal = true"
            >
              <i class="bi bi-plus-lg me-1"></i> 新增 SKU
            </button>
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0">
            <h5
              class="modal-title d-flex align-items-center"
              id="galleryModalLabel"
            >
              <span
                class="badge rounded-circle bg-primary-subtle p-2 me-2 d-flex align-items-center justify-content-center"
              >
                <i class="bi bi-images fs-5 text-primary"></i>
              </span>
              商品圖片庫
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Large Image Preview -->
            <div
              class="gallery-preview text-center mb-4 position-relative bg-light p-3 rounded-4"
            >
              <img
                :src="getImageUrl(allProductImages[galleryActiveIndex])"
                class="img-fluid rounded-3"
                alt="商品圖片預覽"
                style="max-height: 320px; object-fit: contain"
              />
              <!-- Navigation Arrows -->
              <button
                v-if="totalImages > 1"
                class="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow p-2 ms-3"
                style="
                  backdrop-filter: blur(8px);
                  background-color: rgba(255, 255, 255, 0.8);
                "
                @click="galleryPrevImage"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button
                v-if="totalImages > 1"
                class="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow p-2 me-3"
                style="
                  backdrop-filter: blur(8px);
                  background-color: rgba(255, 255, 255, 0.8);
                "
                @click="galleryNextImage"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <!-- Image Counter -->
              <div
                class="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill shadow-sm"
                style="
                  backdrop-filter: blur(8px);
                  background-color: rgba(0, 0, 0, 0.5);
                "
              >
                <small class="text-white d-flex align-items-center">
                  <i class="bi bi-image me-1"></i>{{ galleryActiveIndex + 1 }} /
                  {{ totalImages }}
                </small>
              </div>
            </div>

            <!-- Thumbnail Grid -->
            <div class="row g-3">
              <div
                v-for="(image, index) in allProductImages"
                :key="index"
                class="col-4 col-md-3 col-lg-2"
              >
                <div
                  class="gallery-thumbnail card h-100 border-0 shadow-sm overflow-hidden rounded-3"
                  :class="{ 'ring-primary': index === galleryActiveIndex }"
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
                      class="position-absolute top-0 start-0 badge bg-gradient-primary m-1 rounded-pill px-2"
                      style="font-size: 0.65rem"
                      >主圖</span
                    >
                  </div>
                  <div
                    class="card-footer p-2 d-flex justify-content-between align-items-center bg-white"
                  >
                    <small class="text-secondary">圖 {{ index + 1 }}</small>
                    <button
                      v-if="!isPrimaryImage(image)"
                      class="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill"
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
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-light rounded-pill px-4"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4"
              @click="openFullscreenView"
            >
              <i class="bi bi-fullscreen me-1"></i> 全屏查看
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

// Get stock class based on quantity
const getStockClass = (stock) => {
  if (stock <= 5) return "text-danger fw-bold";
  if (stock <= 20) return "text-warning fw-bold";
  return "text-success";
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
        text: "已成功設置主圖",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        iconColor: "#28a745",
        customClass: {
          popup: "rounded-4 shadow-lg",
          title: "text-success",
        },
      });
    }
  } catch (error) {
    console.error("Failed to set primary image:", error);
    Swal.fire({
      title: "設置失敗",
      text: error.response?.data?.message || "無法設置主圖，請稍后再試",
      icon: "error",
      confirmButtonColor: "#3085d6",
      background: "#fff",
      iconColor: "#dc3545",
      customClass: {
        popup: "rounded-4 shadow-lg",
        title: "text-danger",
      },
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
      confirmButtonColor: "#3085d6",
      background: "#fff",
      iconColor: "#dc3545",
      customClass: {
        popup: "rounded-4 shadow-lg",
        title: "text-danger",
      },
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
      confirmButtonColor: "#3085d6",
      background: "#fff",
      iconColor: "#dc3545",
      customClass: {
        popup: "rounded-4 shadow-lg",
        title: "text-danger",
      },
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
        confirmButtonColor: "#3085d6",
        background: "#fff",
        iconColor: "#dc3545",
        customClass: {
          popup: "rounded-4 shadow-lg",
          title: "text-danger",
        },
      });
      return;
    }

    console.log("Preparing to delete SKU:", { skuId, sku });

    const result = await Swal.fire({
      title: "確定要刪除此 SKU?",
      html: `
        <div class="text-start">
          <p class="mb-3">此操作不可逆，刪除後將無法恢復。</p>
          <div class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <small>刪除後將會影響所有使用此 SKU 的訂單</small>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: '<i class="bi bi-trash me-1"></i> 確定刪除',
      cancelButtonText: "取消",
      background: "#fff",
      iconColor: "#ffc107",
      customClass: {
        popup: "rounded-4 shadow-lg",
        title: "text-warning",
      },
    });

    if (result.isConfirmed) {
      console.log("Deleting SKU ID:", skuId);

      // 顯示處理中
      Swal.fire({
        title: "處理中",
        html: '<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"></div></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "rounded-4 shadow-lg",
        },
      });

      const response = await axios.delete(`/api/skus/${skuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete SKU response:", response);

      if (response.status >= 200 && response.status < 300) {
        // Show success message
        Swal.fire({
          title: "刪除成功",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
          iconColor: "#28a745",
          customClass: {
            popup: "rounded-4 shadow-lg",
            title: "text-success",
          },
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
      confirmButtonColor: "#3085d6",
      background: "#fff",
      iconColor: "#dc3545",
      customClass: {
        popup: "rounded-4 shadow-lg",
        title: "text-danger",
      },
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
/* Base styles */
.card {
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.25s ease;
}

.shadow {
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.07) !important;
}

.rounded-4 {
  border-radius: 1rem !important;
}

.main-card {
  box-shadow: 0 0.25rem 1.5rem rgba(0, 0, 0, 0.05);
}

.product-info-card:hover,
.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
}

/* Typography */
.card-header h3,
.card-header h5 {
  letter-spacing: -0.02em;
}

.badge {
  letter-spacing: 0.02em;
}

.fw-medium {
  font-weight: 500;
}

/* Table styles */
.table th {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.9rem;
}

.table td {
  vertical-align: middle;
}

.info-table tr:last-child th,
.info-table tr:last-child td {
  border-bottom: none;
}

/* Breadcrumb styles */
.breadcrumb {
  background-color: transparent;
  padding: 0.5rem 0;
}

.breadcrumb-item a {
  color: var(--bs-primary);
  text-decoration: none;
  transition: all 0.2s;
}

.breadcrumb-item a:hover {
  text-decoration: none;
  opacity: 0.8;
}

/* Badge and status styles */
.badge.rounded-circle {
  width: 40px;
  height: 40px;
}

.badge.rounded-pill {
  padding-right: 0.75rem;
  padding-left: 0.75rem;
}

.bg-gradient-primary {
  background: linear-gradient(45deg, var(--bs-primary), #4dabf7);
}

.stock-warning {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.price-badge {
  box-shadow: 0 2px 6px rgba(var(--bs-primary-rgb), 0.15);
}

/* Product image and gallery styling */
.product-thumbnail {
  transition: transform 0.3s ease;
}

.product-thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail-nav {
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 white;
}

.thumbnail-nav::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-nav::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.thumbnail-nav::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 10px;
}

.thumbnail-nav::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.thumbnail-item {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.thumbnail-item:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.15);
}

.active-thumbnail {
  transform: translateY(-4px) scale(1.03);
}

.hover-opacity-100 {
  transition: opacity 0.2s;
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}

/* Empty state styling */
.empty-sku-state {
  background-image: linear-gradient(
    to bottom right,
    rgba(248, 249, 250, 0.5),
    white
  );
}

.empty-state-icon,
.empty-image-icon {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
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
  opacity: 0.9;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  width: 2.5rem;
  height: 2.5rem;
}

/* Carousel fade effect */
.carousel-fade .carousel-item {
  opacity: 0;
  transition-property: opacity;
  transform: none;
}

.carousel-fade .carousel-item.active {
  opacity: 1;
}

/* Gallery thumbnails */
.gallery-thumbnail {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.gallery-thumbnail:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.15);
}

.ring-primary {
  box-shadow: 0 0 0 3px var(--bs-primary) !important;
  transform: translateY(-3px) scale(1.05);
}

/* Buttons and controls */
.btn {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.btn:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.btn:focus:after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(150, 150);
    opacity: 0;
  }
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.35rem 0.9rem;
  font-size: 0.85rem;
}

.btn-outline-primary:hover,
.btn-outline-success:hover,
.btn-outline-danger:hover {
  box-shadow: 0 0.25rem 1rem rgba(var(--bs-primary-rgb), 0.2);
}

/* Search input styling */
.search-group {
  border-radius: 50rem;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-group:focus-within {
  box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.25);
}

.search-group .form-control,
.search-group .input-group-text {
  border-color: #e9ecef;
}

.search-group:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
}

/* Table row hover effect */
.transition-bg {
  transition: background-color 0.2s;
}

.transition-bg:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.03);
}

/* Pagination styling */
.pagination {
  gap: 0.2rem;
}

.pagination .page-link {
  border: none;
  padding: 0.5rem 0.75rem;
  color: var(--bs-primary);
  transition: all 0.2s ease;
  border-radius: 0.5rem;
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  color: white;
  box-shadow: 0 3px 5px rgba(var(--bs-primary-rgb), 0.3);
}

.pagination .page-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  transform: translateY(-2px);
}
.pagination .page-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  transform: translateY(-2px);
}

/* Modal styling */
.modal-content {
  border: none;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);
}

.modal-header,
.modal-footer {
  border: none;
}

.gallery-preview {
  transition: all 0.3s ease;
}

/* Section header styling */
.section-header {
  position: relative;
  overflow: hidden;
}

.section-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, var(--bs-success), #20c997);
  border-radius: 0 3px 3px 0;
}

/* Table responsiveness */
@media (max-width: 992px) {
  .table td,
  .table th {
    padding: 0.75rem 0.5rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .badge {
    font-size: 0.75rem;
  }
}

/* Mobile optimizations */
@media (max-width: 576px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .card-header .btn {
    margin-top: 0.5rem;
    align-self: flex-start;
  }

  .sku-management-section .d-flex.section-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .section-header::before {
    width: 100%;
    height: 4px;
    border-radius: 0 0 3px 3px;
  }

  .table td .badge {
    display: inline-block;
    margin-bottom: 0.25rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
  }

  td .d-flex.justify-content-center {
    flex-wrap: wrap;
  }

  /* Stack filter controls */
  .mb-4.bg-light.rounded-4 {
    flex-direction: column;
    align-items: stretch !important;
  }

  .mb-4.bg-light.rounded-4 > div {
    margin-bottom: 0.5rem;
  }

  /* Improve table readability on mobile */
  .table thead {
    display: none;
  }

  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }

  .table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    border-bottom: 1px solid #dee2e6;
    padding: 0.75rem 1rem;
  }

  .table td:last-child {
    border-bottom: none;
  }

  .table td::before {
    content: attr(data-label);
    font-weight: 500;
    margin-right: 1rem;
    text-align: left;
  }

  /* Fix action buttons on mobile */
  td:last-child {
    justify-content: center;
  }

  td:last-child::before {
    display: none;
  }
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .card,
  .modal-content,
  .badge.bg-light,
  .search-group .form-control,
  .search-group .input-group-text,
  .btn-light {
    background-color: var(--bs-dark);
    color: var(--bs-light);
    border-color: var(--bs-gray-800);
  }

  .bg-light,
  .bg-white,
  .table .bg-light {
    background-color: var(--bs-gray-800) !important;
  }

  .text-dark,
  .btn-light,
  .badge.bg-light,
  .text-secondary {
    color: var(--bs-light) !important;
  }

  .border {
    border-color: var(--bs-gray-700) !important;
  }

  .table td,
  .table th,
  .border-bottom {
    border-color: var(--bs-gray-700);
  }

  .text-muted,
  .text-secondary {
    color: var(--bs-gray-400) !important;
  }

  .badge.bg-light {
    background-color: var(--bs-gray-700) !important;
  }

  .empty-sku-state {
    background-image: linear-gradient(
      to bottom right,
      rgba(33, 37, 41, 0.5),
      var(--bs-dark)
    );
  }
}

/* Loading animations for async operations */
.loading-pulse {
  animation: pulse 1.5s infinite;
}

.loading-skeleton {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.loading-skeleton::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Delightful interactions */
.btn-hover-lift {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-hover-lift:hover {
  transform: translateY(-3px);
}

/* Subtle hover effect for table rows */
tr.transition-bg {
  position: relative;
}

tr.transition-bg::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: linear-gradient(to right, var(--bs-primary), transparent);
  transform: scaleX(0);
  transform-origin: bottom left;
  transition: transform 0.3s ease-out;
}

tr.transition-bg:hover::after {
  transform: scaleX(1);
}

/* Gradient overlays for a more premium feel */
.product-info-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(
    135deg,
    rgba(var(--bs-info-rgb), 0.1),
    transparent 70%
  );
  border-radius: 0 1rem 0 50%;
  z-index: 1;
  pointer-events: none;
}

.gallery-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(
    135deg,
    rgba(var(--bs-primary-rgb), 0.1),
    transparent 70%
  );
  border-radius: 0 1rem 0 50%;
  z-index: 1;
  pointer-events: none;
}

/* Add depth to cards with subtle inner shadows */
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

/* Print styles - optimize for SKU list printing */
@media print {
  body {
    background-color: white;
  }

  .container-fluid {
    width: 100%;
    padding: 0;
  }

  .breadcrumb,
  .card-header,
  .section-header .btn,
  .pagination,
  button,
  .modal,
  .card-footer,
  td:last-child,
  .btn {
    display: none !important;
  }

  .card,
  .table,
  tr,
  td,
  th {
    border: none !important;
    box-shadow: none !important;
  }

  .card-body {
    padding: 0;
  }

  .table {
    width: 100% !important;
    margin-bottom: 0;
  }

  .table thead th {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }

  /* Force page breaks */
  tr {
    page-break-inside: avoid;
  }

  h3,
  h4,
  h5 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
}

/* High contrast mode improvements for accessibility */
@media (forced-colors: active) {
  .btn,
  .card,
  .badge,
  .table {
    border: 1px solid CanvasText;
  }

  .btn:hover {
    border-color: Highlight;
  }

  .badge.bg-primary,
  .btn-primary,
  .page-item.active .page-link {
    background-color: Highlight !important;
    color: HighlightText !important;
  }
}
</style>
