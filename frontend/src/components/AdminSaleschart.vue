<template>
  <div class="sales-prediction-chart">
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
  
  // Define gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.predictions.map(p => {
        const date = new Date(p.date);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Predicted Sales',
        data: props.predictions.map(p => p.sales),
        borderColor: '#6366f1',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `₱${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          border: {
            display: false
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          },
          ticks: {
            callback: (value) => `₱${value.toLocaleString()}`,
            padding: 8
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            padding: 8
          }
        }
      }
    }
  });
};

onMounted(() => {
  if (props.predictions.length > 0) {
    createChart();
  }
});

watch(() => props.predictions, (newPredictions) => {
  if (chart) {
    chart.destroy();
  }
  if (newPredictions.length > 0) {
    createChart();
  }
}, { deep: true });
</script>

<style scoped>
.sales-prediction-chart {
  width: 100%;
  height: 400px;
  padding: 1rem;
}
</style>

