<template>
  <div class="container mt-4">
    <h2 class="mb-3">📢 評論管理</h2>

    <!-- 🔍 搜尋 & 篩選 -->
    <div class="row g-2 mb-3">
      <div class="col-md-6">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="🔍 搜尋評論 (商品名稱 / 用戶)"
        />
      </div>
      <div class="col-md-4">
        <select v-model="filterStatus" class="form-select">
          <option value="all">全部</option>
          <option value="待審核">待審核</option>
          <option value="已批准">已批准</option>
          <option value="已拒絕">已拒絕</option>
          <option value="已屏蔽">已屏蔽</option>
        </select>
      </div>
    </div>

    <!-- 📜 表格 -->
    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th>Id</th>
            <th>商品名稱</th>
            <th>用戶名稱</th>
            <th>評分</th>
            <th>內容</th>
            <th>日期</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody v-if="reviews.length > 0">
          <tr v-for="review in filteredReviews" :key="review.id">
            <td>{{ review.id }}</td>
            <td>{{ review.product }}</td>
            <td>{{ review.user }}</td>
            <td>⭐ {{ review.rating }}</td>
            <td class="comment-box">
              {{ review.comment }}
            </td>
            <td>{{ review.date }}</td>
            <td>
              <span class="badge" :class="statusClass(review.status)">
                {{ review.status }}
              </span>
            </td>
            <td>
              <button
                v-if="review.status === '已批准'"
                class="btn btn-sm btn-warning me-1"
                @click="updateReviewStatus(review.id, 'BLOCKED')"
              >
                屏蔽
              </button>
              <button
                v-else-if="review.status === '已屏蔽'"
                class="btn btn-sm bg-success text-white me-1"
                @click="updateReviewStatus(review.id, 'APPROVED')"
              >
                顯示
              </button>
              <button
                class="btn btn-sm btn-info me-1"
                @click="viewReview(review)"
              >
                查看
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteReview(review.id)"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="8" class="text-center">
              <strong>沒有找到符合條件的評論</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📌 Modal：評論詳情 -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">評論詳情</h5>
            <button
              type="button"
              class="btn-close"
              @click="showModal = false"
            ></button>
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
            <button class="btn btn-secondary" @click="showModal = false">
              關閉
            </button>
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
const visibleComments = ref(new Set());

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const toggleCommentVisibility = (id) => {
  if (visibleComments.value.has(id)) {
    visibleComments.value.delete(id);
  } else {
    visibleComments.value.add(id);
  }
};

const fetchReviews = async () => {
  try {
    const response = await fetch("http://localhost:8081/api/review/allreview");

    if (response.status === 204) {
      reviews.value = [];
      return;
    }

    const data = await response.json();

    reviews.value = Array.isArray(data)
      ? data.map((r) => ({
          id: r.reviewId,
          product: r.productName,
          user: r.userName ?? "匿名",
          rating: r.rating,
          comment: r.content,
          status: convertStatus(r.status),
          date: formatDateTime(r.createdAt),
        }))
      : [];
  } catch (error) {
    console.error("❌ 讀取評價失敗", error);
  }
};

const convertStatus = (status) => {
  switch (status) {
    case "APPROVED":
      return "已批准";

    case "BLOCKED":
      return "已屏蔽";
    default:
      return status;
  }
};

const statusClass = (status) => ({
  "bg-warning text-dark": status === "已屏蔽",
  "bg-success text-white": status === "已批准",
});

const updateReviewStatus = async (id, status) => {
  /**
   * 狀態
   * - 屏蔽：BLOCKED
   * - 顯示：APPROVED
   */

  try {
    await fetch(
      `http://localhost:8081/api/review/${id}/status?status=${status}`,
      {
        method: "PATCH",
      }
    );
    const target = reviews.value.find((r) => r.id === id);
    if (target) target.status = statusLabel;
  } catch (err) {
    console.error("更新失敗", err);
  } finally {
    fetchReviews();
  }
};

const deleteReview = async (reviewId) => {
  try {
    await fetch(`http://localhost:8081/api/review/${reviewId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("刪除失敗", err);
  } finally {
    fetchReviews();
  }
};

const viewReview = (review) => {
  selectedReview.value = review;
  showModal.value = true;
};

const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    if (filterStatus.value !== "all" && review.status !== filterStatus.value)
      return false;
    if (
      searchQuery.value &&
      !review.user.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !review.product.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
      return false;
    return true;
  });
});

onMounted(() => {
  fetchReviews();
});
</script>
