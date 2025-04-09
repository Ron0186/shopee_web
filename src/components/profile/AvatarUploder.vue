<template>
    <div class="relative">
            <img
  :src="previewUrl"
  alt="頭像"
  :style="`width: ${avatarSize}px; height: ${avatarSize}px;`"
  class="rounded-full object-cover border-2 border-gray-300 shadow-md cursor-pointer hover:opacity-70 hover:scale-105 transition photo"
  @click="openCropperWindow" title="點擊以變更個人照片"
/>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted, computed } from 'vue';
  
  const props = defineProps<{
  avatarUrl: string,
  size?: number
}>();

const avatarSize = computed(() => props.size || 128); // 預設 64px
  const emit = defineEmits<{
    (e: 'upload-success', file: File): void;
  }>();
  
  const previewUrl = ref(props.avatarUrl);
  let cropperWindow: Window | null = null;
  
  const openCropperWindow = () => {
    cropperWindow = window.open('/cropper-popup', 'CropperPopup', 'width=600,height=600');
    const imagePayload = { type: 'AVATAR_IMAGE', data: previewUrl.value };
    setTimeout(() => {
      cropperWindow?.postMessage(imagePayload, '*');
    }, 500);
  };
  
  const receiveCroppedImage = async (event: MessageEvent) => {
    if (event.data?.type === 'CROPPED_AVATAR') {
      const base64 = event.data.data;
      previewUrl.value = base64;
      const blob = await fetch(base64).then((res) => res.blob());
      const file = new File([blob], 'avatar.jpg', { type: blob.type });
      emit('upload-success', file);
    }
  };
  
  watch(() => props.avatarUrl, (val) => {
    previewUrl.value = val;
  });
  
  onMounted(() => {
    window.addEventListener('message', receiveCroppedImage);
  });
  </script>
  
  <style scoped>
.photo{
  cursor: pointer;
}
</style>