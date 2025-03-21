<template>
    <div class="modal fade" :class="{ show: isOpen, 'd-block': isOpen }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title text-center w-100">新增使用者</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4 pt-0">
            <div class="form-group mb-3">
              <label class="form-label">使用者名稱</label>
              <input type="text" v-model="newUser.username" class="form-control rounded-pill border-0 bg-light" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">密碼</label>
              <input type="text" v-model="newUser.password" class="form-control rounded-pill border-0 bg-light" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Email</label>
              <input type="email" v-model="newUser.email" class="form-control rounded-pill border-0 bg-light" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">電話</label>
              <input type="tel" v-model="newUser.phone" class="form-control rounded-pill border-0 bg-light" />
            </div>
          </div>
          <div class="modal-footer border-top-0 p-4 pt-0">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary rounded-pill px-4 ms-2" @click="insertUser">新增</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref } from "vue";
  import axios from "@/plugins/axios";
  import Swal from "sweetalert2";
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false,
    },
  });
  
  const emit = defineEmits(["close", "insert"]);
  
  const newUser = ref({
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  
  const closeModal = () => {
    emit("close");
  };
  
  const insertUser = async () => {
    try {
      const response = await axios.post("/api/admin/user/any", newUser.value);
      if (response.data.success) {
        await Swal.fire({
          title: response.data.message,
          icon: "success",
        });
        emit("insert");
        closeModal();
      } else {
        Swal.fire({
          title: "錯誤:" + response.data.message,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "錯誤:" + error.response.data.message,
        icon: "error",
      });
    }
  };
  </script>
  
  <style scoped>
  /* 可選：額外的自訂樣式 */
  .btn-primary {
    background-color: #007bff;
    border-color: #007bff;
  }
  
  .btn-primary:hover {
    background-color: #0069d9;
    border-color: #0062cc;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
  }
  
  .btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }
  </style>