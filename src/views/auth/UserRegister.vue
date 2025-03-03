<template>
  <table>
  <tbody>
      <tr>
          <td>使用者名稱 : </td>
          <td><input v-model="userName" type="text" required /></td>
          <td></td>
      </tr>
      <tr>
          <td>密碼 : </td>
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
const userName = ref(null)
const password = ref(null);
const email = ref(null);
const phone = ref(null);


async function register(){
  if(userName.value===""){
    userName.value = null;
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
      "userName": userName.value,
      "password": password.value,
      "email": email.value,
      "phone": phone.value
  };
  console.log("data", data)
  
  axios.defaults.headers.common['Authorization'] = ``
  try {
      const response = await axios.post("/api/users/register",data);
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

      }else{
          Swal.fire({
          title: response.data.message,
          icon: "warning",
      });
      }


  } catch (error) {
      console.log("error",error)
      Swal.fire({
          title: "錯誤:"+ error.message,
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