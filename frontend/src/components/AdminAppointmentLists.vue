<template>
  <div class="admin-appointments-list">
    <h2 class="page-title">Approved Appointments</h2>

    <div v-if="error" class="alert alert-error" role="alert">
      <AlertCircle class="alert-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Search Bar -->
    <div class="search-controls">
      <div class="search-wrapper">
        <CalendarDays class="search-icon" />
        <select v-model="searchMonth" class="select-month">
          <option value="">Select month</option>
          <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
        </select>
      </div>
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input 
          v-model="searchTreatment" 
          type="text" 
          placeholder="Search by treatment" 
          class="search-input"
        >
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

    <!-- Appointment Stats -->
    <div class="adminlist-stats-grid">
      <div v-for="(stat, index) in appointmentStats" :key="stat.label" class="adminlist-stat-card">
        <div class="adminlist-stat-icon-wrapper">
          <Users v-if="index === 0" class="adminlist-stat-icon" />
          <CalendarCheck v-if="index === 1" class="adminlist-stat-icon" />
          <CalendarClock v-if="index === 2" class="adminlist-stat-icon" />
        </div>
        <div class="adminlist-stat-content">
          <p class="adminlist-stat-value">{{ stat.value }}</p>
          <h3 class="adminlist-stat-label">{{ stat.label }}</h3>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="table-container">
      <h3 class="section-title">Appointment Details</h3>
      <div class="table-responsive">
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td>
                <div class="patient-info">
                  <User class="patient-icon" />
                  <span>{{ appointment.patientName }}</span>
                </div>
              </td>
              <td>{{ appointment.userEmail }}</td>
              <td>{{ formatDate(appointment.date) }}</td>
              <td>{{ appointment.time }}</td>
              <td>{{ appointment.service }}</td>
              <td class="price-cell">₱{{ formatPrice(appointment.price) }}</td>
              <td>
                <span class="status-badge">
                  <CheckCircle class="status-icon" />
                  Approved
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loading && filteredAppointments.length === 0" class="empty-state">
          <Inbox class="empty-icon" />
          <p>No approved appointments found</p>
        </div>
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
import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  RotateCcw,
  Users,
  CalendarCheck,
  CalendarClock,
  User,
  CheckCircle,
  Inbox,
  Loader,
  AlertCircle
} from 'lucide-vue-next';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchMonth = ref('');
const searchTreatment = ref('');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const appointmentStats = computed(() => [
  { label: 'Total Approved Appointments', value: appointments.value.length },
  { label: 'This Month', value: appointments.value.filter(a => a.date.toDate().getMonth() === new Date().getMonth()).length },
  { label: 'Next Month', value: appointments.value.filter(a => a.date.toDate().getMonth() === (new Date().getMonth() + 1) % 12).length },
]);

const fetchApprovedAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(database, 'appointments'), where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    const appointmentsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date : Timestamp.fromDate(new Date(doc.data().date)),
      price: doc.data().price || 0,
    }));

    appointments.value = await Promise.all(appointmentsData.map(async (appointment) => {
      const userDoc = await getDoc(doc(database, 'users', appointment.userId));
      const userData = userDoc.data() || {};
      return {
        ...appointment,
        patientName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'N/A',
      };
    }));
  } catch (err) {
    console.error("Error fetching approved appointments:", err);
    error.value = 'Failed to fetch approved appointments. Please try again later.';
  } finally {
    loading.value = false;
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

const formatPrice = (price) => {
  return price.toFixed(2);
};

const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const matchesMonth = searchMonth.value
      ? (appointment.date.toDate().getMonth() + 1) === Number(searchMonth.value)
      : true;
    const matchesTreatment = searchTreatment.value
      ? appointment.service.toLowerCase().includes(searchTreatment.value.toLowerCase())
      : true;
    return matchesMonth && matchesTreatment;
  });
});

const applyFilters = () => {
  // Filtering handled by computed property
};

const resetFilters = () => {
  searchMonth.value = '';
  searchTreatment.value = '';
};

onMounted(() => {
  fetchApprovedAppointments();
});
</script>

<style>
.admin-appointments-list {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.alert {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.alert-error {
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.search-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  width: 1rem;
  height: 1rem;
}

.select-month,
.search-input {
  width: 100%;
  padding: 0.4rem 0.5rem 0.4rem 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.select-month:focus,
.search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.btn {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(159, 122, 234, 0.2);
}

.btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.adminlist-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.adminlist-stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.adminlist-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adminlist-stat-icon-wrapper {
  background: rgba(159, 122, 234, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 0.75rem;
}

.adminlist-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #7c3aed;
}

.adminlist-stat-content {
  flex: 1;
}

.adminlist-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.adminlist-stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #9f7aea;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #32276e;
  margin-bottom: 1.5rem;
}

.table-responsive {
  overflow-y: auto;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem;
  flex: 1;
  min-height: 0;
}

.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #9f7aea;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #8b5cf6;
}

.appointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.appointments-table th {
  background-color: #8b5cf6;
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid #edf2f7;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 0.875rem;
}

.appointments-table tbody tr:hover {
  background-color: #f3e8ff;
}

.appointments-table th:first-child {
  border-top-left-radius: 8px;
}

.appointments-table th:last-child {
  border-top-right-radius: 8px;
}

.appointments-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #edf2f7;
  color: #2d3748;
  font-size: 0.75rem;
}

.patient-info {
  display: flex;
  align-items: center;
}

.patient-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.price-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #f0fff4;
  color: #38a169;
  border-radius: 9999px;
  font-size: 0.675rem;
  font-weight: 500;
}

.status-icon {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.25rem;
}

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.empty-icon,
.loading-icon {
  width: 2.5rem;
  height: 2.5rem;
  color:#8b5cf6;
  margin-bottom: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .admin-appointments-list {
    padding: 0.75rem;
  }
  
  .search-controls {
    flex-direction: column;
  }
  
  .select-month,
  .search-input,
  .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}
</style>