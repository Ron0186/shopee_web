<template>
  <div class="seller-analytics-container">
    <h1>賣家數據分析</h1>

    <!-- 加載提示 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>加載中...</p>
    </div>

    <!-- 主要內容 -->
    <div v-else class="analytics-content">
      <!-- 數據概覽卡片 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>總訂單數</h3>
            <div class="stat-value">{{ statistics.totalOrders || 0 }}</div>
            <div
              class="stat-comparison"
              :class="getGrowthClass(statistics.orderGrowth)"
            >
              {{ formatGrowth(statistics.orderGrowth) }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3>總銷售額</h3>
            <div class="stat-value">
              {{ formatCurrency(statistics.totalSales) }}
            </div>
            <div
              class="stat-comparison"
              :class="getGrowthClass(statistics.salesGrowth)"
            >
              {{ formatGrowth(statistics.salesGrowth) }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>活躍客戶數</h3>
            <div class="stat-value">{{ statistics.activeCustomers || 0 }}</div>
            <div class="stat-comparison">
              {{ formatTimePeriod() }}內有消費的客戶
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>商品總數</h3>
            <div class="stat-value">{{ statistics.totalProducts || 0 }}</div>
            <div class="stat-comparison">
              {{ statistics.activeProducts || 0 }} 個上架中
            </div>
          </div>
        </div>
      </div>

      <!-- 銷售趨勢圖 -->
      <div class="chart-container">
        <div class="chart-header">
          <h2>銷售趨勢</h2>
          <div class="chart-controls">
            <select v-model="salesTimeRange" @change="loadSalesChart">
              <option value="week">最近一週</option>
              <option value="month">最近一個月</option>
              <option value="quarter">最近三個月</option>
              <option value="year">最近一年</option>
            </select>
          </div>
        </div>
        <canvas ref="salesChart" height="300"></canvas>
      </div>

      <!-- 分析區塊 -->
      <div class="analytics-grid">
        <!-- 商品銷售排行 -->
        <div class="analytics-card">
          <h2>熱銷商品排行</h2>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>商品名稱</th>
                  <th>銷售數量</th>
                  <th>銷售額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in topProducts" :key="product.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.quantity }}</td>
                  <td>{{ formatCurrency(product.revenue) }}</td>
                </tr>
                <tr v-if="topProducts.length === 0">
                  <td colspan="4" class="no-data">暫無數據</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 訂單狀態分布 -->
        <div class="analytics-card">
          <h2>訂單狀態分布</h2>
          <canvas ref="orderStatusChart" height="280"></canvas>
        </div>

        <!-- 客戶購買次數分布 -->
        <div class="analytics-card">
          <h2>客戶購買頻率</h2>
          <canvas ref="customerFrequencyChart" height="280"></canvas>
        </div>

        <!-- 付款方式分析 -->
        <div class="analytics-card">
          <h2>付款方式分析</h2>
          <canvas ref="paymentMethodChart" height="280"></canvas>
        </div>
      </div>

      <!-- 銷售預測 -->
      <div class="analytics-card forecast-card">
        <h2>銷售預測 (未來30天)</h2>
        <div class="forecast-content">
          <div class="forecast-stats">
            <div class="forecast-stat">
              <h3>預計訂單數</h3>
              <div class="forecast-value">
                {{ forecast.orderCount || "計算中..." }}
              </div>
              <div class="forecast-comparison">
                較當前月訂單數的
                {{
                  Math.round(
                    (forecast.orderCount / statistics.currentMonthOrders) * 100
                  )
                }}%
              </div>
            </div>
            <div class="forecast-stat">
              <h3>預計銷售額</h3>
              <div class="forecast-value">
                {{
                  forecast.revenue
                    ? formatCurrency(forecast.revenue)
                    : "計算中..."
                }}
              </div>
              <div class="forecast-comparison">
                較當前月銷售額的
                {{
                  Math.round(
                    (forecast.revenue / statistics.currentMonthSales) * 100
                  )
                }}%
              </div>
            </div>
          </div>
          <div class="forecast-chart">
            <canvas ref="forecastChart" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "SellerAnalytics",
  setup() {
    // 參考變數
    const salesChart = ref(null);
    const orderStatusChart = ref(null);
    const customerFrequencyChart = ref(null);
    const paymentMethodChart = ref(null);
    const forecastChart = ref(null);

    // 狀態變數
    const loading = ref(true);
    const selectedShopId = ref(null);
    const salesTimeRange = ref("month");
    const statistics = ref({
      totalOrders: 0,
      totalSales: 0,
      currentMonthOrders: 0,
      currentMonthSales: 0,
      lastMonthOrders: 0,
      lastMonthSales: 0,
      orderGrowth: 0,
      salesGrowth: 0,
      activeCustomers: 0,
      totalProducts: 0,
      activeProducts: 0,
    });
    const topProducts = ref([]);
    const salesData = ref({
      labels: [],
      values: [],
    });
    const orderStatusData = ref([]);
    const customerFrequencyData = ref([]);
    const paymentMethodData = ref([]);
    const forecast = ref({
      orderCount: null,
      revenue: null,
      data: {
        labels: [],
        values: [],
      },
    });

    // 方法
    const fetchSellerShopId = async () => {
      try {
        const response = await fetch("/api/seller/shop/current", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          selectedShopId.value = data.shopId;
          await loadAllData();
        } else {
          console.error("獲取商店ID失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadAllData = async () => {
      if (!selectedShopId.value) return;

      loading.value = true;

      try {
        await Promise.all([
          loadStatistics(),
          loadSalesChart(),
          loadTopProducts(),
          loadOrderStatusChart(),
          loadCustomerFrequencyChart(),
          loadPaymentMethodChart(),
          loadForecast(),
        ]);
      } catch (error) {
        console.error("加載數據錯誤:", error);
      } finally {
        loading.value = false;
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/statistics`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          statistics.value = await response.json();
        } else {
          console.error("獲取統計數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadSalesChart = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/sales?timeRange=${salesTimeRange.value}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          salesData.value = await response.json();
          renderSalesChart();
        } else {
          console.error("獲取銷售數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadTopProducts = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/top-products`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          topProducts.value = await response.json();
        } else {
          console.error("獲取熱銷商品失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadOrderStatusChart = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/order-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          orderStatusData.value = await response.json();
          renderOrderStatusChart();
        } else {
          console.error("獲取訂單狀態數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadCustomerFrequencyChart = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/customer-frequency`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          customerFrequencyData.value = await response.json();
          renderCustomerFrequencyChart();
        } else {
          console.error("獲取客戶購買頻率數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadPaymentMethodChart = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/payment-methods`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          paymentMethodData.value = await response.json();
          renderPaymentMethodChart();
        } else {
          console.error("獲取付款方式數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const loadForecast = async () => {
      try {
        const response = await fetch(
          `/api/seller/shops/${selectedShopId.value}/analytics/forecast`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          forecast.value = await response.json();
          renderForecastChart();
        } else {
          console.error("獲取預測數據失敗");
        }
      } catch (error) {
        console.error("錯誤:", error);
      }
    };

    const renderSalesChart = () => {
      const ctx = document.getElementById("salesChart");

      if (salesChart.value) {
        salesChart.value.destroy();
      }

      salesChart.value = new Chart(ctx, {
        type: "line",
        data: {
          labels: salesData.value.labels,
          datasets: [
            {
              label: "銷售額",
              data: salesData.value.values,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: "rgba(200, 200, 200, 0.2)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `銷售額: $${context.parsed.y.toLocaleString("zh-TW")}`;
                },
              },
            },
          },
        },
      });
    };

    const renderOrderStatusChart = () => {
      const ctx = document.getElementById("orderStatusChart");

      if (orderStatusChart.value) {
        orderStatusChart.value.destroy();
      }

      const labels = orderStatusData.value.map((item) => item.status);
      const data = orderStatusData.value.map((item) => item.count);
      const colors = [
        "rgba(255, 99, 132, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(153, 102, 255, 0.7)",
      ];

      orderStatusChart.value = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              borderColor: colors.map((color) => color.replace("0.7", "1")),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.parsed;
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    };

    const renderCustomerFrequencyChart = () => {
      const ctx = document.getElementById("customerFrequencyChart");

      if (customerFrequencyChart.value) {
        customerFrequencyChart.value.destroy();
      }

      const labels = customerFrequencyData.value.map((item) => item.frequency);
      const data = customerFrequencyData.value.map((item) => item.count);

      customerFrequencyChart.value = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "客戶數量",
              data: data,
              backgroundColor: "rgba(75, 192, 192, 0.7)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: "rgba(200, 200, 200, 0.2)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    };

    const renderPaymentMethodChart = () => {
      const ctx = document.getElementById("paymentMethodChart");

      if (paymentMethodChart.value) {
        paymentMethodChart.value.destroy();
      }

      const labels = paymentMethodData.value.map((item) => item.method);
      const data = paymentMethodData.value.map((item) => item.count);
      const colors = [
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 99, 132, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
      ];

      paymentMethodChart.value = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              borderColor: colors.map((color) => color.replace("0.7", "1")),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.parsed;
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    };

    const renderForecastChart = () => {
      const ctx = document.getElementById("forecastChart");

      if (forecastChart.value) {
        forecastChart.value.destroy();
      }

      forecastChart.value = new Chart(ctx, {
        type: "line",
        data: {
          labels: forecast.value.data.labels,
          datasets: [
            {
              label: "預測銷售額",
              data: forecast.value.data.values,
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              borderDash: [5, 5],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: "rgba(200, 200, 200, 0.2)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    };

    const formatCurrency = (value) => {
      if (value === null || value === undefined) return "$0";
      return `$${Number(value).toLocaleString("zh-TW")}`;
    };

    const formatGrowth = (value) => {
      if (value === null || value === undefined) return "與上月持平";
      if (value > 0) {
        return `較上月增加 ${value}%`;
      } else if (value < 0) {
        return `較上月減少 ${Math.abs(value)}%`;
      } else {
        return "與上月持平";
      }
    };

    const getGrowthClass = (value) => {
      if (value > 0) return "positive";
      if (value < 0) return "negative";
      return "";
    };

    const formatTimePeriod = () => {
      return "近三個月";
    };

    // 生命週期鉤子
    onMounted(() => {
      // 在開發階段可以使用模擬數據
      if (process.env.NODE_ENV === "development") {
        simulateData();
        setTimeout(() => {
          loading.value = false;
        }, 1000);
      } else {
        // 在生產環境獲取實際數據
        fetchSellerShopId();
      }
    });

    // 監聽器
    watch(salesTimeRange, () => {
      loadSalesChart();
    });

    // 模擬數據（僅供示例使用）
    const simulateData = () => {
      selectedShopId.value = 1;

      // 模擬統計數據
      statistics.value = {
        totalOrders: 346,
        totalSales: 187950,
        currentMonthOrders: 38,
        currentMonthSales: 21450,
        lastMonthOrders: 34,
        lastMonthSales: 19800,
        orderGrowth: 11.8,
        salesGrowth: 8.3,
        activeCustomers: 98,
        totalProducts: 45,
        activeProducts: 38,
      };

      // 模擬銷售數據
      const dates = [];
      const values = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        dates.push(
          date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
        );

        // 產生隨機銷售數據，有一定的趨勢
        const baseValue = 5000 + i * 100;
        const randomFactor = Math.random() * 2000 - 1000;
        const weekendBoost =
          date.getDay() === 0 || date.getDay() === 6 ? 1000 : 0;
        values.push(baseValue + randomFactor + weekendBoost);
      }

      salesData.value = {
        labels: dates,
        values: values.map((v) => Number(v.toFixed(2))),
      };

      // 模擬熱銷商品
      topProducts.value = [
        { id: 1, name: "超人氣商品A", quantity: 56, revenue: 28000 },
        { id: 2, name: "熱銷商品B", quantity: 42, revenue: 21000 },
        { id: 3, name: "暢銷商品C", quantity: 38, revenue: 19000 },
        { id: 4, name: "熱門商品D", quantity: 31, revenue: 15500 },
        { id: 5, name: "搶手商品E", quantity: 24, revenue: 12000 },
      ];

      // 模擬訂單狀態數據
      orderStatusData.value = [
        { id: 1, status: "處理中", count: 37 },
        { id: 2, status: "已發貨", count: 28 },
        { id: 3, status: "已完成", count: 253 },
        { id: 4, status: "已取消", count: 18 },
        { id: 5, status: "退貨中", count: 10 },
      ];

      // 模擬客戶購買頻率
      customerFrequencyData.value = [
        { frequency: "1次", count: 45 },
        { frequency: "2-3次", count: 28 },
        { frequency: "4-5次", count: 15 },
        { frequency: "6-10次", count: 7 },
        { frequency: "10次以上", count: 3 },
      ];

      // 模擬付款方式
      paymentMethodData.value = [
        { id: 1, method: "信用卡", count: 195 },
        { id: 2, method: "銀行轉帳", count: 87 },
        { id: 3, method: "超商繳費", count: 52 },
        { id: 4, method: "其他", count: 12 },
      ];

      // 模擬預測數據
      const forecastDates = [];
      const forecastValues = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecastDates.push(
          date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
        );

        // 產生隨機預測數據，有一定的趨勢和波動
        const baseValue = 6000 + i * 50;
        const randomFactor = Math.random() * 1500 - 750;
        const weekendBoost =
          date.getDay() === 0 || date.getDay() === 6 ? 1200 : 0;
        forecastValues.push(baseValue + randomFactor + weekendBoost);
      }

      forecast.value = {
        orderCount: 42,
        revenue: 23500,
        data: {
          labels: forecastDates,
          values: forecastValues.map((v) => Number(v.toFixed(2))),
        },
      };

      // 渲染圖表
      setTimeout(() => {
        renderSalesChart();
        renderOrderStatusChart();
        renderCustomerFrequencyChart();
        renderPaymentMethodChart();
        renderForecastChart();
      }, 1200);
    };

    return {
      // 狀態
      loading,
      selectedShopId,
      salesTimeRange,
      statistics,
      topProducts,
      salesData,
      forecast,

      // 方法
      loadAllData,
      formatCurrency,
      formatGrowth,
      getGrowthClass,
      formatTimePeriod,
      loadSalesChart,
    };
  },
};
</script>

<style scoped>
.seller-analytics-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #2196f3;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 5px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #2196f3;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

.stat-comparison {
  font-size: 12px;
  color: #666;
}

.stat-comparison.positive {
  color: #4caf50;
}

.stat-comparison.negative {
  color: #f44336;
}

.chart-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h2 {
  margin: 0;
  font-size: 18px;
}

.chart-controls select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.analytics-card h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.forecast-card {
  grid-column: 1 / -1;
}

.forecast-content {
  display: flex;
  gap: 30px;
}

.forecast-stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;
  min-width: 250px;
}

.forecast-stat h3 {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.forecast-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

.forecast-comparison {
  font-size: 14px;
  color: #666;
}

.forecast-comparison.positive {
  color: #4caf50;
}

.forecast-comparison.negative {
  color: #f44336;
}

.forecast-chart {
  flex: 1;
  min-height: 200px;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .forecast-content {
    flex-direction: column;
  }

  .forecast-stats {
    flex-direction: row;
  }

  .forecast-stat {
    flex: 1;
  }
}
</style>
