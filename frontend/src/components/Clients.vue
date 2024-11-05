<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Patient Management</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>


    <!-- Patient List -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Approved Clients</h3>
      </div>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-500">Loading clients...</p>
      </div>
      <div v-else-if="clients.length === 0" class="text-center py-4">
        <p class="text-gray-500">No approved clients found.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Email</th>
              <th class="pb-2">Total Appointments</th>
              <th class="pb-2">Last Visit</th>
              <th class="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.email">
              <td class="py-2">{{ client.name || 'N/A' }}</td>
              <td>{{ client.email }}</td>
              <td>{{ client.appointments.length }}</td>
              <td>{{ formatDate(client.lastVisit) }}</td>
              <td>
                <button @click="viewAppointments(client)" class="text-blue-500 hover:text-blue-700 mr-2">View Appointments</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Appointments Modal -->
    <div v-if="selectedClient" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-5 rounded-lg shadow-xl max-w-4xl w-full">
        <h3 class="text-lg font-semibold mb-4">Appointments for {{ selectedClient.email }}</h3>
        <table class="w-full mb-4">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Date</th>
              <th class="pb-2">Time</th>
              <th class="pb-2">Treatment</th>
              <th class="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in selectedClient.appointments" :key="appointment.id">
              <td class="py-2">{{ formatDate(appointment.date) }}</td>
              <td>{{ appointment.time }}</td>
              <td>{{ appointment.service }}</td>
              <td>
                <span :class="{
                  'px-2 py-1 rounded text-xs font-semibold': true,
                  'bg-green-100 text-green-800': appointment.status === 'approved',
                  'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
                  'bg-red-100 text-red-800': appointment.status === 'rejected'
                }">
                  {{ appointment.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="selectedClient = null" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

const clients = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedClient = ref(null);

const fetchApprovedClients = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(db, 'appointments'), where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    
    const clientMap = new Map();

    querySnapshot.forEach((doc) => {
      const appointment = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date : Timestamp.fromDate(new Date(doc.data().date)),
      };

      if (!clientMap.has(appointment.userEmail)) {
        clientMap.set(appointment.userEmail, {
          email: appointment.userEmail,
          name: appointment.userName || 'N/A',
          appointments: [],
          lastVisit: appointment.date,
        });
      }

      const client = clientMap.get(appointment.userEmail);
      client.appointments.push(appointment);
      if (appointment.date > client.lastVisit) {
        client.lastVisit = appointment.date;
      }
    });

    clients.value = Array.from(clientMap.values());
    clients.value.sort((a, b) => b.lastVisit - a.lastVisit);
  } catch (err) {
    console.error("Error fetching approved clients:", err);
    error.value = 'Failed to fetch approved clients. Please try again later.';
  } finally {
    loading.value = false;
  }
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

const viewAppointments = (client) => {
  selectedClient.value = client;
};

onMounted(() => {
  fetchApprovedClients();
});
</script>