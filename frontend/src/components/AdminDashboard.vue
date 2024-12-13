<template>
  <main>
    <div class="dashboard-header">
      <h1>Dashboard <span class="text-accent">Overview</span></h1>
      <div class="period-controls">
        <select class="period-select">
          <option>Month to date</option>
        </select>
        <span class="compared-text">compared to</span>
        <select class="period-select">
          <option>Previous period</option>
        </select>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">Total Clients</div>
        <div class="metric-value">{{ totalPatients || 0 }}</div>
        <div :class="['percentage', clientPercentageChange >= 0 ? 'increase' : 'decrease']">
          {{ clientPercentageChange >= 0 ? '↑' : '↓' }} {{ Math.abs(clientPercentageChange).toFixed(1) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Total Revenue</div>
        <div class="metric-value">₱{{ formatPrice(calculateTotalRevenue()) }}</div>
        <div :class="['percentage', Math.abs(revenuePercentageChange) > 0 ? 'increase' : '']">
          {{ Math.abs(revenuePercentageChange) > 0 ? '↑' : '' }} {{ Math.abs(revenuePercentageChange).toFixed(1) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Approved Appointments</div>
        <div class="metric-value">{{ approvedAppointments.length }}</div>
        <div :class="['percentage', Math.abs(appointmentPercentageChange) > 0 ? 'increase' : '']">
          {{ Math.abs(appointmentPercentageChange) > 0 ? '↑' : '' }} {{ Math.abs(appointmentPercentageChange).toFixed(1) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Total Products</div>
        <div class="metric-value">{{ totalProducts }}</div>
        <div :class="['percentage', Math.abs(productPercentageChange) > 0 ? 'increase' : '']">
          {{ Math.abs(productPercentageChange) > 0 ? '↑' : '' }} {{ Math.abs(productPercentageChange).toFixed(1) }}%
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Appointments per Day</h3>
          <select class="period-select">
            <option>Last 30 days</option>
          </select>
        </div>
        <canvas ref="appointmentChartRef"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>Daily Revenue</h3>
          <select class="period-select">
            <option>Last 7 days</option>
          </select>
        </div>
        <canvas ref="revenueChartRef"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { database } from '../firebase';
import 'chartjs-adapter-moment';
import Chart from 'chart.js/auto';

const users = ref([]);
const products = ref([]);
const clients = ref([]);
const totalPatients = ref(0);
const appointments = ref([]);
const appointmentChartRef = ref(null);
const revenueChartRef = ref(null);
let appointmentChart = null;
let revenueChart = null;
const error = ref(null);

const totalProducts = computed(() => products.value.length);

const approvedAppointments = computed(() =>
  appointments.value.filter(appointment => appointment.status === 'approved')
);

const capPercentage = (value) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.max(-100, Math.min(100, parsed));
};

const fetchProducts = async () => {
  try {
    const productsCollection = collection(database, 'products');
    const snapshot = await getDocs(productsCollection);
    products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    error.value = 'Error loading products: ' + err.message;
    console.error(error.value);
  }
};

const fetchRecentUsers = async () => {
  try {
    const usersCollection = collection(database, 'users');
    const q = query(usersCollection, orderBy('createdAt', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    error.value = 'Error loading users: ' + err.message;
    console.error(error.value);
  }
};

const fetchClients = async () => {
  try {
    const q = query(
      collection(database, 'users'),
      where('role', '==', 'client')
    );
    const querySnapshot = await getDocs(q);
    
    // Process each client document
    const processedClients = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Try to get date from either registrationDate or createdAt
      let createdAt;
      try {
        if (data.registrationDate) {
          createdAt = new Date(data.registrationDate);
        } else if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt;
        } else if (data.createdAt?.seconds) {
          createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds || 0);
        } else if (data.createdAt) {
          createdAt = new Date(data.createdAt);
        }

        // Validate the date
        if (createdAt && !isNaN(createdAt.getTime())) {
          createdAt = Timestamp.fromDate(createdAt);
        } else {
          console.warn('Invalid date for client:', doc.id);
          return null;
        }
      } catch (err) {
        console.warn('Error processing date for client:', doc.id, err);
        return null;
      }

      return {
        id: doc.id,
        ...data,
        createdAt
      };
    }).filter(Boolean); // Remove null entries

    clients.value = processedClients;
    
    // Set total patients count from the processed clients length
    totalPatients.value = processedClients.length;
    
    console.log('Processed clients:', {
      total: processedClients.length,
      withValidDates: processedClients.length
    });

  } catch (err) {
    console.error("Error fetching clients:", err);
    error.value = 'Failed to fetch client profiles. Please try again later.';
  }
};

const fetchAppointments = async () => {
  try {
    const q = query(collection(database, 'appointments'), orderBy('date'));
    const querySnapshot = await getDocs(q);
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        price: parseFloat(data.price) || 0,
      };
    });
    createAppointmentChart();
    createRevenueChart();
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  }
};

const createAppointmentChart = () => {
  try {
    if (!appointmentChartRef.value) {
      console.warn('Chart reference not found');
      return;
    }
    const ctx = appointmentChartRef.value.getContext('2d');
    if (!ctx) {
      console.warn('Could not get chart context');
      return;
    }
    
    // Process appointment data by date
    const appointmentsByDate = {};
    appointments.value.forEach(appointment => {
      const date = appointment.date.toDate().toISOString().split('T')[0];
      appointmentsByDate[date] = (appointmentsByDate[date] || 0) + 1;
    });

    // Sort dates and get last 30 days
    const sortedDates = Object.keys(appointmentsByDate).sort();
    const last30Days = sortedDates.slice(-30);
    const appointmentCounts = last30Days.map(date => appointmentsByDate[date] || 0);

    // Generate an array of colors
    const colors = [
      'rgba(124, 58, 237, 0.8)',   // Purple (original color)
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
    ];

    if (appointmentChart) {
      appointmentChart.destroy();
    }

    appointmentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: last30Days,
        datasets: [{
          label: 'Appointments',
          data: appointmentCounts,
          backgroundColor: last30Days.map((_, index) => colors[index % colors.length]),
          borderColor: last30Days.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              borderDash: [8, 4]
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgb(17, 24, 39)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'normal'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                return `Appointments: ${context.parsed.y}`;
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error creating appointment chart:', err);
  }
};

const createRevenueChart = () => {
  const ctx = revenueChartRef.value.getContext('2d');
  const revenueData = processRevenueData();

  if (revenueChart) {
    revenueChart.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: revenueData.labels,
      datasets: [{
        label: 'Daily Revenue',
        data: revenueData.data,
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(124, 58, 237)',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          max: Math.max(...revenueData.data) * 1.2,
          grid: {
            borderDash: [8, 4]
          },
          ticks: {
            font: {
              size: 12
            },
            callback: function(value) {
              return '₱' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgb(17, 24, 39)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'normal'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: (context) => {
              return `Revenue: ₱${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
};

const processRevenueData = () => {
  const dailyRevenue = {};

  appointments.value.forEach(appointment => {
    const date = appointment.date.toDate().toISOString().split('T')[0];
    const revenue = appointment.price || 0;
    dailyRevenue[date] = (dailyRevenue[date] || 0) + revenue;
  });

  const sortedDates = Object.keys(dailyRevenue).sort();

  return {
    labels: sortedDates,
    data: sortedDates.map(date => dailyRevenue[date])
  };
};

const calculateTotalRevenue = () => {
  return appointments.value.reduce((total, appointment) => {
    return total + (appointment.price || 0);
  }, 0);
};

const formatPrice = (price) => {
  return price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calculatePercentageChange = (currentPeriod, previousPeriod) => {
  // If both periods are 0, return 0 (no change)
  if (currentPeriod === 0 && previousPeriod === 0) return 0;
  // If previous period is 0, calculate based on current value
  if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
  // Calculate percentage change
  const change = ((currentPeriod - previousPeriod) / Math.abs(previousPeriod)) * 100;
  // Return the absolute value of the change
  return Math.abs(change);
};

const calculateDailyChange = (dailyData) => {
  if (dailyData.length < 2) return 0;

  // Sort by date in descending order (newest first)
  const sortedData = [...dailyData].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Get the two most recent days with data
  let currentDay = null;
  let previousDay = null;
  let currentDate = null;
  
  for (const entry of sortedData) {
    if (currentDay === null) {
      currentDay = entry.value;
      currentDate = entry.date;
      continue;
    }
    
    // Only compare with the previous different date
    if (entry.date.getTime() < currentDate.getTime()) {
      previousDay = entry.value;
      break;
    }
  }
  
  if (currentDay === null || previousDay === null) return 0;
  
  return calculatePercentageChange(currentDay, previousDay);
};

const groupDataByDate = (data) => {
  const grouped = {};
  data.forEach(item => {
    try {
      if (!item.date) return;
      
      let dateObj;
      if (item.date instanceof Timestamp) {
        dateObj = item.date.toDate();
      } else if (item.date instanceof Date) {
        dateObj = item.date;
      } else {
        dateObj = new Date(item.date);
      }

      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date encountered:', item.date);
        return;
      }

      const dateStr = dateObj.toISOString().split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateObj,
          value: 0
        };
      }
      grouped[dateStr].value += item.value || 0;
    } catch (err) {
      console.error('Error processing date:', err);
    }
  });
  return Object.values(grouped);
};

const clientPercentageChange = computed(() => {
  try {
    if (clients.value.length === 0) return 0;

    // Sort clients by creation date
    const sortedClients = [...clients.value].sort((a, b) => {
      const dateA = a.createdAt.toDate();
      const dateB = b.createdAt.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate the growth percentage based on new clients
    const totalClients = sortedClients.length;
    const previousTotal = totalClients - 1; // Since all clients are new, each one represents 100% growth
    
    // If this is the first client, show 100% growth
    if (previousTotal === 0) return 100;

    // Calculate the growth percentage
    const growthPercentage = ((totalClients - previousTotal) / previousTotal) * 100;

    console.log('Client growth calculation:', {
      totalClients,
      previousTotal,
      growthPercentage
    });

    return growthPercentage;
  } catch (err) {
    console.error('Error calculating client percentage:', err);
    return 0;
  }
});

const appointmentPercentageChange = computed(() => {
  const appointmentData = approvedAppointments.value.map(apt => ({
    date: apt.date instanceof Timestamp ? apt.date.toDate() : new Date(apt.date),
    value: 1
  }));
  return calculateDailyChange(groupDataByDate(appointmentData));
});

const revenuePercentageChange = computed(() => {
  const revenueData = appointments.value.map(apt => ({
    date: apt.date instanceof Timestamp ? apt.date.toDate() : new Date(apt.date),
    value: apt.price || 0
  }));
  return calculateDailyChange(groupDataByDate(revenueData));
});

const productPercentageChange = computed(() => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayProducts = products.value.filter(product => {
    const createdAt = product.createdAt instanceof Timestamp 
      ? product.createdAt.toDate() 
      : new Date(product.createdAt);
    return createdAt >= today;
  }).length;

  const yesterdayProducts = products.value.filter(product => {
    const createdAt = product.createdAt instanceof Timestamp 
      ? product.createdAt.toDate() 
      : new Date(product.createdAt);
    return createdAt >= yesterday && createdAt < today;
  }).length;

  return calculatePercentageChange(todayProducts, yesterdayProducts);
});

onMounted(() => {
  fetchAppointments();
  fetchRecentUsers();
  fetchProducts();
  fetchClients();
});
</script>

<style scoped>
main {
  background: white;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-top: -10px;
  margin-bottom: 20px;
}

.text-accent {
  color: #6366f1;
}

.period-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: -10px;
  margin-bottom: 20px;
}

.compared-text {
  color: #64748b;
  font-size: 0.875rem;
}

.period-select {
  padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #475569;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.metric-header {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.metric-value {
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.percentage {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.increase {
  color: #16a34a;
  background-color: #f0fdf4;
}

.decrease {
  color: #dc2626;
  background-color: #fef2f2;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  min-height: 400px;
  max-height: 400px;
}

.chart-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  height: 110%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
}

.chart-card canvas {
  flex: 1;
  height: 300px !important;
  max-height: 300px !important;
  width: 100% !important;
}

@media (max-width: 1280px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    height: 800px;
  }
}

@media (max-width: 640px) {
  main {
    padding: 0.75rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .period-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .period-select {
    width: 100%;
  }
  
  .charts-grid {
    height: auto;
    min-height: 800px;
  }
}
</style>

