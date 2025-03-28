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
    <td>{{ formatDate(app.reviewedAt) }}</td>
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
    viewDetails(app) {
      // 顯示申請詳情
      Swal.fire({
        title: `已核准申請詳情 (ID: ${app.applicationId})`,
        html: `
          <div class="text-start">
            <div class="mb-3">
              <div class="d-flex align-items-center mb-2">
                <strong class="text-primary me-2">申請者:</strong> 
                <span>${app.userName} (ID: ${app.userId})</span>
              </div>
              <div class="mb-2">
                <strong class="text-primary me-2">商店名稱:</strong> 
                <span>${app.shopName}</span>
              </div>
              <div class="mb-2">
                <strong class="text-primary me-2">商店分類:</strong> 
                <span class="badge bg-info text-white">${app.shopCategory}</span>
              </div>
              <div class="mb-2">
                <strong class="text-primary me-2">申請時間:</strong> 
                <span>${this.formatDate(app.applicationTime || app.createdAt)}</span>
              </div>
              <div class="mb-2">
                <strong class="text-primary me-2">審核時間:</strong> 
                <span>${this.formatDate(app.reviewedAt)}</span>
              </div>
              <div class="mb-2">
                <strong class="text-primary me-2">審核人:</strong> 
                <span>${app.reviewer}</span>
              </div>
              <div class="mt-3">
                <strong class="text-primary">商店簡介:</strong>
                <div class="p-2 bg-light rounded mt-1">${app.description || app.shopDescription || '無'}</div>
              </div>
              <div class="mt-3">
                <span class="badge bg-success p-2">此申請已被核准</span>
              </div>
            </div>
          </div>
        `,
        width: 600,
        confirmButtonText: '關閉'
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

.description-cell {
  cursor: pointer;
  position: relative;
  white-space: normal;
  word-break: break-word;
  max-width: 200px;
}

.description-cell:hover {
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

tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: pointer;
}
</style>