<template>
  <div class="coupon-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartCanvas = ref(null);
let chartInstance = null;

// 設定 Y 軸 ticks
const yAxisTicks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300];

const chartData = ref({
  labels: ["1月", "2月", "3月", "4月", "5月"],
  datasets: [
    {
      label: "新增優惠券",
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.2)",
      fill: true,
      data: [0, 0, 0, 0, 0],
    },
    {
      label: "刪除優惠券",
      borderColor: "red",
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      fill: true,
      data: [0, 0, 0, 0, 0],
    },
  ],
});

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // 先銷毀舊圖表，避免錯誤
  }

  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: "line",
      data: chartData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            // 強制使用指定 ticks
            type: "linear",
            ticks: {
              callback: function (value, index, values) {
                // 只顯示自訂 ticks
                return yAxisTicks.includes(value) ? value : null;
              },
            },
            // 建議的最小值
            min: 0,
            // 建議的最大值, 你可以設更高,
            suggestedMax: 300,
          },
        },
      },
    });
  }
};

// 按下「新增優惠券」後
const incrementAddCount = () => {
  // 假設 5 月
  chartData.value.datasets[0].data[4]++;
  chartInstance.update();
};

// 按下「刪除」後
const incrementDeleteCount = () => {
  chartData.value.datasets[1].data[4]++;
  chartInstance.update();
};

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

onMounted(initChart);

// 將方法暴露給外部使用
defineExpose({ initChart, incrementAddCount, incrementDeleteCount });
</script>

<style scoped>
.coupon-chart {
  width: 100%;
  height: 300px;
}
</style>
