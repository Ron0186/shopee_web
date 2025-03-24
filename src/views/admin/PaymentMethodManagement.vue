<template>
  <div class="container mt-4">
    <h2>管理付款方式</h2>
    <div>
      <button class="btn btn-success" @click="showAddModel = true">
        新增付款方式
      </button>
    </div>
    <table class="table table-bordered payment-method-table">
      <thead>
        <tr>
          <th style="width: 50px">ID</th>
          <th style="width: 150px">名稱</th>
          <th style="width: 180px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="paymentMethods.length > 0"
          v-for="e in paymentMethods"
          :key="e.id"
        >
          <td>{{ e.id }}</td>
          <td>{{ e.name }}</td>
          <td>
            <button class="btn btn-primary btn-sm" @click="openEditModal(e)">
              編輯資料
            </button>

            <button
              class="btn btn-danger btn-sm ms-2"
              @click="deleteProduct(e.id)"
            >
              刪除付款方式
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 新增付款方式 Modal -->
  <payment-method-add-modal
    :isOpen="showAddModel"
    @close="showAddModel = false"
    @refresh="fetchPaymentMethods"
  />

  <!-- 編輯付款方式 Modal -->
  <payment-method-edit-modal
    :isOpen="showEditModal"
    :theData="selectedElement"
    @close="showEditModal = false"
    @save="updatePaymentMethods"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import PaymentMethodAddModal from "@/components/payment-method.components/PaymentMethodAddModal.vue";
import PaymentMethodEditModal from "@/components/payment-method.components/PaymentMethodEditModal.vue";

const paymentMethods = ref([]);
const showAddModel = ref(false);
const showEditModal = ref(false);
const selectedElement = ref(null);

// 取得付款方式列表
const fetchPaymentMethods = async () => {
  try {
    const response = await axios.get(`/api/paymentMethod/all`);
    console.log("API 回傳的付款方式資料：", response.data);
    paymentMethods.value = response.data;
  } catch (error) {
    console.error("載入付款方式列表失敗", error);
  }
};

// 開啟編輯 Modal
const openEditModal = (e) => {
  selectedElement.value = { ...e }; //複製物件，避免影響原資料
  showEditModal.value = true;
};

// 更新付款方式
const updatePaymentMethods = async (updatedData) => {
  if (!updatedData || !updatedData.id) {
    Swal.fire({
      title: "錯誤",
      text: "無效的更新資料",
      icon: "error",
    });
    return;
  }

  try {
    const { id, ...updateDto } = updatedData;
    const response = await axios.put(`/api/paymentMethod/${id}`, updateDto);
    if (response.status >= 200 && response.status < 300) {
      console.log("更新成功，API 回傳的付款方式資料：", response.data);

      Swal.fire({
        title: "更新成功",
        icon: "success",
      });

      // 重新載入列表 (更新 UI)
      await fetchPaymentMethods();
      // 關閉 Modal
      showEditModal.value = false;
    } else {
      Swal.fire({
        title: "更新失敗",
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "無法更新付款方式",
      icon: "error",
    });
    console.error("錯誤", error);
  }
};

// 刪除付款方式
const deletePaymentMethod = async (id) => {
  try {
    const result = await Swal.fire({
      title: `確定要刪除 ID:${id} 的付款方式嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`/api/paymentMethod/${id}`);
      if (response.status >= 200 && response.status < 300) {
        await Swal.fire({
          title: "刪除成功",
          icon: "success",
        });

        // 重新載入付款方式列表
        await fetchPaymentMethods();
      }
    }
  } catch (error) {
    Swal.fire({
      title: "錯誤",
      icon: "error",
    });
  }
};

// 元件掛載時取得付款方式列表
onMounted(() => {
  fetchPaymentMethods();
});
</script>

<style scoped>
.payment-method-table {
  table-layout: fixed;
  width: 100%;
}
</style>
