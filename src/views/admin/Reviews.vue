<template>
  <div class="container mt-4">
    <h2 class="mb-3">📢 評論管理</h2>

    <!-- 🔍 搜尋 & 篩選 -->
    <div class="row g-2 mb-3">
      <div class="col-md-6">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="🔍 搜尋評論 (商品名稱 / 用戶)">
      </div>
      <div class="col-md-4">
        <select v-model="filterStatus" class="form-select">
          <option value="all">全部</option>
          <option value="待審核">待審核</option>
          <option value="已批准">已批准</option>
          <option value="已拒絕">已拒絕</option>
        </select>
      </div>
    </div>

    <!-- 📜 原生 Bootstrap Table -->
    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Product</th>
            <th scope="col">User</th>
            <th scope="col">Rating</th>
            <th scope="col">Comment</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in filteredReviews" :key="review.id">
            <td>{{ review.id }}</td>
            <td>{{ review.product }}</td>
            <td>{{ review.user }}</td>
            <td>⭐ {{ review.rating }}</td>
            <td class="comment-box">{{ review.comment }}</td>
            <td>{{ review.date }}</td>
            <td>
              <span class="badge" :class="statusClass(review.status)">
                {{ review.status }}
              </span>
            </td>
            <td>
              <button v-if="review.status === '待審核'" class="btn btn-sm btn-success me-1"
                @click="updateReviewStatus(review.id, '已批准')">批准</button>
              <button v-if="review.status === '待審核'" class="btn btn-sm btn-danger me-1"
                @click="updateReviewStatus(review.id, '已拒絕')">拒絕</button>
              <button class="btn btn-sm btn-info me-1" @click="viewReview(review)">查看</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteReview(review.id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📌 Modal 手動管理（查看評論詳情） -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">評論詳情</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>評論編號：</strong> {{ selectedReview.id }}</p>
            <p><strong>商品名稱：</strong> {{ selectedReview.product }}</p>
            <p><strong>用戶：</strong> {{ selectedReview.user }}</p>
            <p><strong>評分：</strong> ⭐ {{ selectedReview.rating }}</p>
            <p><strong>評論內容：</strong> {{ selectedReview.comment }}</p>
            <p><strong>日期：</strong> {{ selectedReview.date }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";

const reviews = ref([]);
const filterStatus = ref("all");
const searchQuery = ref("");
const selectedReview = ref(null);
const showModal = ref(false);

// 📌 假設評論數據
const fetchReviews = async () => {
  reviews.value = [
    { id: "RV001", product: "無線耳機", user: "小明", rating: 5, comment: "音質超棒，電池續航力很長！", status: "待審核", date: "2025-03-01" },
    { id: "RV002", product: "智慧手錶", user: "小華", rating: 3, comment: "功能不錯，但有點難操作。", status: "已批准", date: "2025-03-02" },
    { id: "RV003", product: "電競鍵盤", user: "大雄", rating: 1, comment: "用了一周就壞了，完全不推薦！", status: "已拒絕", date: "2025-03-03" }
  ];
};

onMounted(() => {
  fetchReviews();
});

// 🔍 篩選
const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    if (filterStatus.value !== "all" && review.status !== filterStatus.value) return false;
    if (
      searchQuery.value &&
      !review.user.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !review.product.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) return false;
    return true;
  });
});

// 🟢 審核狀態
const statusClass = (status) => ({
  "bg-warning text-dark": status === "待審核",
  "bg-success text-white": status === "已批准",
  "bg-danger text-white": status === "已拒絕",
});

// ✅ 操作方法
const updateReviewStatus = (id, status) => {
  const review = reviews.value.find((r) => r.id === id);
  if (review) review.status = status;
};

const deleteReview = (id) => {
  reviews.value = reviews.value.filter((review) => review.id !== id);
};

const viewReview = (review) => {
  selectedReview.value = review;
  showModal.value = true;
};
</script>
