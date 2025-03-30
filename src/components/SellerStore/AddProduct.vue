<template>
  <div class="add-product-container">
    <h1>🆕 新增商品</h1>
    <form @submit.prevent="submitProduct">
      <label>商品名稱：</label>
      <input v-model="productName" required placeholder="輸入商品名稱" />

      <label>商品描述：</label>
      <textarea v-model="description" placeholder="輸入商品描述 (可選)" />

      <label>一級分類 ID：</label>
      <input
        v-model.number="category1Id"
        required
        type="number"
        placeholder="輸入一級分類 ID"
      />

      <label>二級分類 ID：</label>
      <input
        v-model.number="category2Id"
        required
        type="number"
        placeholder="輸入二級分類 ID"
      />

      <label>上架狀態：</label>
      <select v-model="active">
        <option :value="true">上架</option>
        <option :value="false">下架</option>
      </select>

      <label>商品圖片：</label>
      <input type="file" multiple @change="handleImageUpload" />

      <button type="submit" class="submit-button">✅ 提交商品</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";

const router = useRouter();

const productName = ref("");
const description = ref("");
const category1Id = ref(null);
const category2Id = ref(null);
const active = ref(false);
const imageFiles = ref([]);

const handleImageUpload = (event) => {
  imageFiles.value = Array.from(event.target.files);
};

const submitProduct = async () => {
  const formData = new FormData();
  formData.append("productName", productName.value);
  formData.append("description", description.value);
  formData.append("category1Id", category1Id.value);
  formData.append("category2Id", category2Id.value);
  formData.append("active", active.value);

  imageFiles.value.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await axios.post("/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    alert("✅ 商品新增成功！");
    router.push(`/store/${response.data.shopId}`); // 可依實際回傳資料調整
  } catch (error) {
    console.error("新增商品失敗", error);
    alert(error?.response?.data?.message || "❌ 商品新增失敗");
  }
};
</script>

<style scoped>
.add-product-container {
  max-width: 600px;
  margin: 0 auto;
  background: #fff8ee;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.add-product-container h1 {
  text-align: center;
  margin-bottom: 20px;
}

form label {
  display: block;
  font-weight: bold;
  margin-top: 15px;
}

form input,
form textarea,
form select {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 5px;
  box-sizing: border-box;
}

.submit-button {
  background: #28a745;
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
}

.submit-button:hover {
  background: #218838;
}
</style>
