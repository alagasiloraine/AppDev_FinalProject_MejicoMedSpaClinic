<!-- src/components/AppLayout.vue -->
<template>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="w-64 bg-gradient-to-b from-purple-600 to-teal-500 text-white">
        <div class="p-4">
          <h1 class="text-xl font-bold mb-8">Mejico MedSpa HMS</h1>
          <nav>
            <router-link 
              v-for="(route, index) in routes" 
              :key="index" 
              :to="route.path" 
              class="block py-2 px-4 rounded mb-2 cursor-pointer" 
              :class="{ 'bg-white bg-opacity-20': $route.path === route.path }"
            >
              {{ route.name }}
            </router-link>
            <button @click="logout" class="nav-btn">Logout</button>

          </nav>
        </div>
      </div>
  
      <!-- Main Content -->
      <div class="flex-1 overflow-auto">
        <router-view></router-view>
      </div>
    </div>
  </template>
  
  <script setup>
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Update the path based on where you have initialized Firebase auth

const router = useRouter();

const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    router.push('/landing'); // Redirect to landing page after logout
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

const routes = [
  { path: '/admin-dashboard', name: 'Dashboard' },
  { path: '/products', name: 'Products' },
  { path: '/services', name: 'Services' },
  { path: '/clients', name: 'Clients' },
  { path: '/appointments', name: 'Appointments' },
  { path: '/calendar', name: 'Calendar' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/settings', name: 'Settings' },
];
</script>
