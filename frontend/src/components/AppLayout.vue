<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next';

const router = useRouter();
const openSubmenus = ref({});

const toggleSubmenu = (routeName) => {
  openSubmenus.value[routeName] = !openSubmenus.value[routeName];
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    router.push('/landing');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

const routes = [
  { path: '/admin-dashboard', name: 'Dashboard' },
  { 
    name: 'Client Management',
    submenu: [
      { path: '/profiles', name: 'Client Profiles' },
      { path: '/clients', name: 'Treatment Records' },
    ]
  },
  { 
    name: 'Appointment Management',
    submenu: [
      { path: '/appointmentlists', name: 'Schedule' },
      { path: '/calendar', name: 'Calendar View' },
      { path: '/appointments', name: 'Schedule Management' },

    ]
  },
  { 
    name: 'Services & Treatments',
    submenu: [
      { path: '/treatments', name: 'Treatment Management' },
      { path: '/services', name: 'Service Management' },
      { path: '/servicelist', name: 'Treatment Packages' },
    ]
  },
  { 
    name: 'Inventory & Products',
    submenu: [
      { path: '/products', name: 'Product Lists' },
      { path: '/inventory', name: 'Inventory Management' },
      { path: '/stock-forecasting', name: 'Stock Forecasting' },
    ]
  },
  { 
    name: 'Reports & Analytics',
    submenu: [
      { path: '/financial-reports', name: 'Financial Reports' },
      { path: '/performance-metrics', name: 'Performance Metrics' },
      { path: '/client-analytics', name: 'Client Analytics' },
    ]
  },
  { 
    name: 'Settings',
    submenu: [
      { path: '/user-management', name: 'User Management' },
      { path: '/system-settings', name: 'System Settings' },
    ]
  },
];
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-gradient-to-b from-purple-600 to-teal-500 text-white">
      <div class="p-4">
        <h1 class="text-xl font-bold mb-8">Mejico MedSpa HMS</h1>
        <nav>
          <div v-for="(route, index) in routes" :key="index">
            <div
              v-if="route.submenu"
              class="mb-2"
            >
              <div
                @click="toggleSubmenu(route.name)"
                class="flex items-center justify-between py-2 px-4 rounded cursor-pointer hover:bg-white hover:bg-opacity-10"
                :class="{ 'bg-white bg-opacity-20': openSubmenus[route.name] }"
              >
                {{ route.name }}
                <ChevronDownIcon v-if="!openSubmenus[route.name]" class="h-4 w-4" />
                <ChevronUpIcon v-else class="h-4 w-4" />
              </div>
              <div v-if="openSubmenus[route.name]" class="ml-4">
                <router-link
                  v-for="(subItem, subIndex) in route.submenu"
                  :key="subIndex"
                  :to="subItem.path"
                  class="block py-2 px-4 rounded mb-1 cursor-pointer text-sm hover:bg-white hover:bg-opacity-10"
                  :class="{ 'bg-white bg-opacity-20': $route.path === subItem.path }"
                >
                  {{ subItem.name }}
                </router-link>
              </div>
            </div>
            <router-link
              v-else
              :to="route.path"
              class="block py-2 px-4 rounded mb-2 cursor-pointer hover:bg-white hover:bg-opacity-10"
              :class="{ 'bg-white bg-opacity-20': $route.path === route.path }"
            >
              {{ route.name }}
            </router-link>
          </div>
        </nav>
        <button @click="logout" class="mt-4 w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300">Logout</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <router-view></router-view>
    </div>
  </div>
</template>