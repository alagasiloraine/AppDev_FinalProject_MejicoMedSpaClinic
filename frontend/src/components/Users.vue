<!-- src/views/Users.vue -->
<template>
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Users Management</h2>
  
      <!-- User Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div v-for="stat in userStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
        </div>
      </div>
  
      <!-- User List -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">User List</h3>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            Add New User
          </button>
        </div>
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Email</th>
              <th class="pb-2">Role</th>
              <th class="pb-2">Status</th>
              <th class="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="py-2">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <span :class="user.status === 'Active' ? 'text-green-500' : 'text-red-500'">
                  {{ user.status }}
                </span>
              </td>
              <td>
                <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button class="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const userStats = ref([
    { label: 'Total Users', value: '45' },
    { label: 'Active Users', value: '38' },
    { label: 'New Users (This Month)', value: '7' },
  ]);
  
  const users = ref([
    { id: 1, name: 'Dr. Maria Santos', email: 'maria@example.com', role: 'Doctor', status: 'Active' },
    { id: 2, name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'Nurse', status: 'Active' },
    { id: 3, name: 'Ana Reyes', email: 'ana@example.com', role: 'Receptionist', status: 'Inactive' },
    { id: 4, name: 'Carlos Mendoza', email: 'carlos@example.com', role: 'Admin', status: 'Active' },
    { id: 5, name: 'Sophia Lim', email: 'sophia@example.com', role: 'Therapist', status: 'Active' },
  ]);
  </script>