<template>
  <tr>
    <td>{{ app.applicationId }}</td>
    <td>{{ app.userId }}</td>
    <td>
      <div class="d-flex align-items-center">
        <div class="user-avatar me-2">
          {{ getInitials(app.userName) }}
        </div>
        {{ app.userName }}
      </div>
    </td>
    <td>
      <span class="shop-name">{{ app.shopName }}</span>
    </td>
    <td>
      <span class="badge bg-info text-white">{{ app.shopCategory }}</span>
    </td>
    <td>
      <div class="description-cell" @click="showFullDescription(app.description || app.shopDescription)">
        {{ truncateDescription(app.description || app.shopDescription) }}
      </div>
    </td>
    <td>{{ formatDate(app.applicationTime || app.createdAt) }}</td>
    <td>
      <span class="reviewer-badge">{{ app.reviewer }}</span>
    </td>
    <td>
      <div class="comment-cell" @click="showFullComment(app.adminComment)">
        {{ truncateDescription(app.adminComment) }}
      </div>
    </td>
    <td>{{ formatDate(app.reviewedAt) }}</td>
    <td class="text-center">
      <button class="btn btn-outline-success btn-sm" @click="confirmApprove(app.applicationId)" title="重新核准">
        <i class="bi bi-check-lg"></i>
      </button>
    </td>
  </tr>
</template>

<script>
import Swal from "sweetalert2";

export default {
  props: {
    app: {
      type: Object,
      required: true
    }
  },
  emits: ["approve"],
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },
    truncateDescription(text) {
      if (!text) return '無';
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return dateStr;
      }
    },
    showFullDescription(description) {
      if (!description) return;
      
      Swal.fire({
        title: '商店簡介',
        html: `<div class="text-start p-3 bg-light rounded">${description || '無'}</div>`,
        width: 600,
        confirmButtonText: '關閉'
      });
    },
    showFullComment(comment) {
      if (!comment) return;
      
      Swal.fire({
        title: '拒絕原因',
        html: `<div class="text-start p-3 bg-light rounded">${comment || '無'}</div>`,
        width: 600,
        confirmButtonText: '關閉'
      });
    },
    confirmApprove(applicationId) {
      Swal.fire({
        title: '確認重新核准？',
        text: "此操作將重新核准之前被拒絕的申請",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '確認核准',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit("approve", applicationId);
        }
      });
    }
  }
};
</script>

<style scoped>
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.description-cell, .comment-cell {
  cursor: pointer;
  position: relative;
  white-space: normal;
  word-break: break-word;
  max-width: 200px;
}

.description-cell:hover, .comment-cell:hover {
  color: #007bff;
  text-decoration: underline;
}

.description-cell:hover::after {
  content: "點擊查看完整內容";
  position: absolute;
  top: -30px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 10;
}

.comment-cell:hover::after {
  content: "點擊查看完整內容";
  position: absolute;
  top: -30px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 10;
}

.shop-name {
  font-weight: 500;
}

.reviewer-badge {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
}
</style>