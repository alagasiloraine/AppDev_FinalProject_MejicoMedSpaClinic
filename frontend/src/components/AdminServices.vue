<template>
  <div class="adminservice-container">
    <div class="adminservice-header">
      <h1>Services Management</h1>
      <button @click="openModal" class="adminservice-add-button">
        <Plus class="adminservice-plus-icon" size="18" />
        Add New Service
      </button>
    </div>

    <div class="adminservice-tabs">
      <button 
        :class="['adminservice-tab-button', { 'adminservice-active': !showArchived }]"
        @click="showArchived = false"
      >
        Active Services
      </button>
      <button 
        :class="['adminservice-tab-button', { 'adminservice-active': showArchived }]"
        @click="showArchived = true"
      >
        Archived Services
      </button>
    </div>

    <div class="adminservice-search-controls">
      <div class="adminservice-search-wrapper">
        <Clock class="adminservice-search-icon" />
        <select v-model="durationFilter" class="adminservice-select">
          <option value="">Filter by duration</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>
      <div class="adminservice-search-wrapper">
        <Search class="adminservice-search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search services..." 
          class="adminservice-search-input"
        />
      </div>
      <button @click="applyFilters" class="adminservice-btn adminservice-btn-primary">
        <Filter class="adminservice-btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="adminservice-btn adminservice-btn-secondary">
        <RotateCcw class="adminservice-btn-icon" />
        Reset
      </button>
    </div>

    <div class="adminservice-services-table">
      <div class="adminservice-table-header">
        <div class="adminservice-service-image">Image</div>
        <div class="adminservice-service-name">Service Name</div>
        <div class="adminservice-duration">Duration</div>
        <div class="adminservice-actions">Actions</div>
      </div>
      
      <div v-if="loading" class="adminservice-loading-state">
        <div class="adminservice-spinner"></div>
        <p class="adminservice-loading-text">Loading packages...</p>
      </div>
      <div v-else-if="filteredServices.length > 0" class="adminservice-table-body">
        <div v-for="service in paginatedServices" :key="service.id" class="adminservice-table-row">
          <div class="adminservice-service-image">
            <img 
              v-if="service.imagePath" 
              :src="service.imagePath" 
              alt="Service image"
              class="adminservice-table-image"
            />
            <div v-else class="adminservice-no-image">
              <ImageIcon size="24" class="adminservice-placeholder-icon" />
            </div>
          </div>
          <div class="adminservice-service-name">{{ service.name }}</div>
          <div class="adminservice-duration">{{ service.duration }} min</div>
          <div class="adminservice-actions">
            <button 
              v-if="!service.archived"
              @click="editService(service)" 
              class="adminservice-icon-button adminservice-edit"
              title="Edit service"
            >
              <Pencil class="adminservice-edit-icon" size="18" />
            </button>
            <button 
              @click="toggleArchiveService(service)" 
              class="adminservice-icon-button"
              :class="service.archived ? 'adminservice-restore' : 'adminservice-archive'"
              :title="service.archived ? 'Restore service' : 'Archive service'"
            >
              <component 
                :is="service.archived ? RotateCcw : Archive" 
                :class="service.archived ? 'adminservice-restore-icon' : 'adminservice-archive-icon'"
                size="18"
              />
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="filteredServices.length === 0" class="adminservice-no-services">
        {{ showArchived ? 'No archived services found.' : 'No active services found.' }}
      </div>
    </div>

    <div class="adminservice-pagination">
      <span>Showing {{ paginatedServices.length }} of {{ totalServices }} services</span>
      <div class="adminservice-pagination-buttons">
        <button 
          @click="prevPage" 
          class="adminservice-pagination-button" 
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          class="adminservice-pagination-button"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <div v-if="isModalOpen" class="adminservice-modal">
      <div class="adminservice-modal-overlay" @click="closeModal"></div>
      <div class="adminservice-modal-content">
        <div class="adminservice-modal-header">
          <h3>{{ editingService ? 'Edit Service' : 'Add New Service' }}</h3>
          <button @click="closeModal" class="adminservice-modal-close">
            <X size="20" />
          </button>
        </div>
        <form @submit.prevent="editingService ? updateService() : addService()" class="adminservice-service-form">
          <div class="adminservice-form-row">
            <div class="adminservice-form-group">
              <label for="serviceName">Service Name</label>
              <div class="adminservice-input-wrapper">
                <input 
                  v-model="currentService.name" 
                  type="text" 
                  id="serviceName" 
                  required 
                  placeholder="Enter service name"
                />
                <Clipboard class="adminservice-input-icon" size="16" />
              </div>
            </div>
            <div class="adminservice-form-group">
              <label for="serviceDuration">Duration (minutes)</label>
              <div class="adminservice-input-wrapper">
                <input 
                  v-model="currentService.duration" 
                  type="number" 
                  id="serviceDuration" 
                  required 
                  placeholder="Enter duration"
                  min="15"
                  step="15"
                />
                <Clock class="adminservice-input-icon" size="16" />
              </div>
            </div>
          </div>
          
          <div class="adminservice-form-group">
            <label for="serviceImage">Service Image</label>
            <div class="adminservice-image-upload">
              <div 
                class="adminservice-image-preview"
                :class="{ 'has-image': imagePreview }"
                @click="triggerFileInput"
              >
                <img v-if="imagePreview" :src="imagePreview" alt="Service preview" />
                <div v-else class="adminservice-upload-placeholder">
                  <ImageIcon class="adminservice-placeholder-icon" size="32" />
                  <span>Preview area</span>
                </div>
              </div>
              <button 
                type="button" 
                class="adminservice-upload-button" 
                @click="triggerFileInput"
              >
                <UploadCloud class="adminservice-button-icon" size="16" />
                Upload Image
              </button>
              <input
                type="file"
                id="serviceImage"
                ref="fileInput"
                accept="image/*"
                @change="handleImageUpload"
                class="adminservice-file-input"
              />
              <span v-if="selectedFile" class="adminservice-file-name">
                Selected: {{ selectedFile.name }}
              </span>
            </div>
          </div>

          <div class="adminservice-modal-actions">
            <button type="button" @click="closeModal" class="adminservice-cancel-button">
              <X size="16" />
              Cancel
            </button>
            <button type="submit" class="adminservice-submit-button">
              <Check size="16" />
              {{ editingService ? 'Update' : 'Add' }} Service
            </button>
          </div>
        </form>
      </div>
    </div>

    <transition name="fade">
      <div 
        v-if="notification.show" 
        class="adminservice-notification" 
        :class="[notification.type, { 'is-loading': notification.loading }]"
      >
        <div class="adminservice-notification-icon">
          <Loader v-if="notification.loading" class="animate-spin" size="24" />
          <CheckCircle2 v-else-if="notification.type === 'success'" size="24" />
          <XCircle v-else size="24" />
        </div>
        <div class="adminservice-notification-content">
          <h4 class="adminservice-notification-title">
            {{ notification.loading ? 'Processing' : notification.type === 'success' ? 'Success' : 'Error' }}
          </h4>
          <p class="adminservice-notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Search, Pencil, Archive, RotateCcw, Plus, CheckCircle2, XCircle, Clock, Filter, X, Check, Clipboard, ImageIcon, UploadCloud, Loader } from 'lucide-vue-next';

const services = ref([]);
const currentService = ref({ name: '', duration: 60, imagePath: null });
const editingService = ref(null);
const isModalOpen = ref(false);
const searchQuery = ref('');
const durationFilter = ref('');
const showArchived = ref(false);
const currentPage = ref(1);
const itemsPerPage = 4;
const loading = ref(true); // Added loading state

const notification = ref({ show: false, message: '', type: '', loading: false });
const selectedFile = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

const showNotification = async (message, type = 'success') => {
  notification.value = { show: true, message, type, loading: false };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const showLoadingNotification = (message) => {
  notification.value = { show: true, message, type: 'loading', loading: true };
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentService.value = { name: '', duration: 60, imagePath: null };
  editingService.value = null;
  selectedFile.value = null;
  imagePreview.value = null;
};

const addService = async () => {
  showLoadingNotification('Adding service...');
  try {
    let imagePath = '';
    
    if (selectedFile.value) {
      const fileName = `service-${Date.now()}-${selectedFile.value.name}`;
      const formData = new FormData();
      formData.append('image', selectedFile.value);
      formData.append('fileName', fileName);
      formData.append('serviceId', '');

      const uploadResponse = await fetch('http://localhost:5000/api/upload-service-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const responseData = await uploadResponse.json();
      if (!responseData.success || !responseData.path) {
        throw new Error('Failed to upload image: ' + (responseData.error || 'Unknown error'));
      }
      imagePath = responseData.path;
    }

    const customId = 'service-' + Date.now();
    const serviceData = {
      ...currentService.value,
      id: customId,
      archived: false,
      archivedAt: null,
      imagePath // This will now contain the correct path
    };

    const serviceRef = await addDoc(collection(database, 'services'), serviceData);
    services.value.push(serviceData);
    
    closeModal();
    showNotification('Service added successfully!');
  } catch (error) {
    console.error('Error details:', error);
    showNotification('Failed to add service: ' + error.message, 'error');
  }
};

const editService = (service) => {
  editingService.value = service;
  currentService.value = { ...service };
  imagePreview.value = service.imagePath;
  openModal();
};

const updateService = async () => {
  showLoadingNotification('Updating service...');
  try {
    let imagePath = currentService.value.imagePath;

    if (selectedFile.value) {
      const fileName = `service-${Date.now()}-${selectedFile.value.name}`;
      const formData = new FormData();
      formData.append('image', selectedFile.value);
      formData.append('fileName', fileName);
      formData.append('serviceId', editingService.value.id);

      const uploadResponse = await fetch('http://localhost:5000/api/upload-service-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const responseData = await uploadResponse.json();
      if (!responseData.success || !responseData.path) {
        throw new Error('Failed to upload image: ' + (responseData.error || 'Unknown error'));
      }
      imagePath = responseData.path;
    }

    const servicesRef = collection(database, 'services');
    const q = query(servicesRef, where("id", "==", editingService.value.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Service not found');
    }

    const docRef = doc(database, 'services', querySnapshot.docs[0].id);
    const updatedData = { ...currentService.value, imagePath };
    await updateDoc(docRef, updatedData);
    
    const index = services.value.findIndex(s => s.id === editingService.value.id);
    services.value[index] = { ...updatedData, id: editingService.value.id };
    
    closeModal();
    showNotification('Service updated successfully!');
  } catch (error) {
    console.error('Error details:', error);
    showNotification('Failed to update service: ' + error.message, 'error');
  }
};

const toggleArchiveService = async (service) => {
  showLoadingNotification('Updating archive status...');
  try {
    const servicesRef = collection(database, 'services');
    const q = query(servicesRef, where("id", "==", service.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Service not found');
    }

    const docRef = doc(database, 'services', querySnapshot.docs[0].id);
    const newArchivedStatus = !service.archived;
    
    await updateDoc(docRef, {
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    });
    
    const index = services.value.findIndex(s => s.id === service.id);
    services.value[index] = { 
      ...service, 
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    };
    
    showNotification(
      newArchivedStatus 
        ? 'Service archived successfully.'
        : 'Service restored successfully.'
    );
  } catch (error) {
    console.error('Failed to update archive status:', error);
    showNotification('Failed to update archive status: ' + error.message, 'error');
  }
};

const fetchServices = async () => {
  loading.value = true; // Set loading to true before fetching
  try{
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      name: doc.data().name,
      duration: doc.data().duration || 60,
      archived: doc.data().archived || false,
      archivedAt: doc.data().archivedAt || null,
      imagePath: doc.data().imagePath || null
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    showNotification('Failed to fetch services: ' + error.message, 'error');
  } finally {
    loading.value = false; // Set loading to false after fetching, regardless of success or failure
  }
};

onMounted(() => {
  fetchServices();
});

const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesDuration = !durationFilter.value || service.duration === parseInt(durationFilter.value);
    const matchesArchiveStatus = service.archived === showArchived.value;
    return matchesSearch && matchesDuration && matchesArchiveStatus;
  });
});

const paginatedServices = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredServices.value.slice(startIndex, endIndex);
});

const totalServices = computed(() => filteredServices.value.length);

const totalPages = computed(() => Math.ceil(totalServices.value / itemsPerPage));

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

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  durationFilter.value = '';
  showArchived.value = false;
  currentPage.value = 1;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Image size should be less than 5MB', 'error');
    return;
  }

  // Validate file type
  if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
    showNotification('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
    return;
  }

  selectedFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.onerror = () => {
    showNotification('Failed to read image file', 'error');
    selectedFile.value = null;
    imagePreview.value = null;
  };
  reader.readAsDataURL(file);
};

const triggerFileInput = () => {
  fileInput.value.click();
};
</script>

<style scoped>
.adminservice-container {
  height: 650px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.adminservice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.adminservice-header h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.adminservice-add-button {
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

.adminservice-plus-icon {
  font-size: 1rem;
}

.adminservice-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.adminservice-tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
}

.adminservice-tab-button.adminservice-active {
  color: #8b5cf6;
  border-bottom: 2px solid #8b5cf6;
  font-weight: 500;
}

.adminservice-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.adminservice-search-wrapper {
  position: relative;
  flex: 1;
}

.adminservice-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.adminservice-select,
.adminservice-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  transition: all 0.2s;
}

.adminservice-select:focus,
.adminservice-search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.adminservice-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.adminservice-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.adminservice-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.adminservice-btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.adminservice-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.adminservice-services-table {
  flex: 1;
  min-height: 400px; /* Increased height */
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.adminservice-table-header,
.adminservice-table-row {
  display: grid;
  grid-template-columns: 100px 1.5fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  align-items: center;
}

.adminservice-table-header {
  background: #8b5cf6;
  position: sticky;
  top: 0;
}

.adminservice-table-header > div {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.adminservice-table-header > div.adminservice-actions {
  text-align: right;
  padding-right: 1.5rem;
}

.adminservice-table-row {
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.adminservice-table-row:hover {
  background: #f9fafb;
}

.adminservice-icon-button {
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

.adminservice-icon-button:hover {
  background-color: #f3f4f6;
}

.adminservice-edit-icon {
  color: #8b5cf6;
}

.adminservice-restore-icon {
  color: #10b981;
}

.adminservice-archive-icon {
  color: #6b7280;
}

.adminservice-icon-button.adminservice-restore:hover {
  background-color: #d1fae5;
}

.adminservice-icon-button.adminservice-archive:hover {
  background-color: #f3f4f6;
}

.adminservice-table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.adminservice-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.adminservice-pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.adminservice-pagination-button {
  padding: 0.5rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.adminservice-pagination-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.adminservice-pagination-button:not(:disabled):hover {
  background: #7c3aed;
}

.adminservice-no-services {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.adminservice-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  color: #374151;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 300px;
  max-width: 400px;
  border-left: 4px solid transparent;
  transform-origin: top right;
}

.adminservice-notification.success {
  border-left-color: #10b981;
  background-color: #f0fdf4;
}

.adminservice-notification.success .adminservice-notification-icon {
  color: #10b981;
}

.adminservice-notification.error {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.adminservice-notification.error .adminservice-notification-icon {
  color: #ef4444;
}

.adminservice-notification.is-loading {
  border-left-color: #8b5cf6;
  background-color: #f5f3ff;
}

.adminservice-notification.is-loading .adminservice-notification-icon {
  color: #8b5cf6;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.adminservice-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 1rem; /* Added padding to keep modal within viewport */
}

.adminservice-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.adminservice-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  position: relative;
  z-index: 51;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column; /* Removed overflow-y: auto; */
}

.adminservice-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
}

.adminservice-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.adminservice-modal-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.adminservice-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.adminservice-service-form {
  padding: 1.25rem; /* Updated padding */
}

.adminservice-form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem; /* Updated margin */
}

.adminservice-form-group {
  flex: 1;
}

.adminservice-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.adminservice-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.adminservice-input-wrapper input {
  width: 100%;
  padding:0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius:8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f9fafb;
}

.adminservice-input-wrapper input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.adminservice-input-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.adminservice-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.adminservice-submit-button,
.adminservice-cancel-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.adminservice-submit-button {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  border: none;
}

.adminservice-submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

.adminservice-cancel-button {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.adminservice-cancel-button:hover {
  background: #e5e7eb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .adminservice-search-controls {
    flex-direction: column;
  }

  .adminservice-search-wrapper {
    width: 100%;
  }
}

.adminservice-image-upload {
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.adminservice-image-preview {
  height: 200px;
  width: 100%;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.adminservice-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.adminservice-image-preview.has-image {
  border-color: #8b5cf6;
}

.adminservice-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.adminservice-upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.adminservice-upload-button:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.adminservice-button-icon {
  width: 1rem;
  height: 1rem;
}

.adminservice-file-input {
  display: none;
}

.adminservice-file-name {
  font-size: 0.875rem;
  color: #6b7280;
  word-break: break-all;
}

.adminservice-service-image {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.adminservice-table-image,
.adminservice-no-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.adminservice-table-image:hover,
.adminservice-no-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.adminservice-service-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 0.5rem;
}

.adminservice-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.adminservice-loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.adminservice-spinner {
  width: 40px;
  height: 40px;
  position: relative;
  margin-bottom: 1rem;
}

.adminservice-spinner::before,
.adminservice-spinner::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #8b5cf6;
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

.adminservice-spinner::after {
  animation-delay: -1s;
}

.adminservice-loading-text {
  color: #8b5cf6;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

