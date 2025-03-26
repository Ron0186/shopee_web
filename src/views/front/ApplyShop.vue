<template>
  <div class="container mt-5">
    <h2 class="mb-4">申請成為賣家</h2>
    <form @submit.prevent="submitApplication">
      <div class="mb-3">
        <label class="form-label">商店名稱</label>
        <input v-model="form.shopName" type="text" class="form-control" placeholder="請輸入商店名稱" required />
      </div>

      <div class="mb-3">
        <label class="form-label">商店分類</label>
        <select v-model="form.shopCategory" class="form-select" required>
          <option value="" disabled>請選擇商店分類</option>
          <option v-for="category in shopCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">退貨地址 - 城市</label>
        <input v-model="form.returnCity" type="text" class="form-control" placeholder="請輸入城市" required />
      </div>

      <div class="mb-3">
        <label class="form-label">退貨地址 - 區域</label>
        <input v-model="form.returnDistrict" type="text" class="form-control" placeholder="請輸入區域" required />
      </div>

      <div class="mb-3">
        <label class="form-label">退貨地址 - 郵遞區號</label>
        <input v-model="form.returnZipCode" type="text" class="form-control" placeholder="請輸入郵遞區號" required />
      </div>

      <div class="mb-3">
        <label class="form-label">退貨地址 - 詳細地址</label>
        <input v-model="form.returnStreetEtc" type="text" class="form-control" placeholder="請輸入詳細地址" />
      </div>

      <div class="mb-3">
        <label class="form-label">收件人姓名</label>
        <input v-model="form.returnRecipientName" type="text" class="form-control" placeholder="請輸入收件人姓名" required />
      </div>

      <div class="mb-3">
        <label class="form-label">收件人電話</label>
        <input v-model="form.returnRecipientPhone" type="text" class="form-control" placeholder="請輸入收件人電話" required />
      </div>

      <div class="mb-3">
        <label class="form-label">商店描述</label>
        <textarea v-model="form.description" class="form-control" rows="3" placeholder="請輸入商店描述"></textarea>
      </div>

      <button type="submit" class="btn btn-primary">提交申請</button>
    </form>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  data() {
    return {
      form: {
        shopName: "",
        shopCategory: "",
        returnCity: "",
        returnDistrict: "",
        returnZipCode: "",
        returnStreetEtc: "",
        returnRecipientName: "",
        returnRecipientPhone: "",
        description: "",
      },
      userId: localStorage.getItem("userId"), // 假設這裡是目前登入的用戶 ID，之後可改為從 Vuex / Pinia 取得
      shopCategories: [
        "服飾",
        "3C 產品",
        "食品",
        "運動用品",
        "家居用品",
        "美妝保養",
        "母嬰用品",
        "寵物用品",
        "書籍文具",
        "汽機車周邊",
        "戶外休閒",
        "其他",
      ],
    };
  },
  methods: {
    async submitApplication() {
      try {
        const response = await axios.post(`/api/shop/application/submit/${this.userId}`, this.form);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: response.data.message,
            confirmButtonText: "確定",
          }).then(() => {
            this.$router.push("/"); // 送出後跳轉首頁
          });
        } else {
          Swal.fire({
            icon: "error",
            title: response.data.message,
            confirmButtonText: "確定",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "錯誤",
          text: error.response?.data.message || error.message,
          confirmButtonText: "確定",
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
