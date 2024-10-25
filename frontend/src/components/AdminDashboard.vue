<!-- src/views/Dashboard.vue -->
<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in quickStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Recent Appointments -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <h3 class="text-lg font-semibold mb-4">Recent Appointments</h3>
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-500">
            <th class="pb-2">Patient</th>
            <th class="pb-2">Date</th>
            <th class="pb-2">Time</th>
            <th class="pb-2">Treatment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in recentAppointments" :key="appointment.id">
            <td class="py-2">{{ appointment.patient }}</td>
            <td>{{ appointment.date }}</td>
            <td>{{ appointment.time }}</td>
            <td>{{ appointment.treatment }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Upcoming Tasks -->
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Upcoming Tasks</h3>
      <ul class="space-y-2">
        <li v-for="task in upcomingTasks" :key="task.id" class="flex items-center">
          <span class="w-2 h-2 rounded-full mr-2" :class="task.priority"></span>
          <span>{{ task.description }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const quickStats = ref([
  { label: 'Total Patients', value: '2,547' },
  { label: 'Appointments Today', value: '28' },
  { label: 'New Patients (This Week)', value: '43' },
  { label: 'Revenue (This Month)', value: '₱4.8M' },
]);

const recentAppointments = ref([
  { id: 1, patient: 'Maria Santos', date: '2023-05-15', time: '10:00 AM', treatment: 'Facial Rejuvenation' },
  { id: 2, patient: 'Juan Dela Cruz', date: '2023-05-15', time: '11:30 AM', treatment: 'Body Contouring' },
  { id: 3, patient: 'Ana Reyes', date: '2023-05-15', time: '2:00 PM', treatment: 'Laser Hair Removal' },
  { id: 4, patient: 'Carlos Mendoza', date: '2023-05-16', time: '9:30 AM', treatment: 'Botox Injection' },
  { id: 5, patient: 'Sophia Lim', date: '2023-05-16', time: '1:00 PM', treatment: 'Chemical Peel' },
]);

const upcomingTasks = ref([
  { id: 1, description: 'Order new supplies', priority: 'bg-red-500' },
  { id: 2, description: 'Follow up with patient inquiries', priority: 'bg-yellow-500' },
  { id: 3, description: 'Schedule staff meeting', priority: 'bg-green-500' },
  { id: 4, description: 'Review monthly performance reports', priority: 'bg-blue-500' },
]);
</script>