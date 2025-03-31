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
      <button
        class="btn btn-success btn-sm me-2"
        @click="approveApplication(app.applicationId)"
      >
        通過
      </button>
      <button class="btn btn-danger btn-sm" @click="rejectApplication(app.applicationId)">
        拒絕
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
      required: true,
    },
    countManager: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["approve", "reject", "update-counts"],
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
    async approveApplication(applicationId) {
      try {
        // 觸發父組件的approve事件並等待它完成
        await this.$emit("approve", applicationId);
        
        // 更新計數 - 直接在這裡更新
        this.updateCount('pending', -1);
        this.updateCount('approved', 1);
      } catch (error) {
        console.error("核准操作失敗:", error);
      }
    },
    async rejectApplication(applicationId) {
      try {
        // 觸發父組件的reject事件並等待它完成
        await this.$emit("reject", applicationId);
        
        // 更新計數 - 直接在這裡更新
        this.updateCount('pending', -1);
        this.updateCount('rejected', 1);
      } catch (error) {
        console.error("拒絕操作失敗:", error);
      }
    },
    updateCount(type, amount) {
      // 先使用事件通知父組件
      this.$emit("update-counts", { type, amount });
      
      // 也嘗試使用countManager
      if (this.countManager && typeof this.countManager.updateCount === 'function') {
        this.countManager.updateCount(type, amount);
      }
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
</style>