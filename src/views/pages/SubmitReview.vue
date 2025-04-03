<template>
    <div class="container mt-4">
      <h2 class="mb-3">📝 商品評價</h2>
  
      <!-- 商品列表 -->
      <div v-if="products.length" class="mb-4">
        <div
          v-for="product in products"
          :key="product.productId"
          class="card mb-3"
        >
          <div class="card-body">
            <h5 class="card-title">{{ product.productName }}</h5>
            <p class="card-text">{{ product.description }}</p>
  
            <div class="mb-2">
              <label class="form-label">評分：</label>
              <select v-model="reviewInputs[product.productId].rating" class="form-select w-auto d-inline-block">
                <option disabled value="">選擇星數</option>
                <option v-for="n in 5" :key="n" :value="n">{{ n }} 星</option>
              </select>
            </div>
  
            <div class="mb-2">
              <label class="form-label">留言：</label>
              <textarea
                v-model="reviewInputs[product.productId].content"
                class="form-control"
                rows="2"
                placeholder="請輸入您的評價..."
              ></textarea>
            </div>
  
            <button class="btn btn-primary" @click="submitReview(product.productId)">
              送出評價
            </button>
          </div>
        </div>
      </div>
  
      <div v-else>
        <p>目前沒有可評價的商品。</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import axios from "@/plugins/axios"; // ✅ 改成你們專案設定的 axios instance
  import { useUserStore } from "@/stores/user";
  
  const userStore = useUserStore();
  const userId = userStore.userId;
  
  const products = ref([]); // 可評價商品
  const reviewInputs = ref({});
  
  // 取得可評價的商品清單
const fetchProductsToReview = async () => {
  try {
    const res = await axios.get(`/api/orders/completed/${userId}/products-to-review`);
    console.log("🛠 API 回傳：", res.data); //測試用

    if (!Array.isArray(res.data)) {
    products.value = [];
     return; // 提早結束
}

    products.value = res.data;

    // 初始化每個商品的輸入欄位
    products.value.forEach((p) => {
      reviewInputs.value[p.productId] = {
        content: "",
        rating: ""
      };
    });
  } catch (err) {
    console.error("載入商品失敗", err);
    alert("❌ 無法載入可評價商品");
  }
};


  
  const submitReview = async (productId) => {
    const input = reviewInputs.value[productId];
  
    if (!input.content || !input.rating) {
      alert("請填寫完整的評分與留言");
      return;
    }
  
    try {
      const response = await axios.post(
        `/api/review/submit?userId=${userId}`,
        {
          productId: productId,
          content: input.content,
          rating: input.rating
        }
      );
  
      alert("✅ 評價送出成功！");
  
      // 清空欄位並移除該商品
      delete reviewInputs.value[productId];
      products.value = products.value.filter((p) => p.productId !== productId);
    } catch (error) {
      console.error("送出評價失敗", error);
      alert("❌ 發生錯誤，請稍後再試");
    }
  };
  
  onMounted(() => {
    fetchProductsToReview();
  });
  </script>
  