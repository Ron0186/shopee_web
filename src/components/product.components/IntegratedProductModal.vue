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
              </div>

              <div class="mb-3">
                <label for="category2" class="form-label">二級分類</label>
                <select
                  class="form-select"
                  id="category2"
                  v-model="productData.category2Id"
                  required
                  :disabled="!productData.category1Id"
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
              </div>

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
                  第一張圖片將自動設為主圖，可通過下方選項變更
                </small>

                <!-- 圖片預覽區域 -->
                <div class="mt-3 row g-2" v-if="productImages.length > 0">
                  <div
                    v-for="(image, index) in productImages"
                    :key="index"
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
                          v-if="index === primaryImageIndex"
                          class="position-absolute top-0 start-0 badge bg-primary m-2"
                        >
                          主圖
                        </span>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          @click="removeImage(index)"
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
                            name="primaryImage"
                            :id="`primaryImage${index}`"
                            :checked="index === primaryImageIndex"
                            @change="setPrimaryImage(index)"
                          />
                          <label
                            class="form-check-label"
                            :for="`primaryImage${index}`"
                          >
                            設為主圖
                          </label>
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
                >
                  <i class="bi bi-plus-circle"></i> 添加規格類型
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="generateSkuList"
                  :disabled="!canGenerateSku"
                >
                  <i class="bi bi-gear"></i> 生成 SKU 列表
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
            下一步：設定商品規格
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
  isOpen: {
    type: Boolean,
    default: false,
  },
  productData: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "refresh"]);

// 用戶店舖資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;

// 活動標籤
const activeTab = ref("basic");

// 商品資料初始化
const productData = reactive({
  productName: "",
  description: "",
  category1Id: "",
  category2Id: "",
  active: true,
  productId: null,
});

// 表示是否跳過SKU設定
const skipSku = ref(false);

// 提交狀態
const isSubmitting = ref(false);

// 多圖片相關
const productImages = ref([]); // 存儲多個圖片對象
const primaryImageIndex = ref(0); // 預設第一張為主圖

// 分類資料
const category1List = ref([]);
const category2List = ref([]);

// SKU規格選項
const specOptions = ref([
  {
    name: "",
    values: [""],
    nameError: "",
    valueErrors: [""],
  },
]);

// 生成的SKU列表
const generatedSkus = ref([]);

// 批量設定
const batchSettings = reactive({
  price: 0,
  stock: 0,
});

// 判斷是否可以編輯SKU（需要先有商品ID或已完成基本資訊）
const canEditSku = computed(() => {
  return props.isEdit || productData.productId || validateBasicInfo(true);
});

// 計算是否可以生成SKU
const canGenerateSku = computed(() => {
  // 檢查是否所有規格都有名稱和至少一個值
  return (
    specOptions.value.length > 0 &&
    specOptions.value.every(
      (spec) =>
        spec.name.trim() !== "" && spec.values.some((v) => v.trim() !== "")
    )
  );
});

// 監聽modal打開狀態
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // 重置表單
      if (!props.isEdit) {
        resetForm();
      } else {
        // 編輯模式：載入產品數據
        loadProductData();
      }
      // 獲取分類資料
      fetchCategory1();
    }
  }
);

// 監聽編輯數據
watch(
  () => props.productData,
  (newVal) => {
    if (newVal && props.isEdit) {
      loadProductData();
    }
  }
);

// 載入產品數據
const loadProductData = () => {
  if (props.productData) {
    productData.productName = props.productData.productName || "";
    productData.description = props.productData.description || "";
    productData.category1Id = props.productData.category1Id || "";
    productData.category2Id = props.productData.category2Id || "";
    productData.active =
      props.productData.active !== undefined ? props.productData.active : true;
    productData.productId = props.productData.id;

    // 載入分類後需要獲取二級分類
    if (productData.category1Id) {
      fetchCategory2(productData.category1Id);
    }

    // 如果有圖片資訊，載入圖片
    if (props.productData.images && props.productData.images.length > 0) {
      // 假設後端返回的圖片資訊包含URL
      productImages.value = props.productData.images.map((img, index) => ({
        preview: img.url,
        isExisting: true,
        id: img.id,
        isPrimary: img.isPrimary,
      }));

      // 設置主圖索引
      const primaryIndex = productImages.value.findIndex(
        (img) => img.isPrimary
      );
      primaryImageIndex.value = primaryIndex >= 0 ? primaryIndex : 0;
    }

    // 如果有SKU資訊，需要重建規格選項和SKU列表
    if (props.productData.skus && props.productData.skus.length > 0) {
      reconstructSkuData(props.productData.skus);
    }
  }
};

// 重建SKU數據
const reconstructSkuData = (skus) => {
  if (!skus || skus.length === 0) return;

  // 收集所有規格名稱和值
  const specMap = {};

  skus.forEach((sku) => {
    if (sku.specPairs) {
      Object.entries(sku.specPairs).forEach(([key, value]) => {
        if (!specMap[key]) {
          specMap[key] = new Set();
        }
        specMap[key].add(value);
      });
    }
  });

  // 創建規格選項
  specOptions.value = Object.entries(specMap).map(([name, valuesSet]) => {
    return {
      name,
      values: Array.from(valuesSet),
      nameError: "",
      valueErrors: Array(valuesSet.size).fill(""),
    };
  });

  // 重建SKU列表
  generatedSkus.value = skus.map((sku) => {
    return {
      id: sku.id,
      specPairs: { ...sku.specPairs },
      price: sku.price,
      stock: sku.stock,
      priceError: "",
      stockError: "",
    };
  });
};

// 獲取一級分類
const fetchCategory1 = async () => {
  try {
    const response = await axios.get("/api/category1/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      // 確保數據格式統一
      category1List.value = response.data.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
      }));
    } else {
      console.error("獲取一級分類資料格式錯誤:", response.data);
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

// 根據一級分類ID獲取二級分類
const fetchCategory2 = async (parentId) => {
  if (!parentId) {
    category2List.value = [];
    return;
  }

  try {
    const response = await axios.get(`/api/category2/byC1`, {
      params: {
        category1Id: parentId,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data)) {
      // 確保數據格式統一
      category2List.value = response.data.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
      }));
    } else {
      console.error("獲取二級分類資料格式錯誤:", response.data);
    }
  } catch (error) {
    console.error("獲取二級分類錯誤:", error);
    Swal.fire({
      title: "載入分類失敗",
      text: error.response?.data?.message || "無法獲取二級分類資料",
      icon: "error",
    });
  }
};

// 當一級分類變更時觸發
const onCategory1Change = () => {
  productData.category2Id = ""; // 清空二級分類選擇
  fetchCategory2(productData.category1Id);
};

// 處理多圖片上傳
const handleImagesChange = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  // 處理每個選擇的文件
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = (e) => {
      productImages.value.push({
        file: file,
        preview: e.target.result,
        isPrimary: productImages.value.length === 0, // 如果是第一張圖，設為主圖
      });

      // 如果是第一張圖，設置為主圖
      if (productImages.value.length === 1) {
        primaryImageIndex.value = 0;
      }
    };

    reader.readAsDataURL(file);
  }
};

// 移除圖片
const removeImage = (index) => {
  // 如果要移除的是主圖，重新設置主圖
  if (index === primaryImageIndex.value) {
    if (productImages.value.length > 1) {
      // 如果還有其他圖片，設置下一張為主圖
      primaryImageIndex.value =
        index === productImages.value.length - 1 ? 0 : index;
    } else {
      primaryImageIndex.value = -1; // 沒有圖片了
    }
  } else if (index < primaryImageIndex.value) {
    // 如果移除的圖片在主圖之前，主圖索引需要減1
    primaryImageIndex.value--;
  }

  // 移除圖片
  productImages.value.splice(index, 1);
};

// 設置主圖
const setPrimaryImage = (index) => {
  primaryImageIndex.value = index;
};

// 添加規格
const addSpec = () => {
  specOptions.value.push({
    name: "",
    values: [""],
    nameError: "",
    valueErrors: [""],
  });
};

// 移除規格
const removeSpec = (index) => {
  if (specOptions.value.length > 1) {
    specOptions.value.splice(index, 1);
  }
};

// 添加規格值
const addSpecValue = (specIndex) => {
  specOptions.value[specIndex].values.push("");
  specOptions.value[specIndex].valueErrors.push("");
};

// 移除規格值
const removeSpecValue = (specIndex, valueIndex) => {
  if (specOptions.value[specIndex].values.length > 1) {
    specOptions.value[specIndex].values.splice(valueIndex, 1);
    specOptions.value[specIndex].valueErrors.splice(valueIndex, 1);
  }
};

// 驗證規格設定
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

    // 驗證規格值不為空
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

    if (!hasValidValue) {
      valid = false;
    }

    // 檢查規格名稱是否重複
    const otherSpecs = specOptions.value.filter((_, i) => i !== specIndex);
    if (otherSpecs.some((s) => s.name === spec.name)) {
      spec.nameError = "規格名稱不能重複";
      valid = false;
    }
  });

  return valid;
};

// 生成笛卡爾積的所有規格組合
const generateCartesianProduct = (arrays) => {
  return arrays.reduce(
    (acc, curr) => {
      return acc
        .map((x) => {
          return curr.map((y) => {
            return [...x, y];
          });
        })
        .flat();
    },
    [[]]
  );
};

// 生成SKU列表
const generateSkuList = () => {
  if (!validateSpecOptions()) {
    return;
  }

  // 準備有效的規格和值
  const validSpecs = specOptions.value
    .map((spec) => {
      return {
        name: spec.name,
        values: spec.values.filter((v) => v.trim() !== ""),
      };
    })
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

  // 生成所有可能的規格組合
  const combinations = generateCartesianProduct(specValuesList);

  // 創建SKU對象
  generatedSkus.value = combinations.map((combination) => {
    // 創建規格鍵值對
    const specPairs = {};
    specNames.forEach((name, index) => {
      specPairs[name] = combination[index];
    });

    // 檢查是否存在相同規格的SKU
    const existingSku =
      props.isEdit && props.productData?.skus
        ? props.productData.skus.find((sku) => {
            if (!sku.specPairs) return false;

            // 檢查是否所有規格值都匹配
            return Object.entries(specPairs).every(
              ([key, value]) => sku.specPairs[key] === value
            );
          })
        : null;

    return {
      id: existingSku?.id,
      specPairs,
      price: existingSku?.price || 0,
      stock: existingSku?.stock || 0,
      priceError: "",
      stockError: "",
    };
  });

  // 如果之前有設置批量值，應用它們
  if (batchSettings.price > 0) {
    applyBatchSetting("price");
  }
  if (batchSettings.stock > 0) {
    applyBatchSetting("stock");
  }
};

// 應用批量設定
const applyBatchSetting = (field) => {
  const value = batchSettings[field];
  generatedSkus.value.forEach((sku) => {
    sku[field] = value;
    sku[`${field}Error`] = ""; // 清除錯誤
  });
};

// 驗證生成的SKU
const validateGeneratedSkus = () => {
  let valid = true;

  generatedSkus.value.forEach((sku) => {
    // 驗證價格
    if (sku.price === null || sku.price === undefined || sku.price < 0) {
      sku.priceError = "價格必須為0或正數";
      valid = false;
    } else {
      sku.priceError = "";
    }

    // 驗證庫存
    if (sku.stock === null || sku.stock === undefined || sku.stock < 0) {
      sku.stockError = "庫存必須為0或正整數";
      valid = false;
    } else {
      sku.stockError = "";
    }
  });

  return valid;
};

// 驗證基本信息
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

// 下一步按鈕處理
const nextStep = async () => {
  if (!validateBasicInfo()) {
    return;
  }

  // 如果是新增模式，先保存商品基本資訊
  if (!props.isEdit && !productData.productId) {
    await saveBasicInfo();
  }

  // 如果已經有商品ID或是編輯模式，直接前往SKU設定
  activeTab.value = "sku";
};

// 保存商品基本資訊
const saveBasicInfo = async () => {
  try {
    isSubmitting.value = true;

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append("userId", userStore.userId); // 用户ID
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("category1Id", productData.category1Id);
    formData.append("category2Id", productData.category2Id);
    formData.append("active", productData.active);

    // 处理多张图片上传
    if (productImages.value.length > 0) {
      // 先添加主图（如果存在）
      if (primaryImageIndex.value >= 0) {
        formData.append(
          "images",
          productImages.value[primaryImageIndex.value].file
        );
      }

      // 再添加其他图片
      for (let i = 0; i < productImages.value.length; i++) {
        if (i !== primaryImageIndex.value) {
          formData.append("images", productImages.value[i].file);
        }
      }
    }

    // 发送请求到后端 API
    const response = await axios.post("/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("商品创建响应:", response);

    if (response.status >= 200 && response.status < 300) {
      // 确保正确获取商品ID
      if (response.data && response.data.productId) {
        console.log("成功获取到商品ID:", response.data.productId);
        productData.productId = response.data.productId;
        return true;
      } else {
        console.error("响应中没有找到商品ID:", response.data);
        Swal.fire({
          title: "错误",
          text: "无法获取商品ID，请联系管理员",
          icon: "error",
        });
        return false;
      }
    } else {
      throw new Error("新增失败");
    }
  } catch (error) {
    console.error("新增商品错误详情:", error);
    console.error("响应数据:", error.response?.data);
    Swal.fire({
      title: "新增失败",
      text:
        error.response?.data?.message ||
        error.message ||
        "请求处理失败，请稍后再试",
      icon: "error",
    });
    return false;
  } finally {
    isSubmitting.value = false;
  }
};

// 更新商品基本資訊
const updateBasicInfo = async () => {
  try {
    isSubmitting.value = true;

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("category1Id", productData.category1Id);
    formData.append("category2Id", productData.category2Id);
    formData.append("active", productData.active);

    // 處理圖片
    // 標記要刪除的現有圖片ID
    const existingImageIds = productImages.value
      .filter((img) => img.isExisting)
      .map((img) => img.id);
    formData.append("existingImageIds", JSON.stringify(existingImageIds));

    // 上傳新圖片
    const newImages = productImages.value.filter((img) => !img.isExisting);
    if (newImages.length > 0) {
      // 先添加主圖（如果是新上傳的）
      const primaryImage = newImages.find(
        (_, i) =>
          productImages.value.indexOf(newImages[i]) === primaryImageIndex.value
      );
      if (primaryImage) {
        formData.append("images", primaryImage.file);
      }

      // 再添加其他新圖片
      for (const img of newImages) {
        if (img !== primaryImage) {
          formData.append("images", img.file);
        }
      }
    }

    // 標記主圖ID
    const primaryImage = productImages.value[primaryImageIndex.value];
    if (primaryImage) {
      formData.append("primaryImageId", primaryImage.id || "");
    }

    // 發送請求到後端 API
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
      return true;
    } else {
      throw new Error("更新失敗");
    }
  } catch (error) {
    console.error("更新商品錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text:
        error.response?.data?.message ||
        error.message ||
        "請求處理失敗，請稍後再試",
      icon: "error",
    });
    return false;
  } finally {
    isSubmitting.value = false;
  }
};

// 提交商品與SKU
// 提交商品与SKU
const submitProductWithSku = async () => {
  try {
    // 先检查是否有商品ID
    if (!productData.productId) {
      console.error("没有商品ID，尝试重新保存基本信息");
      // 如果没有商品ID，尝试重新保存基本信息
      const saved = await saveBasicInfo();
      if (!saved || !productData.productId) {
        Swal.fire({
          title: "错误",
          text: "未能获取商品ID，请先保存基本资讯",
          icon: "error",
        });
        return;
      }
    }

    // 如果选择跳过SKU设定或没有生成SKU，直接完成
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

    // 验证SKU信息
    if (!validateGeneratedSkus()) {
      return;
    }

    isSubmitting.value = true;

    console.log("准备创建SKU，商品ID:", productData.productId);

    // 创建提交的SKU数据
    const skuData = generatedSkus.value.map((sku) => {
      return {
        specPairs: { ...sku.specPairs },
        price: sku.price,
        stock: sku.stock,
      };
    });

    // 使用批量创建SKU的API端点
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

    console.log("SKU创建响应:", response);

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
      throw new Error("新增SKU失败");
    }
  } catch (error) {
    console.error("新增SKU错误:", error);
    console.error("响应详情:", error.response?.data);
    Swal.fire({
      title: "新增失败",
      text: error.response?.data?.message || "无法新增SKU",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 更新商品與SKU
const updateProductWithSku = async () => {
  try {
    // 先更新商品基本信息
    const basicInfoUpdated = await updateBasicInfo();
    if (!basicInfoUpdated) return;

    // 如果沒有SKU需要更新，直接完成
    if (generatedSkus.value.length === 0) {
      closeModal();
      Swal.fire({
        title: "更新成功",
        text: "商品資訊已成功更新",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      emit("refresh");
      return;
    }

    // 驗證SKU信息
    if (!validateGeneratedSkus()) {
      return;
    }

    isSubmitting.value = true;

    // 分離新增和更新的SKU
    const newSkus = generatedSkus.value.filter((sku) => !sku.id);
    const existingSkus = generatedSkus.value.filter((sku) => sku.id);

    // 更新現有SKU
    if (existingSkus.length > 0) {
      const updatePromises = existingSkus.map((sku) => {
        return axios.put(
          `/api/skus/${sku.id}`,
          {
            price: sku.price,
            stock: sku.stock,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      });

      await Promise.all(updatePromises);
    }

    // 添加新SKU
    if (newSkus.length > 0) {
      const newSkuData = newSkus.map((sku) => ({
        specPairs: { ...sku.specPairs },
        price: sku.price,
        stock: sku.stock,
      }));

      await axios.post(
        `/api/products/${productData.productId}/skus/batch`,
        newSkuData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 完成更新
    closeModal();
    Swal.fire({
      title: "更新成功",
      text: "商品及SKU已成功更新",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
    emit("refresh");
  } catch (error) {
    console.error("更新SKU錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.response?.data?.message || "無法更新SKU",
      icon: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 重置表單
const resetForm = () => {
  productData.productName = "";
  productData.description = "";
  productData.category1Id = "";
  productData.category2Id = "";
  productData.active = true;
  productData.productId = null;
  productImages.value = [];
  primaryImageIndex.value = 0;
  activeTab.value = "basic";
  skipSku.value = false;
  specOptions.value = [
    {
      name: "",
      values: [""],
      nameError: "",
      valueErrors: [""],
    },
  ];
  generatedSkus.value = [];
  batchSettings.price = 0;
  batchSettings.stock = 0;
};

// 關閉 Modal
const closeModal = () => {
  resetForm();
  emit("close");
};

// 元件掛載時
onMounted(() => {
  if (props.isOpen) {
    fetchCategory1();
    if (props.isEdit && props.productData) {
      loadProductData();
    }
  }
});
</script>
