<template>
  <div v-if="isOpen" class="modal d-block bg-modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-light">
          <h5 class="modal-title">調整 SKU 價格</h5>
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
                  <div class="col-sm-3"><strong>目前庫存:</strong></div>
                  <div class="col-sm-9">{{ skuData.stock }}</div>
                </div>
                <div class="row">
                  <div class="col-sm-3"><strong>當前價格:</strong></div>
                  <div class="col-sm-9 text-primary fw-bold">
                    NT$ {{ formatPrice(skuData.price) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 價格調整區域 -->
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0">價格調整</h6>
              </div>
              <div class="card-body">
                <div class="form-group mb-3">
                  <label for="priceInput" class="form-label"
                    >新價格 (NT$):</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">NT$</span>
                    <input
                      type="number"
                      id="priceInput"
                      v-model="newPrice"
                      class="form-control"
                      min="0"
                      step="1"
                      :class="{ 'is-invalid': priceError }"
                    />
                    <div class="invalid-feedback" v-if="priceError">
                      {{ priceError }}
                    </div>
                  </div>
                  <small class="form-text text-muted"
                    >設定此 SKU 的新銷售價格</small
                  >
                </div>

                <!-- 快速價格調整工具 -->
                <div class="mt-4">
                  <label class="form-label">快速調整:</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="amount in [50, 100, 200, 500]"
                      :key="'inc' + amount"
                      type="button"
                      class="btn btn-sm btn-outline-success"
                      @click="adjustPrice('increase', amount)"
                    >
                      +{{ amount }}
                    </button>
                    <button
                      v-for="amount in [50, 100, 200, 500]"
                      :key="'dec' + amount"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="adjustPrice('decrease', amount)"
                      :disabled="Number(newPrice) < amount"
                    >
                      -{{ amount }}
                    </button>
                  </div>
                </div>

                <!-- 漲幅計算 -->
                <div
                  v-if="skuData.price > 0 && newPrice > 0"
                  class="alert alert-info mt-3"
                >
                  <small>
                    <span v-if="Number(newPrice) > Number(skuData.price)">
                      價格調整:
                      <strong class="text-success"
                        >+{{
                          formatPrice(Number(newPrice) - Number(skuData.price))
                        }}</strong
                      >
                      (上調
                      {{
                        calculatePercentage(
                          Number(newPrice),
                          Number(skuData.price),
                          true
                        )
                      }}%)
                    </span>
                    <span v-else-if="Number(newPrice) < Number(skuData.price)">
                      價格調整:
                      <strong class="text-danger"
                        >-{{
                          formatPrice(Number(skuData.price) - Number(newPrice))
                        }}</strong
                      >
                      (下調
                      {{
                        calculatePercentage(
                          Number(newPrice),
                          Number(skuData.price),
                          false
                        )
                      }}%)
                    </span>
                    <span v-else>價格未變動</span>
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
            @click="updatePrice"
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
import { ref, watch } from "vue";
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
const newPrice = ref(0);
const priceError = ref("");
const isSubmitting = ref(false);

// 監聽SKU數據變化，初始化價格值
watch(
  () => props.skuData,
  (newValue) => {
    if (newValue) {
      newPrice.value = newValue.price;
    }
  },
  { immediate: true }
);

// 計算漲跌幅百分比
const calculatePercentage = (newValue, oldValue, isIncrease) => {
  if (oldValue === 0) return 100;

  if (isIncrease) {
    return Math.round((newValue / oldValue - 1) * 100);
  } else {
    return Math.round((1 - newValue / oldValue) * 100);
  }
};

// 格式化價格顯示
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 快速調整價格
const adjustPrice = (action, amount) => {
  if (!props.skuData) return;

  const currentPrice = Number(newPrice.value) || 0;

  if (action === "increase") {
    // 增加價格
    newPrice.value = currentPrice + amount;
  } else if (action === "decrease") {
    // 減少價格，確保不低於0
    newPrice.value = Math.max(0, currentPrice - amount);
  }

  // 清除錯誤提示
  priceError.value = "";
};

// 關閉模態窗口
const closeModal = () => {
  resetForm();
  emit("close");
};

// 重置表單
const resetForm = () => {
  newPrice.value = props.skuData ? props.skuData.price : 0;
  priceError.value = "";
};

// 驗證表單
const validateForm = () => {
  let valid = true;

  if (
    newPrice.value === null ||
    newPrice.value === undefined ||
    Number(newPrice.value) < 0
  ) {
    priceError.value = "價格必須為0或正數";
    valid = false;
  } else {
    priceError.value = "";
  }

  return valid;
};

// 更新價格
const updatePrice = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    // 確保 skuId 存在
    if (!props.skuData || !props.skuData.skuId) {
      throw new Error("無法獲取有效的 SKU ID");
    }

    console.log(
      `正在更新價格，SKU ID: ${props.skuData.skuId}, 新價格: ${newPrice.value}`
    );

    // 使用新的API端點更新價格
    const response = await axios.patch(
      `/api/skus/${props.skuData.skuId}/price?price=${newPrice.value}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // 先關閉模態窗
      closeModal();

      // 顯示成功提示
      Swal.fire({
        title: "更新成功",
        text: "SKU價格已成功更新",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // 刷新列表
      emit("refresh");
    } else {
      throw new Error("更新失敗");
    }
  } catch (error) {
    console.error("更新價格錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.response?.data?.message || error.message || "無法更新價格",
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
