<template>
  <div class="stock-predictions">
    <!-- Static Header Section -->
    <div class="static-section">
      <div class="header">
        <h1>Stock Predictions</h1>
        <p class="subtitle">Track and manage your product inventory predictions</p>
      </div>

      <!-- Summary Cards -->
      <div class="metric-cards">
        <div class="metric-card total">
          <div class="card-content">
            <div class="icon-wrapper">
              <Package class="metric-icon" />
            </div>
            <div class="metric-content">
              <h3>Total Items</h3>
              <p class="metric-value">{{ totalProducts }}</p>
            </div>
          </div>
        </div>
        
        <div class="metric-card warning">
          <div class="card-content">
            <div class="icon-wrapper">
              <CheckCircle class="metric-icon" />
            </div>
            <div class="metric-content">
              <h3>Sufficient Stocks</h3>
              <p class="metric-value">{{ totalProducts - predictedRestocks }}</p>
            </div>
          </div>
        </div>
        
        <div class="metric-card success">
          <div class="card-content">
            <div class="icon-wrapper">
              <TrendingDown class="metric-icon" />
            </div>
            <div class="metric-content">
              <h3>Predicted Restocks</h3>
              <p class="metric-value">{{ predictedRestocks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Predictions Table -->
      <div class="predictions-table">
        <div class="table-header">
          <div class="header-left">
            <h3>Current Predictions</h3>
            <span class="items-count">{{ filteredPredictions.length }} items</span>
          </div>
          <div class="header-actions">
            <!-- Filter Dropdown -->
            <div class="filter-dropdown" v-click-outside="closeFilter">
              <button class="action-button" @click="toggleFilter">
                <Filter class="action-icon" />
                Filter
              </button>
              <div v-if="showFilter" class="filter-menu">
                <div class="filter-section">
                  <label>Status</label>
                  <div class="filter-options">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="filters.sufficient">
                      Sufficient
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="filters.restock">
                      Restock
                    </label>
                  </div>
                </div>
                <div class="filter-actions">
                  <button @click="resetFilters" class="reset-button">Reset</button>
                  <button @click="applyFilters" class="apply-button">Apply</button>
                </div>
              </div>
            </div>

            <!-- Export Dropdown -->
            <div class="export-dropdown" v-click-outside="closeExport">
              <button class="action-button" @click="toggleExport">
                <Download class="action-icon" />
                Export
              </button>
              <div v-if="showExport" class="export-menu">
                <button @click="exportData('csv')" class="export-option">CSV</button>
                <button @click="exportData('pdf')" class="export-option">PDF</button>
                <button @click="exportData('docx')" class="export-option">Excel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="table-content">
          <table>
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Current Stock</th>
                <th>Predicted Stock (Next Month)</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prediction in filteredPredictions" :key="prediction.id">
                <td>
                  <div class="product-info">
                    <div class="product-icon-wrapper">
                      <Package class="product-icon" />
                    </div>
                    <div>
                      <span class="product-name">{{ prediction.name }}</span>
                      <span class="product-id">ID: {{ prediction.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="stock-value">{{ prediction.currentStock }}</div>
                </td>
                <td>
                  <div class="stock-prediction">
                    <span class="stock-value">{{ prediction.predictedStock }}</span>
                    <TrendingUp v-if="prediction.action === 'Sufficient'" class="trend-icon up" />
                    <TrendingDown v-else class="trend-icon down" />
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', prediction.action.toLowerCase()]">
                    <span class="status-dot"></span>
                    {{ prediction.action }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  CheckCircle
} from 'lucide-vue-next';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../firebase';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const stockData = ref([]);
const stockPredictions = ref([]);
const loading = ref(true);
const error = ref(null);
const showFilter = ref(false);
const showExport = ref(false);

const filters = ref({
  sufficient: true,
  restock: true
});

const totalProducts = computed(() => stockData.value.length);
const lowStockItems = computed(() => stockData.value.filter(item => item.quantity < 10).length);
const predictedRestocks = computed(() => stockPredictions.value.filter(item => item.action === 'Restock').length);

const filteredPredictions = computed(() => {
  return stockPredictions.value.filter(prediction => {
    if (filters.value.sufficient && prediction.action === 'Sufficient') return true;
    if (filters.value.restock && prediction.action === 'Restock') return true;
    return false;
  });
});

const toggleFilter = () => {
  showFilter.value = !showFilter.value;
  showExport.value = false;
};

const toggleExport = () => {
  showExport.value = !showExport.value;
  showFilter.value = false;
};

const closeFilter = () => {
  showFilter.value = false;
};

const closeExport = () => {
  showExport.value = false;
};

const resetFilters = () => {
  filters.value = {
    sufficient: true,
    restock: true
  };
};

const applyFilters = () => {
  showFilter.value = false;
};

const exportData = (format) => {
  switch (format) {
    case 'csv':
      exportToCSV();
      break;
    case 'pdf':
      exportToPDF();
      break;
    case 'docx':
      exportToExcel();
      break;
  }
  showExport.value = false;
};

const exportToCSV = () => {
  const headers = ['Product Name', 'ID', 'Current Stock', 'Predicted Stock', 'Recommended Action'];
  const data = filteredPredictions.value.map(item => [
    item.name,
    item.id,
    item.currentStock,
    item.predictedStock,
    item.action
  ]);

  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'stock_predictions.csv');
};

const exportToPDF = () => {
  const element = document.createElement('div');
  element.innerHTML = `
    <h1 style="color: #1e293b; margin-bottom: 20px;">Stock Predictions</h1>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid #e2e8f0; padding: 12px; background: #f8fafc;">Product Name</th>
          <th style="border: 1px solid #e2e8f0; padding: 12px; background: #f8fafc;">ID</th>
          <th style="border: 1px solid #e2e8f0; padding: 12px; background: #f8fafc;">Current Stock</th>
          <th style="border: 1px solid #e2e8f0; padding: 12px; background: #f8fafc;">Predicted Stock</th>
          <th style="border: 1px solid #e2e8f0; padding: 12px; background: #f8fafc;">Recommended Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredPredictions.value.map(item => `
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 12px;">${item.name}</td>
            <td style="border: 1px solid #e2e8f0; padding: 12px;">${item.id}</td>
            <td style="border: 1px solid #e2e8f0; padding: 12px;">${item.currentStock}</td>
            <td style="border: 1px solid #e2e8f0; padding: 12px;">${item.predictedStock}</td>
            <td style="border: 1px solid #e2e8f0; padding: 12px;">${item.action}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const opt = {
    margin: 1,
    filename: 'stock_predictions.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

const exportToExcel = () => {
  const headers = ['Product Name', 'ID', 'Current Stock', 'Predicted Stock', 'Recommended Action'];
  const data = filteredPredictions.value.map(item => [
    item.name,
    item.id,
    item.currentStock,
    item.predictedStock,
    item.action
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Predictions');
  XLSX.writeFile(wb, 'stock_predictions.xlsx');
};

const fetchStockData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const productsRef = collection(database, 'products');
    const querySnapshot = await getDocs(productsRef);
    stockData.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      quantity: doc.data().quantity,
      category: doc.data().category
    }));

    calculatePredictions();
  } catch (err) {
    console.error('Error fetching stock data:', err);
    error.value = 'Failed to load stock data. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const calculatePredictions = () => {
  stockPredictions.value = stockData.value.map(item => {
    const predictedStock = Math.max(0, item.quantity - Math.floor(Math.random() * 10));
    let action = predictedStock < 10 ? 'Restock' : 'Sufficient';
    return {
      name: item.name,
      currentStock: item.quantity,
      predictedStock: predictedStock,
      action: action,
      id: item.id
    };
  });
};

onMounted(fetchStockData);
</script>

<style scoped>
.stock-predictions {
  height: 650px;
  background: white;
}

.static-section {
  height: 100%;
}

.header {
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.938rem;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.card-content {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
}

.metric-card.total .icon-wrapper {
  background: rgba(107, 33, 168, 0.1);
  color: #6b21a8;
}

.metric-card.warning .icon-wrapper {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.metric-card.success .icon-wrapper {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.metric-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.metric-content h3 {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
}

.predictions-table {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  height: calc(100% - 220px);
  display: flex;
  flex-direction: column;
}

.table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.items-count {
  color: #64748b;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: #f8fafc;
  border-radius: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #64748b;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  border-color: #6b21a8;
  color: #6b21a8;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

.filter-dropdown, .export-dropdown {
  position: relative;
}

.filter-menu, .export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.reset-button, .apply-button, .export-option {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.reset-button {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.apply-button {
  background: #6b21a8;
  color: white;
  border: none;
}

.export-option {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: all 0.2s ease;
}

.export-option:hover {
  background: #f8fafc;
  border-color: #6b21a8;
  color: #6b21a8;
}

.export-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.table-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.table-content::-webkit-scrollbar {
  width: 6px;
}

.table-content::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  background: white;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.product-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b21a8;
}

.product-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.product-id {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}

.stock-prediction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-value {
  font-weight: 600;
  color: #1e293b;
}

.trend-icon {
  width: 1rem;
  height: 1rem;
}

.trend-icon.up {
  color: #16a34a;
}

.trend-icon.down {
  color: #dc2626;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-badge.restock {
  background-color: #fef2f2;
  color: #dc2626;
}

.status-badge.restock .status-dot {
  background-color: #dc2626;
}

.status-badge.sufficient {
  background-color: #f0fdf4;
  color: #16a34a;
}

.status-badge.sufficient .status-dot {
  background-color: #16a34a;
}

@media (max-width: 768px) {
  .metric-cards {
    grid-template-columns: 1fr;
    padding: 0 1rem 1rem;
  }

  .predictions-table {
    margin: 0 1rem;
  }
  
  .header {
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-button {
    flex: 1;
  }
  
  table {
    min-width: 800px;
  }
}
</style>

