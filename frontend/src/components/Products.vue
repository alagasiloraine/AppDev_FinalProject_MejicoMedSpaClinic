<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Product List</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Product Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div v-for="stat in productStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Product List -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Product List</h3>
      </div>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-500">Loading products...</p>
      </div>
      <div v-else-if="products.length === 0" class="text-center py-4">
        <p class="text-gray-500">No products found.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Price</th>
              <th class="pb-2">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="border-b border-gray-200 last:border-b-0">
              <td class="py-3">{{ product.name }}</td>
              <td class="py-3">₱{{ product.price.toFixed(2) }}</td>
              <td class="py-3">{{ product.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const products = ref([]);
const loading = ref(true);
const error = ref(null);

const productStats = computed(() => {
  const totalProducts = products.value.length;
  const categories = [...new Set(products.value.map(p => p.category))];
  const totalValue = products.value.reduce((sum, product) => sum + Number(product.price), 0);

  return [
    { label: 'Total Products', value: totalProducts },
    { label: 'Categories', value: categories.length },
    { label: 'Total Value', value: `₱${totalValue.toFixed(2)}` },
  ];
});

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    products.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.value.sort((a, b) => a.name.localeCompare(b.name)); // Sort products alphabetically by name
  } catch (err) {
    error.value = 'Error loading products: ' + err.message;
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.bg-white {
  background-color: white;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-bold {
  font-weight: 700;
}

.text-purple-600 {
  color: #7c3aed;
}

.text-gray-500 {
  color: #6b7280;
}

.overflow-x-auto {
  overflow-x: auto;
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  font-weight: 600;
}

td, th {
  padding: 0.75rem 1rem;
  text-align: left;
}

tr:hover {
  background-color: #f9fafb;
}
</style>