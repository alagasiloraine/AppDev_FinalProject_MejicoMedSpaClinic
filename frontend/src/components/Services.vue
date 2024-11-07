  <template>
    <div class="container">
      <div class="header">
        <h1>Service List</h1>
      </div>

      <div class="header-actions">
        <button @click="openModal" class="add-button">Add New Service</button>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search services..." 
            class="search-input" 
          />
        </div>
      </div>

      <div class="services-list card">
        <h2>Existing Services</h2>
        <ul v-if="filteredServices.length > 0" class="services-list">
          <li v-for="service in filteredServices" :key="service.id" class="service-item">
            {{ service.name }}
            <div class="service-actions">
              <button @click="editService(service)" class="edit-button">Edit</button>
              <button @click="deleteService(service.id)" class="delete-button">Delete</button>
            </div>
          </li>
        </ul>
        <p v-else class="no-services">No services available.</p>
      </div>

      <!-- Add/Edit Service Modal -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <h3>{{ editingService ? 'Edit Service' : 'Add New Service' }}</h3>
          <form @submit.prevent="editingService ? updateService() : addService()" class="service-form">
            <div class="form-group">
              <label for="serviceName">Service Name</label>
              <input v-model="currentService.name" type="text" id="serviceName" required />
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
              <button type="submit" class="submit-button">{{ editingService ? 'Update' : 'Add' }} Service</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, computed } from 'vue';
  import { db } from '../firebase';
  import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

  const services = ref([]);
  const currentService = ref({ name: '' });
  const editingService = ref(null);
  const isModalOpen = ref(false);
  const searchQuery = ref('');

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    currentService.value = { name: '' };
    editingService.value = null;
  };

  const addService = async () => {
  try {
    // Generate a custom ID or you can use Firestore's auto ID
    const customId = 'service-' + Date.now(); // Example of custom ID based on timestamp

    // Add the service with the custom ID
    const serviceRef = await addDoc(collection(db, 'services'), {
      ...currentService.value,
      id: customId, // Include the custom ID here
    });

    // Push the service to the local services array with the generated ID
    services.value.push({ ...currentService.value, id: customId });
    
    closeModal();
    alert('Service added successfully!');
  } catch (error) {
    console.error('Failed to add service:', error);
    alert('Failed to add service: ' + error.message);
  }
};


  const editService = (service) => {
    editingService.value = service;
    currentService.value = { name: service.name };
    openModal();
  };

  const updateService = async () => {
    try {
      const serviceRef = doc(db, 'services', editingService.value.id);
      await updateDoc(serviceRef, currentService.value);
      const index = services.value.findIndex(s => s.id === editingService.value.id);
      services.value[index] = { ...currentService.value, id: editingService.value.id };
      closeModal();
      alert('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      alert('Failed to update service: ' + error.message);
    }
  };

  const deleteService = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        services.value = services.value.filter(service => service.id !== id);
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service: ' + error.message);
      }
    }
  };

  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const serviceSnapshot = await getDocs(servicesCollection);
      services.value = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const filteredServices = computed(() => {
    if (!searchQuery.value) return services.value;
    return services.value.filter(service =>
      service.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  fetchServices();
  </script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button,
.edit-button,
.delete-button,
.submit-button,
.cancel-button {
  font-family: 'Poppins', sans-serif;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px 20px;
  color: #fff;
  transition: background-color 0.3s;
}

.add-button {
  background-color: #007bff;
}

.add-button:hover {
  background-color: #0056b3;
}

.edit-button {
  background-color: #28a745;
}

.delete-button {
  background-color: #dc3545;
}

.submit-button {
  background-color: #007bff;
}

.submit-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  margin-right: 10px;
}

.search-container {
  flex-grow: 1;
  margin-left: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Poppins', sans-serif;
}

.services-list {
  list-style-type: none;
  padding: 0;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.service-actions {
  display: flex;
  gap: 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  box-sizing: border-box;
}

.modal-content h3 {
  text-align: center;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.service-form .form-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 15px;
}

.service-form label {
  font-family: 'Poppins', sans-serif;
  margin-bottom: 5px;
}

.service-form input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
}
</style>