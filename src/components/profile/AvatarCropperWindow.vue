<template>
    <div class="p-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">上傳您的大頭貼</h2>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
  
      <cropper
        v-if="image"
        class="cropper"
        :src="image"
        :stencil-props="{ aspectRatio: 1 }"
        :stencil-size="{ width: 250, height: 250 }"
        :resize-image="true"
        :auto-zoom="true"
        @change="onCrop"
      />
  
      <div class="mt-4" v-if="croppedImage">
        <h3 class="text-sm text-gray-600 mb-1">預覽</h3>
        <img :src="croppedImage" class="w-24 h-24 rounded-full border shadow" />
      </div>
  
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="confirm" class="px-4 py-2 bg-green-500 text-white rounded">確認</button>
        <button @click="cancel" class="px-4 py-2 bg-gray-400 text-white rounded">取消</button>
              </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { Cropper } from 'vue-advanced-cropper';
  import 'vue-advanced-cropper/dist/style.css';
  
  const image = ref<string>('');
  const croppedImage = ref<string | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  
  onMounted(() => {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'AVATAR_IMAGE') {
        image.value = event.data.data;
      }
    });
  
    // 若是直接開啟裁切頁面，也允許使用者手動上傳圖片
    fileInput.value?.click();
  });
  
  const onFileChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
  
    if (file.size > 2 * 1024 * 1024) {
      alert('檔案大小不得超過 2MB');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      image.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const onCrop = ({ canvas }: any) => {
    if (canvas) {
      croppedImage.value = canvas.toDataURL();
    }
  };
  
  const confirm = () => {
    if (croppedImage.value) {
      window.opener?.postMessage({ type: 'CROPPED_AVATAR', data: croppedImage.value }, '*');
      window.close();
    }
  };
  
  const cancel = () => {
    window.close();
  };
  </script>
  
  <style scoped>
  .cropper {
    width: 100%;
    height: 300px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  button {
  display: inline-block;
  padding: 15px 25px;
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  outline: none;
  color: #fff;
  background-color: #04AA6D;
  border: none;
  border-radius: 15px;
  box-shadow: 0 9px #999;
  margin-bottom: 25px;
}

button:hover {
  background-color: #3e8e41;
}

button:active {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

  </style>
  