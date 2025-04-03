<template>
  <div class="coupon-chart mb-4">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose, watch } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  chartDataProp: { // 從父元件接收數據
    type: Object,
    default: () => ({ labels: [], newCounts: [], currentCounts: [] })
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

// 初始圖表數據結構
const chartData = ref({
  labels: props.chartDataProp.labels || [], // 使用 prop 的 labels
  datasets: [
    {
      label: '新增數量', // 紅色系
      data: props.chartDataProp.newCounts || [],
      backgroundColor: 'rgba(255, 99, 132, 0.5)', // 半透明紅
      borderColor: 'rgba(255, 99, 132, 1)', // 實心紅
      borderWidth: 1
    },
    {
      label: '目前有效數量', // 藍色系
      data: props.chartDataProp.currentCounts || [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)', // 半透明藍
      borderColor: 'rgba(54, 162, 235, 1)', // 實心藍
      borderWidth: 1
    }
  ]
});

// 初始化或更新圖表
const initOrUpdateChart = (newData) => {
  if (!chartCanvas.value) return; // 確保 canvas 存在

  // 更新 chartData 的值
  if (newData) {
    chartData.value.labels = newData.labels || [];
    // 確保 datasets 存在且有兩個元素
    if (chartData.value.datasets && chartData.value.datasets.length >= 2) {
      chartData.value.datasets[0].data = newData.newCounts || [];
      chartData.value.datasets[1].data = newData.currentCounts || [];
    } else {
      // 如果 datasets 結構不對，重新建立
      console.warn("Chart datasets structure incorrect, re-initializing.");
      chartData.value.datasets = [
        { label: '新增數量', data: newData.newCounts || [], backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 },
        { label: '目前有效數量', data: newData.currentCounts || [], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }
      ];
    }
  }


  if (chartInstance) {
    // 如果圖表已存在，更新數據並重新渲染
    chartInstance.data = chartData.value;
    chartInstance.update();
  } else {
    // 如果圖表不存在，則建立新圖表
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar', // *** 改為長條圖 ***
      data: chartData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, // Y 軸從 0 開始
            ticks: {
              // 自動計算刻度可能比固定 ticks 更好
              stepSize: 10 // 可以建議步長
            },
            title: {
              display: true,
              text: '張數'
            }
          },
          x: {
            title: {
              display: true,
              text: '月份'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top', // 圖例放上方
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        }
      }
    });
  }
};

// 監聽從父元件傳來的數據變化
watch(() => props.chartDataProp, (newData) => {
  console.log("Chart data updated:", newData);
  initOrUpdateChart(newData);
}, { deep: true }); // 深度監聽物件變化


onMounted(() => {
  initOrUpdateChart(props.chartDataProp); // 初始繪製
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy(); // 元件銷毀前銷毀圖表實例
  }
});

// 將更新方法暴露給父元件 (如果父元件需要主動觸發更新)
defineExpose({
  updateChart: initOrUpdateChart
});
</script>

<style scoped>
.coupon-chart {
  width: 100%;
  min-height: 300px;
  /* 給定最小高度 */
  height: 40vh;
  /* 或者使用相對高度 */
  max-height: 400px;
  /* 最大高度限制 */
}
</style>