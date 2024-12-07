<template>
  <div class="stock-predictions">
    <h1>Stock Predictions</h1>
    <div class="chart-container">
      <canvas ref="stockChart"></canvas>
    </div>
    <div class="predictions-summary">
      <div class="prediction-card">
        <PackageIcon class="icon" />
        <h3>Low Stock Items</h3>
        <p>{{ lowStockItems }}</p>
      </div>
      <div class="prediction-card">
        <TruckIcon class="icon" />
        <h3>Reorder Soon</h3>
        <p>{{ reorderSoonItems }}</p>
      </div>
      <div class="prediction-card">
        <TrendingDownIcon class="icon" />
        <h3>Overstocked Items</h3>
        <p>{{ overstockedItems }}</p>
      </div>
    </div>
    <div class="stock-table">
      <h2>Critical Stock Levels</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Reorder Point</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in criticalStockItems" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.currentStock }}</td>
            <td>{{ item.reorderPoint }}</td>
            <td :class="item.status.toLowerCase()">{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PackageIcon, TruckIcon, TrendingDownIcon } from 'lucide-vue-next';
import Chart from 'chart.js/auto';

const stockChart = ref(null);
const lowStockItems = ref(5);
const reorderSoonItems = ref(8);
const overstockedItems = ref(3);

const criticalStockItems = ref([
  { id: 1, name: 'Facial Cleanser', currentStock: 10, reorderPoint: 15, status: 'Low' },
  { id: 2, name: 'Moisturizer', currentStock: 5, reorderPoint: 10, status: 'Critical' },
  { id: 3, name: 'Sunscreen', currentStock: 20, reorderPoint: 25, status: 'Low' },
  { id: 4, name: 'Face Masks', currentStock: 50, reorderPoint: 30, status: 'Overstocked' },
]);

onMounted(() => {
  const ctx = stockChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Facial Cleanser', 'Moisturizer', 'Sunscreen', 'Face Masks', 'Toner'],
      datasets: [{
        label: 'Current Stock',
        data: [10, 5, 20, 50, 15],
        backgroundColor: '#4c1d95'
      }, {
        label: 'Reorder Point',
        data: [15, 10, 25, 30, 20],
        backgroundColor: '#818cf8'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Current Stock vs Reorder Point'
        }
      }
    }
  });
});
</script>

<style scoped>
.stock-predictions {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1, h2 {
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
  margin-bottom: 20px;
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

.stock-table {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #4b5563;
}

td.low {
  color: #f59e0b;
}

td.critical {
  color: #ef4444;
}

td.overstocked {
  color: #10b981;
}

@media (max-width: 768px) {
  .predictions-summary {
    flex-direction: column;
  }
  
  table {
    font-size: 0.9em;
  }
  
  th, td {
    padding: 8px;
  }
}
</style>