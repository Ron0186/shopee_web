<template>
  <div class="modal" :class="{ 'show d-block': isOpen }">
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
          <form>
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
                請設定商品的規格，例如：顏色、尺寸、款式等
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
          <button type="button" class="btn btn-primary" @click="submitSku">
            新增 SKU
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  productId: Number,
});

const emit = defineEmits(["close", "refresh"]);

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;

// SKU 資料
const skuData = reactive({
  price: 0,
  stock: 0,
});

// 規格設定列表
const specs = ref([{ key: "", value: "" }]);

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

// 提交新增 SKU
const submitSku = async () => {
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
    formData.append("productId", props.productId);
    formData.append("stock", skuData.stock);
    formData.append("price", skuData.price);
    formData.append("specPairsJson", specPairsJson);

    // 發送請求
    const response = await axios.post("/api/sku", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      Swal.fire({
        title: "新增成功",
        icon: "success",
      });

      resetForm();
      emit("refresh");
      emit("close");
    }
  } catch (error) {
    console.error("新增 SKU 錯誤:", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || "請求處理失敗，請稍後再試",
      icon: "error",
    });
  }
};

// 重置表單
const resetForm = () => {
  skuData.price = 0;
  skuData.stock = 0;
  specs.value = [{ key: "", value: "" }];
};

// 關閉 Modal
const closeModal = () => {
  resetForm();
  emit("close");
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
