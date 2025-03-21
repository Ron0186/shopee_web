<template>
    <div v-if="isOpen" class="modal-backdrop">
      <div class="modal-content">
        <h4 class="modal-title">新增管理員</h4>
        <form @submit.prevent="addAdmin">
          <div class="mb-3">
            <label class="form-label">名稱</label>
            <input v-model="newAdmin.userName" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">密碼</label>
            <input v-model="newAdmin.password" type="password" class="form-control"  />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="newAdmin.email" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">電話</label>
            <input v-model="newAdmin.phone" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">角色</label>
            <div class="form-check" v-for="role in roles" :key="role">
              <input
                type="checkbox"
                class="form-check-input"
                :value="role"
                v-model="newAdmin.roles"
                :id="'role-' + role"
              />
              <label class="form-check-label" :for="'role-' + role">{{ role }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
            <button type="submit" class="btn btn-primary">新增</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  import axios from '@/plugins/axios';
  
  const props = defineProps({
    isOpen: Boolean,
    roles: Array
  });
  
  const emit = defineEmits(['close', 'refresh']);
  
  const newAdmin = ref({
    userName: '',
    email: '',
    phone: '',
    password: '', // 新增 password 欄位
    roles: []
  });
  
  const addAdmin = async () => {
  try {
    await axios.post('/api/admin/any', newAdmin.value);
    alert('新增成功');

    // 清空表單
    newAdmin.value = {
      userName: '',
      email: '',
      phone: '',
      password: '',
      roles: []
    };

    emit('refresh'); // 通知父元件重新獲取管理員列表
    emit('close'); // 關閉 Modal
  } catch (error) {
    console.error('新增管理員失敗', error);
    alert('新增失敗，請檢查後端 API');
  }
};
  </script>
  
  <style scoped>
  /* 樣式保持不變 */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  </style>