// src/components/InventoryManagement.vue
<script setup>
import { ref, onMounted } from 'vue';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const searchQuery = ref('');
const products = ref([]);
const showAddModal = ref(false);
const usageData = ref([
  { name: 'Jan', usage: 65 },
  { name: 'Feb', usage: 59 },
  { name: 'Mar', usage: 80 },
  { name: 'Apr', usage: 81 },
  { name: 'May', usage: 56 },
  { name: 'Jun', usage: 55 },
]);

const mockProducts = [
  { id: 1, name: 'Facial Cream', category: 'Skincare', quantity: 15, threshold: 20 },
  { id: 2, name: 'Massage Oil', category: 'Massage', quantity: 8, threshold: 10 },
  { id: 3, name: 'Face Mask', category: 'Skincare', quantity: 25, threshold: 15 },
  { id: 4, name: 'Body Scrub', category: 'Body Care', quantity: 5, threshold: 12 },
];

onMounted(() => {
  products.value = mockProducts;
});

const filteredProducts = computed(() => {
  return products.value.filter(product => 
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isLowStock = (quantity, threshold) => quantity <= threshold;
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-teal-400 p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-white">Inventory Management</h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Search and Actions -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex-1 max-w-lg">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Search products..."
            />
            <div class="absolute left-3 top-2.5">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
            </div>
          </div>
        </div>
        <button
          @click="showAddModal = true"
          class="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Add Product
        </button>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    isLowStock(product.quantity, product.threshold)
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ isLowStock(product.quantity, product.threshold) ? 'Low Stock' : 'In Stock' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                <button class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Usage Analytics -->
      <div class="mt-8 bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Usage Analytics</h2>
        <div class="h-64">
          <LineChart width={800} height={240} data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke="#7C3AED" 
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </div>
      </div>
    </div>
  </div>
</template>