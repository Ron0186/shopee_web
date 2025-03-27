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
            <div class="mb-3">
              <label for="productImage" class="form-label">商品圖片</label>
              <input
                type="file"
                class="form-control"
                id="productImage"
                accept="image/*"
                @change="handleImageChange"
              />
              <div class="mt-2" v-if="imagePreview || productData.image">
                <img
                  :src="
                    imagePreview ||
                    (productData.image
                      ? productData.image.startsWith('http')
                        ? productData.image
                        : `${baseUrl}${productData.image}`
                      : '')
                  "
                  alt="預覽圖片"
                  class="img-thumbnail"
                  style="max-height: 200px"
                />
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
          <button type="button" class="btn btn-primary" @click="updateProduct">
            更新商品
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
  image: "",
});

// 分類名稱（只讀顯示用）
const category1Name = ref("");
const category2Name = ref("");

// 圖片相關
const productImage = ref(null);
const imagePreview = ref("");

// 根據分類ID獲取分類名稱
const fetchCategory1Name = async (category1Id) => {
  if (!category1Id) return "";

  try {
    const response = await axios.get(`/api/category1/${category1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.name) {
      return response.data.name;
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
    } else {
      console.error("獲取二級分類名稱資料格式錯誤:", response.data);
      return "未知分類";
    }
  } catch (error) {
    console.error("獲取二級分類名稱錯誤:", error);
    return "未知分類";
  }
};

// 處理圖片上傳
const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    productImage.value = file;

    // 建立預覽圖片
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    productImage.value = null;
    imagePreview.value = "";
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

    // 創建 FormData 對象
    const formData = new FormData();

    // 添加商品資料 - 保留原有的分類ID
    const productJson = {
      productName: productData.productName,
      description: productData.description || "",
      // 不修改分類關聯
      active: productData.active,
    };

    formData.append(
      "product",
      new Blob([JSON.stringify(productJson)], {
        type: "application/json",
      })
    );

    // 如果有選擇新圖片，則添加到 FormData
    if (productImage.value) {
      formData.append("image", productImage.value);
    }

    // 發送請求到後端 API
    const response = await axios.put(
      `/api/product/${productData.productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      await Swal.fire({
        title: "更新成功",
        icon: "success",
      });

      // 通知父元件更新並關閉 Modal
      emit("refresh");
      emit("close");
    }
  } catch (error) {
    console.error("完整錯誤:", error);
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

// 監聽 Modal 開啟和 theData 變化
watch(
  [() => props.isOpen, () => props.theData],
  async ([newIsOpen, newData]) => {
    if (newIsOpen && newData) {
      // 當 Modal 開啟且有資料時，初始化表單
      Object.assign(productData, newData);

      // 獲取分類名稱顯示
      if (productData.category1Id) {
        category1Name.value = await fetchCategory1Name(productData.category1Id);
      }

      if (productData.category2Id) {
        category2Name.value = await fetchCategory2Name(productData.category2Id);
      }

      // 重置圖片預覽
      imagePreview.value = "";
      productImage.value = null;
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
