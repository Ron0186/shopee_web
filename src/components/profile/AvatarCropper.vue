<template>
    <div>
      <input ref="input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  
      <button @click="triggerFileInput" class="px-4 py-2 bg-blue-500 text-white rounded">選擇圖片</button>
  
      <div v-if="image" class="mt-4">
        <cropper
          class="cropper"
          :src="image"
          :stencil-props="{ aspectRatio: 1 }"
          :auto-zoom="true"
          :stencil-size="{ width: 250, height: 250 }"
          :resize-image="true"
          @change="onCrop"
        />
  
        <div class="mt-4">
          <h3 class="font-bold text-gray-700 mb-2">預覽</h3>
          <img v-if="croppedImage" :src="croppedImage" class="w-32 h-32 rounded-full border shadow" />
        </div>
  
        <div class="mt-4 flex space-x-2">
          <button @click="confirmCrop" class="px-4 py-2 bg-green-500 text-white rounded">確認上傳</button>
          <button @click="clear" class="px-4 py-2 bg-gray-400 text-white rounded">取消</button>
        </div>
  
        <p class="text-sm text-gray-500 mt-2">最大限制：2MB，建議使用正方形圖片</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { Cropper } from 'vue-advanced-cropper';
  import 'vue-advanced-cropper/dist/style.css';
  
  const input = ref<HTMLInputElement | null>(null);
  const image = ref<string | null>(null);
  const croppedImage = ref<string | null>(null);
  const cropperRef = ref<any>(null);
  
  const emit = defineEmits(['confirm']);
  
  const triggerFileInput = () => {
    input.value?.click();
  };
  
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
  
  const confirmCrop = async () => {
    if (!croppedImage.value) return;
  
    const blob = await fetch(croppedImage.value).then((res) => res.blob());
    const file = new File([blob], 'avatar.jpg', { type: blob.type });
    emit('confirm', file);
    clear();
  };
  
  const clear = () => {
    image.value = null;
    croppedImage.value = null;
  };
  </script>
  
  <style scoped>
  .cropper {
    width: 300px;
    height: 300px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  </style>
  