<template>
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Product Management</h2>
  
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>
  
      <!-- Product Stats -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in productStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
        </div>
      </div> -->
  
      <!-- Add/Edit Product Form -->
      <div class="bg-white p-4 rounded-lg shadow mb-8">
        <h3 class="text-lg font-semibold mb-4">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="currentProduct.name" id="name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50">
          </div>
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
            <input v-model="currentProduct.price" id="price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50">
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
            <input v-model="currentProduct.quantity" id="quantity" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50">
          </div>
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
            <input v-model="currentProduct.category" id="category" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50">
          </div>
          <div>
            <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              {{ editingProduct ? 'Update Product' : 'Add Product' }}
            </button>
            <button v-if="editingProduct" @click="cancelEdit" type="button" class="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
  
      <!-- Product List -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Product List</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="pb-2">Name</th>
                <th class="pb-2">Price</th>
                <th class="pb-2">Quantity</th>
                <th class="pb-2">Category</th>
                <th class="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td class="py-2">{{ product.name }}</td>
                <td>₱{{ product.price.toFixed(2) }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.category }}</td>
                <td>
                  <button @click="editProduct(product)" class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button @click="deleteProduct(product.id)" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
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
  import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
  
  const products = ref([]);
  const error = ref(null);
  const currentProduct = ref({ name: '', price: 0, quantity: 0, category: '' });
  const editingProduct = ref(null);
  
  // const productStats = computed(() => {
  //   const totalProducts = products.value.length;
  //   const categories = [...new Set(products.value.map(p => p.category))];
  //   const totalValue = products.value.reduce((sum, product) => sum + (Number(product.price) * Number(product.quantity)), 0);
  //   const totalQuantity = products.value.reduce((sum, product) => sum + Number(product.quantity), 0);
  
  //   return [
  //     { label: 'Total Products', value: totalProducts },
  //     { label: 'Categories', value: categories.length },
  //     { label: 'Total Value', value: `₱${totalValue.toFixed(2)}` },
  //     { label: 'Total Quantity', value: totalQuantity },
  //   ];
  // });
  
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      products.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      error.value = 'Error loading products: ' + err.message;
      console.error(error.value);
    }
  };
  
  const saveProduct = async () => {
    try {
      const productData = {
        name: currentProduct.value.name,
        price: Number(currentProduct.value.price),
        quantity: Number(currentProduct.value.quantity),
        category: currentProduct.value.category,
      };
  
      if (editingProduct.value) {
        await updateDoc(doc(db, 'products', editingProduct.value), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      await fetchProducts();
      resetForm();
    } catch (err) {
      error.value = 'Error saving product: ' + err.message;
      console.error(error.value);
    }
  };
  
  const editProduct = (product) => {
    currentProduct.value = { ...product };
    editingProduct.value = product.id;
  };
  
  const cancelEdit = () => {
    resetForm();
  };
  
  const deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        await fetchProducts();
      } catch (err) {
        error.value = 'Error deleting product: ' + err.message;
        console.error(error.value);
      }
    }
  };
  
  const resetForm = () => {
    currentProduct.value = { name: '', price: 0, quantity: 0, category: '' };
    editingProduct.value = null;
  };
  
  onMounted(fetchProducts);
  </script>