<template>
    <div class="container">
        <div class="header">
            <h1>Treatment Management</h1>
        </div>

        <div class="header-actions">
            <button @click="openModal" class="add-button">Add New Treatment</button>
            <div class="search-container">
                <input type="text" v-model="searchQuery" placeholder="Search treatments..." class="search-input" />
            </div>
        </div>

        <div class="treatments-list card">
            <h2>Existing Treatments</h2>
            <table v-if="filteredTreatments.length > 0" class="treatments-table">
                <thead>
                    <tr>
                        <th>Treatment Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Services</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(treatment, index) in filteredTreatments" :key="`${treatment.id}-${index}`">
                        <td>{{ treatment.name }}</td>
                        <td>{{ treatment.description }}</td>
                        <td>₱{{ treatment.price.toFixed(2) }}</td>
                        <td>
                            <ul class="services-list">
                                <li>{{ getServiceNameById(treatment.services) }}</li>
                            </ul>
                        </td>
                        <td>
                            <div class="treatment-actions">
                                <button @click="editTreatment(treatment)" class="edit-button">Edit</button>
                                <button @click="deleteTreatment(treatment.id)" class="delete-button">Delete</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="no-treatments">No treatments available.</p>
        </div>

        <!-- Add Treatment Modal -->
        <div v-if="isModalOpen" class="modal">
            <div class="modal-content">
                <h3>{{ editingTreatment ? 'Edit Treatment' : 'Add New Treatment' }}</h3>
                <form @submit.prevent="editingTreatment ? updateTreatment() : addTreatment()" class="treatment-form">
                    <div class="form-group">
                        <label for="treatmentName">Treatment Name</label>
                        <input v-model="currentTreatment.name" type="text" id="treatmentName" name="treatmentName" required />
                    </div>

                    <div class="form-group">
                        <label for="treatmentDescription">Description</label>
                        <textarea v-model="currentTreatment.description" id="treatmentDescription" name="treatmentDescription" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="treatmentPrice">Price</label>
                        <input v-model.number="currentTreatment.price" type="number" id="treatmentPrice" name="treatmentPrice" step="0.01" min="0" required />
                    </div>

                    <div class="form-group">
                        <label for="treatmentServices">Select Service</label>
                        <!-- Single-select dropdown for services -->
                        <select v-model="currentTreatment.services" id="treatmentServices" name="treatmentServices" required>
                            <option v-for="service in services" :key="service.id" :value="service.id">
                                {{ service.name }}
                            </option>
                        </select>
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                        <button type="submit" class="submit-button">{{ editingTreatment ? 'Update' : 'Add' }} Treatment</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const treatments = ref([]);
const services = ref([]);
const currentTreatment = ref({
    name: '',
    description: '',
    price: 0,
    services: '' // Store only one service ID here
});
const editingTreatment = ref(null);
const isModalOpen = ref(false);
const searchQuery = ref('');

// Open modal to add or edit treatment
const openModal = () => {
    isModalOpen.value = true;
};

// Close modal and reset form
const closeModal = () => {
    isModalOpen.value = false;
    currentTreatment.value = {
        name: '',
        description: '',
        price: 0,
        services: '' // Reset to empty string for single service
    };
    editingTreatment.value = null;
};

// Fetch available services from Firestore
const fetchServices = async () => {
    try {
        const servicesCollection = collection(db, 'services');
        const serviceSnapshot = await getDocs(servicesCollection);
        if (serviceSnapshot.empty) {
            console.warn('No services found in Firestore.');
        }

        services.value = serviceSnapshot.docs.map(doc => ({
            name: doc.data().name,
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching services:', error);
        alert('Failed to fetch services. Please try again.');
    }
};

// Get service name by matching service ID
const getServiceNameById = (serviceId) => {
    const service = services.value.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
};

// Add new treatment to Firestore
const addTreatment = async () => {
    try {
        const treatmentRef = await addDoc(collection(db, 'treatments'), {
            ...currentTreatment.value,
            services: currentTreatment.value.services // Store only the selected service ID
        });
        treatments.value.push({ ...currentTreatment.value, id: treatmentRef.id });
        closeModal();
        alert('Treatment added successfully!');
    } catch (error) {
        console.error('Failed to add treatment:', error);
        alert('Failed to add treatment: ' + error.message);
    }
};

// Edit an existing treatment
const editTreatment = (treatment) => {
    editingTreatment.value = treatment;
    currentTreatment.value = { ...treatment };
    openModal();
};

// Update treatment in Firestore
const updateTreatment = async () => {
    try {
        const treatmentRef = doc(db, 'treatments', editingTreatment.value.id);
        await updateDoc(treatmentRef, {
            ...currentTreatment.value,
            services: currentTreatment.value.services // Store only the selected service ID
        });
        const index = treatments.value.findIndex(t => t.id === editingTreatment.value.id);
        treatments.value[index] = { ...currentTreatment.value, id: editingTreatment.value.id };
        closeModal();
        alert('Treatment updated successfully!');
    } catch (error) {
        console.error('Failed to update treatment:', error);
        alert('Failed to update treatment: ' + error.message);
    }
};

// Delete treatment from Firestore
const deleteTreatment = async (id) => {
    if (confirm('Are you sure you want to delete this treatment?')) {
        try {
            await deleteDoc(doc(db, 'treatments', id));
            treatments.value = treatments.value.filter(treatment => treatment.id !== id);
            alert('Treatment deleted successfully!');
        } catch (error) {
            console.error('Failed to delete treatment:', error);
            alert('Failed to delete treatment: ' + error.message);
        }
    }
};

// Fetch treatments from Firestore
const fetchTreatments = async () => {
    try {
        const treatmentsCollection = collection(db, 'treatments');
        const treatmentSnapshot = await getDocs(treatmentsCollection);
        treatments.value = treatmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching treatments:', error);
    }
};

// Filter treatments based on search query
const filteredTreatments = computed(() => {
    if (!searchQuery.value) return treatments.value;
    return treatments.value.filter(treatment =>
        treatment.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        treatment.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Fetch services and treatments when component mounts
onMounted(() => {
    fetchServices();
    fetchTreatments();
});
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
    margin-right: 20px;
}

.search-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: 'Poppins', sans-serif;
}

.treatments-list {
    margin-top: 20px;
}

.treatments-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.treatments-table th,
.treatments-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

.treatments-table th {
    background-color: #f2f2f2;
}

.treatment-actions {
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
    width: 450px;
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
}

.treatment-form .form-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 15px;
}

.treatment-form label {
    font-family: 'Poppins', sans-serif;
    margin-bottom: 5px;
}

.treatment-form input[type="text"],
.treatment-form input[type="number"],
.treatment-form textarea,
.treatment-form select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    box-sizing: border-box;
}

.treatment-form select[multiple] {
    height: 150px;
}

.services-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.9em;
}

.services-list li {
    margin-bottom: 2px;
}
</style>