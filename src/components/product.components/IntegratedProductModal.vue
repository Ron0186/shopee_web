<template>
  <div class="modal" :class="{ 'show d-block': isOpen }">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? "編輯商品" : "新增商品" }}</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <!-- 分頁導航 -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'basic' }"
                href="#"
                @click.prevent="activeTab = 'basic'"
              >
                基本資訊
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'sku' }"
                href="#"
                @click.prevent="activeTab = 'sku'"
                :disabled="!canEditSku"
              >
                商品規格 (SKU)
              </a>
            </li>
          </ul>

          <!-- 基本資訊頁面 -->
          <div v-if="activeTab === 'basic'">
            <form>
              <!-- 商品ID（編輯模式下顯示） -->
              <div class="mb-3" v-if="isEdit && productData.productId">
                <label for="productId" class="form-label">商品 ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="productId"
                  v-model="productData.productId"
                  readonly
                />
              </div>

              <div class="mb-3">
                <label for="productName" class="form-label">商品名稱</label>
                <input
                  type="text"
                  class="form-control"
                  id="productName"
                  v-model="productData.productName"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">商品描述</label>
                <textarea
                  class="form-control"
                  id="description"
                  v-model="productData.description"
                  rows="3"
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="category1" class="form-label">一級分類</label>
                <select
                  class="form-select"
                  id="category1"
                  v-model="productData.category1Id"
                  @change="onCategory1Change"
                  required
                  :disabled="isEdit && !canEditCategories"
                >
                  <option value="" disabled selected>請選擇一級分類</option>
                  <option
                    v-for="category in category1List"
                    :key="category.categoryId"
                    :value="category.categoryId"
                  >
                    {{ category.categoryName }}
                  </option>
                </select>
                <small v-if="isEdit && !canEditCategories" class="text-muted"
                  >分類關聯不可變更，如需變更請刪除後重新建立商品</small
                >
              </div>

              <div class="mb-3">
                <label for="category2" class="form-label">二級分類</label>
                <select
                  class="form-select"
                  id="category2"
                  v-model="productData.category2Id"
                  required
                  :disabled="
                    !productData.category1Id || (isEdit && !canEditCategories)
                  "
                >
                  <option value="" disabled selected>請選擇二級分類</option>
                  <option
                    v-for="category in category2List"
                    :key="category.categoryId"
                    :value="category.categoryId"
                  >
                    {{ category.categoryName }}
                  </option>
                </select>
                <small v-if="isEdit && !canEditCategories" class="text-muted"
                  >分類關聯不可變更，如需變更請刪除後重新建立商品</small
                >
              </div>

              <!-- 商品圖片區 -->
              <div class="mb-3">
                <label for="productImages" class="form-label"
                  >商品圖片（可上傳多張）</label
                >
                <input
                  type="file"
                  class="form-control"
                  id="productImages"
                  accept="image/*"
                  @change="handleImagesChange"
                  multiple
                />
                <small class="form-text text-muted">
                  您可以選擇多張圖片一次上傳
                </small>

                <!-- 現有圖片預覽 -->
                <div v-if="isEdit && existingImages.length > 0" class="mt-3">
                  <label class="form-label">現有圖片</label>
                  <div class="row g-2">
                    <div
                      v-for="(image, index) in existingImages"
                      :key="'existing-' + index"
                      class="col-md-4 col-6"
                    >
                      <div class="card h-100">
                        <div class="position-relative">
                          <img
                            :src="getImageUrl(image)"
                            alt="商品圖片"
                            class="card-img-top"
                            style="
                              height: 150px;
                              object-fit: contain;
                              padding: 10px;
                            "
                            @error="handleImageError($event, image)"
                          />
                          <span
                            v-if="image.isPrimary"
                            class="position-absolute top-0 start-0 badge bg-primary m-2"
                          >
                            主圖
                          </span>
                          <button
                            type="button"
                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            @click="removeExistingImage(index)"
                            title="移除圖片"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                        <div class="card-body pt-2 pb-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="radio"
                              name="primaryExistingImage"
                              :id="`primaryExistingImage${index}`"
                              :checked="image.isPrimary"
                              @change="setExistingImageAsPrimary(index)"
                            />
                            <label
                              class="form-check-label"
                              :for="`primaryExistingImage${index}`"
                            >
                              設為主圖
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="existingImages.length === 0"
                    class="alert alert-info mt-2"
                  >
                    此商品目前沒有圖片
                  </div>
                </div>

                <!-- 新圖片預覽 -->
                <div v-if="newImages.length > 0" class="mt-3">
                  <label class="form-label">
                    {{ isEdit ? "新增圖片" : "圖片預覽" }}
                  </label>
                  <div class="row g-2">
                    <div
                      v-for="(image, index) in newImages"
                      :key="'new-' + index"
                      class="col-md-4 col-6"
                    >
                      <div class="card h-100">
                        <div class="position-relative">
                          <img
                            :src="image.preview"
                            alt="預覽圖片"
                            class="card-img-top"
                            style="
                              height: 150px;
                              object-fit: contain;
                              padding: 10px;
                            "
                          />
                          <span
                            v-if="image.isPrimary"
                            class="position-absolute top-0 start-0 badge bg-success m-2"
                          >
                            {{ isEdit ? "新主圖" : "主圖" }}
                          </span>
                          <button
                            type="button"
                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            @click="removeNewImage(index)"
                            title="移除圖片"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                        <div class="card-body pt-2 pb-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="radio"
                              name="primaryNewImage"
                              :id="`primaryNewImage${index}`"
                              :checked="image.isPrimary"
                              @change="setNewImageAsPrimary(index)"
                            />
                            <label
                              class="form-check-label"
                              :for="`primaryNewImage${index}`"
                            >
                              設為主圖
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="activeCheck"
                  v-model="productData.active"
                />
                <label class="form-check-label" for="activeCheck"
                  >上架商品</label
                >
              </div>
            </form>
          </div>

          <!-- SKU設定頁面 -->
          <div v-if="activeTab === 'sku'">
            <div class="alert alert-info mb-3" v-if="isEdit">
              <i class="bi bi-info-circle me-2"></i>
              編輯模式下，您可以修改現有 SKU
              的價格和庫存，但無法修改規格類型和值。如需更改規格組合，請在基本資訊頁面刪除商品並重新創建。
            </div>
            <!-- 規格設定區 -->
            <div class="mb-4">
              <h6>設定商品規格</h6>
              <div v-if="specOptions.length === 0" class="alert alert-info">
                請先添加商品規格選項
              </div>

              <div
                v-for="(spec, index) in specOptions"
                :key="index"
                class="mb-3"
              >
                <div class="d-flex mb-2">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="spec.name"
                    placeholder="規格名稱 (如: 顏色、尺寸)"
                    :class="{ 'is-invalid': spec.nameError }"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="removeSpec(index)"
                    :disabled="specOptions.length <= 1"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <div class="invalid-feedback d-block" v-if="spec.nameError">
                  {{ spec.nameError }}
                </div>

                <div class="d-flex flex-wrap align-items-center mb-2">
                  <div
                    v-for="(value, valueIndex) in spec.values"
                    :key="valueIndex"
                    class="d-flex align-items-center me-2 mb-2"
                  >
                    <input
                      type="text"
                      class="form-control form-control-sm me-1"
                      style="width: 120px"
                      v-model="spec.values[valueIndex]"
                      placeholder="規格值"
                      :class="{ 'is-invalid': spec.valueErrors[valueIndex] }"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeSpecValue(index, valueIndex)"
                      :disabled="spec.values.length <= 1"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                    <div
                      class="invalid-feedback d-block"
                      v-if="spec.valueErrors[valueIndex]"
                    >
                      {{ spec.valueErrors[valueIndex] }}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary mb-2"
                    @click="addSpecValue(index)"
                  >
                    <i class="bi bi-plus"></i> 添加規格值
                  </button>
                </div>
              </div>

              <div class="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="addSpec"
                  :disabled="isEdit && generatedSkus.length > 0"
                >
                  <i class="bi bi-plus-circle"></i> 添加規格類型
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="confirmGenerateSkuList"
                  :disabled="
                    !canGenerateSku || (isEdit && generatedSkus.length > 0)
                  "
                >
                  <i class="bi bi-gear"></i>
                  {{ isEdit ? "重新生成 SKU 列表" : "生成 SKU 列表" }}
                </button>
              </div>
            </div>

            <!-- 生成的SKU列表 -->
            <div v-if="generatedSkus.length > 0" class="mb-4">
              <h6>SKU 列表設定</h6>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th width="40%">規格組合</th>
                      <th>價格 (NT$)</th>
                      <th>庫存</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sku, index) in generatedSkus" :key="index">
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
                      <td>
                        <input
                          type="number"
                          class="form-control"
                          v-model="sku.price"
                          min="0"
                          step="1"
                          required
                          :class="{ 'is-invalid': sku.priceError }"
                        />
                        <div class="invalid-feedback" v-if="sku.priceError">
                          {{ sku.priceError }}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control"
                          v-model="sku.stock"
                          min="0"
                          required
                          :class="{ 'is-invalid': sku.stockError }"
                        />
                        <div class="invalid-feedback" v-if="sku.stockError">
                          {{ sku.stockError }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 批量設定 -->
              <div class="card mb-3">
                <div class="card-header bg-light">批量設定</div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label">統一價格:</label>
                      <div class="input-group">
                        <input
                          type="number"
                          class="form-control"
                          v-model="batchSettings.price"
                          min="0"
                          step="1"
                        />
                        <button
                          class="btn btn-outline-secondary"
                          type="button"
                          @click="applyBatchSetting('price')"
                        >
                          應用
                        </button>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">統一庫存:</label>
                      <div class="input-group">
                        <input
                          type="number"
                          class="form-control"
                          v-model="batchSettings.stock"
                          min="0"
                        />
                        <button
                          class="btn btn-outline-secondary"
                          type="button"
                          @click="applyBatchSetting('stock')"
                        >
                          應用
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            取消
          </button>
          <button
            v-if="activeTab === 'basic'"
            type="button"
            class="btn btn-primary"
            @click="nextStep"
            :disabled="isSubmitting"
          >
            {{ isEdit ? "下一步：編輯規格" : "下一步：設定商品規格" }}
          </button>
          <button
            v-else-if="activeTab === 'sku' && !isEdit"
            type="button"
            class="btn btn-primary"
            @click="submitProductWithSku"
            :disabled="isSubmitting || (generatedSkus.length === 0 && !skipSku)"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? "處理中..." : "確認新增" }}
          </button>
          <button
            v-else-if="activeTab === 'sku' && isEdit"
            type="button"
            class="btn btn-primary"
            @click="updateProductWithSku"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? "處理中..." : "確認更新" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  defineProps,
  defineEmits,
} from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  productData: Object,
  isEdit: Boolean,
});

const emit = defineEmits(["close", "refresh"]);

// 用戶店舖資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;
const baseUrl = ref(import.meta.env.VITE_API_URL || "");

// 基本資料
const activeTab = ref("basic");
const isSubmitting = ref(false);
const canEditCategories = ref(false);

// 商品資料
const productData = reactive({
  productId: null,
  productName: "",
  description: "",
  category1Id: "",
  category2Id: "",
  active: true,
});

// 圖片相關
const existingImages = ref([]);
const newImages = ref([]);
const imagesToDelete = ref(new Set());

// 分類相關
const category1List = ref([]);
const category2List = ref([]);

// SKU相關
const skipSku = ref(false);
const specOptions = ref([
  { name: "", values: [""], nameError: "", valueErrors: [""] },
]);
const generatedSkus = ref([]);
const batchSettings = reactive({ price: 0, stock: 0 });

// 計算屬性
const canEditSku = computed(
  () => props.isEdit || productData.productId || validateBasicInfo(true)
);
const canGenerateSku = computed(
  () =>
    specOptions.value.length > 0 &&
    specOptions.value.every(
      (spec) =>
        spec.name.trim() !== "" && spec.values.some((v) => v.trim() !== "")
    )
);

// 監聽器：當模態窗口打開或數據變化時
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      if (!props.isEdit) resetForm();
      else loadProductData();
      fetchCategory1();
    }
  }
);

watch(
  () => props.productData,
  (newVal) => {
    if (newVal && props.isEdit && props.isOpen) loadProductData();
  }
);

watch(
  () => category1List.value,
  (newList) => {
    if (newList.length > 0 && productData.category1Id) {
      // 确保分类1显示正确
      const cat1 = newList.find((c) => c.categoryId == productData.category1Id);
      if (!cat1 && props.productData?.category1?.categoryName) {
        // 如果找不到匹配的分类但有名称，添加一个临时分类
        category1List.value.push({
          categoryId: productData.category1Id,
          categoryName: props.productData.category1.categoryName,
        });
      }
    }
  },
  { immediate: true }
);

watch(
  () => category2List.value,
  (newList) => {
    if (newList.length > 0 && productData.category2Id) {
      const cat2 = newList.find((c) => c.categoryId == productData.category2Id);
      if (!cat2 && props.productData?.category2?.categoryName) {
        category2List.value.push({
          categoryId: productData.category2Id,
          categoryName: props.productData.category2.categoryName,
        });
      }
    }
  },
  { immediate: true }
);

// 监听标签切换
watch(
  () => activeTab.value,
  async (newTab) => {
    if (
      newTab === "sku" &&
      props.isEdit &&
      generatedSkus.value.length === 0 &&
      productData.productId
    ) {
      console.log("在标签切换时获取 SKU 数据");
      await fetchSkuData();
    }
  }
);

// 监听 productId 变化
watch(
  () => productData.productId,
  async (newId, oldId) => {
    if (newId && newId !== oldId && props.isEdit && activeTab.value === "sku") {
      console.log("产品 ID 变化，重新获取 SKU 数据");
      await fetchSkuData();
    }
  }
);

// 數據加載方法
const loadProductData = async () => {
  if (!props.productData) {
    console.log("没有数据传入");
    return;
  }

  console.log("加载的数据:", props.productData);

  // 重置部分表单
  newImages.value = [];
  imagesToDelete.value = new Set();

  // 读取基本资料
  productData.productId = props.productData.productId || props.productData.id;
  productData.productName = props.productData.productName || "";
  productData.description = props.productData.description || "";
  productData.active =
    props.productData.active === undefined ? true : props.productData.active;

  console.log("处理后的商品数据:", productData);

  // 提取分类
  const { category1Id, category2Id } = extractCategoryIds(props.productData);
  productData.category1Id = category1Id;
  productData.category2Id = category2Id;

  console.log("提取的分类ID:", { category1Id, category2Id });

  // 載入資料
  if (productData.category1Id) await fetchCategory2(productData.category1Id);

  // 确保获取产品图片
  if (productData.productId) {
    console.log("加载商品图片, ID:", productData.productId);
    await fetchProductImages(productData.productId);
  }

  // 如果没有从API获取到图片，尝试直接从props中提取
  if (existingImages.value.length === 0 && props.productData) {
    console.log("API没有获取到图片，从props中提取");

    if (
      props.productData.productImages &&
      props.productData.productImages.length > 0
    ) {
      existingImages.value = props.productData.productImages.map((img) => ({
        ...img,
        isPrimary: !!img.isPrimary,
        id: img.id || img.imageId,
        imagePath: img.imagePath || img.imageUrl || "",
      }));
    } else if (props.productData.primaryImageUrl) {
      existingImages.value = [
        {
          id: null,
          imagePath: props.productData.primaryImageUrl,
          isPrimary: true,
        },
      ];
    }

    console.log("从props提取的图片:", existingImages.value);
  }

  // 尝试从多个来源获取 SKU 数据
  if (props.isEdit) {
    console.log("编辑模式，尝试获取 SKU 数据");

    // 首先尝试从 props 中获取
    if (props.productData.skus?.length > 0) {
      console.log("从 props 中发现 SKU 数据，开始重构");
      reconstructSkuData(props.productData.skus);
    }
    // 如果 props 中没有 SKU 数据，尝试从 API 获取
    else if (productData.productId) {
      console.log("从 API 获取 SKU 数据");
      await fetchSkuData();
    }
  }
};

const confirmGenerateSkuList = () => {
  if (isEdit.value && generatedSkus.value.length > 0) {
    Swal.fire({
      title: "確認操作",
      text: "在編輯模式下，重新生成 SKU 列表可能會導致資料丟失。是否繼續？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "繼續",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        generateSkuList();
      }
    });
  } else {
    generateSkuList();
  }
};

// 從API響應中提取分類ID
const extractCategoryIds = (data) => {
  let category1Id = null;
  let category2Id = null;

  if (data.category1?.id) category1Id = data.category1.id;
  else if (data.category1Id) category1Id = data.category1Id;
  else if (data.category1?.categoryId) category1Id = data.category1.categoryId;

  if (data.category2?.id) category2Id = data.category2.id;
  else if (data.category2Id) category2Id = data.category2Id;
  else if (data.category2?.categoryId) category2Id = data.category2.categoryId;

  return { category1Id, category2Id };
};

// 獲取圖片URL
const getImageUrl = (image) => {
  if (!image) return "/assets/default-image.png";

  console.log("处理图片URL, 图片数据:", image);

  const imagePath =
    image.imagePath || image.imageUrl || image.path || image.url;

  if (!imagePath) return "/assets/default-image.png";

  return imagePath.startsWith("http")
    ? imagePath
    : imagePath.startsWith("/")
    ? `${baseUrl.value}${imagePath}`
    : `${baseUrl.value}/${imagePath}`;
};

// 處理圖片載入錯誤
const handleImageError = (event, image) => {
  const fallbackUrl = image.imagePath
    ? image.imagePath.startsWith("/")
      ? `${baseUrl.value}${image.imagePath.substring(1)}`
      : `${baseUrl.value}/${image.imagePath}`
    : "/assets/default-image.png";

  event.target.src = fallbackUrl;
};

// 重建SKU數據
const reconstructSkuData = (skus) => {
  if (!skus?.length) return;

  console.log("重构 SKU 数据，收到的 SKU:", skus);

  // 清除现有规格选项
  specOptions.value = [];

  // 从所有 SKU 中收集规格值
  const specMap = {};
  skus.forEach((sku) => {
    if (!sku.specPairs) return;
    Object.entries(sku.specPairs).forEach(([key, value]) => {
      if (!specMap[key]) specMap[key] = new Set();
      specMap[key].add(value);
    });
  });

  console.log("提取的规格映射:", specMap);

  // 根据收集的数据创建规格选项
  specOptions.value = Object.entries(specMap).map(([name, valuesSet]) => ({
    name,
    values: Array.from(valuesSet),
    nameError: "",
    valueErrors: Array(valuesSet.size).fill(""),
  }));

  console.log("重构后的规格选项:", specOptions.value);

  // 使用现有数据重建 SKU 列表
  generatedSkus.value = skus.map((sku) => ({
    id: sku.id || sku.skuId,
    specPairs: { ...sku.specPairs },
    price: sku.price,
    stock: sku.stock,
    priceError: "",
    stockError: "",
  }));

  console.log("重构后的 SKU 列表:", generatedSkus.value);
};

const backfillSkuData = () => {
  // 如果没有数据或已经生成，则跳过
  if (!props.productData?.skus?.length || generatedSkus.value.length > 0)
    return;

  // 从现有产品重构规格选项和 SKU 数据
  reconstructSkuData(props.productData.skus);

  // 如果可用，根据第一个 SKU 设置默认批量值
  if (generatedSkus.value.length > 0) {
    const firstSku = generatedSkus.value[0];
    batchSettings.price = firstSku.price || 0;
    batchSettings.stock = firstSku.stock || 0;
  }
};

const fetchSkuData = async () => {
  try {
    if (!productData.productId) {
      console.log("沒有產品 ID，無法獲取 SKU 數據");
      return false;
    }

    const productId = parseInt(productData.productId);
    if (isNaN(productId) || productId <= 0) {
      console.error("產品 ID 無效:", productData.productId);
      return false;
    }

    console.log("正在獲取 SKU 數據，產品 ID:", productId);

    const response = await axios.get(`/api/products/${productId}/skus`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    console.log("获取到的 SKU 数据:", response.data);

    if (response.data && Array.isArray(response.data)) {
      // 重构 SKU 数据
      reconstructSkuData(response.data);
      return true;
    } else {
      console.warn("获取到的 SKU 数据格式不符合预期");
      return false;
    }
  } catch (error) {
    console.error("获取 SKU 数据失败:", error);
    console.error("错误详情:", error.response?.data || error.message);
    return false;
  }
};

// API請求方法
const fetchProductImages = async (productId) => {
  try {
    console.log("正在获取商品图片, 商品ID:", productId);

    const response = await axios.get(`/api/products/${productId}/images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      console.log("API返回的图片数据:", response.data);

      existingImages.value = response.data.map((img) => ({
        ...img,
        imagePath: img.imagePath,
        isPrimary: !!img.isPrimary,
        id: img.id || img.imageId,
      }));

      console.log("处理后的图片数据:", existingImages.value);
    }
  } catch (error) {
    console.error("获取商品图片错误:", error);

    // 从 props 获取图片信息
    if (props.productData) {
      console.log("尝试从props获取图片数据:", props.productData);

      // 尝试多种可能的数据结构
      if (
        props.productData.productImages &&
        props.productData.productImages.length > 0
      ) {
        console.log("从productImages获取图片");
        existingImages.value = props.productData.productImages.map((img) => ({
          ...img,
          isPrimary: !!img.isPrimary,
          id: img.id || img.imageId,
          imagePath: img.imagePath || img.imageUrl || "",
        }));
      } else if (props.productData.primaryImageUrl) {
        console.log("从primaryImageUrl获取图片");
        existingImages.value = [
          {
            id: null,
            imagePath: props.productData.primaryImageUrl,
            isPrimary: true,
          },
        ];
      } else if (props.productData.image) {
        console.log("从image获取图片");
        existingImages.value = [
          {
            id: null,
            imagePath: props.productData.image,
            isPrimary: true,
          },
        ];
      }

      console.log("最终设置的图片数据:", existingImages.value);
    }
  }
};

const fetchCategory1 = async () => {
  try {
    const response = await axios.get("/api/category1/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      category1List.value = response.data.map((cat) => ({
        categoryId: cat.id || cat.categoryId,
        categoryName: cat.name || cat.categoryName,
      }));
    }
  } catch (error) {
    console.error("獲取一級分類錯誤:", error);
    Swal.fire({
      title: "載入分類失敗",
      text: error.response?.data?.message || "無法獲取一級分類資料",
      icon: "error",
    });
  }
};

const fetchCategory2 = async (parentId) => {
  if (!parentId) {
    category2List.value = [];
    return;
  }

  try {
    const response = await axios.get("/api/category2/byC1", {
      params: { category1Id: parentId },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      category2List.value = response.data.map((cat) => ({
        categoryId: cat.id || cat.categoryId,
        categoryName: cat.name || cat.categoryName,
      }));
    }
  } catch (error) {
    console.error("獲取二級分類錯誤:", error);
  }
};

// 事件處理方法
const onCategory1Change = () => {
  productData.category2Id = "";
  fetchCategory2(productData.category1Id);
};

const handleImagesChange = (event) => {
  const files = event.target.files;
  if (!files?.length) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = (e) => {
      newImages.value.push({
        file: file,
        preview: e.target.result,
        isPrimary:
          newImages.value.length === 0 && existingImages.value.length === 0,
      });

      if (newImages.value.length === 1 && existingImages.value.length === 0) {
        resetAllPrimaryFlags();
        newImages.value[0].isPrimary = true;
      }
    };

    reader.readAsDataURL(file);
  }
};

const removeExistingImage = (index) => {
  const imageToRemove = existingImages.value[index];

  if (imageToRemove.id) imagesToDelete.value.add(imageToRemove.id);

  if (imageToRemove.isPrimary) {
    if (existingImages.value.length > 1) {
      const nextIndex = (index + 1) % existingImages.value.length;
      resetAllPrimaryFlags();
      existingImages.value[nextIndex].isPrimary = true;
    } else if (newImages.value.length > 0) {
      resetAllPrimaryFlags();
      newImages.value[0].isPrimary = true;
    }
  }

  existingImages.value.splice(index, 1);
};

const removeNewImage = (index) => {
  const imageToRemove = newImages.value[index];

  if (imageToRemove.isPrimary) {
    if (newImages.value.length > 1) {
      const nextIndex = (index + 1) % newImages.value.length;
      resetAllPrimaryFlags();
      newImages.value[nextIndex].isPrimary = true;
    } else if (existingImages.value.length > 0) {
      resetAllPrimaryFlags();
      existingImages.value[0].isPrimary = true;
    }
  }

  newImages.value.splice(index, 1);
};

const setExistingImageAsPrimary = (index) => {
  resetAllPrimaryFlags();
  existingImages.value[index].isPrimary = true;
};

const setNewImageAsPrimary = (index) => {
  resetAllPrimaryFlags();
  newImages.value[index].isPrimary = true;
};

const resetAllPrimaryFlags = () => {
  existingImages.value.forEach((img) => {
    img.isPrimary = false;
  });
  newImages.value.forEach((img) => {
    img.isPrimary = false;
  });
};

// SKU相關方法
const addSpec = () => {
  specOptions.value.push({
    name: "",
    values: [""],
    nameError: "",
    valueErrors: [""],
  });
};

const removeSpec = (index) => {
  if (specOptions.value.length > 1) {
    specOptions.value.splice(index, 1);
  }
};

const addSpecValue = (specIndex) => {
  specOptions.value[specIndex].values.push("");
  specOptions.value[specIndex].valueErrors.push("");
};

const removeSpecValue = (specIndex, valueIndex) => {
  if (specOptions.value[specIndex].values.length > 1) {
    specOptions.value[specIndex].values.splice(valueIndex, 1);
    specOptions.value[specIndex].valueErrors.splice(valueIndex, 1);
  }
};

const validateSpecOptions = () => {
  let valid = true;

  specOptions.value.forEach((spec, specIndex) => {
    // 驗證規格名稱
    if (!spec.name.trim()) {
      spec.nameError = "規格名稱不能為空";
      valid = false;
    } else {
      spec.nameError = "";
    }

    // 驗證規格值
    let hasValidValue = false;
    spec.values.forEach((value, valueIndex) => {
      if (!value.trim()) {
        spec.valueErrors[valueIndex] = "規格值不能為空";
        valid = false;
      } else {
        spec.valueErrors[valueIndex] = "";
        hasValidValue = true;
      }
    });

    if (!hasValidValue) valid = false;

    // 檢查重複
    const otherSpecs = specOptions.value.filter((_, i) => i !== specIndex);
    if (otherSpecs.some((s) => s.name === spec.name)) {
      spec.nameError = "規格名稱不能重複";
      valid = false;
    }
  });

  return valid;
};

const generateCartesianProduct = (arrays) => {
  return arrays.reduce(
    (acc, curr) => acc.map((x) => curr.map((y) => [...x, y])).flat(),
    [[]]
  );
};

const generateSkuList = () => {
  // 如果我们已经有 SKU 并且处于编辑模式，
  // 在重新生成前确认，因为这会丢失现有数据
  if (props.isEdit && generatedSkus.value.length > 0) {
    Swal.fire({
      title: "確認重新生成",
      text: "重新生成會覆蓋現有的SKU數據，是否繼續？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "確認",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        doGenerateSkuList();
      }
    });
  } else {
    doGenerateSkuList();
  }
};

const doGenerateSkuList = () => {
  if (!validateSpecOptions()) return;

  // 暫存當前的 SKU 資料 (以便保留已有的價格和庫存)
  const existingSkuMap = {};
  generatedSkus.value.forEach((sku) => {
    // 創建一個唯一的鍵值來標識每個 SKU
    const key = Object.entries(sku.specPairs)
      .map(([k, v]) => `${k}:${v}`)
      .sort()
      .join("|");

    existingSkuMap[key] = {
      id: sku.id,
      price: sku.price,
      stock: sku.stock,
    };
  });

  // 准备规格
  const validSpecs = specOptions.value
    .map((spec) => ({
      name: spec.name,
      values: spec.values.filter((v) => v.trim() !== ""),
    }))
    .filter((spec) => spec.name && spec.values.length > 0);

  if (validSpecs.length === 0) {
    Swal.fire({
      title: "無效的規格",
      text: "請至少添加一個有效的規格和規格值",
      icon: "warning",
    });
    return;
  }

  const specNames = validSpecs.map((spec) => spec.name);
  const specValuesList = validSpecs.map((spec) => spec.values);

  // 生成组合
  const combinations = generateCartesianProduct(specValuesList);

  // 创建 SKUs
  generatedSkus.value = combinations.map((combination) => {
    // 创建规格对
    const specPairs = {};
    specNames.forEach((name, index) => {
      specPairs[name] = combination[index];
    });

    // 創建用於查找的鍵值
    const key = Object.entries(specPairs)
      .map(([k, v]) => `${k}:${v}`)
      .sort()
      .join("|");

    // 檢查是否有匹配的現有 SKU
    const existingSku = existingSkuMap[key];

    return {
      id: existingSku?.id || null,
      specPairs,
      price: existingSku?.price || 0,
      stock: existingSku?.stock || 0,
      priceError: "",
      stockError: "",
    };
  });

  // 顯示提示
  if (props.isEdit && Object.keys(existingSkuMap).length > 0) {
    Swal.fire({
      title: "SKU 列表已更新",
      text: "已保留現有 SKU 的價格和庫存數據",
      icon: "info",
      timer: 1500,
    });
  }

  // 批量設置僅應用於新 SKU
  if (batchSettings.price > 0 || batchSettings.stock > 0) {
    // 詢問是否要對所有 SKU 應用批量設置
    Swal.fire({
      title: "批量設置",
      text: "是否要對所有 SKU 應用批量設置值？選擇「否」將只對新 SKU 應用",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "是，全部 SKU",
      cancelButtonText: "否，僅新 SKU",
    }).then((result) => {
      if (result.isConfirmed) {
        // 應用於所有 SKU
        if (batchSettings.price > 0) applyBatchSetting("price");
        if (batchSettings.stock > 0) applyBatchSetting("stock");
      } else {
        // 僅應用於新 SKU (無 id 的)
        generatedSkus.value.forEach((sku) => {
          if (!sku.id) {
            if (batchSettings.price > 0) sku.price = batchSettings.price;
            if (batchSettings.stock > 0) sku.stock = batchSettings.stock;
          }
        });
      }
    });
  }
};

const applyBatchSetting = (field) => {
  const value = batchSettings[field];
  generatedSkus.value.forEach((sku) => {
    sku[field] = value;
    sku[`${field}Error`] = "";
  });
};

const validateGeneratedSkus = () => {
  let valid = true;

  generatedSkus.value.forEach((sku) => {
    // 驗證價格
    let price = Number(sku.price);
    if (isNaN(price)) {
      try {
        price = parseFloat(sku.price);
      } catch (e) {
        price = NaN;
      }
    }

    if (isNaN(price) || price < 0) {
      sku.priceError = "價格必須為0或正數";
      valid = false;
    } else {
      sku.price = price; // 確保是數字
      sku.priceError = "";
    }

    // 驗證庫存
    let stock = Number(sku.stock);
    if (isNaN(stock)) {
      try {
        stock = parseInt(sku.stock);
      } catch (e) {
        stock = NaN;
      }
    }

    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      sku.stockError = "庫存必須為0或正整數";
      valid = false;
    } else {
      sku.stock = stock; // 確保是數字
      sku.stockError = "";
    }
  });

  return valid;
};

// 表單驗證與提交
const validateBasicInfo = (silent = false) => {
  let valid = true;

  if (!productData.productName) {
    if (!silent) Swal.fire({ title: "請輸入商品名稱", icon: "warning" });
    valid = false;
  }

  if (!productData.category1Id) {
    if (!silent) Swal.fire({ title: "請選擇一級分類", icon: "warning" });
    valid = false;
  }

  if (!productData.category2Id) {
    if (!silent) Swal.fire({ title: "請選擇二級分類", icon: "warning" });
    valid = false;
  }

  return valid;
};

const nextStep = async () => {
  if (!validateBasicInfo()) return;

  // 新增模式先保存基本資訊
  if (!props.isEdit && !productData.productId) {
    await saveBasicInfo();
  }

  // 在切换到 SKU 标签前，确保 SKU 数据已加载
  if (
    props.isEdit &&
    generatedSkus.value.length === 0 &&
    productData.productId
  ) {
    console.log("切换到 SKU 标签前获取 SKU 数据");
    const success = await fetchSkuData();

    if (success) {
      console.log("成功获取并构建 SKU 数据");
      Swal.fire({
        title: "已载入现有规格",
        text: "已自动加载商品规格数据",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  activeTab.value = "sku";
};

const saveBasicInfo = async () => {
  try {
    isSubmitting.value = true;

    // 創建表單
    const formData = new FormData();
    formData.append("userId", userStore.userId);
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("category1Id", productData.category1Id);
    formData.append("category2Id", productData.category2Id);
    formData.append("active", productData.active);

    // 處理圖片
    const primaryImage = newImages.value.find((img) => img.isPrimary);

    if (primaryImage) {
      formData.append("images", primaryImage.file);
      formData.append("isPrimaryNew", "true");
    }

    newImages.value.forEach((img) => {
      if (!img.isPrimary) {
        formData.append("images", img.file);
      }
    });

    const response = await axios.post("/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      if (response.data?.productId) {
        productData.productId = response.data.productId;
        return true;
      } else {
        Swal.fire({
          title: "錯誤",
          text: "無法獲取商品ID",
          icon: "error",
        });
        return false;
      }
    } else {
      throw new Error("新增失敗");
    }
  } catch (error) {
    console.error("新增商品錯誤:", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || error.message || "請求處理失敗",
      icon: "error",
    });
    return false;
  } finally {
    isSubmitting.value = false;
  }
};

const updateProduct = async () => {
  try {
    if (!productData.productName) {
      Swal.fire({ title: "請輸入商品名稱", icon: "warning" });
      return false;
    }

    isSubmitting.value = true;

    const formData = new FormData();
    formData.append("productId", productData.productId);
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("active", productData.active);

    // 處理刪除圖片
    if (imagesToDelete.value.size > 0) {
      const deleteIds = Array.from(imagesToDelete.value);
      deleteIds.forEach((id) => {
        formData.append("deleteImageIds", id.toString());
      });
    }

    // 處理主圖
    const primaryExistingImage = existingImages.value.find(
      (img) => img.isPrimary
    );
    if (primaryExistingImage?.id) {
      formData.append("primaryImageId", primaryExistingImage.id);
    }

    // 處理新圖片
    if (newImages.value.length > 0) {
      newImages.value.forEach((img) => {
        if (img.file) {
          formData.append("newImages", img.file);
        }
      });
    }

    const response = await axios.put(
      `/api/products/${productData.productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      closeModal();
      Swal.fire({
        title: "更新成功",
        text: "商品已成功更新",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      emit("refresh");
      return true;
    } else {
      throw new Error("更新失敗");
    }
  } catch (error) {
    console.error("更新商品錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.response?.data?.message || error.message || "請求處理失敗",
      icon: "error",
    });
    return false;
  } finally {
    isSubmitting.value = false;
  }
};

const updateProductWithSku = async () => {
  try {
    // 先更新基本資訊
    const basicInfoUpdated = await updateProduct();
    if (!basicInfoUpdated) return;

    // 如果沒有 SKU 資料，直接返回
    if (generatedSkus.value.length === 0) {
      closeModal();
      emit("refresh");
      return;
    }

    // 驗證 SKU 資料
    if (!validateGeneratedSkus()) {
      return;
    }

    isSubmitting.value = true;

    // 分類處理 - 只更新現有的 SKU，不處理新增
    const existingSkus = generatedSkus.value.filter((sku) => sku.id);
    let successCount = 0;
    let errorCount = 0;

    // 逐一更新現有 SKU 的價格和庫存
    for (const sku of existingSkus) {
      try {
        // 確保數據格式正確
        const updateData = {
          price: Number(sku.price),
          stock: Number(sku.stock),
        };

        console.log(`更新 SKU ${sku.id}，數據:`, updateData);

        // 發送請求更新
        const response = await axios.put(`/api/skus/${sku.id}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        if (response.status >= 200 && response.status < 300) {
          successCount++;
        } else {
          errorCount++;
          console.error(`更新 SKU ${sku.id} 失敗:`, response);
        }
      } catch (error) {
        errorCount++;
        console.error(`更新 SKU ${sku.id} 錯誤:`, error);
      }
    }

    // 顯示更新結果
    if (errorCount > 0) {
      Swal.fire({
        title: "部分更新失敗",
        text: `成功更新 ${successCount} 個 SKU，${errorCount} 個更新失敗`,
        icon: "warning",
      });
    } else if (successCount > 0) {
      Swal.fire({
        title: "更新成功",
        text: `已成功更新 ${successCount} 個 SKU 的價格和庫存`,
        icon: "success",
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: "未進行更新",
        text: "沒有現有的 SKU 需要更新",
        icon: "info",
      });
    }

    // 清理並刷新
    emit("refresh");
    closeModal();
  } catch (error) {
    console.error("更新 SKU 時發生錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.message || "未知錯誤",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const submitProductWithSku = async () => {
  try {
    if (!productData.productId) {
      const saved = await saveBasicInfo();
      if (!saved || !productData.productId) {
        Swal.fire({
          title: "錯誤",
          text: "未能獲取商品ID",
          icon: "error",
        });
        return;
      }
    }

    if (skipSku.value || generatedSkus.value.length === 0) {
      closeModal();
      Swal.fire({
        title: "新增成功",
        text: "商品已成功新增",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      emit("refresh");
      return;
    }

    if (!validateGeneratedSkus()) {
      return;
    }

    isSubmitting.value = true;

    // 創建SKU數據
    const skuData = generatedSkus.value.map((sku) => ({
      specPairs: { ...sku.specPairs },
      price: sku.price,
      stock: sku.stock,
    }));

    const response = await axios.post(
      `/api/products/${productData.productId}/skus/batch`,
      skuData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      closeModal();
      Swal.fire({
        title: "新增成功",
        text: "商品及SKU已成功新增",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      emit("refresh");
    } else {
      throw new Error("新增SKU失敗");
    }
  } catch (error) {
    console.error("新增SKU錯誤:", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || "無法新增SKU",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 重置與關閉
const resetForm = () => {
  productData.productName = "";
  productData.description = "";
  productData.category1Id = "";
  productData.category2Id = "";
  productData.active = true;
  productData.productId = null;
  existingImages.value = [];
  newImages.value = [];
  imagesToDelete.value = new Set();
  activeTab.value = "basic";
  skipSku.value = false;
  specOptions.value = [
    { name: "", values: [""], nameError: "", valueErrors: [""] },
  ];
  generatedSkus.value = [];
  batchSettings.price = 0;
  batchSettings.stock = 0;
};

const closeModal = () => {
  // 如果有提交中的請求，詢問用戶是否確定要關閉
  if (isSubmitting.value) {
    Swal.fire({
      title: "確認關閉",
      text: "資料正在提交中，確定要關閉嗎？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "確定",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        emit("close");
      }
    });
  } else {
    resetForm();
    emit("close");
  }
};

// 掛載時初始化
onMounted(() => {
  console.log("组件挂载完成");
  if (props.isOpen && props.productData) {
    console.log("初始化时加载商品数据:", props.productData);

    // 如果直接有productId，立即加载图片
    if (props.productData.productId || props.productData.id) {
      const productId = props.productData.productId || props.productData.id;
      console.log("组件挂载时加载图片, 商品ID:", productId);
      fetchProductImages(productId);
    }
  }
  // 添加頁面關閉前的事件處理
  window.addEventListener("beforeunload", (event) => {
    if (isSubmitting.value) {
      // 提示用戶有未完成的操作
      event.preventDefault();
      event.returnValue = "";
    }
  });
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.sku-spec {
  display: inline-block;
  margin-right: 1rem;
}

.spec-key {
  font-weight: bold;
  margin-right: 0.25rem;
}

.spec-value {
  color: #0d6efd;
}

.card-img-top {
  background-color: #f8f9fa;
}

.nav-link.disabled {
  color: #6c757d;
  cursor: not-allowed;
}
</style>
