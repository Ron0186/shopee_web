<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow">
          <h3 class="text-center mb-4">註冊</h3>
          <form @submit.prevent="register">
            <div class="mb-3">
              <label class="form-label">用戶名稱</label>
              <input v-model="user.userName" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">電子郵件</label>
              <input v-model="user.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">密碼</label>
              <input v-model="user.password" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">手機號碼</label>
              <input v-model="user.phone" type="tel" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary w-100">註冊</button>
          </form>
          <div v-if="successMessage" class="alert alert-success mt-3">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: {
        userName: '',
        email: '',
        password: '',
        phone: '',
      },
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    async register() {
      try {
        const response = await axios.post('http://localhost:8081/api/users/register', this.user);
        this.successMessage = response.data.successMessage;
        this.errorMessage = '';
        // 清空表單
        this.user = {
          userName: '',
          email: '',
          password: '',
          phone: '',
        };
        // 可以加上導向登入頁面
        // this.$router.push('/login');
      } catch (error) {
        if (error.response) {
          // 後端返回錯誤響應
          this.errorMessage = error.response.data.errorMessage || '註冊失敗，請稍後再試。';
        } else if (error.request) {
          // 請求發送成功，但沒有收到響應
          this.errorMessage = '無法連接到伺服器，請檢查您的網路連接。';
        } else {
          // 發送請求時發生錯誤
          this.errorMessage = '發生未知錯誤，請稍後再試。';
        }
        this.successMessage = '';
      }
    },
  },
};
</script>

<style>
.container {
  max-width: 600px;
}
</style>