<template>
    <div class="pagination-container d-flex justify-content-between align-items-center mt-3">
      <div class="pagination-info">
        顯示 {{ startItem }}-{{ endItem }} 筆，共 {{ totalItems }} 筆結果
      </div>
      
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(0)">
              <i class="bi bi-chevron-double-left"></i>
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          
          <template v-for="page in visiblePages" :key="page">
            <li v-if="page === '...'" class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li v-else class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page + 1 }}</a>
            </li>
          </template>
          
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(totalPages - 1)">
              <i class="bi bi-chevron-double-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentPage: {
        type: Number,
        required: true
      },
      pageSize: {
        type: Number,
        required: true
      },
      totalItems: {
        type: Number,
        required: true
      },
      totalPages: {
        type: Number,
        required: true
      }
    },
    emits: ["page-change"],
    computed: {
      startItem() {
        return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
      },
      endItem() {
        const end = (this.currentPage + 1) * this.pageSize;
        return end > this.totalItems ? this.totalItems : end;
      },
      visiblePages() {
        // 定義要顯示的頁碼數量（不包括首尾頁和省略號）
        const maxVisiblePages = 5;
        const pages = [];
        
        if (this.totalPages <= maxVisiblePages + 2) {
          // 如果總頁數較少，全部顯示
          for (let i = 0; i < this.totalPages; i++) {
            pages.push(i);
          }
        } else {
          // 始終顯示第一頁
          pages.push(0);
          
          // 計算中間顯示的頁碼範圍
          let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
          let endPage = Math.min(this.totalPages - 2, startPage + maxVisiblePages - 1);
          
          // 調整開始頁，確保顯示足夠的頁碼
          if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
          }
          
          // 添加省略號（如果需要）
          if (startPage > 1) {
            pages.push('...');
          }
          
          // 添加中間頁碼
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
          }
          
          // 添加省略號（如果需要）
          if (endPage < this.totalPages - 2) {
            pages.push('...');
          }
          
          // 始終顯示最後一頁
          pages.push(this.totalPages - 1);
        }
        
        return pages;
      }
    },
    methods: {
      changePage(page) {
        if (page < 0 || page >= this.totalPages) return;
        if (page === this.currentPage) return;
        
        this.$emit("page-change", page);
      }
    }
  };
  </script>
  
  <style scoped>
  .pagination-container {
    font-size: 0.875rem;
  }
  
  .pagination-info {
    color: #6c757d;
  }
  
  .page-link {
    color: #4e73df;
    padding: 0.375rem 0.5rem;
  }
  
  .page-item.active .page-link {
    background-color: #4e73df;
    border-color: #4e73df;
  }
  
  .page-item.disabled .page-link {
    color: #6c757d;
  }
  </style>