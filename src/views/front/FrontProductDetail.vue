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
            />
          </div>
          <!-- 縮圖列表 -->
          <div class="thumbnails d-flex overflow-auto">
            <div
              v-for="(image, index) in productImages"
              :key="index"
              class="thumbnail-item me-2"
              @click="selectedImageIndex = index"
            >
              <img
                :src="image"
                class="img-thumbnail"
                :class="{ 'border-primary': selectedImageIndex === index }"
                style="
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  cursor: pointer;
                "
                alt="商品縮圖"
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
        <p class="text-muted small mb-3">{{ product.productId }}</p>

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
          <h3 class="mb-1">NT${{ currentPrice }}</h3>
          <p
            v-if="product.originalPrice && product.originalPrice > currentPrice"
            class="text-muted"
          >
            <del>原價：NT${{ product.originalPrice }}</del>
          </p>
        </div>

        <!-- 顏色選擇 -->
        <div class="mb-3">
          <p class="mb-2">顏色：{{ selectedColor || "請選擇" }}</p>
          <div class="d-flex">
            <div
              v-for="(color, index) in colors"
              :key="index"
              class="color-option me-2 mb-2"
              @click="selectColor(color)"
            >
              <div
                class="color-circle"
                :style="{
                  backgroundColor: color.hexCode,
                  border:
                    selectedColor === color.name
                      ? '2px solid #000'
                      : '1px solid #ddd',
                }"
                :title="color.name"
              ></div>
            </div>
          </div>
        </div>

        <!-- 尺寸選擇 -->
        <div class="mb-4">
          <p class="mb-2">尺寸：{{ selectedSize || "請選擇" }}</p>
          <div class="d-flex flex-wrap">
            <button
              v-for="size in sizes"
              :key="size"
              type="button"
              class="btn me-2 mb-2"
              :class="
                selectedSize === size ? 'btn-dark' : 'btn-outline-secondary'
              "
              style="min-width: 50px; border-radius: 50%"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>
          <a
            href="#"
            class="text-decoration-none"
            @click.prevent="showSizeGuide = true"
          >
            <i class="bi bi-rulers me-1"></i>尺寸相關資訊
          </a>
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
            <span class="ms-3">庫存充足</span>
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
          <button class="btn btn-outline-dark">
            <i class="bi bi-heart me-2"></i>加入收藏
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
              <div class="product-details mt-4">
                <h5>商品特點</h5>
                <ul>
                  <li>100% 純棉材質</li>
                  <li>經典工作襯衫設計</li>
                  <li>前胸雙口袋</li>
                  <li>適合日常穿搭</li>
                  <li>機洗</li>
                </ul>
              </div>
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
const selectedImage = computed(
  () => productImages.value[selectedImageIndex.value] || ""
);

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

// 價格計算
const currentPrice = computed(() => {
  return product.value.price || 790;
});

// 是否可以加入購物車
const canAddToCart = computed(() => {
  return selectedColor.value && selectedSize.value && quantity.value > 0;
});

// 監聽 Modal 顯示
watch(showSizeGuide, (newValue) => {
  if (newValue) {
    document.getElementById("sizeGuideModal").classList.add("d-block");
  } else {
    document.getElementById("sizeGuideModal").classList.remove("d-block");
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
    // 實際使用時請替換為真實API路徑
    const response = await axios.get(`/api/products/${productId}`);

    if (response.status === 200 && response.data) {
      product.value = response.data;

      // 處理圖片資源
      if (
        response.data.productImages &&
        response.data.productImages.length > 0
      ) {
        productImages.value = response.data.productImages.map((img) => img.url);
      } else {
        // 假設的測試圖片，實際應用中應使用真實的商品圖片
        productImages.value = [
          "/assets/product-1.jpg",
          "/assets/product-2.jpg",
          "/assets/product-3.jpg",
          "/assets/product-4.jpg",
        ];
      }
    }
  } catch (error) {
    console.error("獲取商品詳情失敗:", error);

    // 載入失敗時使用默認數據 (僅用於開發測試)
    product.value = {
      productId: "356852",
      productName: "男裝 男女適穿 牛仔boxy工作襯衫[5分袖][童版]",
      description:
        "這款工作襯衫採用柔軟舒適的布料，簡約設計風格適合男女穿著。寬鬆的boxy剪裁提供舒適的穿著體驗，五分袖設計適合春夏季節。",
      price: 790,
      originalPrice: 990,
      stock: 100,
      rating: 4.5,
      reviewCount: 12,
    };

    // 測試用圖片
    productImages.value = [
      "https://via.placeholder.com/500x600?text=Product+Image+1",
      "https://via.placeholder.com/500x600?text=Product+Image+2",
      "https://via.placeholder.com/500x600?text=Product+Image+3",
      "https://via.placeholder.com/500x600?text=Product+Image+4",
    ];
  }
};

// 在元件掛載時獲取商品資訊
onMounted(() => {
  fetchProductDetail();
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
