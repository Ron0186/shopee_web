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
              <label for="productImage" class="form-label">商品圖片</label>
              <input
                type="file"
                class="form-control"
                id="productImage"
                accept="image/*"
                @change="handleImageChange"
              />
              <div class="mt-2" v-if="imagePreview">
                <img
                  :src="imagePreview"
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
          <button type="button" class="btn btn-primary" @click="submitProduct">
            新增商品
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

// 图片相关
const productImage = ref(null);
const imagePreview = ref("");

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

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("shopId", props.shopId);
    formData.append("category1Id", productData.category1Id);
    formData.append("category2Id", productData.category2Id);
    formData.append("productName", productData.productName);
    formData.append("description", productData.description || "");
    formData.append("active", productData.active);

    // 如果有選擇圖片，則添加到 FormData
    if (productImage.value) {
      formData.append("image", productImage.value);
    }

    // 發送請求到後端 API
    const response = await axios.post("/api/product", formData, {
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

      // 重置表單
      resetForm();

      // 通知父元件更新並關閉 Modal
      emit("refresh");
      emit("close");
    }
  } catch (error) {
    console.error("完整錯誤:", error);
    Swal.fire({
      title: "新增失敗",
      text: error.response?.data?.message || "請求處理失敗，請稍後再試",
      icon: "error",
    });
  }
};

// 重置表單
const resetForm = () => {
  productData.productName = "";
  productData.description = "";
  productData.category1Id = "";
  productData.category2Id = "";
  productData.active = true;
  productImage.value = null;
  imagePreview.value = "";
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
