<!-- src/views/Appointments.vue -->
<template>
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Appointment Management</h2>
  
      <!-- Appointment Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in appointmentStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
        </div>
      </div>
  
      <!-- Appointment Calendar -->
      <div class="bg-white p-4 rounded-lg shadow mb-8">
        <h3 class="text-lg font-semibold mb-4">Appointment Calendar</h3>
        <!-- Add a calendar component here -->
        <div class="h-64 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500">Calendar Component Placeholder</p>
        </div>
      </div>
  
      <!-- Upcoming Appointments -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Patient</th>
              <th class="pb-2">Date</th>
              <th class="pb-2">Time</th>
              <th class="pb-2">Treatment</th>
              <th class="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in upcomingAppointments" :key="appointment.id">
              <td class="py-2">{{ appointment.patient }}</td>
              <td>{{ appointment.date }}</td>
              <td>{{ appointment.time }}</td>
              <td>{{ appointment.treatment }}</td>
              <td>
                <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button class="text-red-500 hover:text-red-700">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const appointmentStats = ref([
    { label: 'Today\'s Appointments', value: '28' },
    { label: 'This Week', value: '143' },
    { label: 'This Month', value: '587' },
    { label: 'Cancellation Rate', value: '3%' },
  ]);
  
  const upcomingAppointments = ref([
    { id: 1, patient: 'Maria Santos', date: '2023-05-15', time: '10:00 AM', treatment: 'Facial Rejuvenation' },
    { id: 2, patient: 'Juan Dela Cruz', date: '2023-05-15', time: '11:30 AM', treatment: 'Body Contouring' },
    { id: 3, patient: 'Ana Reyes', date: '2023-05-15', time: '2:00 PM', treatment: 'Laser Hair Removal' },
    { id: 4, patient: 'Carlos Mendoza', date: '2023-05-16', time: '9:30 AM', treatment: 'Botox Injection' },
    { id: 5, 
  
   patient: 'Sophia Lim', date: '2023-05-16', time: '1:00 PM', treatment: 'Chemical Peel' },
  ]);
  </script>