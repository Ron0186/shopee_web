<template>
  <div class="profile-photo-section">
    <div class="photo-container">
      <div class="avatar-wrapper">
        <img 
          v-if="photoPreview || fullPhotoUrl" 
          :src="photoPreview || fullPhotoUrl" 
          alt="管理員頭像" 
          class="profile-avatar"
          @error="handleImageError"
        />
        <div v-else class="default-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        
        <div class="avatar-overlay">
          <label for="profile-photo-upload" class="upload-icon">
            <i class="bi bi-camera"></i>
          </label>
          <input
            type="file"
            id="profile-photo-upload"
            ref="fileInput"
            accept="image/*"
            @change="handlePhotoUpload"
            class="hidden-input"
          />
        </div>
      </div>
    </div>
    
    <div v-if="photoName" class="photo-info">
      <span class="photo-name">{{ truncatedPhotoName }}</span>
      <div class="photo-actions">
        <button type="button" @click="removePhoto" class="btn-remove-photo">
          <i class="bi bi-x-circle"></i> 取消
        </button>
      </div>
    </div>

    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <div class="progress">
        <div 
          class="progress-bar" 
          role="progressbar" 
          :style="{ width: uploadProgress + '%' }" 
          :aria-valuenow="uploadProgress" 
          aria-valuemin="0" 
          aria-valuemax="100"
        >
          {{ uploadProgress }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';

const props = defineProps({
  currentPhotoUrl: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['photo-uploaded', 'photo-removed']);

const photoPreview = ref(null);
const photoFile = ref(null);
const photoName = ref('');
const fileInput = ref(null);
const uploadProgress = ref(0);

// 獲取完整的頭像 URL (添加 base URL 如果需要)
const fullPhotoUrl = computed(() => {
  if (!props.currentPhotoUrl) return '';
  
  // 如果已經是完整 URL，則直接返回
  if (props.currentPhotoUrl.startsWith('http')) {
    return props.currentPhotoUrl;
  }
  
  // 否則加上 API URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
  return `${baseUrl}${props.currentPhotoUrl}`;
});

// 檔案名稱顯示截斷（如果太長）
const truncatedPhotoName = computed(() => {
  if (!photoName.value) return '';
  return photoName.value.length > 20 
    ? photoName.value.substring(0, 17) + '...' 
    : photoName.value;
});

// 處理圖片載入錯誤
function handleImageError(event) {
  event.target.src = '/uploads/AdminDefault.png';
}

// 處理檔案上傳
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    Swal.fire({
      icon: 'error',
      title: '檔案類型錯誤',
      text: '請上傳圖片檔案（JPG, PNG, GIF等）'
    });
    resetFileInput();
    return;
  }
  
  // 檢查檔案大小（限制為2MB）
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSizeInBytes) {
    Swal.fire({
      icon: 'error',
      title: '檔案過大',
      text: '圖片大小不能超過2MB'
    });
    resetFileInput();
    return;
  }
  
  photoFile.value = file;
  photoName.value = file.name;
  
  // 創建預覽URL
  createPreview(file);
  
  // 上傳到伺服器
  await uploadPhotoToServer(file);
}

// 創建預覽
function createPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 上傳到伺服器
async function uploadPhotoToServer(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    uploadProgress.value = 0;
    
    const response = await axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = percentCompleted;
      }
    });
    
    if (response.data.success) {
      uploadProgress.value = 100;
      
      // 延遲一下，讓用戶看到上傳完成的進度條
      setTimeout(() => {
        uploadProgress.value = 0;
        
        // 通知父組件圖片已上傳
        emit('photo-uploaded', response.data.data);
      }, 800);
    } else {
      handleUploadError('上傳失敗: ' + response.data.message);
    }
  } catch (error) {
    handleUploadError('上傳發生錯誤: ' + (error.response?.data?.message || error.message));
  }
}

// 處理上傳錯誤
function handleUploadError(errorMessage) {
  uploadProgress.value = 0;
  photoPreview.value = null;
  photoFile.value = null;
  photoName.value = '';
  
  Swal.fire({
    icon: 'error',
    title: '上傳失敗',
    text: errorMessage
  });
  
  resetFileInput();
}

// 移除照片
function removePhoto() {
  photoPreview.value = null;
  photoFile.value = null;
  photoName.value = '';
  uploadProgress.value = 0;
  resetFileInput();
  
  // 通知父組件圖片已被移除
  emit('photo-removed');
}

// 重置檔案輸入
function resetFileInput() {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<style scoped>
.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.photo-container {
  position: relative;
  margin-bottom: 10px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  font-size: 70px;
  color: #d1d1d1;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
  opacity: 0;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.photo-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.photo-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.photo-actions {
  display: flex;
  gap: 10px;
}

.btn-remove-photo {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-remove-photo:hover {
  text-decoration: underline;
}

.upload-progress {
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
}

.progress {
  height: 6px;
  border-radius: 3px;
  background-color: #e9ecef;
  overflow: hidden;
}

.progress-bar {
  background-color: #007bff;
  color: white;
  text-align: center;
  font-size: 10px;
  line-height: 6px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .default-avatar {
    font-size: 60px;
  }
}
</style>