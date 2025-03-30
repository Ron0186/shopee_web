<template>
  <div v-if="isOpen" class="modal d-block bg-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">新增 SKU</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSku">
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
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="saveSku"
            :disabled="isSubmitting || generatedSkus.length === 0"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? "處理中..." : "確認新增" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close", "refresh"]);

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;

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

// 表單狀態
const isSubmitting = ref(false);

// 重置表單
const resetForm = () => {
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

// 監聽modal打開狀態，重置表單
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  }
);

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

    return {
      specPairs,
      price: 0,
      stock: 0,
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

// 關閉模態窗口
const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm();
    emit("close");
  }
};

// 保存SKU
const saveSku = async () => {
  if (generatedSkus.value.length === 0) {
    Swal.fire({
      title: "未生成SKU",
      text: "請先設定規格並生成SKU列表",
      icon: "warning",
    });
    return;
  }

  if (!validateGeneratedSkus()) {
    return;
  }

  try {
    isSubmitting.value = true;

    // 創建提交的SKU數據
    const skuData = generatedSkus.value.map((sku) => {
      const skuDto = {
        specPairs: { ...sku.specPairs },
        price: sku.price,
        stock: sku.stock,
      };

      return skuDto;
    });

    console.log("提交的SKU數據:", skuData);

    // 使用新的API端點批量創建SKU
    const response = await axios.post(
      `/api/products/${props.productId}/skus/batch`,
      skuData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "新增成功",
        text: `成功新增 ${skuData.length} 個SKU`,
        icon: "success",
        timer: 1500,
      });

      // 關閉模態窗並刷新列表
      closeModal();
      emit("refresh");
    } else {
      throw new Error("新增失敗");
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
</script>

<style scoped>
.bg-modal {
  background-color: rgba(0, 0, 0, 0.5);
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
