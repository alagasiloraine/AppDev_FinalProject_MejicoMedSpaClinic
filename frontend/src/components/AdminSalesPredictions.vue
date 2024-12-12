<template>
  <div class="admin-sales-analysis">
    <div class="header-section">
      <h1 class="title">Sales Analysis</h1>
      <div class="datetime-display">
        <div class="datetime-container">
          <div class="date-section">
            <CalendarIcon class="icon" />
            <span>{{ formattedDate }}</span>
          </div>
          <div class="time-section">
            <ClockIcon class="icon" />
            <span>{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="toggle-container">
      <div class="toggle-buttons">
        <button 
          @click="activeView = 'monthly'" 
          :class="['toggle-btn', { 'active': activeView === 'monthly' }]"
        >
          <BarChart2Icon class="toggle-icon" />
          Monthly Sales
        </button>
        <button 
          @click="activeView = 'predictions'" 
          :class="['toggle-btn', { 'active': activeView === 'predictions' }]"
        >
          <TrendingUpIcon class="toggle-icon" />
          Sales Predictions
        </button>
      </div>
      <div class="toggle-indicator" :class="activeView"></div>
    </div>

    <div class="content-wrapper">
      <!-- Monthly Sales View -->
      <div v-if="activeView === 'monthly'" class="monthly-view">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading monthly sales data...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <div class="error-content">
            <XCircleIcon class="error-icon" />
            <div>
              <h3>Error loading sales data</h3>
              <p>{{ error }}</p>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="monthly-stats-header">
            <h3 class="monthly-title">Monthly Sales Overview</h3>
            <p class="monthly-subtitle">Track your business growth month by month</p>
          </div>
          
          <div class="monthly-cards">
            <div v-for="(data, date) in aggregatedSales" 
                 :key="date" 
                 class="monthly-card"
                 :class="{'highlight': isHighestSales(data.totalSales)}"
            >
              <div class="card-header">
                <div class="month-badge">
                  {{ formatMonthShort(date) }}
                </div>
                <div class="trend-indicator" v-if="getSalesTrend(date, data.totalSales)">
                  <TrendingUpIcon v-if="getSalesTrend(date, data.totalSales) === 'increase'" 
                                 class="trend-icon increase" />
                  <TrendingDownIcon v-if="getSalesTrend(date, data.totalSales) === 'decrease'" 
                                   class="trend-icon decrease" />
                </div>
              </div>
              
              <div class="card-body">
                <div class="sales-amount">
                  <p class="amount">{{ formatCurrency(data.totalSales) }}</p>
                  <p class="label">Total Sales</p>
                </div>
                
                <div class="appointments-count">
                  <div class="count-circle">
                    {{ data.count }}
                  </div>
                  <p class="label">Appointments</p>
                </div>
              </div>
              
              <div class="card-footer">
                <CalendarIcon class="footer-icon" />
                <span>{{ formatMonth(date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Predictions View -->
      <div v-else-if="activeView === 'predictions'" class="predictions-view">
        <div class="predictions-header">
          <BarChartIcon class="predictions-icon" />
          <h2 class="subtitle">Sales Predictions</h2>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading sales predictions...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <div class="error-content">
            <XCircleIcon class="error-icon" />
            <div>
              <h3>Error loading predictions</h3>
              <p>{{ error }}</p>
            </div>
          </div>
        </div>

        <div v-else class="predictions-content">
          <div class="prediction-cards">
            <div class="prediction-card next-month">
              <div class="card-icon">
                <CalendarPlusIcon />
              </div>
              <div class="card-content">
                <h3>Next Month's Prediction</h3>
                <p class="prediction-value">{{ formatCurrency(nextMonthPrediction) }}</p>
                <div class="trend">
                  <TrendingUpIcon class="trend-icon" />
                  <span>Projected Growth</span>
                </div>
              </div>
            </div>
            
            <div class="prediction-card total">
              <div class="card-icon">
                <BarChart3Icon />
              </div>
              <div class="card-content">
                <h3>6-Month Total Prediction</h3>
                <p class="prediction-value">{{ formatCurrency(sixMonthTotal) }}</p>
                <div class="trend">
                  <LineChart class="trend-icon" />
                  <span>Cumulative Forecast</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-header">
              <LineChartIcon class="chart-icon" />
              <h3>Sales Prediction Chart</h3>
            </div>
            <SalesPredictionChart :predictions="predictions" />
          </div>

          <div class="prediction-breakdown">
            <div class="breakdown-header">
              <ClipboardListIcon class="breakdown-icon" />
              <h3>6-Month Prediction Breakdown</h3>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th><CalendarIcon class="table-icon" /> Month</th>
                    <th><DollarSignIcon class="table-icon" /> Predicted Sales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(prediction, index) in predictions" :key="index">
                    <td>{{ formatDate(prediction.date) }}</td>
                    <td>{{ formatCurrency(prediction.sales) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  XCircleIcon, 
  BarChart2Icon, 
  TrendingUpIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingDownIcon,
  BarChartIcon,
  CalendarPlusIcon,
  BarChart3Icon,
  LineChart,
  LineChartIcon,
  ClipboardListIcon,
  DollarSignIcon
} from 'lucide-vue-next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../firebase';
import SalesPredictionChart from './AdminSaleschart.vue';

const activeView = ref('monthly');
const salesData = ref([]);
const predictions = ref([]);
const loading = ref(true);
const error = ref(null);
const formattedDate = ref('');
const formattedTime = ref('');
let timeInterval;

const aggregatedSales = computed(() => {
  const aggregated = {};
  
  salesData.value.forEach(appointment => {
    const date = new Date(appointment.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!aggregated[monthKey]) {
      aggregated[monthKey] = {
        totalSales: 0,
        count: 0
      };
    }
    aggregated[monthKey].totalSales += appointment.price || 0;
    aggregated[monthKey].count += 1;
  });

  return Object.fromEntries(
    Object.entries(aggregated).sort((a, b) => b[0].localeCompare(a[0]))
  );
});

const nextMonthPrediction = computed(() => {
  return predictions.value[0]?.sales || 0;
});

const sixMonthTotal = computed(() => {
  return predictions.value.reduce((total, prediction) => total + prediction.sales, 0);
});

const formatMonth = (dateString) => {
  const [year, month] = dateString.split('-');
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(value);
};

const formatMonthShort = (dateString) => {
  const [year, month] = dateString.split('-');
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'short'
  });
};

const isHighestSales = (sales) => {
  const allSales = Object.values(aggregatedSales.value).map(data => data.totalSales);
  return sales === Math.max(...allSales);
};

const getSalesTrend = (currentDate, currentSales) => {
  const dates = Object.keys(aggregatedSales.value).sort();
  const currentIndex = dates.indexOf(currentDate);
  
  if (currentIndex < dates.length - 1) {
    const nextDate = dates[currentIndex + 1];
    const nextSales = aggregatedSales.value[nextDate].totalSales;
    
    if (currentSales > nextSales) return 'increase';
    if (currentSales < nextSales) return 'decrease';
  }
  
  return null;
};

const updateDateTime = () => {
  const now = new Date();
  formattedDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  formattedTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const calculatePredictions = () => {
  if (salesData.value.length === 0) {
    error.value = 'No sales data available for prediction';
    return;
  }

  const sortedData = [...salesData.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  const xValues = sortedData.map((_, index) => index);
  const yValues = sortedData.map(item => item.price);

  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  predictions.value = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(lastDate.getFullYear(), lastDate.getMonth() + i + 1, 1);
    const sales = Math.max(0, slope * (n + i) + intercept);
    return { 
      date: date.toISOString().split('T')[0], 
      sales: Math.round(sales) 
    };
  });
};

const fetchSalesData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const appointmentsRef = collection(database, 'appointments');
    const q = query(
      appointmentsRef,
      where('status', '==', 'approved')
    );

    const querySnapshot = await getDocs(q);
    const appointments = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let date;
      if (data.date instanceof Date) {
        date = data.date;
      } else if (data.date && typeof data.date.toDate === 'function') {
        date = data.date.toDate();
      } else if (data.date && !isNaN(Date.parse(data.date))) {
        date = new Date(data.date);
      } else {
        console.warn(`Invalid date format for document ${doc.id}`);
        return;
      }
      appointments.push({
        date: date.toISOString().split('T')[0],
        price: data.price || 0
      });
    });

    salesData.value = appointments;
    calculatePredictions();
  } catch (err) {
    console.error('Error fetching sales data:', err);
    error.value = 'Failed to load sales data. Please try again later.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSalesData();
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped>
.admin-sales-analysis {
  height: 650px;
  max-height: 650px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a202c;
  letter-spacing: -0.5px;
}

.header-section {
  margin-bottom: 24px;
}

.datetime-display {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(107, 70, 193, 0.2);
}

.datetime-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.date-section, .time-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}

.icon {
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.toggle-container {
  position: relative;
  background: #f4f4f5;
  padding: 6px;
  border-radius: 12px;
  width: fit-content;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.toggle-container:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toggle-buttons {
  position: relative;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #666;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.toggle-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(107, 70, 193, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.toggle-btn:hover::before {
  width: 200%;
  height: 200%;
}

.toggle-btn.active {
  color: white;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.toggle-btn:hover .toggle-icon {
  transform: scale(1.1);
}

.toggle-indicator {
  position: absolute;
  top: 6px;
  left: 6px;
  height: calc(100% - 12px);
  width: calc(50% - 10px);
  background: #6b46c1;
  border-radius: 6px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.toggle-indicator.predictions {
  transform: translateX(calc(100% + 8px));
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.monthly-view, .predictions-view {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

.data-table-container, .prediction-breakdown {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-responsive {
  overflow-x: auto;
}

.table-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th, td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #4a5568;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tr:hover td {
  background-color: #f8f9ff;
}

td {
  color: #2d3748;
  font-size: 14px;
}

.subtitle {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2d3748;
}

.prediction-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.prediction-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.prediction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6b46c1, #805ad5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.prediction-card:hover::before {
  opacity: 1;
}

.prediction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(107, 70, 193, 0.15);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f7fafc;
  color: #6b46c1;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.prediction-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b46c1;
}

.trend-icon {
  width: 14px;
  height: 14px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.chart-icon {
  width: 20px;
  height: 20px;
  color: #6b46c1;
}

.chart-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.prediction-breakdown {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.breakdown-icon {
  width: 20px;
  height: 20px;
  color: #6b46c1;
}

.breakdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.table-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  vertical-align: middle;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #6b46c1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background-color: #fff5f5;
  border-left: 4px solid #e53e3e;
  color: #c53030;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 8px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  width: 20px;
  height: 20px;
  color: #e53e3e;
}

/* Custom Scrollbar */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f4;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .prediction-cards {
    grid-template-columns: 1fr;
  }

  .toggle-container {
    width: 100%;
    justify-content: center;
  }
  
  .toggle-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
  }
  
  .toggle-indicator {
    width: calc(50% - 4px);
  }

  th, td {
    padding: 12px 16px;
  }

  .admin-sales-analysis {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 20px;
  }

  .prediction-value {
    font-size: 28px;
  }

  .datetime-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .toggle-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .toggle-icon {
    width: 16px;
    height: 16px;
  }
}

.monthly-stats-header {
  margin-bottom: 24px;
}

.monthly-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.monthly-subtitle {
  color: #64748b;
  font-size: 0.775rem;
}

.monthly-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.monthly-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.monthly-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(107, 70, 193, 0.15);
  border-color: #6b46c1;
}

.monthly-card.highlight {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  color: white;
}

.monthly-card.highlight .label,
.monthly-card.highlight .footer-icon {
  color: rgba(255, 255, 255, 0.8);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-badge {
  background: #f7fafc;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.highlight .month-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.trend-indicator {
  display: flex;
  align-items: center;
}

.trend-icon {
  width: 20px;
  height: 20px;
}

.trend-icon.increase {
  color: #38a169;
}

.trend-icon.decrease {
  color: #e53e3e;
}

.highlight .trend-icon.increase,
.highlight .trend-icon.decrease {
  color: white;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sales-amount {
  flex: 1;
}

.amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
}

.appointments-count {
  text-align: center;
}

.count-circle {
  width: 48px;
  height: 48px;
  background: #f7fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #4a5568;
}

.highlight .count-circle {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
}

.highlight .card-footer {
  border-top-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.footer-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

@media (max-width: 768px) {
  .monthly-cards {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .monthly-stats-header {
    padding: 0 16px;
  }
  
  .amount {
    font-size: 1.5rem;
  }
}
</style>

