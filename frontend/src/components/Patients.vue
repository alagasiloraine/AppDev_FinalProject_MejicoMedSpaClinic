<!-- src/views/Patients.vue -->
<template>
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Patient Management</h2>
  
      <!-- Patient Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in patientStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
        </div>
      </div>
  
      <!-- Patient List -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Patient List</h3>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            Add New Patient
          </button>
        </div>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Age</th>
              <th class="pb-2">Contact</th>
              <th class="pb-2">Last Visit</th>
              <th class="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td class="py-2">{{ patient.name }}</td>
              <td>{{ patient.age }}</td>
              <td>{{ patient.contact }}</td>
              <td>{{ patient.lastVisit }}</td>
              <td>
                <button class="text-blue-500 hover:text-blue-700 mr-2">View</button>
                <button class="text-green-500 hover:text-green-700">Schedule</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const patientStats = ref([
    { label: 'Total Patients', value: '2,547' },
    { label: 'New Patients (This Month)', value: '87' },
    { label: 'Appointments (This Week)', value: '143' },
    { label: 'Patient Satisfaction', value: '94%' },
  ]);
  
  const patients = ref([
    { id: 1, name: 'Maria Santos', age: 35, contact: '0917-123-4567', lastVisit: '2023-05-10' },
    { id: 2, name: 'Juan Dela Cruz', age: 42, contact: '0918-234-5678', lastVisit: '2023-05-08' },
    { id: 3, name: 'Ana Reyes', age: 28, contact: '0919-345-6789', lastVisit: '2023-05-12' },
    { id: 4, name: 'Carlos Mendoza', age: 50, contact: '0920-456-7890', lastVisit: '2023-05-05' },
    { id: 5, name: 'Sophia Lim', age: 31, contact: '0921-567-8901', lastVisit: '2023-05-11' },
  ]);
  </script>