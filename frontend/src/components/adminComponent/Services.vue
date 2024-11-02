<template>
  <div class="container">
    <div class="header">
      <h1>Service Management</h1>
    </div>

    <!-- Flex Container for Add Button and Search Bar -->
    <div class="header-actions">
      <!-- Add Service Button -->
      <button @click="openModal" class="add-button">Add New Service</button>
      
      <!-- Search Input -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search services..." 
          class="search-input" 
        />
      </div>
    </div>

    <!-- Services List Table -->
    <div class="services-list card">
      <h2>Existing Services</h2>
      <table v-if="filteredServices.length > 0" class="services-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td>{{ service.name }}</td>
            <td>{{ service.description }}</td>
            <td>₱{{ service.price.toFixed(2) }}</td> <!-- Changed currency to Peso -->
            <td>
              <span :class="service.availability === 'available' ? 'available' : 'unavailable'">
                {{ service.availability }}
              </span>
            </td>
            <td>
              <div class="service-actions">
                <button @click="editService(service)" aria-label="Edit Service" class="edit-button">Edit</button>
                <button @click="deleteService(service.id)" aria-label="Delete Service" class="delete-button">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-services">No services available.</p>
    </div>

    <!-- Add Service Modal -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h3>Add New Service</h3>
        <form @submit.prevent="addService" class="service-form">
          <div class="form-group">
            <label for="serviceName">Service Name</label>
            <input v-model="newService.name" type="text" id="serviceName" placeholder="Enter service name" required />
          </div>
          <div class="form-group">
            <label for="serviceDescription">Description</label>
            <textarea v-model="newService.description" id="serviceDescription" rows="3" placeholder="Enter service description" required></textarea>
          </div>
          <div class="form-group">
            <label for="servicePrice">Price</label>
            <input v-model.number="newService.price" type="number" id="servicePrice" step="0.01" min="0" placeholder="Enter service price" required />
          </div>
          <div class="form-group">
            <label for="serviceAvailability">Availability</label>
            <select v-model="newService.availability" id="serviceAvailability" required>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
            <button type="submit" class="submit-button">Add Service</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Service Modal -->
    <div v-if="editingService" class="modal">
      <div class="modal-content">
        <h3>Edit Service</h3>
        <form @submit.prevent="updateService" class="service-form">
          <div class="form-group">
            <label for="editServiceName">Service Name</label>
            <input v-model="editingService.name" type="text" id="editServiceName" placeholder="Enter service name" required />
          </div>
          <div class="form-group">
            <label for="editServiceDescription">Description</label>
            <textarea v-model="editingService.description" id="editServiceDescription" rows="3" placeholder="Enter service description" required></textarea>
          </div>
          <div class="form-group">
            <label for="editServicePrice">Price</label>
            <input v-model.number="editingService.price" type="number" id="editServicePrice" step="0.01" min="0" placeholder="Enter service price" required />
          </div>
          <div class="form-group">
            <label for="editServiceAvailability">Availability</label>
            <select v-model="editingService.availability" id="editServiceAvailability" required>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
            <button type="submit" class="submit-button">Update Service</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { database } from '../../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  name: 'ServiceManagement',
  setup() {
    const newService = ref({
      name: '',
      description: '',
      price: 0,
      availability: 'available',
    });

    const services = ref([]);
    const editingService = ref(null);
    const isModalOpen = ref(false);
    const searchQuery = ref('');

    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
      newService.value = { name: '', description: '', price: 0, availability: 'available' };
    };

    const addService = async () => {
      const isFormValid = newService.value.name && newService.value.description && newService.value.price >= 0;

      if (isFormValid) {
        const serviceData = {
          name: newService.value.name,
          description: newService.value.description,
          price: newService.value.price,
          availability: newService.value.availability,
        };

        try {
          const serviceRef = await addDoc(collection(database, 'services'), serviceData);
          services.value.push({ ...serviceData, id: serviceRef.id });
          closeModal();
          alert('Service added successfully!');
        } catch (error) {
          console.error('Failed to add service:', error);
          alert('Failed to add service: ' + error.message);
        }
      } else {
        alert('Please fill in all fields correctly.');
      }
    };

    const editService = (service) => {
      editingService.value = { ...service };
    };

    const updateService = async () => {
      const index = services.value.findIndex(service => service.id === editingService.value.id);
      if (index !== -1) {
        try {
          const serviceRef = doc(database, 'services', editingService.value.id);
          await updateDoc(serviceRef, {
            name: editingService.value.name,
            description: editingService.value.description,
            price: editingService.value.price,
            availability: editingService.value.availability,
          });

          services.value[index] = { ...editingService.value };
          editingService.value = null;
          alert('Service updated successfully!');
        } catch (error) {
          console.error('Failed to update service:', error);
          alert('Failed to update service: ' + error.message);
        }
      }
    };

    const deleteService = async (id) => {
      try {
        const serviceRef = doc(database, 'services', id);
        await deleteDoc(serviceRef);
        services.value = services.value.filter(service => service.id !== id);
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service: ' + error.message);
      }
    };

    const cancelEdit = () => {
      editingService.value = null;
    };

    const fetchServices = async () => {
      try {
        const servicesCollection = collection(database, 'services');
        const serviceSnapshot = await getDocs(servicesCollection);
        const servicesList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        services.value = servicesList;
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    const filteredServices = computed(() => {
      if (!searchQuery.value) {
        return services.value;
      }
      return services.value.filter(service =>
        service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    fetchServices();

    return {
      newService,
      services,
      editingService,
      isModalOpen,
      searchQuery,
      openModal,
      closeModal,
      addService,
      editService,
      updateService,
      deleteService,
      cancelEdit,
      filteredServices,
    };
  },
};
</script>

<style scoped>
/* Enhanced styles */

.header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between; /* Distribute space between the button and search bar */
  align-items: center; /* Center items vertically */
  margin-bottom: 20px; /* Space below the header actions */
}

.add-button {
  margin-bottom: 0; /* Reset margin */
}

.search-container {
  margin-bottom: 0; /* Reset margin */
}

.search-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Poppins';
}

.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif; /* Apply Poppins font */
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.add-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #0056b3;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.services-table th,
.services-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.services-table th {
  background-color: #f2f2f2;
}

.available {
  color: green;
}

.unavailable {
  color: red;
}

.service-actions {
  display: flex;
  gap: 5px;
}

.edit-button,
.delete-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button {
  background-color: #dc3545;
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
  width: 400px;
}

.service-form .form-group {
  margin-bottom: 15px;
}

.service-form label {
  display: block;
  margin-bottom: 5px;
}

.service-form input,
.service-form select,
.service-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  margin-right: 10px;
  background-color: #ccc;
}
</style>
