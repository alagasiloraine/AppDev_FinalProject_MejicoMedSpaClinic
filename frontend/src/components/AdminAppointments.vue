<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Appointment Management</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Search Filters -->
    <div class="mb-4 flex space-x-4">
      <input
        v-model="searchName"
        class="border p-2 rounded"
        placeholder="Search by name"
        type="text"
      />
      <select v-model="searchMonth" class="border p-2 rounded">
        <option value="">All Months</option>
        <option v-for="i in 12" :key="i" :value="i">
          {{ new Date(2023, i - 1, 1).toLocaleString('default', { month: 'long' }) }}
        </option>
      </select>
      <input
        v-model="searchTreatment"
        class="border p-2 rounded"
        placeholder="Search by treatment"
        type="text"
      />
    </div>

    <!-- All Appointments Table -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <h3 class="text-lg font-semibold mb-4">All Appointments</h3>
      <div class="overflow-x-auto">
        <table v-if="!loading && filteredAppointments.length > 0" class="w-full">
          <thead>
            <tr class="text-left text-gray-500 bg-gray-100">
              <th class="p-2">Client</th>
              <th class="p-2">Date</th>
              <th class="p-2">Time</th>
              <th class="p-2">Treatment</th>
              <th class="p-2">Status</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="border-b">
              <td class="p-2">{{ appointment.clientName }}</td>
              <td class="p-2">{{ formatDate(appointment.date) }}</td>
              <td class="p-2">{{ appointment.time }}</td>
              <td class="p-2">{{ appointment.service }}</td>
              <td class="p-2">
                <span :class="{
                  'px-2 py-1 rounded text-xs font-semibold': true,
                  'bg-green-100 text-green-800': appointment.status === 'approved',
                  'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
                  'bg-red-100 text-red-800': appointment.status === 'rejected'
                }">
                  {{ appointment.status }}
                </span>
              </td>
              <td class="p-2">
                <template v-if="appointment.status === 'pending'">
                  <button @click="approveAppointment(appointment)" class="text-green-500 hover:text-green-700 mr-2">Approve</button>
                  <button @click="declineAppointment(appointment)" class="text-red-500 hover:text-red-700">Decline</button>
                </template>
                <template v-else>
                  <span class="text-gray-500">No actions available</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!loading && filteredAppointments.length === 0" class="text-gray-500">No appointments found.</p>
        <p v-else class="text-gray-500">Loading appointments...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchName = ref('');
const searchMonth = ref('');
const searchTreatment = ref('');

const fetchAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(database, 'appointments'));
    const appointmentsData = [];

    for (const appointmentDoc of querySnapshot.docs) {
      const data = appointmentDoc.data();
      const userDocRef = doc(database, 'users', data.userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      appointmentsData.push({
        id: appointmentDoc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending',
        clientName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown Client',
        userEmail: userData ? userData.email : 'Unknown Email'
      });
    }

    appointments.value = appointmentsData;
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const approveAppointment = async (appointment) => {
  try {
    await updateDoc(doc(database, 'appointments', appointment.id), {
      status: 'approved'
    });
    appointment.status = 'approved';
    appointments.value = [...appointments.value];
  } catch (err) {
    console.error('Error approving appointment:', err);
    error.value = 'Failed to approve appointment. Please try again later.';
  }
};

const declineAppointment = async (appointment) => {
  try {
    await updateDoc(doc(database, 'appointments', appointment.id), {
      status: 'rejected'
    });
    appointment.status = 'rejected';
    appointments.value = [...appointments.value];
  } catch (err) {
    console.error('Error declining appointment:', err);
    error.value = 'Failed to decline appointment. Please try again later.';
  }
};

const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    console.error("Invalid date object:", date);
    return "Invalid Date";
  }
};

const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const matchesName = searchName.value
      ? appointment.clientName.toLowerCase().includes(searchName.value.toLowerCase())
      : true;
    const matchesMonth = searchMonth.value
      ? (appointment.date.toDate().getMonth() + 1) === Number(searchMonth.value)
      : true;
    const matchesTreatment = searchTreatment.value
      ? appointment.service.toLowerCase().includes(searchTreatment.value.toLowerCase())
      : true;
    return matchesName && matchesMonth && matchesTreatment;
  });
});

onMounted(() => {
  fetchAppointments();
});
</script>