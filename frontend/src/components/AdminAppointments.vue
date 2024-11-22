<template>
  <div class="adminappointment-appointments">
    <h2 class="page-title">Appointment Management</h2>

    <div v-if="error" class="error-alert">
      <AlertCircle class="alert-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Search Controls -->
    <div class="search-controls">
      <div class="search-wrapper">
        <User class="search-icon" />
        <input
          v-model="searchName"
          class="search-input"
          placeholder="Search by name"
          type="text"
        />
      </div>
      <div class="search-wrapper">
        <CalendarDays class="search-icon" />
        <select v-model="searchMonth" class="select-month">
          <option value="">Select month</option>
          <option v-for="i in 12" :key="i" :value="i">
            {{ new Date(2023, i - 1, 1).toLocaleString('default', { month: 'long' }) }}
          </option>
        </select>
      </div>
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          v-model="searchTreatment"
          class="search-input"
          placeholder="Search by treatment"
          type="text"
        />
      </div>
      <button @click="applyFilters" class="btn btn-primary">
        <Filter class="btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="btn btn-secondary">
        <RotateCcw class="btn-icon" />
        Reset
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="adminappointment-stats-container">
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <UsersIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">{{ filteredAppointments.length }}</p>
          <h3 class="adminappointment-stat-label">Total Appointments</h3>
        </div>
      </div>
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <CalendarIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">
            {{ filteredAppointments.filter(a => new Date(a.date.toDate()).getMonth() === new Date().getMonth()).length }}
          </p>
          <h3 class="adminappointment-stat-label">This Month</h3>
        </div>
      </div>
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <HourglassIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">
            {{ filteredAppointments.filter(a => new Date(a.date.toDate()) > new Date()).length }}
          </p>
          <h3 class="adminappointment-stat-label">Next Month</h3>
        </div>
      </div>
    </div>

    <!-- Appointment Details with scrollable table -->
    <div class="appointment-details">
      <h3 class="section-title">Appointment Details</h3>
      <div class="table-wrapper">
        <table v-if="!loading && filteredAppointments.length > 0" class="appointments-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Treatment</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td>{{ appointment.clientName }}</td>
              <td>{{ appointment.userEmail }}</td>
              <td>{{ formatDate(appointment.date) }}</td>
              <td>{{ appointment.time }}</td>
              <td>{{ appointment.service }}</td>
              <td>₱{{ appointment.price || '0.00' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(appointment.status)]">
                  {{ formatStatus(appointment.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="approveAppointment(appointment)" 
                    class="action-button approve"
                    :disabled="['approved', 'cancelled', 'rejected'].includes(appointment.status)"
                  >
                    Approve
                  </button>
                  <button 
                    @click="declineAppointment(appointment)" 
                    class="action-button decline"
                    :disabled="['approved', 'cancelled', 'rejected'].includes(appointment.status)"
                  >
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!loading && filteredAppointments.length === 0" class="no-data">
          No appointments found.
        </p>
        <div v-else class="loading-state">
          <Loader class="loading-icon spin" />
          <p>Loading appointments...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { 
  Users as UsersIcon, 
  Calendar as CalendarIcon, 
  Hourglass as HourglassIcon, 
  Loader,
  User,
  Search,
  Filter,
  RotateCcw,
  CalendarDays,
  AlertCircle
} from 'lucide-vue-next';

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

const applyFilters = () => {
  // Filtering is handled by computed property
};

const resetFilters = () => {
  searchName.value = '';
  searchMonth.value = '';
  searchTreatment.value = '';
};

const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'pending':
    case 'pending cancellation':
      return 'pending';
    case 'rejected':
    case 'cancelled':
      return 'rejected';
    default:
      return '';
  }
};

const formatStatus = (status) => {
  return status === 'pending cancellation' ? 'pending cancel' : status;
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style>
.adminappointment-appointments {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.error-alert {
  display: flex;
  align-items: center;
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.search-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input,
.select-month {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  transition: all 0.2s;
}

.search-input:focus,
.select-month:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background-color: #7c3aed;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #6d28d9;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.adminappointment-stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.adminappointment-stat-icon-wrapper {
  background: rgba(159, 122, 234, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 0.75rem;
}

.adminappointment-stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.adminappointment-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adminappointment-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #7c3aed;
}

.adminappointment-stat-content {
  flex: 1;
}

.adminappointment-stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #9f7aea;
  margin: 0;
}

.adminappointment-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border-radius: 0.5rem;
  background: white;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    margin-right: 2px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 6px;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #9f7aea;
    border-radius: 6px;
    border: 2px solid #f3f4f6;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #7c3aed;
  }
}

.appointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.appointments-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #8b5cf6;
}

.appointments-table th {
  color: white;
  font-weight: 500;
  text-align: left;
  padding: 0.75rem 1rem;
}

.appointments-table th:first-child {
  border-top-left-radius: 0.5rem;
}

.appointments-table th:last-child {
  border-top-right-radius: 0.5rem;
}

.appointments-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-block;
  white-space: nowrap;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.approve {
  background-color: #22c55e;
  color: white;
}

.action-button.approve:disabled {
  background-color: #22c55e;
}

.action-button.decline {
  background-color: #ef4444;
  color: white;
}

.action-button.decline:disabled {
  background-color: #ef4444;
}

.no-data,
.loading-state {
  text-align: center;
  color: #8b5cf6;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #7c3aed;
  margin-bottom: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>