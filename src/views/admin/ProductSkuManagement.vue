<template>
  <div class="container mt-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/seller/dashboard">賣家中心</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="`/seller/shop/${shopId}/products`"
            >商品管理</router-link
          >
        </li>
        <li class="breadcrumb-item active" aria-current="page">SKU 管理</li>
      </ol>
    </nav>

    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h3 class="mb-0">SKU 管理 - {{ productInfo.productName }}</h3>
        <router-link
          :to="`/seller/shop/${shopId}/products`"
          class="btn btn-outline-secondary"
        >
          返回商品列表
        </router-link>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-8">
            <div class="table-responsive">
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 150px">商品 ID</th>
                    <td>{{ productInfo.productId }}</td>
                  </tr>
                  <tr>
                    <th>商品名稱</th>
                    <td>{{ productInfo.productName }}</td>
                  </tr>
                  <tr>
                    <th>狀態</th>
                    <td>
                      <span
                        :class="
                          productInfo.active ? 'text-success' : 'text-warning'
                        "
                      >
                        {{ productInfo.active ? "上架" : "審核中" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <img
              v-if="productInfo.image"
              :src="
                productInfo.image.startsWith('http')
                  ? productInfo.image
                  : `${baseUrl}${productInfo.image}`
              "
              alt="商品圖片"
              class="img-thumbnail product-thumbnail"
            />
            <div v-else class="no-image">
              <span>無商品圖片</span>
            </div>
          </div>
        </div>

        <!-- SKU 管理區域 -->
        <div class="sku-management-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>SKU 列表</h4>
            <button class="btn btn-success" @click="showAddModal = true">
              新增 SKU
            </button>
          </div>

          <!-- SKU 列表 -->
          <div v-if="skuList.length > 0">
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>SKU ID</th>
                    <th>規格</th>
                    <th>庫存</th>
                    <th>價格</th>
                    <th style="width: 150px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sku in skuList" :key="sku.skuId">
                    <td>{{ sku.skuId }}</td>
                    <td>
                      <div
                        v-for="(value, key) in sku.specPairs"
                        :key="key"
                        class="sku-spec"
                      >
                        <span class="spec-key">{{ key }}:</span>
                        <span class="spec-value">{{ value }}</span>
                      </div>
                    </td>
                    <td>{{ sku.stock }}</td>
                    <td>NT$ {{ formatPrice(sku.price) }}</td>
                    <td>
                      <button
                        class="btn btn-primary btn-sm me-2"
                        @click="openEditModal(sku)"
                      >
                        編輯
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        @click="deleteSku(sku.skuId)"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="alert alert-info">
            該商品尚未設定 SKU。請點擊「新增 SKU」按鈕建立規格。
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 SKU Modal -->
    <sku-add-modal
      :is-open="showAddModal"
      :product-id="productId"
      @close="showAddModal = false"
      @refresh="fetchSkuList"
    />

    <!-- 編輯 SKU Modal -->
    <sku-edit-modal
      :is-open="showEditModal"
      :sku-data="selectedSku"
      @close="showEditModal = false"
      @refresh="fetchSkuList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import SkuAddModal from "@/components/sku.components/SkuAddModal.vue";
import SkuEditModal from "@/components/sku.components/SkuEditModal.vue";

const route = useRoute();
const router = useRouter();
const productId = parseInt(route.params.productId) || null;
const shopId = parseInt(route.params.shopId) || null;

// 用戶資訊
const userStore = useUserStore();
const token = userStore.token;
const baseUrl = ref(import.meta.env.VITE_API_URL);

// 數據狀態
const productInfo = ref({});
const skuList = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedSku = ref(null);

// 格式化價格顯示
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// 獲取商品詳情
const fetchProductInfo = async () => {
  try {
    const response = await axios.get(`/api/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      productInfo.value = response.data;
      console.log("獲取到商品詳情:", productInfo.value);
    } else {
      console.error("獲取商品詳情格式錯誤:", response.data);
      router.push(`/seller/shop/${shopId}/products`);
    }
  } catch (error) {
    console.error("獲取商品詳情錯誤:", error);
    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取商品詳情",
      icon: "error",
    });
    router.push(`/seller/shop/${shopId}/products`);
  }
};

// 獲取商品的 SKU 列表
const fetchSkuList = async () => {
  try {
    console.log("正在獲取 SKU 列表，商品ID:", productId);

    const response = await axios.get("/api/sku", {
      params: {
        productId: productId,
        _t: Date.now(), // 防止緩存
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("原始 SKU 響應:", response);

    if (response.data && Array.isArray(response.data)) {
      console.log("SKU 數據條數:", response.data.length);

      // 深拷貝數據以避免 Proxy 對象的潛在問題
      skuList.value = JSON.parse(JSON.stringify(response.data));

      console.log("處理後的 SKU 列表:", skuList.value);
    } else {
      console.error("獲取 SKU 資料格式不符合預期:", response.data);
      skuList.value = [];
    }
  } catch (error) {
    console.error("獲取 SKU 列表錯誤:", error);
    console.error("錯誤詳情:", error.response || error.message);
    skuList.value = [];

    Swal.fire({
      title: "載入失敗",
      text: error.response?.data?.message || "無法獲取 SKU 列表",
      icon: "error",
    });
  }
};

// 開啟編輯 Modal
const openEditModal = (sku) => {
  selectedSku.value = { ...sku };
  showEditModal.value = true;
};

// 刪除 SKU
const deleteSku = async (skuId) => {
  try {
    const result = await Swal.fire({
      title: "確定要刪除此 SKU?",
      text: "此操作不可逆，刪除後將無法恢復",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      console.log("正在刪除 SKU ID:", skuId);

      const response = await axios.delete(`/api/sku/${skuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("刪除 SKU 響應:", response);

      if (response.status >= 200 && response.status < 300) {
        // 本地更新狀態 (不依賴重新獲取)
        skuList.value = skuList.value.filter((item) => item.skuId !== skuId);

        // 然後顯示成功消息
        Swal.fire({
          title: "刪除成功",
          icon: "success",
        });

        // 再次嘗試從服務器獲取最新數據
        setTimeout(() => {
          fetchSkuList();
        }, 500);
      }
    }
  } catch (error) {
    console.error("刪除 SKU 錯誤:", error);
    Swal.fire({
      title: "刪除失敗",
      text: error.response?.data?.message || "無法刪除 SKU",
      icon: "error",
    });
  }
};

// 元件掛載時獲取商品詳情和 SKU 列表
onMounted(async () => {
  if (!productId || !shopId) {
    console.error("無效的商品 ID 或商店 ID");
    router.push("/seller/dashboard");
    return;
  }

  await fetchProductInfo();
  await fetchSkuList();
});
</script>

<style scoped>
.product-thumbnail {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.no-image {
  width: 200px;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin: 0 auto;
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
</style>
