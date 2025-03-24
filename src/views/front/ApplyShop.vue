<template>
    <div class="container mt-5">
      <h2 class="mb-4">申請成為賣家</h2>
      <form @submit.prevent="submitApplication">
        <div class="mb-3">
          <label class="form-label">商店名稱</label>
          <input v-model="form.shopName" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">商店分類</label>
          <input v-model="form.shopCategory" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">退貨地址 - 城市</label>
          <input v-model="form.returnCity" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">退貨地址 - 區域</label>
          <input v-model="form.returnDistrict" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">退貨地址 - 郵遞區號</label>
          <input v-model="form.returnZipCode" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">退貨地址 - 詳細地址</label>
          <input v-model="form.returnStreetEtc" type="text" class="form-control" />
        </div>
  
        <div class="mb-3">
          <label class="form-label">收件人姓名</label>
          <input v-model="form.returnRecipientName" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">收件人電話</label>
          <input v-model="form.returnRecipientPhone" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">商店描述</label>
          <textarea v-model="form.description" class="form-control" rows="3"></textarea>
        </div>
  
        <button type="submit" class="btn btn-primary">提交申請</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "@/plugins/axios";
  import Swal from 'sweetalert2'; // 引入 SweetAlert2
  
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
      };
    },
    methods: {
      async submitApplication() {
        try {
          const response = await axios.post(`/api/shop/application/submit/${this.userId}`, this.form);
  
          if (response.data.success) { // 檢查 success 欄位
            Swal.fire({
              icon: 'success',
              title: response.data.message,
              confirmButtonText: '確定'
            }).then(() => {
               this.$router.push("/"); // 送出後跳轉首頁
            });
          } else {
            // 處理後端返回的錯誤（即使 HTTP 狀態碼是 200）
            Swal.fire({
              icon: 'error',
              title: response.data.message,
              confirmButtonText: '確定'
            });
          }
        } catch (error) {
          // 處理 HTTP 錯誤 (例如 400, 500 等)
          Swal.fire({
            icon: 'error',
            title: '錯誤',
             text: error.response?.data.message || error.message ,
            confirmButtonText: '確定'
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