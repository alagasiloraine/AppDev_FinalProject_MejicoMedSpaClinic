<template>
  <div class="admintreatment-container">
    <div class="admintreatment-header">
      <h1>Treatment Management</h1>
      <button @click="openModal" class="admintreatment-add-button">
        <Plus class="admintreatment-plus-icon" size="18" />
        Add New Treatment
      </button>
    </div>

    <div class="admintreatment-tabs">
      <button 
        :class="['admintreatment-tab-button', { 'admintreatment-active': !showArchived }]"
        @click="showArchived = false"
      >
        Active Treatments
      </button>
      <button 
        :class="['admintreatment-tab-button', { 'admintreatment-active': showArchived }]"
        @click="showArchived = true"
      >
        Archived Treatments
      </button>
    </div>

    <div class="admintreatment-search-section">
      <div class="admintreatment-search-container">
        <div class="admintreatment-search-wrapper">
          <Search class="admintreatment-search-icon" size="18" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search treatments..." 
            class="admintreatment-search-input"
          />
        </div>
      </div>
      <div class="admintreatment-filter-container">
        <select v-model="priceFilter" class="admintreatment-price-filter">
          <option value="">Filter by price</option>
          <option value="100">₱100</option>
          <option value="200">₱200</option>
          <option value="300">₱300</option>
        </select>
      </div>
    </div>

    <div class="admintreatment-treatments-table">
      <div class="admintreatment-table-header">
        <div class="admintreatment-treatment-name">Treatment Name</div>
        <div class="admintreatment-description">Description</div>
        <div class="admintreatment-price">Price</div>
        <div class="admintreatment-services">Services</div>
        <div class="admintreatment-actions">Actions</div>
      </div>
      
      <div v-if="filteredTreatments.length > 0" class="admintreatment-table-body">
        <div v-for="treatment in filteredTreatments" :key="treatment.id" class="admintreatment-table-row">
          <div class="admintreatment-treatment-name">{{ treatment.name }}</div>
          <div class="admintreatment-description">{{ treatment.description }}</div>
          <div class="admintreatment-price">₱{{ treatment.price.toFixed(2) }}</div>
          <div class="admintreatment-services">{{ getServiceNameById(treatment.services) }}</div>
          <div class="admintreatment-actions">
            <button 
              v-if="!treatment.archived"
              @click="editTreatment(treatment)" 
              class="admintreatment-icon-button admintreatment-edit"
              title="Edit treatment"
            >
              <Pencil class="admintreatment-edit-icon" size="18" />
            </button>
            <button 
              @click="toggleArchiveTreatment(treatment)" 
              class="admintreatment-icon-button"
              :class="treatment.archived ? 'admintreatment-restore' : 'admintreatment-archive'"
              :title="treatment.archived ? 'Restore treatment' : 'Archive treatment'"
            >
              <component 
                :is="treatment.archived ? RotateCcw : Archive" 
                :class="treatment.archived ? 'admintreatment-restore-icon' : 'admintreatment-archive-icon'"
                size="18"
              />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="admintreatment-no-treatments">
        {{ showArchived ? 'No archived treatments found.' : 'No active treatments found.' }}
      </div>
    </div>

    <div class="admintreatment-pagination">
      <span>Showing {{ filteredTreatments.length }} of {{ totalTreatments }} treatments</span>
      <div class="admintreatment-pagination-buttons">
        <button 
          @click="prevPage" 
          class="admintreatment-pagination-button" 
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          class="admintreatment-pagination-button"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="admintreatment-modal">
      <div class="admintreatment-modal-content">
        <h3>{{ editingTreatment ? 'Edit Treatment' : 'Add New Treatment' }}</h3>
        <form @submit.prevent="editingTreatment ? updateTreatment() : addTreatment()" class="admintreatment-treatment-form">
          <div class="admintreatment-form-group">
            <label for="treatmentName">Treatment Name</label>
            <input v-model="currentTreatment.name" type="text" id="treatmentName" required />
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentDescription">Description</label>
            <textarea v-model="currentTreatment.description" id="treatmentDescription" rows="3" required></textarea>
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentPrice">Price</label>
            <input v-model.number="currentTreatment.price" type="number" id="treatmentPrice" step="0.01" min="0" required />
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentServices">Select Service</label>
            <select v-model="currentTreatment.services" id="treatmentServices" required>
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
          <div class="admintreatment-modal-actions">
            <button type="button" @click="closeModal" class="admintreatment-cancel-button">Cancel</button>
            <button type="submit" class="admintreatment-submit-button">
              {{ editingTreatment ? 'Update' : 'Add' }} Treatment
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Notification -->
    <transition name="fade">
      <div v-if="notification.show" class="admintreatment-notification" :class="notification.type">
        <div class="admintreatment-notification-icon">
          <CheckCircle v-if="notification.type === 'success'" size="24" />
          <XCircle v-else size="24" />
        </div>
        <div class="admintreatment-notification-content">
          <h4 class="admintreatment-notification-title">
            {{ notification.type === 'success' ? 'Success' : 'Error' }}
          </h4>
          <p class="admintreatment-notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Search, Pencil, Archive, RotateCcw, Plus, CheckCircle, XCircle } from 'lucide-vue-next';

const treatments = ref([]);
const services = ref([]);
const currentTreatment = ref({ name: '', description: '', price: 0, services: '' });
const editingTreatment = ref(null);
const isModalOpen = ref(false);
const searchQuery = ref('');
const priceFilter = ref('');
const showArchived = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const notification = ref({ show: false, message: '', type: '' });

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentTreatment.value = { name: '', description: '', price: 0, services: '' };
  editingTreatment.value = null;
};

const addTreatment = async () => {
  try {
    const customId = 'treatment-' + Date.now();
    const treatmentData = {
      ...currentTreatment.value,
      id: customId,
      archived: false,
      archivedAt: null
    };

    const treatmentRef = await addDoc(collection(database, 'treatments'), treatmentData);
    treatments.value.push(treatmentData);
    
    closeModal();
    showNotification('Treatment added successfully!');
  } catch (error) {
    console.error('Failed to add treatment:', error);
    showNotification('Failed to add treatment: ' + error.message, 'error');
  }
};

const editTreatment = (treatment) => {
  editingTreatment.value = treatment;
  currentTreatment.value = { ...treatment };
  openModal();
};

const updateTreatment = async () => {
  try {
    const treatmentsRef = collection(database, 'treatments');
    const q = query(treatmentsRef, where("id", "==", editingTreatment.value.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Treatment not found');
    }

    const docRef = doc(database, 'treatments', querySnapshot.docs[0].id);
    await updateDoc(docRef, currentTreatment.value);
    
    const index = treatments.value.findIndex(t => t.id === editingTreatment.value.id);
    treatments.value[index] = { ...currentTreatment.value, id: editingTreatment.value.id };
    closeModal();
    showNotification('Treatment updated successfully!');
  } catch (error) {
    console.error('Failed to update treatment:', error);
    showNotification('Failed to update treatment: ' + error.message, 'error');
  }
};

const toggleArchiveTreatment = async (treatment) => {
  try {
    const treatmentsRef = collection(database, 'treatments');
    const q = query(treatmentsRef, where("id", "==", treatment.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Treatment not found');
    }

    const docRef = doc(database, 'treatments', querySnapshot.docs[0].id);
    const newArchivedStatus = !treatment.archived;
    
    await updateDoc(docRef, {
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    });
    
    const index = treatments.value.findIndex(t => t.id === treatment.id);
    treatments.value[index] = { 
      ...treatment, 
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    };
    
    showNotification(
      newArchivedStatus 
        ? 'Treatment archived successfully.'
        : 'Treatment restored successfully.'
    );
  } catch (error) {
    console.error('Failed to update archive status:', error);
    showNotification('Failed to update archive status: ' + error.message, 'error');
  }
};

const fetchTreatments = async () => {
  try {
    const treatmentsCollection = collection(database, 'treatments');
    const treatmentSnapshot = await getDocs(treatmentsCollection);
    treatments.value = treatmentSnapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      name: doc.data().name,
      description: doc.data().description,
      price: doc.data().price,
      services: doc.data().services,
      archived: doc.data().archived || false,
      archivedAt: doc.data().archivedAt || null
    }));
  } catch (error) {
    console.error('Error fetching treatments:', error);
    showNotification('Failed to fetch treatments: ' + error.message, 'error');
  }
};

const fetchServices = async () => {
  try {
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    showNotification('Failed to fetch services: ' + error.message, 'error');
  }
};

onMounted(() => {
  fetchTreatments();
  fetchServices();
});

const filteredTreatments = computed(() => {
  return treatments.value.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesPrice = !priceFilter.value || treatment.price === parseFloat(priceFilter.value);
    const matchesArchiveStatus = treatment.archived === showArchived.value;
    return matchesSearch && matchesPrice && matchesArchiveStatus;
  });
});

const paginatedTreatments = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTreatments.value.slice(startIndex, endIndex);
});

const totalTreatments = computed(() => filteredTreatments.value.length);

const totalPages = computed(() => Math.ceil(totalTreatments.value / itemsPerPage));

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const getServiceNameById = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId);
  return service ? service.name : '';
};
</script>

<style scoped>
.admintreatment-container {
  height: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.admintreatment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.admintreatment-header h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.admintreatment-add-button {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-plus-icon {
  font-size: 1rem;
}

.admintreatment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.admintreatment-tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-tab-button.admintreatment-active {
  color: #8b5cf6;
  border-bottom: 2px solid #8b5cf6;
  font-weight: 500;
}

.admintreatment-search-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.admintreatment-search-input, .admintreatment-price-filter {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
}

.admintreatment-search-container {
  flex: 1;
}

.admintreatment-filter-container {
  width: 200px;
}

.admintreatment-treatments-table {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.admintreatment-table-header {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(200px, 2fr) 100px 150px 100px;
  background: #8b5cf6;
  padding: 0.75rem;
  position: sticky;
  top: 0;
}

.admintreatment-table-header > div {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.admintreatment-table-row {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(200px, 2fr) 100px 150px 100px;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  font-size: 0.875rem;
}

.admintreatment-table-row:hover {
  background: #f9fafb;
}

.admintreatment-icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admintreatment-icon-button:hover {
  background-color: #f3f4f6;
}

.admintreatment-edit-icon {
  color: #8b5cf6;
}

.admintreatment-restore-icon {
  color: #10b981;
}

.admintreatment-archive-icon {
  color: #6b7280;
}

.admintreatment-icon-button.admintreatment-restore:hover {
  background-color: #d1fae5;
}

.admintreatment-icon-button.admintreatment-archive:hover {
  background-color: #f3f4f6;
}

.admintreatment-table-body {
  flex: 1;
  overflow-y: auto;
}

.admintreatment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.admintreatment-modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.admintreatment-modal-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.admintreatment-form-group {
  margin-bottom: 1rem;
}

.admintreatment-form-group label {
  display: block;
  margin-bottom: 0.25rem;
  color: #374151;
  font-size: 0.875rem;
}

.admintreatment-form-group input,
.admintreatment-form-group textarea,
.admintreatment-form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
}

.admintreatment-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.admintreatment-submit-button, .admintreatment-cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-submit-button {
  background: #8b5cf6;
  color: white;
}

.admintreatment-cancel-button {
  background: #e5e7eb;
  color: #374151;
}

.admintreatment-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.admintreatment-pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.admintreatment-pagination-button {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admintreatment-no-treatments {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.admintreatment-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.admintreatment-search-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
}

.admintreatment-search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  width: 300px;
}

.admintreatment-treatment-name {
  padding-right: 2rem;
}

.admintreatment-price {
  text-align: center;
}

.admintreatment-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.admintreatment-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  color: #374151;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  width: 100%;
}

.admintreatment-notification-icon {
  flex-shrink: 0;
}

.admintreatment-notification-content {
  flex-grow: 1;
}

.admintreatment-notification-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.admintreatment-notification-message {
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.admintreatment-notification.success {
  border-left: 4px solid #7c3aed;
}

.admintreatment-notification.success .admintreatment-notification-icon {
  color: #7c3aed;
}

.admintreatment-notification.error {
  border-left: 4px solid #ef4444;
}

.admintreatment-notification.error .admintreatment-notification-icon {
  color: #ef4444;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style>