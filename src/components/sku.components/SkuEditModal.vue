<template>
  <div class="modal" :class="{ 'show d-block': isOpen }">
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
          <form>
            <!-- SKU ID (唯讀) -->
            <div class="mb-3">
              <label for="skuId" class="form-label">SKU ID</label>
              <input
                type="text"
                class="form-control"
                id="skuId"
                v-model="skuData.skuId"
                readonly
              />
            </div>

            <!-- 價格輸入 -->
            <div class="mb-3">
              <label for="price" class="form-label">價格 (NT$)</label>
              <input
                type="number"
                class="form-control"
                id="price"
                v-model="skuData.price"
                step="1"
                min="0"
                required
              />
            </div>

            <!-- 庫存輸入 -->
            <div class="mb-3">
              <label for="stock" class="form-label">庫存數量</label>
              <input
                type="number"
                class="form-control"
                id="stock"
                v-model="skuData.stock"
                step="1"
                min="0"
                required
              />
            </div>

            <!-- 規格設定 -->
            <div class="mb-3">
              <label class="form-label">商品規格</label>
              <div class="alert alert-info">
                編輯商品的規格，例如：顏色、尺寸、款式等
              </div>

              <div
                v-for="(spec, index) in specs"
                :key="index"
                class="mb-2 border p-3 rounded"
              >
                <div class="row g-2">
                  <div class="col-5">
                    <label :for="`specKey${index}`" class="form-label"
                      >規格名稱</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      :id="`specKey${index}`"
                      v-model="spec.key"
                      placeholder="例如：顏色、尺寸"
                    />
                  </div>
                  <div class="col-5">
                    <label :for="`specValue${index}`" class="form-label"
                      >規格值</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      :id="`specValue${index}`"
                      v-model="spec.value"
                      placeholder="例如：紅色、XL"
                    />
                  </div>
                  <div class="col-2 d-flex align-items-end">
                    <button
                      type="button"
                      class="btn btn-danger"
                      @click="removeSpec(index)"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-secondary mt-2"
                @click="addSpec"
              >
                + 新增規格
              </button>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="updateSku">
            更新 SKU
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  skuData: Object,
});

const emit = defineEmits(["close", "refresh"]);

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;

// SKU 資料
const skuData = reactive({
  skuId: null,
  price: 0,
  stock: 0,
});

// 規格設定列表
const specs = ref([]);

// 添加新規格
const addSpec = () => {
  specs.value.push({ key: "", value: "" });
};

// 移除規格
const removeSpec = (index) => {
  if (specs.value.length > 1) {
    specs.value.splice(index, 1);
  } else {
    Swal.fire({
      title: "至少需要一組規格",
      icon: "warning",
    });
  }
};

// 初始化規格數據
const initSpecsFromProps = () => {
  if (props.skuData && props.skuData.specPairs) {
    specs.value = [];
    for (const [key, value] of Object.entries(props.skuData.specPairs)) {
      specs.value.push({ key, value });
    }
    if (specs.value.length === 0) {
      specs.value.push({ key: "", value: "" });
    }
  } else {
    specs.value = [{ key: "", value: "" }];
  }
};

// 將規格列表轉換為 Map 格式
const getSpecPairsMap = () => {
  const specPairs = {};
  specs.value.forEach((spec) => {
    if (spec.key && spec.value) {
      specPairs[spec.key.trim()] = spec.value.trim();
    }
  });
  return specPairs;
};

// 更新 SKU
const updateSku = async () => {
  try {
    // 驗證輸入
    if (skuData.price <= 0) {
      Swal.fire({ title: "請輸入有效的價格", icon: "warning" });
      return;
    }

    if (skuData.stock < 0) {
      Swal.fire({ title: "庫存不能為負數", icon: "warning" });
      return;
    }

    // 驗證規格
    let hasValidSpec = false;
    for (const spec of specs.value) {
      if (spec.key && spec.value) {
        hasValidSpec = true;
        break;
      }
    }

    if (!hasValidSpec) {
      Swal.fire({ title: "請至少輸入一組有效的規格", icon: "warning" });
      return;
    }

    // 獲取規格 Map
    const specPairsMap = getSpecPairsMap();
    const specPairsJson = JSON.stringify(specPairsMap);

    // 創建 FormData
    const formData = new FormData();
    formData.append("stock", skuData.stock);
    formData.append("price", skuData.price);
    formData.append("specPairsJson", specPairsJson);

    // 發送請求
    const response = await axios.put(`/api/sku/${skuData.skuId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "更新成功",
        icon: "success",
      });

      emit("refresh");
      emit("close");
    }
  } catch (error) {
    console.error("更新 SKU 錯誤:", error);
    Swal.fire({
      title: "更新失敗",
      text: error.response?.data?.message || "請求處理失敗，請稍後再試",
      icon: "error",
    });
  }
};

// 關閉 Modal
const closeModal = () => {
  emit("close");
};

// 監聽 props 變化
watch(
  [() => props.isOpen, () => props.skuData],
  ([newIsOpen, newSkuData]) => {
    if (newIsOpen && newSkuData) {
      // 複製 skuData
      Object.assign(skuData, {
        skuId: newSkuData.skuId,
        price: newSkuData.price,
        stock: newSkuData.stock,
      });

      // 初始化規格
      initSpecsFromProps();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
