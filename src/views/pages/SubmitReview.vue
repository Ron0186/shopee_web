<template>
  <div class="container py-5">
    <div
      v-for="product in products"
      :key="product.orderItemId"
      class="card mb-4 p-3"
    >
      <h5>{{ product.productName }}</h5>
      <small class="text-muted">完成時間：{{ formatDate(product.updatedAt) }}</small>
      <div>
        <label>評分：</label>
        <select v-model="reviewInputs[product.orderItemId].rating">
          <option value="5">5 星</option>
          <option value="4">4 星</option>
          <option value="3">3 星</option>
          <option value="2">2 星</option>
          <option value="1">1 星</option>
        </select>
      </div>
      <div>
        <label>留言：</label>
        <textarea
          class="form-control"
          v-model="reviewInputs[product.orderItemId].content"
          placeholder="留下評論..."
        ></textarea>
      </div>
      <button
        class="btn btn-primary mt-2"
        @click="submitReview(product.orderItemId)"
      >
        送出評價
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const userId = userStore.userId;

const products = ref([]);
const reviewInputs = reactive({});

const fetchProductsToReview = async () => {
  try {
    const res = await axios.get(
      `/api/orders/completed/${userId}/products-to-review`
    );
    products.value = res.data;

    res.data.forEach((item) => {
      reviewInputs[item.orderItemId] = {
        orderItemId: item.orderItemId, // ✅ 必填
        productId: item.productId,
        content: "",
        rating: 5,
      };
    });
  } catch (error) {
    console.error("載入可評價商品失敗", error);
  }
};

const submitReview = async (orderItemId) => {
  const input = reviewInputs[orderItemId];
  console.log("🧪 input 值：", input);
  try {
    await axios.post(`/api/review/submit?userId=${userId}`, {
      orderItemId: input.orderItemId,
      productId: input.productId,
      content: input.content,
      rating: input.rating,
    });
    Swal.fire("送出成功", "", "success");
  } catch (error) {
    console.error("送出失敗", error);
    Swal.fire("送出失敗", "", "error");
  }
};

onMounted(() => {
  fetchProductsToReview();
});

const formatDate = (datetime) => {
  if (!datetime) return "-";
  const date = new Date(datetime);
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};
</script>

<style scoped>
.card {
  background-color: #fff7e8;
  border: 1px solid #f2d4a3;
  border-radius: 8px;
}
h5 {
  font-weight: bold;
  margin-bottom: 10px;
}
select,
textarea {
  margin-bottom: 10px;
  width: 100%;
}
</style>
