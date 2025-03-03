!<template>
  <h3>會員登入</h3>
  <table>
  <tbody>
      <tr>
          <td>Eail : </td>
          <td><input type="text" name="email" v-model="email"></td>
          <td></td>
      </tr>
      <tr>
          <td>密碼 : </td>
          <td><input type="text" name="password" v-model="password"></td>
          <td></td>
      </tr>
      <tr>
          <td> </td>
          <td align="right"><button type="button" @click="login">Login</button></td>
      </tr>
  </tbody>
</table>
</template>

<script setup>
import { ref } from 'vue';
import axios from '@/plugins/axios'
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
const router = useRouter()

const email = ref(null);
const password = ref(null)


async function login(){
  if(email.value===""){
      email.value = null;
  }

  if(password.value===""){
      password.value = null;
  }

  const data={
      "email": email.value,
      "password": password.value
  };
  console.log("data", data)
  
  axios.defaults.headers.common['Authorization'] = ``
  try {
      const response = await axios.post("/api/users/login",data);
      // console.log("response",response)
      
      if(response.data.success){
          await Swal.fire({
          title: response.data.message,
          icon: "success",
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      sessionStorage.setItem("userName",response.data.userName);
      sessionStorage.setItem("email",response.data.email)
      sessionStorage.setItem("token",response.data.token)
      //導向首頁
      router.push("/")
      router.push({
          name: "FrontHome"
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

</style>