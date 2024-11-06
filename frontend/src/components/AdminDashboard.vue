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
        <h3 class="text-sm text-gray-500 mb-2">Monthly Revenue</h3>
        <p class="text-3xl font-bold text-purple-600">₱{{ monthlyRevenue }}M</p>
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

    <!-- Appointment Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Approved Appointments Over Time</h3>
        <canvas ref="appointmentChartRef"></canvas>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Appointment Status Distribution</h3>
        <canvas ref="appointmentStatusChartRef"></canvas>
      </div>
    </div>

    <!-- Other dashboard content -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Chart from 'chart.js/auto';

const users = ref([]);
const products = ref([]);
const clients = ref([]);
const totalPatients = ref(0);
const monthlyRevenue = ref(4.8);
const appointments = ref([]);
const appointmentChartRef = ref(null);
const appointmentStatusChartRef = ref(null);
let appointmentChart = null;
let appointmentStatusChart = null;
const error = ref(null);


const totalProducts = computed(() => products.value.length);

const fetchProducts = async () => {
  try {
    const productsCollection = collection(db, 'products');
    const snapshot = await getDocs(productsCollection);
    products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    error.value = 'Error loading products: ' + err.message;
    console.error(error.value);
  }
};
const fetchRecentUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
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
    const q = query(collection(db, 'users'), where('role', '==', 'user'));
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
const approvedAppointments = computed(() => 
  appointments.value.filter(appointment => appointment.status === 'approved')
);

const fetchAppointments = async () => {
  try {
    const q = query(collection(db, 'appointments'), orderBy('date'));
    const querySnapshot = await getDocs(q);
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
      };
    });
    createAppointmentChart();
    createAppointmentStatusChart();
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const createAppointmentChart = () => {
  const ctx = appointmentChartRef.value.getContext('2d');
  const appointmentData = processAppointmentData();

  if (appointmentChart) {
    appointmentChart.destroy();
  }

  appointmentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: appointmentData.labels,
      datasets: [{
        label: 'Number of Approved Appointments',
        data: appointmentData.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Approved Appointments'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
};

const createAppointmentStatusChart = () => {
  const ctx = appointmentStatusChartRef.value.getContext('2d');
  const statusData = processStatusData();

  if (appointmentStatusChart) {
    appointmentStatusChart.destroy();
  }

  appointmentStatusChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: statusData.labels,
      datasets: [{
        data: statusData.data,
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Appointment Status Distribution'
        }
      }
    }
  });
};

const processAppointmentData = () => {
  const appointmentCounts = {};
  approvedAppointments.value.forEach(appointment => {
    const date = appointment.date.toDate().toISOString().split('T')[0];
    appointmentCounts[date] = (appointmentCounts[date] || 0) + 1;
  });

  const sortedDates = Object.keys(appointmentCounts).sort();
  return {
    labels: sortedDates,
    data: sortedDates.map(date => appointmentCounts[date])
  };
};

const processStatusData = () => {
  const statusCounts = appointments.value.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(statusCounts),
    data: Object.values(statusCounts)
  };
};

onMounted(() => {
  fetchAppointments();
  fetchRecentUsers();
  fetchProducts();
  fetchClients();
});
</script>