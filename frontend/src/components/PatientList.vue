<template>
    <div class="patient-list">
      <h2>Patient List</h2>
      <ul>
        <li v-for="patient in patients" :key="patient.id">
          {{ patient.name }} - {{ patient.condition }}
        </li>
      </ul>
      <form @submit.prevent="addPatient">
        <input v-model="newPatient.name" placeholder="Patient Name" required>
        <input v-model="newPatient.condition" placeholder="Condition" required>
        <button type="submit">Add Patient</button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { database } from '../firebase';
  import { ref as dbRef, push, onValue, off } from 'firebase/database';
  
  export default {
    setup() {
      const patients = ref([]);
      const newPatient = ref({ name: '', condition: '' });
      const patientsRef = dbRef(database, 'patients');
  
      const addPatient = () => {
        push(patientsRef, newPatient.value);
        newPatient.value = { name: '', condition: '' };
      };
  
      onMounted(() => {
        onValue(patientsRef, (snapshot) => {
          const data = snapshot.val();
          patients.value = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        });
      });
  
      onUnmounted(() => {
        off(patientsRef);
      });
  
      return {
        patients,
        newPatient,
        addPatient
      };
    }
  };
  </script>
  
  <style scoped>
  .patient-list {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }
  
  input, button {
    padding: 10px;
  }
  
  button {
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    opacity: 0.8;
  }
  </style>