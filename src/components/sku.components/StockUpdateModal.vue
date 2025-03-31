<template>
  <div v-if="isOpen" class="modal d-block bg-modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-light">
          <h5 class="modal-title">調整 SKU 庫存</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="skuData" class="mb-3">
            <!-- SKU 資訊卡片 -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h6 class="mb-0">SKU 資訊</h6>
              </div>
              <div class="card-body">
                <div class="row mb-2">
                  <div class="col-sm-3"><strong>SKU ID:</strong></div>
                  <div class="col-sm-9">{{ skuData.skuId }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-3"><strong>規格:</strong></div>
                  <div class="col-sm-9">
                    <span
                      v-for="(value, key) in skuData.specPairs"
                      :key="key"
                      class="sku-spec ms-1"
                    >
                      <span class="spec-key">{{ key }}:</span>
                      <span class="spec-value">{{ value }}</span>
                    </span>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-3"><strong>價格:</strong></div>
                  <div class="col-sm-9">
                    NT$ {{ formatPrice(skuData.price) }}
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-3"><strong>當前庫存:</strong></div>
                  <div class="col-sm-9 text-primary fw-bold">
                    {{ skuData.stock }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 庫存調整區域 -->
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0">庫存調整</h6>
              </div>
              <div class="card-body">
                <div class="form-group mb-3">
                  <label for="stockInput" class="form-label">{{
                    adjustType === "set" ? "新庫存數量:" : "庫存變化量:"
                  }}</label>
                  <input
                    type="number"
                    id="stockInput"
                    v-model="newStock"
                    class="form-control"
                    :min="adjustType === 'set' ? 0 : null"
                    :class="{ 'is-invalid': stockError }"
                  />
                  <div class="invalid-feedback" v-if="stockError">
                    {{ stockError }}
                  </div>
                  <small class="form-text text-muted">
                    {{
                      adjustType === "set"
                        ? "設定此 SKU 的最新庫存數量"
                        : "設定此 SKU 的庫存變化量（正數增加，負數減少）"
                    }}
                  </small>
                  <!-- 當在增減模式時，顯示最終庫存數量 -->
                  <div
                    v-if="adjustType === 'change'"
                    class="form-text text-primary mt-2"
                  >
                    最終庫存數量: <strong>{{ calculateFinalStock() }}</strong>
                  </div>
                </div>

                <!-- 調整類型選擇 -->
                <div class="mt-4 mb-3">
                  <label class="form-label d-block">調整方式:</label>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="adjustType"
                      id="setStock"
                      v-model="adjustType"
                      value="set"
                      checked
                    />
                    <label class="form-check-label" for="setStock"
                      >設定為指定數量</label
                    >
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="adjustType"
                      id="changeStock"
                      v-model="adjustType"
                      value="change"
                    />
                    <label class="form-check-label" for="changeStock"
                      >增減數量</label
                    >
                  </div>
                </div>

                <!-- 快速庫存調整工具 -->
                <div v-if="adjustType === 'change'" class="mt-3">
                  <label class="form-label">快速調整:</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="amount in [1, 5, 10, 50, 100]"
                      :key="'inc' + amount"
                      type="button"
                      class="btn btn-sm btn-outline-success"
                      @click="adjustStock('increase', amount)"
                    >
                      +{{ amount }}
                    </button>
                    <button
                      v-for="amount in [1, 5, 10, 50, 100]"
                      :key="'dec' + amount"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="adjustStock('decrease', amount)"
                    >
                      -{{ amount }}
                    </button>
                  </div>
                </div>

                <!-- 庫存變化說明 -->
                <div
                  v-if="adjustType === 'change'"
                  class="alert alert-info mt-3"
                >
                  <small>
                    <span v-if="Number(newStock) > 0">
                      庫存將增加:
                      <strong class="text-success">+{{ newStock }}</strong>
                      (從 {{ skuData.stock }} 到 {{ calculateFinalStock() }})
                    </span>
                    <span v-else-if="Number(newStock) < 0">
                      庫存將減少:
                      <strong class="text-danger">{{ newStock }}</strong>
                      (從 {{ skuData.stock }} 到 {{ calculateFinalStock() }})
                    </span>
                    <span v-else> 庫存將保持不變: {{ skuData.stock }} </span>
                  </small>
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
            type="button"
            class="btn btn-primary"
            @click="updateStock"
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
import { ref, watch, computed } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  skuData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "refresh"]);

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;

// 表單狀態
const newStock = ref(0);
const stockError = ref("");
const isSubmitting = ref(false);
const adjustType = ref("set"); // 'set' 或 'change'
const currentSkuId = ref(null); // 添加一個新的 ref 來存儲 SKU ID

// 計算最終庫存數量
const calculateFinalStock = () => {
  if (!props.skuData) return 0;

  const currentStock = Number(props.skuData.stock);

  if (adjustType.value === "set") {
    return Number(newStock.value);
  } else {
    // 增減模式
    const result = currentStock + Number(newStock.value);
    return result < 0 ? 0 : result;
  }
};

// 監聽SKU數據變化，初始化庫存值並提取 SKU ID
watch(
  () => props.skuData,
  (newValue) => {
    if (newValue) {
      console.log("StockUpdateModal 接收到新的 SKU 數據:", newValue);

      // 立即提取並存儲 SKU ID
      currentSkuId.value = newValue.skuId;
      console.log("提取的 SKU ID:", currentSkuId.value);

      newStock.value = newValue.stock;
      adjustType.value = "set"; // 重置調整類型
    }
  },
  { immediate: true }
);

// 監聽調整類型變化
watch(
  () => adjustType.value,
  (newValue) => {
    if (newValue === "set" && props.skuData) {
      // 如果切換到設定模式，重置為當前庫存
      newStock.value = props.skuData.stock;
    } else if (newValue === "change") {
      // 如果切換到增減模式，設定為 0 (表示不變)
      newStock.value = 0;
    }
  }
);

// 格式化價格顯示
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 關閉模態窗口
const closeModal = () => {
  resetForm();
  emit("close");
};

// 重置表單
const resetForm = () => {
  newStock.value = props.skuData ? props.skuData.stock : 0;
  stockError.value = "";
  adjustType.value = "set";
};

// 快速調整庫存
const adjustStock = (action, amount) => {
  if (!props.skuData) return;

  // 由於我們在 "change" 模式，直接設置增減量
  if (action === "increase") {
    newStock.value = amount;
  } else if (action === "decrease") {
    newStock.value = -amount;
  }

  // 清除錯誤訊息
  stockError.value = "";
};

// 驗證表單
const validateForm = () => {
  let valid = true;

  if (adjustType.value === "set") {
    // 設定模式下，庫存必須是非負整數
    if (
      newStock.value === null ||
      newStock.value === undefined ||
      Number(newStock.value) < 0
    ) {
      stockError.value = "庫存數量必須為0或正整數";
      valid = false;
    }
  } else {
    // 增減模式下，檢查最終庫存是否合法
    const finalStock = calculateFinalStock();
    if (finalStock < 0) {
      stockError.value = "調整後的庫存不能為負數";
      valid = false;
    }
  }

  if (valid) {
    stockError.value = "";
  }

  return valid;
};

// 更新庫存
const updateStock = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    // 檢查 SKU ID
    if (currentSkuId.value === null || currentSkuId.value === undefined) {
      throw new Error("無法獲取有效的 SKU ID");
    }

    // 計算最終庫存數量
    let finalStock = 0;

    if (adjustType.value === "set") {
      // 設定為指定數量模式
      finalStock = Number(newStock.value);
    } else {
      // 增減數量模式
      // 確保這裡的邏輯是正確的：當前庫存 + 變化量
      const currentStock = Number(props.skuData.stock);
      const changeAmount = Number(newStock.value);

      finalStock = currentStock + changeAmount;

      // 記錄詳細的計算過程
      console.log("庫存計算：", {
        調整模式: "增減數量",
        當前庫存: currentStock,
        變化量: changeAmount,
        計算後庫存: finalStock,
      });
    }

    // 確保庫存不為負數
    if (finalStock < 0) finalStock = 0;

    console.log(
      `正在更新庫存，SKU ID: ${currentSkuId.value}, 原庫存: ${props.skuData.stock}, 新庫存: ${finalStock}`
    );

    // 使用存儲的 SKU ID
    const response = await axios.patch(
      `/api/skus/${currentSkuId.value}/stock?stock=${finalStock}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "更新成功",
        text: "SKU庫存已成功更新",
        icon: "success",
        timer: 1500,
      });

      // 關閉模態窗並刷新列表
      closeModal();
      emit("refresh");
    } else {
      throw new Error("更新失敗");
    }
  } catch (error) {
    console.error("更新庫存錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.response?.data?.message || error.message || "無法更新庫存",
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
  margin-right: 8px;
}

.spec-key {
  font-weight: 500;
}
</style>

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
