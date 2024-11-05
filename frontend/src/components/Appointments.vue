<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Appointment Management</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>



    <!-- All Appointments Table -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <h3 class="text-lg font-semibold mb-4">All Appointments</h3>
      <div class="overflow-x-auto">
        <table v-if="!loading && filteredAppointments.length > 0" class="w-full">
          <thead>
            <tr class="text-left text-gray-500 bg-gray-100">
              <th class="p-2">Patient</th>
              <th class="p-2">Date</th>
              <th class="p-2">Time</th>
              <th class="p-2">Treatment</th>
              <th class="p-2">Status</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="border-b">
              <td class="p-2">{{ appointment.userEmail }}</td>
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
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchEmail = ref('');
const searchMonth = ref('');
const searchTreatment = ref('');



const fetchAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending', // Ensure status is set, default to 'pending'
      };
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const approveAppointment = async (appointment) => {
  try {
    await updateDoc(doc(db, 'appointments', appointment.id), {
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
    await updateDoc(doc(db, 'appointments', appointment.id), {
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
    const matchesEmail = searchEmail.value
      ? appointment.userEmail.toLowerCase().includes(searchEmail.value.toLowerCase())
      : true;
    const matchesMonth = searchMonth.value
      ? (appointment.date.toDate().getMonth() + 1) === Number(searchMonth.value)
      : true;
    const matchesTreatment = searchTreatment.value
      ? appointment.service.toLowerCase().includes(searchTreatment.value.toLowerCase())
      : true;
    return matchesEmail && matchesMonth && matchesTreatment;
  });
});





onMounted(() => {
  fetchAppointments();
});
</script>
