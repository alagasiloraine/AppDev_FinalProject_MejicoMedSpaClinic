<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Analytics Dashboard</h2>

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
        <h3 class="text-sm text-gray-500 mb-2">Treatment Success</h3>
        <p class="text-3xl font-bold text-purple-600">{{ treatmentSuccess }}%</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Total Products</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalProducts }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Appointments Over Time</h3>
        <canvas ref="appointmentChart"></canvas>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">AI Treatment Recommendations</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="treatment in aiTreatments" :key="treatment.name" class="flex items-center">
            <span class="w-3 h-3 rounded-full" :class="treatment.color"></span>
            <span class="text-sm ml-2">{{ treatment.name }}: {{ treatment.match }}% Match</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Users, Top Products, and Recent Clients -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Recent Users</h3>
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Email</th>
              <th class="pb-2">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="py-2">{{ user.email }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Top Products</h3>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Price</th>
              <th class="pb-2">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in topProducts" :key="product.id">
              <td class="py-2">{{ product.name }}</td>
              <td>₱{{ product.price.toFixed(2) }}</td>
              <td>{{ product.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Recent Clients</h3>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in recentClients" :key="client.id">
              <td class="py-2">{{ client.firstName }} {{ client.lastName }}</td>
              <td>{{ formatDate(client.lastVisit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->
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
const appointments = ref([]);
const error = ref(null);
const totalPatients = ref(0);
const monthlyRevenue = ref(4.8);
const treatmentSuccess = ref(94.2);
const appointmentChart = ref(null);

const aiTreatments = ref([
  { name: 'Treatment A', match: 85, color: 'bg-purple-500' },
  { name: 'Treatment B', match: 65, color: 'bg-teal-500' },
  { name: 'Treatment C', match: 45, color: 'bg-teal-500' },
]);

const totalProducts = computed(() => products.value.length);

const topProducts = computed(() => {
  return products.value
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);
});

const recentClients = computed(() => {
  return clients.value
    .sort((a, b) => b.lastVisit - a.lastVisit)
    .slice(0, 5);
});

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

const fetchAppointments = async () => {
  try {
    const q = query(collection(db, 'appointments'), where('status', '==', 'approved'), orderBy('date'));
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
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  }
};

const createAppointmentChart = () => {
  if (appointmentChart.value) {
    appointmentChart.value.destroy();
  }

  const ctx = document.getElementById('appointmentChart');
  const appointmentData = processAppointmentData();

  appointmentChart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: appointmentData.labels,
      datasets: [{
        label: 'Number of Appointments',
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
            text: 'Number of Appointments'
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

const processAppointmentData = () => {
  const appointmentCounts = {};
  appointments.value.forEach(appointment => {
    const date = appointment.date.toDate().toISOString().split('T')[0];
    appointmentCounts[date] = (appointmentCounts[date] || 0) + 1;
  });

  const sortedDates = Object.keys(appointmentCounts).sort();
  return {
    labels: sortedDates,
    data: sortedDates.map(date => appointmentCounts[date])
  };
};

const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    console.error("Invalid date object:", date);
    return "Invalid Date";
  }
};

onMounted(() => {
  fetchRecentUsers();
  fetchProducts();
  fetchClients();
  fetchAppointments();
});
</script>