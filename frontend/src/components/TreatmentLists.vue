<template>
    <div class="container">
      <div class="header">
        <h1>Treatments and Services List</h1>
      </div>
  
      <div class="lists-container">
        <div class="list-section">
          <h2>Treatments</h2>
          <div v-if="loadingTreatments" class="loading">Loading treatments...</div>
          <ul v-else-if="treatments.length > 0" class="item-list">
            <li v-for="treatment in treatments" :key="treatment.id" class="list-item">
              <h3>{{ treatment.name }}</h3>
              <p>{{ treatment.description }}</p>
              <p>Duration: {{ treatment.duration }} minutes</p>
              <p>Price: ₱{{ treatment.price.toFixed(2) }}</p>
            </li>
          </ul>
          <p v-else class="no-items">No treatments available.</p>
        </div>
  
        <div class="list-section">
          <h2>Services</h2>
          <div v-if="loadingServices" class="loading">Loading services...</div>
          <ul v-else-if="services.length > 0" class="item-list">
            <li v-for="service in services" :key="service.id" class="list-item">
              <h3>{{ service.name }}</h3>
              <p>{{ service.description }}</p>
              <p>Price: ₱{{ service.price.toFixed(2) }}</p>
              <p>Availability: 
                <span :class="service.availability === 'available' ? 'available' : 'unavailable'">
                  {{ service.availability }}
                </span>
              </p>
            </li>
          </ul>
          <p v-else class="no-items">No services available.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { db } from '../firebase';
  import { collection, getDocs } from 'firebase/firestore';
  
  const treatments = ref([]);
  const services = ref([]);
  const loadingTreatments = ref(true);
  const loadingServices = ref(true);
  
  const fetchTreatments = async () => {
    try {
      const treatmentsCollection = collection(db, 'treatments');
      const treatmentSnapshot = await getDocs(treatmentsCollection);
      treatments.value = treatmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      loadingTreatments.value = false;
    }
  };
  
  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const serviceSnapshot = await getDocs(servicesCollection);
      services.value = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      loadingServices.value = false;
    }
  };
  
  onMounted(() => {
    fetchTreatments();
    fetchServices();
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: auto;
    padding: 20px;
    font-family: 'Poppins', sans-serif;
  }
  
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .header h1 {
    font-size: 2.5rem;
    color: #333;
  }
  
  .lists-container {
    display: flex;
    justify-content: space-between;
    gap: 30px;
  }
  
  .list-section {
    flex: 1;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .list-section h2 {
    font-size: 1.8rem;
    color: #444;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .item-list {
    list-style-type: none;
    padding: 0;
  }
  
  .list-item {
    background-color: #ffffff;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .list-item h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 10px;
  }
  
  .list-item p {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
  }
  
  .available {
    color: green;
    font-weight: bold;
  }
  
  .unavailable {
    color: red;
    font-weight: bold;
  }
  
  .loading, .no-items {
    text-align: center;
    color: #666;
    font-style: italic;
  }
  
  @media (max-width: 768px) {
    .lists-container {
      flex-direction: column;
    }
  }
  </style>