<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Client Management</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Client List -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Client Profiles</h3>
      </div>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-500">Loading clients...</p>
      </div>
      <div v-else-if="clients.length === 0" class="text-center py-4">
        <p class="text-gray-500">No clients found.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Email</th>
              <th class="pb-2">Phone</th>
              <th class="pb-2">Last Visit</th>
              <th class="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id">
              <td class="py-2">{{ client.firstName }} {{ client.lastName }}</td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone || 'N/A' }}</td>
              <td>{{ formatDate(client.lastVisit) }}</td>
              <td>
                <button @click="viewProfile(client)" class="text-blue-500 hover:text-blue-700 mr-2">View Profile</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="selectedClient" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-5 rounded-lg shadow-xl max-w-4xl w-full">
        <h3 class="text-lg font-semibold mb-4">Profile: {{ selectedClient.firstName }} {{ selectedClient.lastName }}</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="font-semibold">Email:</p>
            <p>{{ selectedClient.email }}</p>
          </div>
          <div>
            <p class="font-semibold">Phone:</p>
            <p>{{ selectedClient.phone || 'N/A' }}</p>
          </div>
          <div>
            <p class="font-semibold">Date of Birth:</p>
            <p>{{ formatDate(selectedClient.dateOfBirth) }}</p>
          </div>
          <div>
            <p class="font-semibold">Gender:</p>
            <p>{{ selectedClient.gender || 'N/A' }}</p>
          </div>
          <div>
            <p class="font-semibold">Address:</p>
            <p>{{ formatAddress(selectedClient.address) }}</p>
          </div>
          <div>
            <p class="font-semibold">Last Visit:</p>
            <p>{{ formatDate(selectedClient.lastVisit) }}</p>
          </div>
          <div class="col-span-2">
            <p class="font-semibold">Medical Information:</p>
            <ul class="list-disc list-inside">
              <li>Allergies: {{ selectedClient.medical?.allergies || 'None' }}</li>
              <li>Chronic Conditions: {{ selectedClient.medical?.chronicConditions || 'None' }}</li>
              <li>Skin Conditions: {{ selectedClient.medical?.skinConditions || 'None' }}</li>
            </ul>
          </div>
        </div>
        <button @click="selectedClient = null" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

const clients = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedClient = ref(null);

const fetchClients = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(database, 'users'), where('role', '==', 'client'));
    const querySnapshot = await getDocs(q);
    
    clients.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateOfBirth: data.dateOfBirth instanceof Timestamp ? data.dateOfBirth : Timestamp.fromDate(new Date(data.dateOfBirth)),
        lastVisit: data.lastVisit instanceof Timestamp ? data.lastVisit : (data.lastVisit ? Timestamp.fromDate(new Date(data.lastVisit)) : null),
      };
    });

    clients.value.sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return b.lastVisit - a.lastVisit;
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    error.value = 'Failed to fetch client profiles. Please try again later.';
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
  } else if (date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    return 'N/A';
  }
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  const parts = [
    address.houseStreet,
    address.barangay,
    address.city,
    address.province,
    address.postalCode,
    address.country
  ].filter(Boolean);
  return parts.join(', ');
};

const viewProfile = (client) => {
  selectedClient.value = client;
};

onMounted(() => {
  fetchClients();
});
</script>