<template>
  <div>
    <h2>管理員登入</h2>
    <form @submit.prevent="login">
      <div>
        <input type="email" v-model="user.email" placeholder="輸入 Email" required />
      </div>
      <div>
      <input type="password" v-model="user.password" placeholder="輸入密碼" required />
    </div>
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
    const response = await axios.post("http://localhost:8081/api/admin/login", this.user);

    // 存 Token
    localStorage.setItem("jwtToken", response.data.token);

    // 解析 JWT
    const payload = JSON.parse(atob(response.data.token.split(".")[1]));

    // 存入 LocalStorage
    localStorage.setItem("userEmail", payload.sub);
    localStorage.setItem("userName", payload.userName);

    // 顯示成功訊息
    this.successMessage = response.data.successMessage;
    alert("登入成功！歡迎, " + payload.userName);

    // 導向首頁
    this.$router.push("/admin/");
  } catch (error) {
    console.error("登入錯誤:", error); // ✅ 新增錯誤輸出，檢查實際錯誤
    if (error.response) {
      console.error("錯誤回應:", error.response); // ✅ 顯示錯誤回應內容
      this.errorMessage = error.response.data.errorMessage || "登入失敗";
    } else if (error.request) {
      console.error("沒有收到後端回應:", error.request);
      this.errorMessage = "後端沒有回應，請稍後再試";
    } else {
      console.error("設定請求錯誤:", error.message);
      this.errorMessage = "發送請求時發生錯誤";
    }
  }
}

  }
};
</script>
