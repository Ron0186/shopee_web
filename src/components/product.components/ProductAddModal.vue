<template>
  <div class="modal" :class="{ 'show d-block': isOpen }">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">新增商品</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
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
                        <!-- 使用 Bootstrap 圖標 -->
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
              <label class="form-check-label" for="activeCheck">上架商品</label>
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
            @click="submitProduct"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? "處理中..." : "新增商品" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  isOpen: Boolean,
  shopId: Number,
});

const emit = defineEmits(["close", "refresh"]);

// 用戶店舖資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;

// 商品資料初始化
const productData = reactive({
  productName: "",
  description: "",
  category1Id: "",
  category2Id: "",
  active: true,
});

// 提交狀態
const isSubmitting = ref(false);

// 多圖片相關
const productImages = ref([]); // 存儲多個圖片對象
const primaryImageIndex = ref(0); // 預設第一張為主圖

// 分類資料
const category1List = ref([]);
const category2List = ref([]);

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
      console.log("一級分類資料:", category1List.value);
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
    // 使用現有API獲取特定一級分類下的二級分類
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
      console.log("二級分類資料:", category2List.value);
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

// 提交新增商品
const submitProduct = async () => {
  try {
    // 驗證必填欄位
    if (!productData.productName) {
      Swal.fire({ title: "請輸入商品名稱", icon: "warning" });
      return;
    }

    if (!productData.category1Id) {
      Swal.fire({ title: "請選擇一級分類", icon: "warning" });
      return;
    }

    if (!productData.category2Id) {
      Swal.fire({ title: "請選擇二級分類", icon: "warning" });
      return;
    }

    isSubmitting.value = true;

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append("userId", userStore.userId); // 用戶ID
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("category1Id", productData.category1Id);
    formData.append("category2Id", productData.category2Id);
    formData.append("active", productData.active);

    // 處理多張圖片上傳
    if (productImages.value.length > 0) {
      // 先添加主圖（如果存在）
      if (primaryImageIndex.value >= 0) {
        formData.append(
          "images",
          productImages.value[primaryImageIndex.value].file
        );
      }

      // 再添加其他圖片
      for (let i = 0; i < productImages.value.length; i++) {
        if (i !== primaryImageIndex.value) {
          formData.append("images", productImages.value[i].file);
        }
      }

      console.log(
        `正在上傳 ${productImages.value.length} 張圖片，主圖索引: ${primaryImageIndex.value}`
      );
    } else {
      console.log("未上傳任何圖片，將使用默認圖片");
    }

    // 發送請求到後端 API
    const response = await axios.post("/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      // 先關閉模態窗
      closeModal();

      // 顯示成功提示
      Swal.fire({
        title: "新增成功",
        text: "商品已成功新增",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // 通知父元件更新
      emit("refresh");
    } else {
      throw new Error("新增失敗");
    }
  } catch (error) {
    console.error("新增商品錯誤:", error);
    Swal.fire({
      title: "新增失敗",
      text:
        error.response?.data?.message ||
        error.message ||
        "請求處理失敗，請稍後再試",
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
  productImages.value = [];
  primaryImageIndex.value = 0;
};

// 關閉 Modal
const closeModal = () => {
  resetForm();
  emit("close");
};

// 監聽 Modal 開啟
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // 當 Modal 開啟時，獲取分類資料
      fetchCategory1();
    }
  }
);

// 元件掛載時獲取分類資料
onMounted(() => {
  if (props.isOpen) {
    fetchCategory1();
  }
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
