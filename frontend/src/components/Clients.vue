<template>
  <div class="container">
    <h2 class="page-title">Patient Management</h2>

    <!-- Tabs -->
    <div class="tabs">
      <nav class="tab-nav">
        <button 
          @click="activeTab = 'overview'"
          :class="['tab-button', { 'active': activeTab === 'overview' }]"
        >
          Overview
        </button>
        <button 
          @click="activeTab = 'clients'"
          :class="['tab-button', { 'active': activeTab === 'clients' }]"
        >
          Client List
        </button>
      </nav>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <strong>Error:</strong>
      <span>{{ error }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>

    <!-- Overview Tab -->
    <div v-else-if="activeTab === 'overview'" class="overview">
      <!-- Stats Cards -->
      <div class="clients-stats-grid">
        <div class="clients-stat-card blue">
          <div class="clients-stat-icon">
            <Users class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ clients.length }}</h3>
            <p class="clients-stat-label">Total Clients</p>
          </div>
        </div>

        <div class="clients-stat-card green">
          <div class="clients-stat-icon">
            <Calendar class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ totalAppointments }}</h3>
            <p class="clients-stat-label">Total Appointments</p>
          </div>
        </div>

        <div class="clients-stat-card purple">
          <div class="clients-stat-icon">
            <Clock class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ formatDate(latestAppointment) }}</h3>
            <p class="clients-stat-label">Latest Appointment</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list">
          <div v-for="client in recentClients" :key="client.id" class="activity-item">
            <div class="client-info">
              <div class="client-avatar">
                <span>{{ client.firstName[0] }}</span>
              </div>
              <div>
                <p class="client-name">{{ client.firstName }} {{ client.lastName }}</p>
                <p class="client-date">{{ formatDate(client.lastVisit) }}</p>
              </div>
            </div>
            <span class="status-badge approved">approved</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Client List Tab -->
    <div v-else class="client-list">
      <div class="list-header">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search clients..." 
            class="search-input"
          >
          <Search class="search-icon" />
        </div>
        <select class="filter-select">
          <option>Filter by status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      <table class="client-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Total Appointments</th>
            <th>Last Visit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.firstName }} {{ client.lastName }}</td>
            <td>
              <div class="contact-info">
                <div class="contact-item">
                  <Mail class="contact-icon" />
                  {{ client.email }}
                </div>
                <div class="contact-item">
                  <Phone class="contact-icon" />
                  {{ client.phone || 'N/A' }}
                </div>
              </div>
            </td>
            <td>{{ client.appointments.length }}</td>
            <td>{{ formatDate(client.lastVisit) }}</td>
            <td>
              <button 
                @click="viewAppointments(client)"
                class="view-details-btn"
              >
                <Eye class="btn-icon" />
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Client Details Modal -->
    <div v-if="selectedClient" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            Client Details: 
            <span class="client-name">{{ selectedClient.firstName }} {{ selectedClient.lastName }}</span>
          </h3>
          <button @click="selectedClient = null" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>

        <div class="client-details">
          <div class="detail-item">
            <p class="detail-label">Email</p>
            <p class="detail-value">{{ selectedClient.email }}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label">Phone</p>
            <p class="detail-value">{{ selectedClient.phone || 'N/A' }}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label">Total Appointments</p>
            <p class="detail-value">{{ selectedClient.appointments.length }}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label">Last Visit</p>
            <p class="detail-value">{{ formatDate(selectedClient.lastVisit) }}</p>
          </div>
        </div>

        <div class="appointment-history">
          <h4 class="appointment-history-title">Appointment History</h4>
          <div class="appointment-table-wrapper">
            <table class="appointment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Treatment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in selectedClient.appointments" :key="appointment.id">
                  <td>
                    <span class="date-cell">{{ formatDate(appointment.date) }}</span>
                  </td>
                  <td>
                    <span class="time-cell">{{ appointment.time }}</span>
                  </td>
                  <td>
                    <span class="treatment-cell">{{ appointment.service }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', appointment.status]">
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Eye, Users, Calendar, Clock, Search, Mail, Phone, X } from 'lucide-vue-next';

const clients = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedClient = ref(null);
const activeTab = ref('overview');

// Computed properties for overview stats
const totalAppointments = computed(() => {
  return clients.value.reduce((total, client) => total + client.appointments.length, 0);
});

const latestAppointment = computed(() => {
  return clients.value.reduce((latest, client) => {
    const clientLatest = client.lastVisit;
    return !latest || (clientLatest && clientLatest > latest) ? clientLatest : latest;
  }, null);
});

const recentClients = computed(() => {
  return [...clients.value]
    .sort((a, b) => (b.lastVisit || 0) - (a.lastVisit || 0))
    .slice(0, 5);
});

// Existing functions
const fetchClientsAndAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const usersSnapshot = await getDocs(collection(database, 'users'));
    const usersData = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appointments: []
    }));

    const appointmentsQuery = query(collection(database, 'appointments'), where('status', '==', 'approved'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    appointmentsSnapshot.forEach((doc) => {
      const appointment = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date : Timestamp.fromDate(new Date(doc.data().date)),
      };

      const clientIndex = usersData.findIndex(user => user.id === appointment.userId);
      if (clientIndex !== -1) {
        usersData[clientIndex].appointments.push(appointment);
        if (!usersData[clientIndex].lastVisit || appointment.date > usersData[clientIndex].lastVisit) {
          usersData[clientIndex].lastVisit = appointment.date;
        }
      }
    });

    clients.value = usersData
      .filter(user => user.appointments.length > 0)
      .sort((a, b) => (b.lastVisit || 0) - (a.lastVisit || 0));

  } catch (err) {
    console.error("Error fetching clients and appointments:", err);
    error.value = 'Failed to fetch client data. Please try again later.';
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
  fetchClientsAndAppointments();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.tabs {
  margin-bottom: 2rem;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  margin-right: 2rem;
  border: none;
  background: none;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
}

.tab-button.active {
  color: #8B5CF6;
  border-bottom: 2px solid #8B5CF6;
}

.error-alert {
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.clients-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.clients-stat-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
}

.clients-stat-card.blue {
  background-color: #eff6ff;
}

.clients-stat-card.green {
  background-color: #ecfdf5;
}

.clients-stat-card.purple {
  background-color: #f5f3ff;
}

.clients-stat-icon {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.75rem;
  border-radius: 9999px;
  margin-right: 1rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #8b5cf6; /* Updated icon color */
}

.clients-stat-label {
  font-size: 0.875rem;
  color: #4b5563;
}

.clients-stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.recent-activity {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #382d6e;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.client-info {
  display: flex;
  align-items: center;
}

.client-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background-color:#6B46C1 ;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: azure;
}

.client-name {
  font-weight: 500;
}

.client-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.client-list {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 20rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.client-table {
  width: 100%;
  border-collapse: collapse;
}

.client-table th,
.client-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.client-table th {
  font-weight: 500;
  color: #6b7280;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.view-details-btn {
  display: flex;
  align-items: center;
  color: white;
  background-color: #6B46C1;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.view-details-btn:hover {
  background-color: #543897;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
}

.modal-title .client-name {
  color: #6B46C1;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #6B46C1;
}

.client-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
}

.appointment-history {
  padding: 0 1.5rem 1.5rem;
}

.appointment-history-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.appointment-table-wrapper {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.appointment-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
}

.appointment-table th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #4b5563;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
}

.appointment-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.date-cell {
  color: #1f2937;
  font-weight: 500;
}

.time-cell {
  color: #6b7280;
  font-weight: 500;
}

.treatment-cell {
  color: #1f2937;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.approved {
  background-color: #ecfdf5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fffbeb;
  color: #92400e;
}

.status-badge.cancelled {
  background-color: #fef2f2;
  color: #991b1b;
}

.appointment-table tbody tr:hover {
  background-color: #f8fafc;
}

@media (max-width: 640px) {
  .modal {
    max-width: 100%;
    margin: 1rem;
  }
  
  .appointment-table {
    font-size: 0.75rem;
  }
  
  .appointment-table td,
  .appointment-table th {
    padding: 0.5rem;
  }
}
</style>