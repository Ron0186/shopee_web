<template>
  <div class="modal" :class="{ 'show d-block': isOpen }">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">編輯商品</h5>
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
              <input
                type="text"
                class="form-control"
                id="category1"
                v-model="category1Name"
                readonly
              />
              <small class="text-muted"
                >分類關聯不可變更，如需變更請刪除後重新建立商品</small
              >
            </div>
            <div class="mb-3">
              <label for="category2" class="form-label">二級分類</label>
              <input
                type="text"
                class="form-control"
                id="category2"
                v-model="category2Name"
                readonly
              />
              <small class="text-muted"
                >分類關聯不可變更，如需變更請刪除後重新建立商品</small
              >
            </div>

            <!-- 現有圖片區域 -->
            <div class="mb-3">
              <label class="form-label">現有圖片</label>
              <div class="row g-2" v-if="existingImages.length > 0">
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
              <div class="alert alert-info mt-2" v-else>此商品目前沒有圖片</div>
            </div>

            <!-- 新增圖片區域 -->
            <div class="mb-3">
              <label for="productImages" class="form-label">新增圖片</label>
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

              <!-- 新上傳圖片預覽 -->
              <div class="row g-2 mt-2" v-if="newImages.length > 0">
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
                        新主圖
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
            @click="updateProduct"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? "處理中..." : "更新商品" }}
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
  theData: Object,
});

const emit = defineEmits(["close", "refresh"]);

// 用戶店舖資訊
const userStore = useUserStore();
const userId = userStore.userId;
const token = userStore.token;
const baseUrl = ref(import.meta.env.VITE_API_URL);

// 商品資料初始化
const productData = reactive({
  productId: null,
  productName: "",
  description: "",
  category1Id: "",
  category2Id: "",
  active: true,
});

// 提交狀態
const isSubmitting = ref(false);

// 分類名稱（只讀顯示用）
const category1Name = ref("");
const category2Name = ref("");

// 圖片相關
const existingImages = ref([]); // 已有的圖片
const newImages = ref([]); // 新上傳的圖片
const imagesToDelete = ref(new Set()); // 要刪除的圖片ID

// 獲取圖片 URL
const getImageUrl = (image) => {
  if (!image) return "";

  // 檢查各種可能的圖片路徑屬性
  const imagePath =
    image.imagePath || image.imageUrl || image.path || image.url;

  console.log("處理圖片路徑:", imagePath);

  if (!imagePath) return "";

  // 處理絕對和相對路徑
  if (imagePath.startsWith("http")) {
    return imagePath;
  } else {
    return `${baseUrl.value}${imagePath}`;
  }
};

// 處理圖片載入錯誤
const handleImageError = (event, image) => {
  console.error("圖片載入失敗:", image);

  // 試著使用不同的路徑格式
  const fallbackUrl = image.imagePath
    ? image.imagePath.startsWith("/")
      ? `${baseUrl.value}${image.imagePath.substring(1)}`
      : `${baseUrl.value}/${image.imagePath}`
    : "/assets/default-image.png";

  event.target.src = fallbackUrl;
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
      // 添加到新圖片陣列
      newImages.value.push({
        file: file,
        preview: e.target.result,
        isPrimary:
          newImages.value.length === 0 && existingImages.value.length === 0,
      });

      // 如果是第一張新圖片，且沒有現有圖片，設置為主圖
      if (newImages.value.length === 1 && existingImages.value.length === 0) {
        resetAllPrimaryFlags();
        newImages.value[0].isPrimary = true;
      }
    };

    reader.readAsDataURL(file);
  }
};

// 移除現有圖片
const removeExistingImage = (index) => {
  const imageToRemove = existingImages.value[index];

  // 添加到要刪除的圖片ID集合
  if (imageToRemove.id) {
    imagesToDelete.value.add(imageToRemove.id);
  }

  // 如果移除的是主圖，需要重新設置主圖
  if (imageToRemove.isPrimary) {
    // 嘗試將剩餘的第一張現有圖片設為主圖，否則使用第一張新圖片
    if (existingImages.value.length > 1) {
      const nextIndex = (index + 1) % existingImages.value.length;
      resetAllPrimaryFlags();
      existingImages.value[nextIndex].isPrimary = true;
    } else if (newImages.value.length > 0) {
      resetAllPrimaryFlags();
      newImages.value[0].isPrimary = true;
    }
  }

  // 從陣列中移除
  existingImages.value.splice(index, 1);
};

// 移除新上傳的圖片
const removeNewImage = (index) => {
  const imageToRemove = newImages.value[index];

  // 如果移除的是主圖，需要重新設置主圖
  if (imageToRemove.isPrimary) {
    // 嘗試將剩餘的第一張新圖片設為主圖，否則使用第一張現有圖片
    if (newImages.value.length > 1) {
      const nextIndex = (index + 1) % newImages.value.length;
      resetAllPrimaryFlags();
      newImages.value[nextIndex].isPrimary = true;
    } else if (existingImages.value.length > 0) {
      resetAllPrimaryFlags();
      existingImages.value[0].isPrimary = true;
    }
  }

  // 從陣列中移除
  newImages.value.splice(index, 1);
};

// 設置現有圖片為主圖
const setExistingImageAsPrimary = (index) => {
  resetAllPrimaryFlags();
  existingImages.value[index].isPrimary = true;
};

// 設置新圖片為主圖
const setNewImageAsPrimary = (index) => {
  resetAllPrimaryFlags();
  newImages.value[index].isPrimary = true;
};

// 重置所有主圖標記
const resetAllPrimaryFlags = () => {
  // 重置現有圖片的主圖標記
  existingImages.value.forEach((img) => {
    img.isPrimary = false;
  });

  // 重置新圖片的主圖標記
  newImages.value.forEach((img) => {
    img.isPrimary = false;
  });
};

// 獲取商品的所有圖片
const fetchProductImages = async (productId) => {
  try {
    console.log(`開始獲取商品 ID:${productId} 的圖片`);

    const response = await axios.get(`/api/products/${productId}/images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 輸出日誌以便於調試
    console.log("API 返回的商品圖片資料:", response.data);

    if (response.data && Array.isArray(response.data)) {
      existingImages.value = response.data.map((img) => ({
        ...img,
        imagePath: img.imagePath,
        isPrimary: !!img.isPrimary,
        id: img.id || img.imageId,
      }));
      console.log("處理後的圖片資料:", existingImages.value);
    } else {
      console.error("獲取商品圖片格式錯誤:", response.data);
      existingImages.value = [];
    }
  } catch (error) {
    console.error("獲取商品圖片錯誤:", error);
    console.error("錯誤詳情:", error.response || error.message);

    // 嘗試從 props.theData 中獲取圖片信息
    if (props.theData && props.theData.productImages) {
      console.log("從 props.theData 中提取圖片信息");
      existingImages.value = props.theData.productImages.map((img) => ({
        ...img,
        isPrimary: !!img.isPrimary,
        id: img.id || img.imageId,
      }));
    } else if (props.theData && props.theData.primaryImageUrl) {
      // 如果只有主圖信息
      console.log("從 props.theData 中提取主圖信息");
      existingImages.value = [
        {
          id: null,
          imagePath: props.theData.primaryImageUrl,
          isPrimary: true,
        },
      ];
    } else {
      existingImages.value = [];
    }
  }
};

// 根據分類ID獲取分類名稱
const fetchCategory1Name = async (category1Id) => {
  if (!category1Id) return "";

  try {
    const response = await axios.get(`/api/category1/${category1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.name) {
      return response.data.name;
    } else if (response.data && response.data.categoryName) {
      return response.data.categoryName;
    } else {
      console.error("獲取一級分類名稱資料格式錯誤:", response.data);
      return "未知分類";
    }
  } catch (error) {
    console.error("獲取一級分類名稱錯誤:", error);
    return "未知分類";
  }
};

const fetchCategory2Name = async (category2Id) => {
  if (!category2Id) return "";

  try {
    const response = await axios.get(`/api/category2/${category2Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.name) {
      return response.data.name;
    } else if (response.data && response.data.categoryName) {
      return response.data.categoryName;
    } else {
      console.error("獲取二級分類名稱資料格式錯誤:", response.data);
      return "未知分類";
    }
  } catch (error) {
    console.error("獲取二級分類名稱錯誤:", error);
    return "未知分類";
  }
};

// 提交編輯商品
const updateProduct = async () => {
  try {
    // 驗證必填欄位
    if (!productData.productName) {
      Swal.fire({ title: "請輸入商品名稱", icon: "warning" });
      return;
    }

    isSubmitting.value = true;

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append("productId", productData.productId);
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("active", productData.active);

    // 確保分類ID也被傳遞，即使不可編輯
    formData.append("category1Id", productData.category1Id || "");
    formData.append("category2Id", productData.category2Id || "");

    // 處理要刪除的圖片
    if (imagesToDelete.value.size > 0) {
      formData.append(
        "deleteImageIds",
        Array.from(imagesToDelete.value).join(",")
      );
    }

    // 處理新圖片上傳
    if (newImages.value.length > 0) {
      // 找出主圖（如果有）
      const primaryNewImage = newImages.value.find((img) => img.isPrimary);

      // 先添加主圖（如果存在）
      if (primaryNewImage) {
        formData.append("images", primaryNewImage.file);
        formData.append("isPrimaryNew", "true");
      }

      // 再添加其他新圖片
      newImages.value.forEach((img) => {
        if (!img.isPrimary) {
          formData.append("images", img.file);
        }
      });
    }

    // 處理現有圖片的主圖設置
    const primaryExistingImage = existingImages.value.find(
      (img) => img.isPrimary
    );
    if (primaryExistingImage && primaryExistingImage.id) {
      formData.append("primaryImageId", primaryExistingImage.id);
    }

    console.log("更新商品資料:", {
      productId: productData.productId,
      productName: productData.productName,
      description: productData.description,
      active: productData.active,
      newImagesCount: newImages.value.length,
      imagesToDeleteCount: imagesToDelete.value.size,
    });

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
      // 先關閉模態窗
      closeModal();

      // 顯示成功提示
      Swal.fire({
        title: "更新成功",
        text: "商品已成功更新",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // 通知父元件更新
      emit("refresh");
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
  } finally {
    isSubmitting.value = false;
  }
};

// 從 API 響應中提取分類ID
const extractCategoryIds = (data) => {
  let category1Id = null;
  let category2Id = null;

  // 檢查不同可能的數據結構
  if (data.category1 && data.category1.id) {
    category1Id = data.category1.id;
  } else if (data.category1Id) {
    category1Id = data.category1Id;
  } else if (data.category1 && data.category1.categoryId) {
    category1Id = data.category1.categoryId;
  }

  if (data.category2 && data.category2.id) {
    category2Id = data.category2.id;
  } else if (data.category2Id) {
    category2Id = data.category2Id;
  } else if (data.category2 && data.category2.categoryId) {
    category2Id = data.category2.categoryId;
  }

  return { category1Id, category2Id };
};

// 關閉 Modal
const closeModal = () => {
  // 重置表單狀態
  newImages.value = [];
  existingImages.value = [];
  imagesToDelete.value = new Set();
  emit("close");
};

// 監聽 Modal 開啟和 theData 變化
// 監聽 Modal 開啟和 theData 變化
watch(
  [() => props.isOpen, () => props.theData],
  async ([newIsOpen, newData]) => {
    console.log("Modal 狀態變更:", { isOpen: newIsOpen, hasData: !!newData });

    if (newIsOpen && newData) {
      console.log("商品原始資料:", newData);

      // 重置表單
      newImages.value = [];
      existingImages.value = [];
      imagesToDelete.value = new Set();

      // 提取商品基本資料
      productData.productId = newData.productId;
      productData.productName = newData.productName || "";
      productData.description = newData.description || "";
      productData.active = newData.active === undefined ? true : newData.active;

      // 提取分類ID
      const { category1Id, category2Id } = extractCategoryIds(newData);
      productData.category1Id = category1Id;
      productData.category2Id = category2Id;

      // 獲取分類名稱顯示
      if (productData.category1Id) {
        category1Name.value = await fetchCategory1Name(productData.category1Id);
      }

      if (productData.category2Id) {
        category2Name.value = await fetchCategory2Name(productData.category2Id);
      }

      // 獲取商品圖片
      if (productData.productId) {
        await fetchProductImages(productData.productId);
      }

      // 如果 API 請求失敗，嘗試從 theData 中提取圖片信息
      if (existingImages.value.length === 0) {
        console.log("API 未返回圖片，嘗試從 theData 中提取");

        // 直接檢查 newData 中是否有圖片相關字段
        if (newData.productImages && newData.productImages.length > 0) {
          existingImages.value = newData.productImages.map((img) => ({
            ...img,
            isPrimary: !!img.isPrimary,
            id: img.id || img.imageId,
          }));
        } else if (newData.primaryImageUrl) {
          existingImages.value = [
            {
              id: null,
              imagePath: newData.primaryImageUrl,
              isPrimary: true,
            },
          ];
        } else if (newData.image) {
          existingImages.value = [
            {
              id: null,
              imagePath: newData.image,
              isPrimary: true,
            },
          ];
        }

        console.log("從 theData 提取的圖片:", existingImages.value);
      }
    }
  },
  { immediate: true }
);

// 元件掛載時獲取分類資料
onMounted(() => {
  if (props.isOpen && props.theData) {
    // 初始化資料在 watch 中處理
  }
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
