<template>
  <div v-if="isOpen" class="modal d-block bg-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">編輯 SKU</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="skuData">
            <form @submit.prevent="updateSku">
              <div class="mb-3">
                <p><strong>SKU ID:</strong> {{ skuData.id }}</p>
              </div>

              <!-- 規格顯示 (唯讀) -->
              <div class="mb-3">
                <label class="form-label">SKU 規格:</label>
                <div class="spec-display p-2 border rounded bg-light">
                  <span
                    v-for="(value, key) in skuData.specPairs"
                    :key="key"
                    class="sku-spec"
                  >
                    <span class="spec-key">{{ key }}:</span>
                    <span class="spec-value">{{ value }}</span>
                  </span>
                </div>
                <small class="form-text text-muted">
                  規格資訊無法變更，若需修改規格請刪除此 SKU 並新增一個新的
                </small>
              </div>

              <!-- 庫存數量 -->
              <div class="mb-3">
                <label for="skuStock" class="form-label">庫存數量:</label>
                <input
                  type="number"
                  class="form-control"
                  id="skuStock"
                  v-model="formData.stock"
                  min="0"
                  required
                  :class="{ 'is-invalid': validationErrors.stock }"
                />
                <div class="invalid-feedback" v-if="validationErrors.stock">
                  {{ validationErrors.stock }}
                </div>
              </div>

              <!-- 價格 -->
              <div class="mb-3">
                <label for="skuPrice" class="form-label">價格 (NT$):</label>
                <input
                  type="number"
                  class="form-control"
                  id="skuPrice"
                  v-model="formData.price"
                  min="0"
                  step="1"
                  required
                  :class="{ 'is-invalid': validationErrors.price }"
                />
                <div class="invalid-feedback" v-if="validationErrors.price">
                  {{ validationErrors.price }}
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="updateSku"
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
import { ref, reactive, watch } from "vue";
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

// 表單數據
const formData = reactive({
  stock: 0,
  price: 0,
});

// 表單狀態
const validationErrors = reactive({
  stock: "",
  price: "",
});
const isSubmitting = ref(false);

// 監聽SKU數據變化，初始化表單值
watch(
  () => props.skuData,
  (newValue) => {
    if (newValue) {
      formData.stock = newValue.stock;
      formData.price = newValue.price;
      resetValidationErrors();
    }
  }
);

// 重置驗證錯誤
const resetValidationErrors = () => {
  validationErrors.stock = "";
  validationErrors.price = "";
};

// 關閉模態窗口
const closeModal = () => {
  if (!isSubmitting.value) {
    emit("close");
  }
};

// 驗證表單
const validateForm = () => {
  let valid = true;
  resetValidationErrors();

  if (
    formData.stock === null ||
    formData.stock === undefined ||
    formData.stock < 0
  ) {
    validationErrors.stock = "庫存數量必須為0或正整數";
    valid = false;
  }

  if (
    formData.price === null ||
    formData.price === undefined ||
    formData.price < 0
  ) {
    validationErrors.price = "價格必須為0或正數";
    valid = false;
  }

  return valid;
};

// 更新SKU
const updateSku = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    // 創建提交的數據對象
    const updateData = {
      stock: formData.stock,
      price: formData.price,
    };

    // 使用新的API端點更新SKU
    const response = await axios.put(
      `/api/skus/${props.skuData.id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "更新成功",
        text: "SKU已成功更新",
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

.spec-display {
  min-height: 40px;
}
</style>
