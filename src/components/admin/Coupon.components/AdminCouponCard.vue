<template>
  <div class="col-md-4 mb-4">
    <div class="card h-100">
      <div class="card-body">
        <!-- 圖片 -->
        <div v-if="imageSrc" class="text-center mb-2">
          <img :src="imageSrc" alt="優惠券圖片" class="img-thumbnail"
            style="max-width: 100%; height: auto; max-height: 150px;" />
        </div>

        <!-- 優惠券基本資訊 -->
        <h5 class="card-title">ID: {{ coupon.couponId }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">名稱: {{ coupon.couponName }}</h6>
        <p class="card-text">代碼: {{ coupon.couponCode }}</p>
        <p class="card-text">
          有效期限: {{ formatDate(coupon.startDate) }} ~ {{ formatDate(coupon.endDate) }}
        </p>
      </div>

      <div class="card-footer d-flex justify-content-between">
        <button class="btn btn-primary btn-sm" @click="showDetails">詳細資料</button>
        <button class="btn btn-warning btn-sm" @click="openEditModal">修改</button>
        <button class="btn btn-danger btn-sm" @click="emitDeleteCoupon">刪除</button>
      </div>
    </div>
  </div>

  <!-- 修改 Modal -->
  <div v-if="isEditModalVisible" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">修改優惠券</h5>
          <button type="button" class="btn-close" @click="closeEditModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUpdate">
            <!-- 優惠券 ID（不可修改） -->
            <div class="mb-3">
              <label class="form-label">優惠券 ID（不可修改）</label>
              <input type="text" class="form-control" v-model="editData.couponId" disabled />
            </div>

            <!-- 優惠券名稱 -->
            <div class="mb-3">
              <label class="form-label">優惠券名稱</label>
              <input type="text" class="form-control" v-model="editData.couponName" required />
              <div v-if="!editData.couponName" class="text-danger">優惠券名稱不得為空</div>
            </div>

            <!-- 優惠券代碼 -->
            <div class="mb-3">
              <label class="form-label">優惠券代碼</label>
              <input type="text" class="form-control" v-model="editData.couponCode" required />
              <div v-if="!editData.couponCode" class="text-danger">優惠券代碼不得為空</div>
            </div>

            <div class="row">
              <!-- 開始日期 -->
              <div class="col-md-6">
                <label class="form-label">開始日期</label>
                <flat-pickr v-model="editData.startDate" class="form-control" :config="datePickerConfig"
                  @on-change="validateStartDate"></flat-pickr>
                <div v-if="!editData.startDate" class="text-danger">開始日期不得為空</div>
              </div>

              <!-- 結束日期 -->
              <div class="col-md-6">
                <label class="form-label">結束日期</label>
                <flat-pickr v-model="editData.endDate" class="form-control" :config="datePickerConfig"
                  :disabled="!editData.startDate"></flat-pickr>
                <div v-if="!editData.endDate" class="text-danger">結束日期不得為空</div>
                <div
                  v-if="editData.startDate && editData.endDate && new Date(editData.endDate) <= new Date(editData.startDate)"
                  class="text-danger">
                  結束日期必須晚於開始日期
                </div>
              </div>
            </div>

            <!-- 上傳圖片 -->
            <div class="mb-3">
              <label class="form-label">上傳圖片</label>
              <input type="file" class="form-control" @change="handleImageUpload" />
              <img v-if="imagePreview" :src="imagePreview" alt="預覽" class="img-thumbnail mt-2"
                style="max-width: 150px;" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">取消</button>
              <button type="submit" class="btn btn-success">儲存修改</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import axiosapi from "@/plugins/axios";
import Swal from "sweetalert2";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const props = defineProps({
  coupon: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["deleteCoupon"]);

const isEditModalVisible = ref(false);
const editData = ref({});
const imagePreview = ref(null);
const imageSrc = ref(null);

// ✅【日期選擇器設定】確保格式、禁選過去時間
const datePickerConfig = ref({
  enableTime: false,
  dateFormat: "Y-m-d",
  minDate: "today"  // ✅【禁止選擇過去日期】
});

// ✅【選擇開始日期時，清空結束日期，避免錯誤的時間範圍】
function validateStartDate(selectedDates, dateStr) {
  editData.value.startDate = dateStr;
  editData.value.endDate = null;  // ✅ 清空結束日期
}

// **初始化時載入優惠券圖片**
onMounted(() => {
  loadCouponImage();
});

// **載入優惠券圖片**
async function loadCouponImage() {
  if (props.coupon.couponId) {
    try {
      const response = await axiosapi.get(`/coupons/detail/${props.coupon.couponId}`, {
        responseType: "arraybuffer"
      });
      const base64Image = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      imageSrc.value = `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
      console.error("圖片載入失敗:", error);
      imageSrc.value = "/static/images/no-image.jpg";
    }
  }
}

// **打開修改表單**
function openEditModal() {
  editData.value = { ...props.coupon };
  imagePreview.value = null;
  isEditModalVisible.value = true;
}

// **關閉修改表單**
function closeEditModal() {
  isEditModalVisible.value = false;
}

// **圖片上傳**
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const base64Full = reader.result;
    editData.value.photo = base64Full.split(",")[1];
    imagePreview.value = base64Full;
  };
  reader.readAsDataURL(file);
}

// **提交修改**
async function submitUpdate() {
  if (!editData.value.couponName || !editData.value.couponCode || !editData.value.startDate || !editData.value.endDate) {
    Swal.fire("錯誤!", "所有欄位皆不得為空", "error");
    return;
  }
  // ✅ **新增結束時間需大於開始時間的判斷**
  const startDate = new Date(editData.value.startDate);
  const endDate = new Date(editData.value.endDate);
  if (endDate <= startDate) {
    Swal.fire("錯誤!", "結束日期必須晚於開始日期", "error");
    return;
  }
  try {
    console.log("發送更新請求:", editData.value);
    const resp = await axiosapi.put(
      `/coupons/${editData.value.couponId}`,
      JSON.stringify(editData.value),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!resp.data.success) throw new Error(resp.data.message || "修改失敗");


    // **如果有上傳新圖片**
    if (editData.value.photo) {
      const detailResp = await axiosapi.post(
        "/coupons/detail",
        JSON.stringify({
          photoId: parseInt(editData.value.couponId),
          photo: editData.value.photo
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!detailResp.data.success) throw new Error(detailResp.data.message || "圖片更新失敗");

      // **重新載入最新圖片**
      await loadCouponImage();
    }
    // ✅ **確保更新後 UI 及父元件資料同步**
    Object.assign(props.coupon, editData.value);  // **更新當前卡片的資料**
    emit("refreshCouponList");  // **通知父元件重新載入優惠券清單**
    Swal.fire("成功!", "優惠券已修改", "success");
    closeEditModal();
  } catch (err) {
    console.error("修改失敗:", err);
    Swal.fire("錯誤!", err.message || "修改失敗", "error");
  }
}

// **刪除優惠券**
function emitDeleteCoupon() {
  emit("deleteCoupon", props.coupon.couponId);
}

// **日期格式化**
function formatDate(dateString) {
  return dateString ? dateString.split("T")[0] : "";
}
</script>
