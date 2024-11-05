<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Inventory Management</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Inventory Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in inventoryStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Submenus -->
    <div class="mb-8">
      <button @click="activeSubmenu = 'view'" class="bg-purple-600 text-white px-4 py-2 rounded mr-2 hover:bg-purple-700">View Inventory</button>
      <button @click="activeSubmenu = 'add'" class="bg-purple-600 text-white px-4 py-2 rounded mr-2 hover:bg-purple-700">Add Stock</button>
      <button @click="activeSubmenu = 'out'" class="bg-purple-600 text-white px-4 py-2 rounded mr-2 hover:bg-purple-700">Stock Out</button>
      <button @click="activeSubmenu = 'alerts'" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Low Stock Alerts</button>
    </div>

    <!-- Add Stock Form -->
    <div v-if="activeSubmenu === 'add'" class="bg-white p-4 rounded-lg shadow mb-8">
      <h3 class="text-lg font-semibold mb-4">Add Stock</h3>
      <form @submit.prevent="addStock">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="productName">
            Product Name
          </label>
          <input v-model="newStock.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="productName" type="text" placeholder="Product Name" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
            Quantity
          </label>
          <input v-model.number="newStock.quantity" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="quantity" type="number" placeholder="Quantity" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="price">
            Price
          </label>
          <input v-model.number="newStock.price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" step="0.01" placeholder="Price" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="category">
            Category
          </label>
          <input v-model="newStock.category" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="category" type="text" placeholder="Category" required>
        </div>
        <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Add Stock
        </button>
      </form>
    </div>

    <!-- Stock Out Form -->
    <div v-if="activeSubmenu === 'out'" class="bg-white p-4 rounded-lg shadow mb-8">
      <h3 class="text-lg font-semibold mb-4">Stock Out</h3>
      <form @submit.prevent="stockOut">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="productSelect">
            Select Product
          </label>
          <select v-model="stockOutProduct" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="productSelect" required>
            <option v-for="product in inventory" :key="product.id" :value="product.id">
              {{ product.name }} (Current Stock: {{ product.quantity }})
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="quantityOut">
            Quantity Out
          </label>
          <input v-model.number="stockOutQuantity" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="quantityOut" type="number" placeholder="Quantity" required>
        </div>
        <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Stock Out
        </button>
      </form>
    </div>

    <!-- View Inventory -->
    <div v-if="activeSubmenu === 'view'" class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Current Inventory</h3>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-500">Loading inventory...</p>
      </div>
      <div v-else-if="inventory.length === 0" class="text-center py-4">
        <p class="text-gray-500">No products in inventory.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Quantity</th>
              <th class="pb-2">Price</th>
              <th class="pb-2">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in inventory" :key="product.id" class="border-b border-gray-200 last:border-b-0">
              <td class="py-3">{{ product.name }}</td>
              <td class="py-3">{{ product.quantity }}</td>
              <td class="py-3">₱{{ product.price.toFixed(2) }}</td>
              <td class="py-3">{{ product.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Low Stock Alerts -->
    <div v-if="activeSubmenu === 'alerts'" class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Low Stock Alerts</h3>
      <div v-if="lowStockItems.length === 0" class="text-center py-4">
        <p class="text-gray-500">No low stock items.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="pb-2">Name</th>
              <th class="pb-2">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lowStockItems" :key="item.id" class="border-b border-gray-200 last:border-b-0">
              <td class="py-3">{{ item.name }}</td>
              <td class="py-3">{{ item.quantity }}</td>
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
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';

const inventory = ref([]);
const loading = ref(true);
const error = ref(null);
const activeSubmenu = ref('view');

const newStock = ref({ name: '', quantity: 0, price: 0, category: '' });
const stockOutProduct = ref('');
const stockOutQuantity = ref(0);

const inventoryStats = computed(() => {
  const totalItems = inventory.value.length;
  const totalStock = inventory.value.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = lowStockItems.value.length;
  const totalValue = inventory.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return [
    { label: 'Total Items', value: totalItems },
    { label: 'Total Stock', value: totalStock },
    { label: 'Low Stock Items', value: lowStockCount },
    { label: 'Total Value', value: `₱${totalValue.toFixed(2)}` },
  ];
});

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity < 10);
});

const fetchInventory = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    inventory.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    inventory.value.sort((a, b) => a.name.localeCompare(b.name)); // Sort products alphabetically by name
  } catch (err) {
    error.value = 'Error loading inventory: ' + err.message;
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};

const addStock = async () => {
  try {
    await addDoc(collection(db, 'products'), newStock.value);
    await fetchInventory();
    newStock.value = { name: '', quantity: 0, price: 0, category: '' };
  } catch (err) {
    error.value = 'Error adding stock: ' + err.message;
    console.error(error.value);
  }
};

const stockOut = async () => {
  try {
    const productRef = doc(db, 'products', stockOutProduct.value);
    const product = inventory.value.find(p => p.id === stockOutProduct.value);
    if (product) {
      const newQuantity = Math.max(0, product.quantity - stockOutQuantity.value);
      await updateDoc(productRef, { quantity: newQuantity });
      await fetchInventory();
      stockOutProduct.value = '';
      stockOutQuantity.value = 0;
    }
  } catch (err) {
    error.value = 'Error updating stock: ' + err.message;
    console.error(error.value);
  }
};

onMounted(() => {
  fetchInventory();
});
</script>

<style scoped>
/* ... (keep the existing styles) ... */
</style>