<template>
  <div class="login-container">
    <h3>登入</h3>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="username">使用者名稱:</label>
        <input type="text" id="username" v-model="username" />
      </div>
      <div class="form-group">
        <label for="password">密碼:</label>
        <input type="password" id="password" v-model="password" />
      </div>

      <div class="form-links">
        <router-link to="/forgot-password">忘記密碼?</router-link>
      </div>

      <div class="form-group">
        <button type="submit">開始購物吧!</button>
      </div>
      <div class="form-links">
        <router-link to="/user/register">還沒有帳號？ 立即註冊</router-link>
      </div>

      <div class="quick-login">
        <p>快速登入</p>
        <button @click="quickLogin('Waylay')" class="quick-login-btn">Waylay</button>
        <button @click="quickLogin('Cypher')" class="quick-login-btn">Cypher</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();

const username = ref("");
const password = ref("");

// 新增存储管理方法
const syncStorage = {
  setToken(token) {
    localStorage.setItem('authToken', token);       // 长期存储
    sessionStorage.setItem('authToken', token);  // 会话存储
  },
  clearTokens() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
};

async function login() {
  if (username.value === "") {
    username.value = null;
  }

  if (password.value === "") {
    password.value = null;
  }

  const data = {
    username: username.value,
    password: password.value,
  };

  // 清除之前的 Authorization header (避免和其他登入狀態衝突)
  axios.defaults.headers.common["Authorization"] = ``;
  try {
    const response = await axios.post("/api/auth/login", data);

    if (response.data.success) {
      const decodedToken = jwtDecode(response.data.token);
      // 設定 token
      syncStorage.setToken(response.data.token);

      // 同步儲存使用者資訊到 localStorage
      localStorage.setItem('userId', decodedToken.userId);
      localStorage.setItem('username', decodedToken.sub);

      const result = await Swal.fire({
        title: response.data.message,
        icon: "success",
      });


      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      //設定userStore
      userStore.saveUserData(decodedToken.sub, decodedToken.userId, response.data.token, decodedToken.roles);
      userStore.reloadUserData();
      if (result.isConfirmed) {
        router.push("/shop");
      }
    }
  } catch (error) {
    let errorMessage = "登入失敗，請稍後再試"; // 預設錯誤訊息

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        errorMessage = data.message || "帳號或密碼錯誤";
      } else if (status === 400) {
        errorMessage = data.message || "請求格式錯誤";
      } else if (status === 403) {
        errorMessage = data.message || "您沒有權限執行此操作";
      } else if (status === 404) {
        errorMessage = data.message || "找不到資源";
      } else if (status >= 500) {
        errorMessage = data.message || "伺服器發生錯誤";
      } else {
        errorMessage = `登入失敗，錯誤碼：${status}`;
      }
    } else if (error.request) {
      errorMessage = "網路連線異常，請檢查您的網路";
    } else {
      errorMessage = "發生未知的錯誤";
    }
    Swal.fire({
      title: "錯誤:" + errorMessage,
      icon: "error",
    });
  }
}



async function quickLogin(user) {
  // 快速登入的邏輯
  let userData = {};
  if (user === "Waylay") {
    userData = { username: "Waylay", password: "Test" };
  } else if (user === "Cypher") {
    userData = { username: "Cypher", password: "Test" };
  } else {
    return; // 未知的用戶
  }

  username.value = userData.username; // 自動填入帳號
  password.value = userData.password;    // 自動填入密碼
  await login(); // 呼叫 login 函數
}

window.addEventListener('storage', (event) => {
  if (event.key === 'authToken') {
    // 當其他分頁更新 localStorage 時，同步到 sessionStorage
    sessionStorage.setItem('tempAuthToken', event.newValue);
  }
});

// 修改跨标签页事件監聽，統一使用 authToken 鍵
window.addEventListener('storage', (event) => {
  if (event.key === 'authToken') {
    // 當其他分頁更新 localStorage 時，同步到 sessionStorage
    sessionStorage.setItem('authToken', event.newValue);
    if (!event.newValue) router.push('/user/login');
  }
});
</script>

<style scoped>
/* ... (原有的樣式) ... */
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  /* 重要 */
}

.form-group button {
  background-color: #ff9b20;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  /* 讓按鈕填滿寬度 */
}

.form-group button:hover {
  background-color: #e7840b;
}

.form-links {
  margin-top: 5px;
  text-align: left;
}

.form-links a {
  color: #06c;
  text-decoration: none;
  font-size: 14px;
  /*可以調整*/
}

.form-links a:hover {
  text-decoration: underline;
}

.quick-login {
  margin-top: 20px;
  text-align: center;
  /* 讓按鈕水平居中 */
}

.quick-login p {
  margin-bottom: 10px;
  font-weight: bold;
}

.quick-login-btn {
  background-color: #6c757d;
  /* 灰色按鈕 */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  /* 按鈕之間的間距 */
  transition: background-color 0.3s;
  /* 平滑過渡 */
}

.quick-login-btn:hover {
  background-color: #5a6268;
  /* 深灰色 */
}
</style>