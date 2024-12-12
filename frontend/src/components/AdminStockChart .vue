<template>
  <div class="stock-prediction-chart">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  predictions: {
    type: Array,
    required: true
  }
});

const chartRef = ref(null);
let chart = null;

const createChart = () => {
  const ctx = chartRef.value.getContext('2d');
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.predictions.map(p => p.product),
      datasets: [
        {
          label: 'Current Stock',
          data: props.predictions.map(p => p.currentStock),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Predicted Stock',
          data: props.predictions.map(p => p.predictedStock),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const updateChart = () => {
  if (chart) {
    chart.data.labels = props.predictions.map(p => p.product);
    chart.data.datasets[0].data = props.predictions.map(p => p.currentStock);
    chart.data.datasets[1].data = props.predictions.map(p => p.predictedStock);
    chart.update();
  }
};

onMounted(() => {
  if (props.predictions.length > 0) {
    createChart();
  }
});

watch(() => props.predictions, (newPredictions) => {
  if (newPredictions.length > 0) {
    if (chart) {
      updateChart();
    } else {
      createChart();
    }
  }
}, { deep: true });
</script>

<style scoped>
.stock-prediction-chart {
  width: 100%;
  height: 400px;
}
</style>

