<!-- 用戶數據分析頁面 - 重新設計 -->
<template>
  <div class="user-analytics-container">
    <h1 class="page-title">用戶數據分析</h1>
    <p class="page-subtitle">查看平台用戶增長與活動趨勢</p>
    
    <!-- 時間範圍選擇和匯出按鈕 -->
    <div class="controls-container">
      <div class="time-filter">
        <button 
          :class="['filter-btn', timeRange === 1 ? 'active' : '']" 
          @click="changeTimeRange(1)"
        >
          今日
        </button>
        <button 
          :class="['filter-btn', timeRange === 7 ? 'active' : '']" 
          @click="changeTimeRange(7)"
        >
          7天
        </button>
        <button 
          :class="['filter-btn', timeRange === 30 ? 'active' : '']" 
          @click="changeTimeRange(30)"
        >
          30天
        </button>
      </div>
      
      <!-- 匯出CSV按鈕 -->
      <button 
        class="export-btn" 
        @click="exportToCSV" 
        :disabled="loading || chartData.data.length === 0"
      >
        <i class="fas fa-download"></i> 匯出CSV
      </button>
    </div>
    
    <!-- 主要統計資料 -->
    <div class="stats-container">
      <div class="stat-card">
        <h3 class="stat-title">新增用戶總數</h3>
        <div class="stat-value">{{ totalNewUsers }}</div>
        <div class="stat-footer">過去 {{ timeRange }} 天</div>
      </div>
      
      <div class="stat-card">
        <h3 class="stat-title">日均新增用戶</h3>
        <div class="stat-value">{{ averageNewUsers }}</div>
        <div class="stat-footer">平均每日新增用戶</div>
      </div>
      
      <div class="stat-card">
        <h3 class="stat-title">最高單日新增</h3>
        <div class="stat-value">{{ maxDailyNewUsers }}</div>
        <div class="stat-footer">{{ maxDailyDate }}</div>
      </div>
    </div>
    
    <!-- 圖表區域 -->
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">用戶增長趨勢</h3>
        <div class="chart-options">
          <button 
            :class="['chart-option-btn', chartType === 'line' ? 'active' : '']" 
            @click="changeChartType('line')"
          >
            折線圖
          </button>
          <button 
            :class="['chart-option-btn', chartType === 'bar' ? 'active' : '']" 
            @click="changeChartType('bar')"
          >
            柱狀圖
          </button>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas ref="mainChartRef"></canvas>
      </div>
    </div>
    
    <!-- 詳細數據表格 -->
    <div class="table-container">
      <h3 class="table-title">詳細數據</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>新增用戶數</th>
            <th>佔比</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(label, index) in chartData.labels" :key="index">
            <td>{{ label }}</td>
            <td>{{ chartData.data[index] }}</td>
            <td>{{ ((chartData.data[index] / totalNewUsers) * 100).toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 加載中提示 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>資料載入中...</span>
    </div>
    
    <!-- 錯誤提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import axios from '@/plugins/axios';

export default {
  name: 'UserAnalyticsPage',
  setup() {
    // 圖表相關引用
    const mainChartRef = ref(null);
    let mainChart = null;

    // 狀態變數
    const loading = ref(false);
    const error = ref(null);
    const timeRange = ref(7); // 預設為7天
    const chartType = ref('line');
    const chartData = ref({
      labels: [],
      data: []
    });
    const totalNewUsers = ref(0);

    // 計算屬性
    const averageNewUsers = computed(() => {
      if (chartData.value.data.length === 0) return 0;
      const sum = chartData.value.data.reduce((acc, val) => acc + val, 0);
      return Math.round((sum / chartData.value.data.length) * 10) / 10;
    });

    const maxDailyNewUsers = computed(() => {
      if (chartData.value.data.length === 0) return 0;
      return Math.max(...chartData.value.data);
    });

    const maxDailyDate = computed(() => {
      if (chartData.value.data.length === 0) return '';
      const maxIndex = chartData.value.data.indexOf(maxDailyNewUsers.value);
      return chartData.value.labels[maxIndex] || '';
    });

    // 方法
    const fetchUserStatistics = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await axios.get(`/api/stats/new-users?days=${timeRange.value}`);
        
        // 更新圖表資料
        chartData.value.labels = response.data.labels || [];
        chartData.value.data = response.data.data || [];
        totalNewUsers.value = response.data.total || 0;
        
        // 更新圖表
        updateChart();
      } catch (err) {
        console.error('獲取用戶統計數據失敗:', err);
        error.value = '獲取數據失敗，請稍後再試';
      } finally {
        loading.value = false;
      }
    };

    const changeTimeRange = (days) => {
      timeRange.value = days;
    };

    const changeChartType = (type) => {
      chartType.value = type;
      updateChart();
    };

    const updateChart = () => {
      if (!mainChartRef.value) return;

      // 銷毀舊圖表
      if (mainChart) {
        mainChart.destroy();
      }

      const ctx = mainChartRef.value.getContext('2d');
      
      mainChart = new Chart(ctx, {
        type: chartType.value,
        data: {
          labels: chartData.value.labels,
          datasets: [{
            label: '新增用戶數',
            data: chartData.value.data,
            backgroundColor: 'rgba(65, 105, 225, 0.2)',
            borderColor: 'rgb(65, 105, 225)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgb(65, 105, 225)',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    };

// 優化後的CSV匯出函數
const exportToCSV = () => {
  if (chartData.value.labels.length === 0) {
    error.value = '沒有數據可以匯出';
    return;
  }

  try {
    // 準備CSV數據
    const csvRows = [];
    
    // 添加標題行 - 完整的表頭
    csvRows.push(['日期', '新增用戶數', '佔比(%)', '新增用戶總數', '日均新增用戶', '最高單日新增']);
    
    // 添加摘要行 - 包含整體統計數據
    csvRows.push([
      '統計摘要',
      totalNewUsers.value,
      '100',
      totalNewUsers.value,
      averageNewUsers.value,
      maxDailyNewUsers.value
    ]);
    
    // 添加分隔行
    csvRows.push(['', '', '', '', '', '']);
    
    // 添加第二個標題行 - 僅針對每日詳細數據
    csvRows.push(['日期', '新增用戶數', '佔比(%)', '', '', '']);
    
    // 添加數據行
    chartData.value.labels.forEach((label, index) => {
      const percentage = ((chartData.value.data[index] / totalNewUsers.value) * 100).toFixed(1);
      csvRows.push([
        label,
        chartData.value.data[index],
        percentage,
        '', // 詳細數據行不顯示摘要資訊
        '', 
        ''
      ]);
    });
    
    // 將數據轉換為CSV格式，考慮到Excel的特性
    let csvContent = '';
    
    // 處理每一行，確保格式正確
    csvRows.forEach(row => {
      const processedRow = row.map(cell => {
        // 如果是數字，直接返回
        if (!isNaN(cell) && cell !== '') {
          return cell;
        }
        // 如果是文字，用引號包裹以處理可能的逗號
        return `"${cell}"`;
      });
      
      csvContent += processedRow.join(',') + '\r\n'; // 使用CRLF換行符，對Excel更友好
    });
    
    // 添加BOM以確保Excel正確顯示中文
    csvContent = '\uFEFF' + csvContent;
    
    // 創建Blob對象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 創建下載鏈接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `用戶數據統計_${timeRange.value}天_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    
    // 添加到文檔並觸發下載
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('匯出CSV失敗:', err);
    error.value = '匯出失敗，請稍後再試';
  }
};

    // 監聽時間範圍變更
    watch(timeRange, () => {
      fetchUserStatistics();
    });

    // 組件掛載時獲取數據
    onMounted(() => {
      fetchUserStatistics();
    });

    return {
      loading,
      error,
      timeRange,
      chartType,
      chartData,
      totalNewUsers,
      averageNewUsers,
      maxDailyNewUsers,
      maxDailyDate,
      mainChartRef,
      changeTimeRange,
      changeChartType,
      exportToCSV // 新增匯出CSV方法
    };
  }
};
</script>

<style scoped>
.user-analytics-container {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.page-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.time-filter {
  display: flex;
}

.filter-btn {
  padding: 6px 15px;
  margin-right: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e5e5e5;
}

.filter-btn.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

/* 匯出按鈕樣式 */
.export-btn {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #45a049;
}

.export-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.export-btn i {
  margin-right: 6px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-footer {
  font-size: 13px;
  color: #888;
}

.chart-container {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.chart-options {
  display: flex;
}

.chart-option-btn {
  padding: 4px 10px;
  font-size: 13px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  margin-left: 5px;
  cursor: pointer;
  border-radius: 4px;
}

.chart-option-btn.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

.table-container {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  font-weight: bold;
  color: #555;
  background-color: #f8f8f8;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-top-color: #2c3e50;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
  margin-right: 10px;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #d9534f;
  padding: 15px;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
  margin-top: 20px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .controls-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .export-btn {
    margin-top: 10px;
    align-self: flex-start;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-options {
    margin-top: 10px;
  }
  
  .chart-wrapper {
    height: 300px;
  }
}
</style>