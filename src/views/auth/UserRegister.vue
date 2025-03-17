<template>
  <table>
  <tbody>
      <tr>
          <td>使用者名稱(長度:6-20) : </td>
          <td><input v-model="username" type="text" required /></td>
          <td></td>
      </tr>
      <tr>
          <td>密碼(長度:6-12，包含至少1個大寫字母) : </td>
          <td><input v-model="password" type="password" required /></td>
          <td></td>
      </tr>
      <tr>
          <td>Email : </td>
          <td><input v-model="email" type="email" required /></td>
          <td></td>
      </tr>
      <tr>
          <td>手機號碼 : </td>
          <td><input v-model="phone" type="tel" required /></td>
          <td></td>
      </tr>
      <tr>
          <td> </td>
          <td align="right"><button type="button" @click="register">註冊</button></td>
      </tr>
  </tbody>
</table>

</template>

<script setup>
import axios from '@/plugins/axios';
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref(null)
const password = ref(null);
const email = ref(null);
const phone = ref(null);


async function register(){
  if(username.value===""){
    username.value = null;
  }

  if(password.value===""){
      password.value = null;
  }
  
  if(email.value===""){
    email.value = null;
  }
  
  if(phone.value===""){
    phone.value = null;
  }
  

  const data={
      "username": username.value,
      "password": password.value,
      "email": email.value,
      "phone": phone.value
  };
  console.log("data", data)
  
  axios.defaults.headers.common['Authorization'] = ``
  try {
      const response = await axios.post("/api/auth/register",data);
      // console.log("response",response)
      
      if(response.data.success){
          await Swal.fire({
          title: response.data.message,
          icon: "success",
      });

      //導向登入
      router.push({
          name: "UserLogin"
      })

      }
  } catch (error) {
    let errorMessage = "註冊失敗，請稍後再試"; // 預設錯誤訊息

if (error.response) {
    // 伺服器有回應 (HTTP 錯誤)
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
        errorMessage = data.message || "帳號或密碼錯誤"; // 優先使用後端訊息
    } else if (status === 400) {
        errorMessage = data.message || "請求格式錯誤"; // 例如，缺少必要欄位
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
    // 請求已發出，但沒有收到回應 (例如網路問題)
    errorMessage = "網路連線異常，請檢查您的網路";
} else {
    // 其他錯誤 (例如設定 Axios 時發生錯誤)
    errorMessage = "發生未知的錯誤";
}

Swal.fire({
    title: "錯誤:"+errorMessage,
    icon: "error",
});
  }
}
</script>

<style>
.container {
  max-width: 600px;
}
</style>