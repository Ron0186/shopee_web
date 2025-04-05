<template>
  <div class="container mt-4">
    <div class="row">
      <!-- 左側：產品圖片 -->
      <div class="col-md-6">
        <div class="product-gallery">
          <!-- 主圖顯示 -->
          <div class="main-image mb-3">
            <img
              :src="selectedImage"
              class="img-fluid rounded"
              alt="商品主圖"
              @error="handleImageError"
            />
          </div>
          <!-- 縮圖列表 -->
          <div class="thumbnails d-flex overflow-auto">
            <div
              v-for="(image, index) in allProductImages"
              :key="index"
              class="thumbnail-item me-2"
              @click="selectedImageIndex = index"
            >
              <img
                :src="getImageUrl(image)"
                class="img-thumbnail"
                :class="{ 'border-primary': selectedImageIndex === index }"
                style="
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  cursor: pointer;
                "
                alt="商品縮圖"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：產品資訊 -->
      <div class="col-md-6">
        <!-- 商品標題 -->
        <h2 class="mb-2">{{ product.productName }}</h2>

        <!-- 商品編號 -->
        <!-- <p class="text-muted small mb-3">{{ product.productId }}</p> -->

        <!-- 評分 -->
        <div class="mb-3 d-flex align-items-center">
          <div class="me-2">
            <i
              v-for="n in 5"
              :key="n"
              class="bi"
              :class="n <= product.rating ? 'bi-star-fill' : 'bi-star'"
              style="color: #ffd700"
            ></i>
          </div>
          <a href="#reviews" class="text-decoration-none"
            >{{ product.reviewCount || 0 }} 評價</a
          >
        </div>

        <!-- 價格 -->
        <div class="mb-4">
          <h3 class="mb-1" v-html="priceDisplay"></h3>
          <p
            v-if="
              selectedSku &&
              product.originalPrice &&
              product.originalPrice > currentPrice
            "
            class="text-muted"
          >
            <del>原價：NT${{ product.originalPrice }}</del>
          </p>
        </div>

        <!-- 動態生成每種規格的選擇器 -->
        <div v-for="(values, specName) in specs" :key="specName" class="mb-3">
          <p class="mb-2">
            {{ specName }}：{{ selectedSpecs[specName] || "請選擇" }}
          </p>

          <!-- 顏色規格改成文字顯示 -->
          <div v-if="specName === '顏色'" class="d-flex flex-wrap">
            <button
              v-for="(item, index) in values"
              :key="index"
              type="button"
              class="btn me-2 mb-2"
              :class="
                selectedSpecs[specName] === item.value
                  ? 'btn-dark'
                  : 'btn-outline-secondary'
              "
              style="min-width: 50px"
              @click="selectSpec(specName, item.value)"
            >
              {{ item.value }}
            </button>
          </div>

          <!-- 其他規格使用按鈕 -->
          <div v-else class="d-flex flex-wrap">
            <button
              v-for="(item, index) in values"
              :key="index"
              type="button"
              class="btn me-2 mb-2"
              :class="
                selectedSpecs[specName] === item.value
                  ? 'btn-dark'
                  : 'btn-outline-secondary'
              "
              style="min-width: 50px"
              @click="selectSpec(specName, item.value)"
            >
              {{ item.value }}
            </button>
          </div>
        </div>

        <!-- 配送方式 -->
        <div class="mb-4">
          <p class="mb-2">配送方式</p>
          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="radio"
              name="shippingMethod"
              id="homeDelivery"
              value="homeDelivery"
              v-model="shippingMethod"
            />
            <label class="form-check-label" for="homeDelivery">宅配配送</label>
          </div>
          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="radio"
              name="shippingMethod"
              id="convenience"
              value="convenience"
              v-model="shippingMethod"
            />
            <label class="form-check-label" for="convenience">超商取貨</label>
          </div>
          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="radio"
              name="shippingMethod"
              id="storePickup"
              value="storePickup"
              v-model="shippingMethod"
            />
            <label class="form-check-label" for="storePickup"
              >實體店鋪取貨</label
            >
          </div>
        </div>

        <!-- 購買數量 -->
        <div class="mb-4">
          <div class="d-flex align-items-center">
            <button
              class="btn btn-outline-secondary"
              @click="quantity > 1 ? quantity-- : null"
              :disabled="quantity <= 1"
            >
              <i class="bi bi-dash"></i>
            </button>
            <input
              type="number"
              class="form-control text-center mx-2"
              v-model="quantity"
              min="1"
              style="width: 80px"
            />
            <button
              class="btn btn-outline-secondary"
              @click="quantity++"
              :disabled="quantity >= product.stock"
            >
              <i class="bi bi-plus"></i>
            </button>
            <span class="ms-3">{{ stockStatus }}</span>
          </div>
        </div>

        <!-- 加入購物車按鈕 -->
        <div class="d-grid gap-2">
          <button
            class="btn btn-dark btn-lg py-3"
            @click="addToCart"
            :disabled="!canAddToCart"
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>

    <!-- 商品詳情內容 -->
    <div class="row mt-5">
      <div class="col-12">
        <ul class="nav nav-tabs" id="productTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="details-tab"
              data-bs-toggle="tab"
              data-bs-target="#details"
              type="button"
              role="tab"
            >
              商品詳情
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="reviews-tab"
              data-bs-toggle="tab"
              data-bs-target="#reviews"
              type="button"
              role="tab"
            >
              顧客評價
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="shipping-tab"
              data-bs-toggle="tab"
              data-bs-target="#shipping"
              type="button"
              role="tab"
            >
              配送與退貨
            </button>
          </li>
        </ul>
        <div class="tab-content py-4" id="productTabsContent">
          <div class="tab-pane fade show active" id="details" role="tabpanel">
            <div class="p-3">
              <h4>商品描述</h4>
              <p>{{ product.description }}</p>
            </div>
          </div>
          <div class="tab-pane fade" id="reviews" role="tabpanel">
            <div class="p-3">
              <h4>顧客評價</h4>
              <p>暫無評價</p>
            </div>
          </div>
          <div class="tab-pane fade" id="shipping" role="tabpanel">
            <div class="p-3">
              <h4>配送資訊</h4>
              <p>全台配送，一般地區3-5個工作天到貨。</p>
              <h4 class="mt-4">退換貨政策</h4>
              <p>收到商品後七天內可申請退換貨。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 尺寸指南 Modal -->
    <div
      class="modal fade"
      id="sizeGuideModal"
      tabindex="-1"
      :class="{ show: showSizeGuide }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">尺寸指南</h5>
            <button
              type="button"
              class="btn-close"
              @click="showSizeGuide = false"
            ></button>
          </div>
          <div class="modal-body">
            <h6>尺寸對照表</h6>
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>尺寸</th>
                  <th>胸圍 (cm)</th>
                  <th>肩寬 (cm)</th>
                  <th>衣長 (cm)</th>
                  <th>袖長 (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XS</td>
                  <td>96</td>
                  <td>42</td>
                  <td>65</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>S</td>
                  <td>100</td>
                  <td>44</td>
                  <td>67</td>
                  <td>25</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>104</td>
                  <td>46</td>
                  <td>69</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>108</td>
                  <td>48</td>
                  <td>71</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>114</td>
                  <td>50</td>
                  <td>73</td>
                  <td>28</td>
                </tr>
                <tr>
                  <td>XXL</td>
                  <td>120</td>
                  <td>52</td>
                  <td>75</td>
                  <td>29</td>
                </tr>
                <tr>
                  <td>3XL</td>
                  <td>126</td>
                  <td>54</td>
                  <td>77</td>
                  <td>30</td>
                </tr>
              </tbody>
            </table>
            <p class="mt-3">
              測量說明：平放測量，單位為公分，誤差範圍±2cm屬正常。
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showSizeGuide = false"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const productId = route.params.productId;
const userStore = useUserStore();

// 基礎 URL
const baseUrl = ref(import.meta.env.VITE_API_URL || "");
const defaultImage = "/assets/default-image.png"; // 默認圖片路徑

// 商品資料
const product = ref({
  productId: "",
  productName: "",
  description: "",
  price: 0,
  originalPrice: 0,
  stock: 100,
  rating: 4.5,
  reviewCount: 12,
});

// 商品圖片
const productImages = ref([]);
const selectedImageIndex = ref(0);

// 規格選項
const colors = ref([
  { name: "米白", hexCode: "#F5F5DC" },
  { name: "深灰", hexCode: "#444444" },
  { name: "牛仔藍", hexCode: "#5D8AA8" },
]);
const sizes = ref(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);

// 用戶選擇
const selectedColor = ref("");
const selectedSize = ref("");
const quantity = ref(1);
const shippingMethod = ref("homeDelivery");
const showSizeGuide = ref(false);

// 增強圖片處理邏輯
// 從各種來源獲取所有商品圖片
const allProductImages = computed(() => {
  if (!product.value) return [];

  // 如果有 productImages 數組，優先使用它
  if (productImages.value && productImages.value.length > 0) {
    return productImages.value.map((img) => {
      // 處理不同格式的圖片物件
      if (typeof img === "string") {
        return { imagePath: img };
      }
      return img;
    });
  }

  // 使用可能的其他圖片來源
  const images = [];

  // 檢查 primaryImageUrl
  if (product.value.primaryImageUrl) {
    images.push({
      imagePath: product.value.primaryImageUrl,
      isPrimary: true,
    });
  }

  // 檢查 image
  if (
    product.value.image &&
    product.value.image !== product.value.primaryImageUrl
  ) {
    images.push({
      imagePath: product.value.image,
      isPrimary: !product.value.primaryImageUrl,
    });
  }

  // 如果仍然沒有圖片，使用預設圖片
  if (images.length === 0) {
    images.push({
      imagePath: defaultImage,
      isPrimary: true,
    });
  }

  return images;
});

// 選中的圖片
const selectedImage = computed(() => {
  const images = allProductImages.value;
  if (images.length === 0) return defaultImage;

  if (
    selectedImageIndex.value >= 0 &&
    selectedImageIndex.value < images.length
  ) {
    return getImageUrl(images[selectedImageIndex.value]);
  }

  return getImageUrl(images[0]);
});

// 獲取圖片 URL
const getImageUrl = (image) => {
  if (!image) return defaultImage;

  const imagePath = image.imagePath || image.path || image.url || image;
  if (!imagePath) return defaultImage;

  // 如果是完整 URL，直接返回
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }

  // 如果是相對路徑，加上基礎 URL
  if (
    typeof imagePath === "string" &&
    baseUrl.value &&
    !imagePath.startsWith("/assets")
  ) {
    return `${baseUrl.value}${imagePath}`;
  }

  // 如果是本地圖片路徑，直接返回
  return imagePath;
};

// 處理圖片加載錯誤
const handleImageError = (e) => {
  console.log("圖片載入失敗，使用預設圖片");
  e.target.src = defaultImage;
};

// 價格計算
const currentPrice = computed(() => {
  // 如果有選中的SKU，返回SKU價格
  if (selectedSku.value) {
    return selectedSku.value.price;
  }

  // 否則返回商品基本價格
  return product.value.price || 0;
});

// 新增價格顯示計算屬性
const priceDisplay = computed(() => {
  // 檢查是否所有規格都已選擇
  const allSpecsSelected = Object.keys(specs.value).every(
    (specName) => selectedSpecs.value[specName]
  );

  // 如果已選擇所有規格並找到對應SKU
  if (allSpecsSelected && selectedSku.value) {
    return `NT$${currentPrice.value}`;
  }

  // 否則顯示價格區間
  if (product.value.priceRange) {
    const { minPrice, maxPrice } = product.value.priceRange;
    if (minPrice === maxPrice) {
      return `NT$${minPrice}`;
    } else {
      return `NT$${minPrice} - NT$${maxPrice}`;
    }
  }

  // 沒有價格區間數據時的備選方案
  return `NT$${product.value.price || 0}`;
});

// 是否可以加入購物車
const canAddToCart = computed(() => {
  // 檢查是否所有規格都已選擇
  const allSpecsSelected = Object.keys(specs.value).every(
    (specName) => selectedSpecs.value[specName]
  );
  return allSpecsSelected && quantity.value > 0;
});

// 監聽 Modal 顯示
watch(showSizeGuide, (newValue) => {
  if (newValue) {
    const modal = document.getElementById("sizeGuideModal");
    if (modal) {
      modal.classList.add("d-block");
      modal.style.display = "block";
      document.body.classList.add("modal-open");
    }
  } else {
    const modal = document.getElementById("sizeGuideModal");
    if (modal) {
      modal.classList.remove("d-block");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  }
});

// 選擇顏色
const selectColor = (color) => {
  selectedColor.value = color.name;
};

// 選擇尺寸
const selectSize = (size) => {
  selectedSize.value = size;
};

// 加入購物車
const addToCart = () => {
  if (!canAddToCart.value) {
    Swal.fire({
      title: "請選擇規格",
      text: "請先選擇顏色和尺寸",
      icon: "warning",
    });
    return;
  }

  // 這裡執行加入購物車的操作
  if (!userStore.isLoggedIn) {
    Swal.fire({
      title: "請先登入",
      text: "加入購物車需要先登入",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "前往登入",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/login");
      }
    });
    return;
  }

  // 組織購物車項目數據
  const cartItem = {
    productId: product.value.productId,
    productName: product.value.productName,
    color: selectedColor.value,
    size: selectedSize.value,
    quantity: quantity.value,
    price: currentPrice.value,
    image: selectedImage.value,
  };

  // 調用加入購物車API (模擬)
  try {
    // 實際應用中替換為真實的API調用
    console.log("加入購物車:", cartItem);

    Swal.fire({
      title: "成功",
      text: "已加入購物車",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      text: "加入購物車失敗",
      icon: "error",
    });
  }
};

// 獲取商品詳情
const fetchProductDetail = async () => {
  try {
    console.log("獲取商品詳情, 商品ID:", productId);

    // 使用新的API路徑獲取完整商品詳情
    const response = await axios.get(`/api/products/${productId}/detail`);

    if (response.status === 200 && response.data) {
      console.log("商品詳情原始回應:", response.data);

      // 設置商品基本信息
      product.value = response.data.product;

      // 設置SKU資料
      skus.value = response.data.skus || [];

      // 處理圖片資源
      if (
        response.data.product.productImages &&
        Array.isArray(response.data.product.productImages) &&
        response.data.product.productImages.length > 0
      ) {
        productImages.value = response.data.product.productImages.map((img) =>
          typeof img === "string" ? { imagePath: img } : img
        );
        console.log("商品圖片數據:", productImages.value);
      } else if (
        response.data.product.primaryImageUrl ||
        response.data.product.image
      ) {
        console.log("使用主圖/圖片字段:", {
          primaryImageUrl: response.data.product.primaryImageUrl,
          image: response.data.product.image,
        });
      }
    }

    // 處理規格信息
    processSpecifications(response.data.specifications);
  } catch (error) {
    console.error("獲取商品詳情失敗:", error);
  }
};

const processSpecifications = (specifications) => {
  if (!specifications || !Array.isArray(specifications)) return;

  // 清空現有規格
  specs.value = {};
  selectedSpecs.value = {};

  // 遍歷所有規格類型
  specifications.forEach((spec) => {
    const specName = spec.specName; // 例如："顏色", "容量"
    if (spec.values && spec.values.length > 0) {
      // 為每種規格類型創建一個數組
      specs.value[specName] = spec.values.map((v) => {
        // 針對顏色規格，添加hexCode
        if (specName === "顏色") {
          return {
            value: v.value,
            hexCode: getColorHexCode(v.value),
          };
        }
        return { value: v.value };
      });
    }
  });

  console.log("處理後的規格:", specs.value);
};

const specs = ref({}); // 用於存儲所有類型的規格
const selectedSpecs = ref({}); // 用於存儲用戶選擇的規格值
const skus = ref([]);
const selectedSku = ref(null);

// 選擇規格
const selectSpec = (specName, value) => {
  selectedSpecs.value[specName] = value;
  updateSelectedSku();
};

// 根據當前選擇的所有規格找到對應的SKU
const findMatchingSku = () => {
  // 檢查是否所有必要的規格都已選擇
  const allSpecsSelected = Object.keys(specs.value).every(
    (specName) => selectedSpecs.value[specName]
  );

  if (!allSpecsSelected || !skus.value.length) {
    return null;
  }

  // 尋找匹配所有已選規格的SKU
  return skus.value.find((sku) => {
    const specPairs = sku.specPairs || {};
    return Object.keys(selectedSpecs.value).every(
      (specName) => specPairs[specName] === selectedSpecs.value[specName]
    );
  });
};

// 更新當前價格和庫存
const updateSelectedSku = () => {
  selectedSku.value = findMatchingSku();

  if (selectedSku.value) {
    // 更新價格
    product.value.price = selectedSku.value.price;

    // 更新庫存
    const stockAvailable = selectedSku.value.stock || 0;
    if (stockAvailable <= 0) {
      stockStatus.value = "售罄";
    } else {
      stockStatus.value = `剩餘${stockAvailable}件`;
    }

    // 限制購買數量不超過庫存
    if (quantity.value > stockAvailable) {
      quantity.value = Math.max(1, stockAvailable);
    }
  }
};

// 監聽所有規格選擇的變化
watch(
  selectedSpecs,
  () => {
    updateSelectedSku();
  },
  { deep: true }
);

const getColorHexCode = (colorName) => {
  // 顏色映射表
  const colorMap = {
    米白: "#F5F5DC",
    深灰: "#444444",
    牛仔藍: "#5D8AA8",
    黑色: "#000000",
    白色: "#FFFFFF",
    灰色: "#808080",
    藍色: "#0000FF",
    紅色: "#FF0000",
    綠色: "#008000",
    黃色: "#FFFF00",
    紫色: "#800080",
    粉色: "#FFC0CB",
    橙色: "#FFA500",
  };

  return colorMap[colorName] || "#CCCCCC"; // 若找不到顏色則返回默認灰色
};

const stockStatus = ref("庫存充足");

// 在元件掛載時獲取商品資訊
onMounted(async () => {
  await fetchProductDetail();

  // 初始化 Bootstrap 模態框
  const bootstrap = window.bootstrap;
  if (bootstrap && bootstrap.Modal) {
    const modalElement = document.getElementById("sizeGuideModal");
    if (modalElement) {
      new bootstrap.Modal(modalElement);
    }
  }
});
</script>

<style scoped>
.color-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.color-circle:hover {
  transform: scale(1.1);
}

.thumbnail-item img {
  transition: all 0.2s;
}

.thumbnail-item img:hover {
  border-color: #007bff;
}

.modal.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

/* 尺寸按鈕圓形樣式 */
.btn-outline-secondary {
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* 產品頁面基本樣式 */
.product-gallery {
  position: relative;
}

.main-image {
  border-radius: 8px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 500px;
  object-fit: cover;
}

.thumbnails {
  scrollbar-width: thin;
}

.thumbnails::-webkit-scrollbar {
  height: 5px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

/* 標籤頁樣式 */
.nav-tabs .nav-link {
  color: #212529;
}

.nav-tabs .nav-link.active {
  font-weight: 500;
  border-bottom: 2px solid #212529;
}
</style>
