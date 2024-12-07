<template>
  <div class="sales-predictions">
    <h1>Sales Predictions</h1>
    <div class="chart-container">
      <canvas ref="salesChart"></canvas>
    </div>
    <div class="predictions-summary">
      <div class="prediction-card">
        <TrendingUpIcon class="icon" />
        <h3>Projected Growth</h3>
        <p>{{ projectedGrowth }}%</p>
      </div>
      <div class="prediction-card">
        <DollarSignIcon class="icon" />
        <h3>Estimated Revenue</h3>
        <p>${{ estimatedRevenue.toLocaleString() }}</p>
      </div>
      <div class="prediction-card">
        <BarChartIcon class="icon" />
        <h3>Top Selling Product</h3>
        <p>{{ topSellingProduct }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { TrendingUpIcon, DollarSignIcon, BarChartIcon } from 'lucide-vue-next';
import Chart from 'chart.js/auto';

const salesChart = ref(null);
const projectedGrowth = ref(15);
const estimatedRevenue = ref(250000);
const topSellingProduct = ref('Premium Facial Treatment');

onMounted(() => {
  const ctx = salesChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales Forecast',
        data: [30000, 35000, 40000, 50000, 60000, 75000],
        borderColor: '#4c1d95',
        backgroundColor: 'rgba(76, 29, 149, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '6-Month Sales Forecast'
        }
      }
    }
  });
});
</script>

<style scoped>
.sales-predictions {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #4c1d95;
  margin-bottom: 20px;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.predictions-summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.prediction-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  flex: 1;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prediction-card .icon {
  width: 40px;
  height: 40px;
  color: #4c1d95;
  margin-bottom: 10px;
}

.prediction-card h3 {
  color: #4b5563;
  margin-bottom: 10px;
}

.prediction-card p {
  color: #4c1d95;
  font-size: 1.5em;
  font-weight: bold;
}

@media (max-width: 768px) {
  .predictions-summary {
    flex-direction: column;
  }
}
</style>