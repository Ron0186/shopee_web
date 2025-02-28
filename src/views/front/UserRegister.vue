<template>
    <div class="register-container">
      <h2>使用者註冊</h2>
      <form @submit.prevent="register">
        <input type="text" v-model="userName" placeholder="輸入用戶名稱" required />
        <input type="email" v-model="email" placeholder="輸入 Email" required />
        <input type="password" v-model="password" placeholder="輸入密碼" required />
        <input type="text" v-model="phone" placeholder="輸入電話號碼" required />
        <button type="submit">註冊</button>
      </form>
  
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        userName: "",
        email: "",
        password: "",
        phone: "",
        errorMessage: "",
        successMessage: ""
      };
    },
    methods: {
      async register() {
        this.errorMessage = "";
        this.successMessage = "";
  
        try {
          const response = await axios.post("http://localhost:8081/user/register", null, {
            params: {
              userName: this.userName,
              email: this.email,
              password: this.password,
              phone: this.phone
            }
          });
  
          this.successMessage = response.data.successMessage;
          alert("註冊成功，歡迎 " + this.userName);
          
          // 可自動導向登入頁面
          this.$router.push("/user/login");
        } catch (error) {
          if (error.response && error.response.data) {
            this.errorMessage = error.response.data.errorMessage || "註冊失敗";
          } else {
            this.errorMessage = "無法連線至伺服器";
          }
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .register-container {
    width: 300px;
    margin: auto;
    text-align: center;
  }
  
  input {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
  }
  
  button {
    width: 100%;
    padding: 8px;
    background-color: #28a745;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .error {
    color: red;
  }
  
  .success {
    color: green;
  }
  </style>
  