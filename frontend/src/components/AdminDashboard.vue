<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Admin Dashboard</h2>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Total Clients</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalPatients }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Total Revenue</h3>
        <p class="text-3xl font-bold text-purple-600">₱{{ formatPrice(calculateTotalRevenue()) }}</p>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Approved Appointments</h3>
        <p class="text-3xl font-bold text-purple-600">{{ approvedAppointments.length }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Total Products</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalProducts }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Treatment Booking Percentages</h3>
        <div class="h-96">
          <canvas ref="appointmentChartRef"></canvas>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Daily Revenue</h3>
        <div class="h-96">
          <canvas ref="revenueChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Other dashboard content -->
  </div>
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
    const q = query(collection(database, 'users'), where('role', '==', 'user'));
    const querySnapshot = await getDocs(q);

    clients.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastVisit: doc.data().lastVisit instanceof Timestamp ? doc.data().lastVisit : Timestamp.fromDate(new Date(doc.data().lastVisit)),
    }));

    totalPatients.value = clients.value.length;
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
        price: parseFloat(data.price) || 0, // Ensure price is a number
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
  const ctx = appointmentChartRef.value.getContext('2d');
  const treatmentData = processTreatmentData();

  if (appointmentChart) {
    appointmentChart.destroy();
  }

  appointmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: treatmentData.labels,
      datasets: [{
        label: 'Booking Percentage',
        data: treatmentData.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Booking Percentage'
          },
          ticks: {
            callback: function (value) {
              return value + '%';
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Treatments'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `Booking Percentage: ${context.parsed.x.toFixed(2)}%`;
            }
          }
        }
      }
    }
  });
};

const createRevenueChart = () => {
  const ctx = revenueChartRef.value.getContext('2d');
  const revenueData = processRevenueData();

  if (revenueChart) {
    revenueChart.destroy();
  }

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: revenueData.labels,
      datasets: [{
        label: 'Daily Revenue',
        data: revenueData.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          time: {
            unit: 'month',
            displayFormats: {
              day: 'MMM d'
            }
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue (₱)'
          },
          ticks: {
            callback: function (value) {
              return '₱' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        tooltip: {
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


const processTreatmentData = () => {
  const treatmentCounts = {};
  const totalAppointments = appointments.value.length;

  appointments.value.forEach(appointment => {
    treatmentCounts[appointment.service] = (treatmentCounts[appointment.service] || 0) + 1;
  });

  const sortedTreatments = Object.entries(treatmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Get top 10 treatments

  return {
    labels: sortedTreatments.map(([treatment, _]) => treatment),
    data: sortedTreatments.map(([_, count]) => (count / totalAppointments * 100).toFixed(2))
  };
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

onMounted(() => {
  fetchAppointments();
  fetchRecentUsers();
  fetchProducts();
  fetchClients();
});
</script>