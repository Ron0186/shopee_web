<template>
  <div class="shop-container">
    <!-- 📌 主要內容區域 -->
    <main class="main-content">
      <h1>🛒 商品商城</h1>

      <!-- 📌 分類選單 -->
      <div class="category-menu">
        <div class="categories">
          <button
            class="category-btn"
            :class="{ active: selectedCategory1 === null }"
            @click="selectCategory1(null)"
          >
            所有分類
          </button>
          <button
            v-for="cat1 in category1List"
            :key="cat1.id"
            class="category-btn"
            :class="{ active: selectedCategory1 === cat1.id }"
            @click="selectCategory1(cat1.id)"
          >
            {{ cat1.name }}
          </button>
        </div>

        <div class="subcategories" v-if="selectedCategory1">
          <button
            class="subcategory-btn"
            :class="{ active: selectedCategory2 === null }"
            @click="selectCategory2(null)"
          >
            全部
          </button>
          <button
            v-for="cat2 in filteredCategory2List"
            :key="cat2.id"
            class="subcategory-btn"
            :class="{ active: selectedCategory2 === cat2.id }"
            @click="selectCategory2(cat2.id)"
          >
            {{ cat2.name }}
          </button>
        </div>
      </div>

      <!-- 📌 搜尋欄 -->
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="搜尋商品..." />
        <button @click="searchProduct">🔍 搜尋</button>
      </div>

      <!-- 📌 商品列表 -->
      <div v-if="loading" class="loading">載入中...請稍候</div>
      <div v-else-if="products.length === 0" class="no-products">
        沒有符合條件的商品
      </div>
      <div v-else class="products-grid">
        <div
          class="product-card"
          v-for="product in products"
          :key="product.productId"
        >
          <img
            :src="
              getImageUrl(
                product.primaryImageUrl ||
                  (product.imageUrls && product.imageUrls[0])
              )
            "
            :alt="product.productName"
            @click="viewProductDetail(product)"
            style="cursor: pointer"
          />
          <h3 @click="viewProductDetail(product)" style="cursor: pointer">
            {{ product.productName }}
          </h3>
          <p class="product-price">💰 {{ product.lowestPrice }} 元</p>
          <p class="product-seller">👤 賣家：{{ product.sellerName }}</p>
          <p v-if="product.category1Name" class="category-tag">
            分類：{{ product.category1Name }} / {{ product.category2Name }}
          </p>
          <button @click="addToCart(product)">🛒 加入購物車</button>
          <button @click="viewProductDetail(product)" class="view-details-btn">
            👁️ 查看詳情
          </button>
        </div>
      </div>

      <!-- 📌 分頁控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          :disabled="currentPage === 0"
          @click="changePage(currentPage - 1)"
          class="page-btn prev"
        >
          上一頁
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage >= totalPages - 1"
          @click="changePage(currentPage + 1)"
          class="page-btn next"
        >
          下一頁
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios"; // 使用插件封裝的 axios

const router = useRouter();

// 🔹 商品和分類資料
const products = ref([]);
const category1List = ref([]);
const category2List = ref([]);
const filteredCategory2List = ref([]);

// 🔹 UI 狀態
const searchQuery = ref("");
const loading = ref(true);
const currentPage = ref(0);
const pageSize = ref(12);
const totalPages = ref(0);
const selectedCategory1 = ref(null);
const selectedCategory2 = ref(null);

// 🔹 API URL 前綴 (根據實際環境可調整)
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";

// ✅ 測試 API 連接和配置
const testApiConnection = async () => {
  try {
    console.log("測試 API 連接...");
    console.log("環境變數 VITE_API_URL:", import.meta.env.VITE_API_URL);
    console.log("使用的 apiBaseUrl:", apiBaseUrl);

    // 嘗試一個簡單的 API 請求
    const testUrl = `${apiBaseUrl}/api/health`;
    console.log("測試 URL:", testUrl);

    const testResponse = await axios.get(testUrl);
    console.log("API 連接測試成功:", testResponse.data);
    return true;
  } catch (error) {
    console.error("API 連接測試失敗:", error);
    return false;
  }
};

// ✅ 從後端 API 抓商品資料
const fetchProducts = async () => {
  console.log("獲取商品列表...");
  loading.value = true;

  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    // 添加過濾參數
    if (selectedCategory1.value) {
      params.category1Id = selectedCategory1.value;
    }
    if (selectedCategory2.value) {
      params.category2Id = selectedCategory2.value;
    }
    if (searchQuery.value) {
      params.nameKeyword = searchQuery.value;
    }

    console.log("商品查詢參數:", params);

    // 構建正確的 API URL
    const url = `${apiBaseUrl}/api/products/public`;
    console.log("商品 API URL:", url);

    const res = await axios.get(url, { params });
    console.log("商品 API 返回數據:", res.data);

    // 處理分頁數據
    if (res.data && res.data.content) {
      products.value = res.data.content;
      totalPages.value = res.data.totalPages;
      console.log(`成功載入 ${products.value.length} 個商品`);
    } else {
      console.warn("商品 API 返回的數據格式不符合預期:", res.data);

      // 嘗試備用 API 端點
      console.log("嘗試備用 API 端點...");
      const backupUrl = `${apiBaseUrl}/api/products/public/shop/0`;
      console.log("備用 URL:", backupUrl);

      const backupRes = await axios.get(backupUrl, { params });
      console.log("備用 API 返回數據:", backupRes.data);

      if (backupRes.data && backupRes.data.content) {
        products.value = backupRes.data.content;
        totalPages.value = backupRes.data.totalPages;
        console.log(`成功從備用 API 載入 ${products.value.length} 個商品`);
      } else {
        products.value = [];
        totalPages.value = 0;
      }
    }
  } catch (error) {
    console.error("❌ 取得商品失敗：", error);
    console.log("錯誤詳情:", error.response || error.message);

    try {
      // 嘗試備用 API 端點
      console.log("主 API 失敗，嘗試備用 API...");
      const backupUrl = `${apiBaseUrl}/api/products/public/shop/0`;
      console.log("備用 URL:", backupUrl);

      const backupRes = await axios.get(backupUrl, {
        params: {
          page: currentPage.value,
          size: pageSize.value,
        },
      });

      console.log("備用 API 返回數據:", backupRes.data);

      if (backupRes.data && backupRes.data.content) {
        products.value = backupRes.data.content;
        totalPages.value = backupRes.data.totalPages;
        console.log(`成功從備用 API 載入 ${products.value.length} 個商品`);
      } else {
        products.value = [];
        totalPages.value = 0;
      }
    } catch (backupError) {
      console.error("備用 API 也失敗:", backupError);
      products.value = [];
      totalPages.value = 0;
    }
  } finally {
    loading.value = false;
  }
};

// ✅ 獲取所有一級分類
const fetchCategory1 = async () => {
  console.log("獲取一級分類...");
  try {
    const url = `${apiBaseUrl}/api/category1/all`;
    console.log("一級分類 API URL:", url);

    const res = await axios.get(url);
    console.log("一級分類 API 返回數據:", res.data);

    if (Array.isArray(res.data)) {
      category1List.value = res.data;
      console.log(`成功載入 ${category1List.value.length} 個一級分類`);
    } else {
      console.error("一級分類 API 返回的數據不是數組:", res.data);
      category1List.value = [];
    }
  } catch (error) {
    console.error("❌ 取得一級分類失敗：", error);
    console.log("錯誤詳情:", error.response || error.message);
    category1List.value = [];
  }
};

// ✅ 根據一級分類ID獲取對應的二級分類
const fetchCategory2ByCategory1 = async (category1Id) => {
  console.log("獲取二級分類...");
  if (!category1Id) {
    filteredCategory2List.value = [];
    return;
  }

  try {
    const url = `${apiBaseUrl}/api/category2/byC1`;
    console.log("二級分類 API URL:", url);

    const res = await axios.get(url, {
      params: { category1Id },
    });

    console.log("二級分類 API 返回數據:", res.data);

    if (Array.isArray(res.data)) {
      filteredCategory2List.value = res.data;
      console.log(`成功載入 ${filteredCategory2List.value.length} 個二級分類`);
    } else {
      console.error("二級分類 API 返回的數據不是數組:", res.data);
      filteredCategory2List.value = [];
    }
  } catch (error) {
    console.error("❌ 取得二級分類失敗：", error);
    console.log("錯誤詳情:", error.response || error.message);
    filteredCategory2List.value = [];
  }
};

// 🔍 選擇一級分類
const selectCategory1 = async (id) => {
  console.log("選擇一級分類:", id);
  selectedCategory1.value = id;
  selectedCategory2.value = null; // 重置二級分類選擇
  currentPage.value = 0; // 重置分頁

  if (id) {
    await fetchCategory2ByCategory1(id);
  } else {
    filteredCategory2List.value = [];
  }

  await fetchProducts();
};

// 🔍 選擇二級分類
const selectCategory2 = async (id) => {
  console.log("選擇二級分類:", id);
  selectedCategory2.value = id;
  currentPage.value = 0; // 重置分頁
  await fetchProducts();
};

// 🔍 執行搜尋
const searchProduct = () => {
  console.log("執行搜尋:", searchQuery.value);
  currentPage.value = 0; // 重置分頁
  fetchProducts();
};

// 📄 分頁控制
const changePage = (newPage) => {
  console.log("切換頁面:", newPage);
  if (newPage >= 0 && newPage < totalPages.value) {
    currentPage.value = newPage;
    fetchProducts();
  }
};

const addToCart = async (product) => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const userId = Number(
    localStorage.getItem("userId") || sessionStorage.getItem("userId")
  );

  if (!token || !userId) {
    alert("請先登入再使用購物車功能！");
    return;
  }

  // 🔍 先檢查 product 有沒有 skuId
  if (!product.skuId) {
    console.error("❌ product.skuId 缺失", product);
    alert("❌ 加入購物車失敗，找不到商品 SKU ID！");
    return;
  }

  try {
    const res = await axios.post(
      `${apiBaseUrl}/api/cart/add`,
      {
        userId,
        skuId: product.skuId,
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 加入購物車成功：", res.data);
    alert(`${product.productName} 已加入購物車！`);
  } catch (error) {
    console.error("❌ 加入購物車失敗：", error.response || error.message);
    alert("❌ 加入購物車失敗，請稍後再試");
  }
};

// 👁️ 查看商品詳情
const viewProductDetail = (product) => {
  console.log("查看商品詳情:", product);
  router.push(`/products/${product.productId}/detail`);
};

// 🖼️ 圖片處理
const getImageUrl = (url) => {
  if (!url) return `${apiBaseUrl}/uploads/default-product-image.jpg`;
  return url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
};

// 👀 監聽搜尋關鍵字變化
watch(searchQuery, (newVal, oldVal) => {
  if (newVal === "" && oldVal !== "") {
    // 當清空搜尋框時自動刷新商品列表
    fetchProducts();
  }
});

// 🔁 初始化時呼叫
onMounted(async () => {
  console.log("===== 商城頁面初始化 =====");
  await testApiConnection();
  await fetchCategory1();
  await fetchProducts();
});
</script>

<style>
/* ✅ 讓主要內容區域填滿剩餘空間 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0;
  /* ✅ 移除 margin */
  padding: 0;
  /* ✅ 確保不影響 */
  box-sizing: border-box;
}

.shop-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1400px;
  padding: 20px;
  box-sizing: border-box;
}

.navbar,
.footer {
  width: 100%;
  /* ✅ 讓它們完全填滿 */
  margin: 0;
  /* ✅ 確保不會有左右空白 */
  padding: 0;
  /* ✅ 確保內邊距不影響 */
  box-sizing: border-box;
}

/* 🎯 分類選單 */
.category-menu {
  width: 100%;
  margin-bottom: 20px;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: center;
}

.subcategories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  padding-left: 20px;
  justify-content: center;
}

.category-btn,
.subcategory-btn {
  padding: 8px 15px;
  background: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover,
.subcategory-btn:hover {
  background: #e0e0e0;
}

.category-btn.active {
  background: #007bff;
  color: white;
  border-color: #0069d9;
}

.subcategory-btn.active {
  background: #28a745;
  color: white;
  border-color: #218838;
}

/* 🎯 搜尋欄 */
.search-bar {
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.search-bar input {
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar button {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 5px;
}

/* 載入中和沒有商品的提示 */
.loading,
.no-products {
  margin: 30px 0;
  font-size: 18px;
  color: #666;
  text-align: center;
  width: 100%;
}

/* 🎯 商品網格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 🎯 商品卡片 */
.product-card {
  max-width: 250px;
  /* 確保商品卡片不會變得過大 */
  width: 100%;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 180px;
  /* 調整圖片大小，讓商品更明顯 */
  object-fit: cover;
  border-radius: 5px;
}

.product-card h3 {
  font-size: 16px;
  margin: 10px 0;
  font-weight: bold;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
}

.product-card p {
  font-size: 14px;
  color: #444;
  margin-bottom: 8px;
}

.product-price {
  font-size: 16px !important;
  color: #e84118 !important;
  font-weight: bold;
}

.product-seller {
  font-size: 12px !important;
  color: #666 !important;
}

/* 分類標籤 */
.category-tag {
  font-size: 12px;
  color: #666;
  background-color: #f8f9fa;
  padding: 2px 5px;
  border-radius: 3px;
  margin-bottom: 10px;
}

/* 🎯 購物按鈕 */
.product-card button {
  background: #ff6f61;
  color: white;
  padding: 10px 15px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease-in-out;
  width: 100%;
  margin-bottom: 5px;
}

.product-card button:hover {
  background: #e05b50;
}

/* 查看詳情按鈕 */
.view-details-btn {
  background: #007bff !important;
  margin-top: 5px;
}

.view-details-btn:hover {
  background: #0069d9 !important;
}

/* 分頁控制 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.page-btn {
  padding: 8px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  color: #666;
}
</style>
