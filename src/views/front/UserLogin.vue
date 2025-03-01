<template>
  <div>
    <h2>使用者登入</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="user.email" placeholder="輸入 Email" required />
      <input type="password" v-model="user.password" placeholder="輸入密碼" required />
      <button type="submit">登入</button>
    </form>
    
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from "axios"; // 引入 axios

export default {
  data() {
    return {
      user: {
        email: "",
        password: ""
      },
      errorMessage: "",
      successMessage: ""
    };
  },
  methods: {
    async login() {
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await axios.post("http://localhost:8081/api/users/login", this.user);

        // 成功處理
        this.successMessage = response.data.successMessage;
        alert("登入成功！歡迎, " + response.data.userName);

        // 存 Token 或用戶資訊
        localStorage.setItem("userEmail", response.data.email);
        localStorage.setItem("userName", response.data.userName);

        //可導向到其他頁面
        this.$router.push('/');
      } catch (error) {
        if (error.response) {
          // 取得後端回傳的錯誤訊息
          this.errorMessage = error.response.data.errorMessage || "登入失敗";
        } else {
          this.errorMessage = "無法連線至伺服器";
        }
      }
    }
  }
};
</script>
