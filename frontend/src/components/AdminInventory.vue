<template>
  <div class="admininventory-container">
    <!-- Enhanced Header Section -->
    <div class="admininventory-header-section">
      <h2 class="admininventory-title">Inventory Management</h2>
      <p class="admininventory-subtitle">Track and manage your product inventory</p>
    </div>

    <div class="admininventory-notification">
      <button 
        @click="showNotification = !showNotification" 
        class="admininventory-notification-button"
        :class="{ 'has-notifications': lowStockItems.length > 0 }"
      >
        <Bell class="h-5 w-5" />
        <span v-if="lowStockItems.length > 0" class="admininventory-notification-badge">
          {{ lowStockItems.length }}
        </span>
      </button>
      
      <!-- Notification Dropdown -->
      <div v-if="showNotification" class="admininventory-notification-dropdown">
        <div class="admininventory-notification-header">
          <h3 class="text-lg font-semibold">Low Stock Items</h3>
          <button @click="showNotification = false" class="text-gray-500 hover:text-gray-700">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="admininventory-notification-content">
          <div v-if="lowStockItems.length === 0" class="admininventory-notification-empty">
            <Package class="h-8 w-8 text-gray-400" />
            <p>No low stock items</p>
          </div>
          <div v-else class="admininventory-notification-items">
            <div v-for="item in lowStockItems" :key="item.id" class="admininventory-notification-item">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-50 rounded-lg">
                  <Package class="h-5 w-5 text-red-500" />
                </div>
                <div class="admininventory-product-info">
                  <span class="admininventory-product-name">{{ item.name }}</span>
                  <span class="admininventory-stock-text">Stock: {{ item.quantity }}</span>
                </div>
              </div>
              <span class="admininventory-price">₱{{ item.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="admininventory-error-alert">
      <AlertCircleIcon class="admininventory-error-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Redesigned Stats Grid -->
    <div class="admininventory-stats-grid">
      <div v-for="stat in inventoryStats" :key="stat.label" 
           class="admininventory-stat-card" :class="getStatCardClass(stat.label)">
        <div class="admininventory-stat-icon-wrapper" :class="getStatIconClass(stat.label)">
          <LayoutGrid v-if="stat.label === 'Total Items'" class="h-5 w-5" />
          <Package v-if="stat.label === 'Total Stock'" class="h-5 w-5" />
          <AlertTriangle v-if="stat.label === 'Low Stock Items'" class="h-5 w-5" />
          <Coins v-if="stat.label === 'Total Value'" class="h-5 w-5" />
        </div>
        <div class="admininventory-stat-content">
          <h3 class="admininventory-stat-label">{{ stat.label }}</h3>
          <p class="admininventory-stat-value" :class="getStatColor(stat.label)">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Enhanced Search Controls -->
    <div class="admininventory-search-section">
      <div class="admininventory-search-container">
        <div class="admininventory-search-group">
          <div class="admininventory-category-wrapper">
            <Package class="admininventory-search-icon" />
            <select v-model="searchCategory" class="admininventory-select-input">
              <option value="">All Categories</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="admininventory-search-wrapper">
            <Search class="admininventory-search-icon" />
            <input 
              v-model="searchProduct" 
              type="text" 
              placeholder="Search products..." 
              class="admininventory-search-input"
            >
          </div>
        </div>
        <button @click="searchCategory = ''; searchProduct = ''" 
                class="admininventory-reset-button">
          <RotateCcw class="admininventory-reset-icon" />
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Improved Inventory Table -->
    <div class="admininventory-inventory-table">
      <div class="admininventory-table-header">
        <div class="admininventory-table-title">
          <h3>Current Inventory</h3>
          <span class="admininventory-item-count">{{ filteredInventory.length }} items</span>
        </div>
      </div>

      <!-- Updated Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-container">
          <div class="spinner">
            <div 
              class="spinner-line" 
              v-for="n in 8" 
              :key="n" 
              :style="{ transform: `rotate(${(n-1) * 45}deg)` }"
            ></div>
          </div>
        </div>
        <p class="loading-text">Loading inventory data...</p>
      </div>

      <div v-else-if="inventory.length === 0" class="admininventory-empty-state">
        <Package class="admininventory-empty-icon" />
        <p class="admininventory-empty-text">No products found in inventory</p>
        <p class="admininventory-empty-subtext">Add products to get started</p>
      </div>

      <div v-else class="admininventory-table-wrapper">
        <div class="admininventory-table-container">
          <table class="admininventory-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Category</th>
                <th>Treatment</th>
                <th>Price</th>
                <th>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredInventory" :key="product.id"
                  class="admininventory-inventory-row">
                <td class="admininventory-table-cell">
                  <div class="admininventory-product-cell">
                    <div class="admininventory-product-icon">
                      <Package class="admininventory-product-icon-svg" />
                    </div>
                    <div class="admininventory-product-info">
                      <span class="admininventory-product-name">{{ product.name }}</span>
                      <span class="admininventory-product-id">ID: {{ product.id.slice(0, 8) }}</span>
                    </div>
                  </div>
                </td>
                <td class="admininventory-table-cell">
                  <span class="admininventory-category-tag" :class="getCategoryColor(product.category)">
                    {{ product.category }}
                  </span>
                </td>
                <td class="admininventory-table-cell">
                  <div class="admininventory-treatment-wrapper" v-if="product.treatments && product.treatments.length > 0">
                    <span 
                      class="admininventory-treatment-tag" 
                      :class="getTreatmentColor(getTreatmentName(product.treatments[0]))"
                      v-tooltip="product.treatments.length > 1 ? {
                        content: product.treatments.slice(1).map(id => getTreatmentName(id)).join(', '),
                        placement: 'top'
                      } : null"
                    >
                      {{ getTreatmentName(product.treatments[0]) }}
                      <span v-if="product.treatments.length > 1" class="admininventory-more-indicator">
                        +{{ product.treatments.length - 1 }}
                      </span>
                    </span>
                  </div>
                  <span v-else class="admininventory-treatment-tag admininventory-bg-gray-100 admininventory-text-gray-800">
                    No Treatment
                  </span>
                </td>
                <td class="admininventory-table-cell">
                  <div class="admininventory-price-cell">
                    <span class="admininventory-currency">₱</span>
                    <span class="admininventory-amount">{{ product.price.toFixed(2) }}</span>
                  </div>
                </td>
                <td class="admininventory-table-cell">
                  <div class="admininventory-stock-level">
                    <div class="admininventory-stock-bar-wrapper">
                      <div class="admininventory-stock-bar">
                        <div class="admininventory-stock-fill" 
                             :class="[getStockLevelClass(product.quantity), {'stock-reducing': product.id === reducingProductId}]"
                             :style="{ width: getStockPercentage(product.quantity) + '%' }"
                             :data-percentage="getStockPercentage(product.quantity)">
                        </div>
                      </div>
                      <span class="admininventory-stock-text" :class="getStockTextClass(product.quantity)">
                        {{ product.quantity }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  AlertCircle as AlertCircleIcon, 
  Package, 
  Search, 
  RotateCcw, 
  LayoutGrid,
  Coins,
  AlertTriangle,
  Bell,
  X
} from 'lucide-vue-next';

const inventory = ref([]);
const loading = ref(true);
const error = ref(null);
const searchCategory = ref('');
const searchProduct = ref('');
const reducingProductId = ref(null);
const isReducing = ref(false);
const showNotification = ref(false);
const treatmentsMap = ref(new Map());

const uniqueCategories = computed(() => {
  return [...new Set(inventory.value.map(item => item.category))];
});

const inventoryStats = computed(() => {
  const totalItems = inventory.value.length;
  const totalStock = inventory.value.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = lowStockItems.value.length;
  const totalValue = inventory.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return [
    { label: 'Total Items', value: totalItems },
    { label: 'Total Stock', value: totalStock },
    { label: 'Low Stock Items', value: lowStockCount },
    { label: 'Total Value', value: `₱${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];
});

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity < 15);
});

const filteredInventory = computed(() => {
  return inventory.value.filter(product => {
    const matchesCategory = !searchCategory.value || 
      product.category.toLowerCase() === searchCategory.value.toLowerCase();
    const matchesProduct = !searchProduct.value || 
      product.name.toLowerCase().includes(searchProduct.value.toLowerCase());
    return matchesCategory && matchesProduct;
  });
});

const getStockLevelClass = (quantity) => {
  const percentage = (quantity / 100) * 100;
  if (percentage >= 60) return 'admininventory-bg-green-500';
  if (percentage >= 30) return 'admininventory-bg-yellow-500';
  return 'admininventory-bg-red-500';
};

const getStockTextClass = (quantity) => {
  const percentage = (quantity / 100) * 100;
  if (percentage >= 60) return 'admininventory-text-green-600';
  if (percentage >= 30) return 'admininventorytext-yellow-600';
  return 'admininventory-text-red-600 admininventory-font-semibold';
};

const getStockPercentage = (quantity) => {
  const maxStock = 100;
  return Math.max(0, Math.min((quantity / maxStock) * 100, 100));
};

const getCategoryColor = (category) => {
  const colors = [
    'admininventory-bg-purple-100 admininventory-text-purple-800',
    'admininventory-bg-blue-100 admininventory-text-blue-800',
    'admininventory-bg-green-100 admininventory-text-green-800',
    'admininventory-bg-yellow-100 admininventory-text-yellow-800',
    'admininventory-bg-red-100 admininventory-text-red-800',
    'admininventory-bg-indigo-100 admininventory-text-indigo-800',
    'admininventory-bg-pink-100 admininventory-text-pink-800',
  ];
  
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return colors[index];
};

const getTreatmentColor = (treatment) => {
  if (!treatment) return 'admininventory-bg-gray-100 admininventory-text-gray-800';

  const colors = [
    'admininventory-bg-teal-100 admininventory-text-teal-800',
    'admininventory-bg-orange-100 admininventory-text-orange-800',
    'admininventory-bg-cyan-100 admininventory-text-cyan-800',
    'admininventory-bg-lime-100 admininventory-text-lime-800',
    'admininventory-bg-fuchsia-100 admininventory-text-fuchsia-800',
  ];
  
  const index = treatment.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return colors[index];
};

const getStatColor = (label) => {
  const colors = {
    'Total Items': 'admininventory-text-blue-600',
    'Total Stock': 'admininventory-text-green-600',
    'Low Stock Items': 'admininventory-text-red-600',
    'Total Value': 'admininventory-text-purple-600'
  };
  return colors[label] || 'admininventory-text-gray-600';
};

const getStatCardClass = (label) => {
  const classes = {
    'Total Items': 'admininventory-border-blue-100',
    'Total Stock': 'admininventory-border-green-100',
    'Low Stock Items': 'admininventory-border-red-100',
    'Total Value': 'admininventory-border-purple-100'
  };
  return classes[label] || '';
};

const getStatIconClass = (label) => {
  const classes = {
    'Total Items': 'admininventory-bg-blue-100 admininventory-text-blue-600',
    'Total Stock': 'admininventory-bg-green-100 admininventory-text-green-600',
    'Low Stock Items': 'admininventory-bg-red-100 admininventory-text-red-600',
    'Total Value': 'admininventory-bg-purple-100 admininventory-text-purple-600'
  };
  return classes[label] || '';
};

const fetchInventory = async () => {
  loading.value = true;
  error.value = null;
  try {
    const treatmentsSnapshot = await getDocs(collection(database, 'treatments'));
    treatmentsMap.value = new Map(
      treatmentsSnapshot.docs.map(doc => [doc.id, doc.data().name])
    );

    const querySnapshot = await getDocs(collection(database, 'products'));
    inventory.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    inventory.value.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    error.value = 'Error loading inventory: ' + err.message;
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};

const getTreatmentName = (treatmentId) => {
  return treatmentsMap.value.get(treatmentId) || 'Unknown Treatment';
};

const setupAppointmentListener = () => {
  const appointmentsRef = collection(database, 'appointments');
  
  onSnapshot(appointmentsRef, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const appointmentData = change.doc.data();
      console.log('Appointment data:', appointmentData);
      
      if (change.type === 'modified' && 
          appointmentData.status === 'approved' && 
          !appointmentData.stockReduced) {
        console.log('Processing newly approved appointment:', change.doc.id);
        
        try {
          const serviceName = appointmentData.service || (appointmentData.services && appointmentData.services[0]);
          
          if (!serviceName) {
            console.error('No service name found in appointment:', appointmentData);
            return;
          }
          
          console.log('Processing service:', serviceName);

          const productsRef = collection(database, 'products');
          const productsSnapshot = await getDocs(productsRef);
          
          console.log('Available products:', productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
          
          const matchingProduct = productsSnapshot.docs.find(doc => {
            const productData = doc.data();
            const productCategory = productData.category?.toLowerCase().trim();
            const serviceNameNormalized = serviceName.toLowerCase().trim();
            
            console.log('Comparing:', {
              service: serviceNameNormalized,
              category: productCategory,
              matches: productCategory === serviceNameNormalized
            });
            
            return productCategory === serviceNameNormalized;
          });

          if (!matchingProduct) {
            console.error('No matching product found for service:', serviceName);
            return;
          }

          const productData = matchingProduct.data();
          console.log('Found matching product:', {
            id: matchingProduct.id,
            data: productData
          });

          if (productData.quantity <= 0) {
            console.error('Insufficient stock for product:', productData.name);
            return;
          }

          reducingProductId.value = matchingProduct.id;
          isReducing.value = true;
          const productRef = doc(database, 'products', matchingProduct.id);
          const newQuantity = productData.quantity - 1;
          
          await updateDoc(productRef, {
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
          });

          console.log('Updated product quantity:', {
            product: productData.name,
            oldQuantity: productData.quantity,
            newQuantity: newQuantity
          });

          const appointmentRef = doc(database, 'appointments', change.doc.id);
          await updateDoc(appointmentRef, {
            stockReduced: true,
            stockReducedAt: new Date().toISOString(),
            processedProductId: matchingProduct.id
          });

          console.log('Marked appointment as processed:', {
            appointmentId: change.doc.id,
            productId: matchingProduct.id
          });

          setTimeout(() => {
            reducingProductId.value = null;
            isReducing.value = false;
          }, 1000);

          await fetchInventory();
          
        } catch (err) {
          console.error('Error processing appointment:', err);
          error.value = 'Error updating inventory: ' + err.message;
        }
      }
    });
  });
};

const debugInfo = computed(() => {
  return {
    inventoryCount: inventory.value.length,
    categories: inventory.value.map(item => item.category),
    lastError: error.value
  };
});

onMounted(() => {
  fetchInventory();
  setupAppointmentListener();
});

const vTooltip = {
  mounted(el, binding) {
    if (binding.value) {
      el.setAttribute('data-tooltip', binding.value.content);
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.setAttribute('data-tooltip', binding.value.content);
    }
  }
};

// app.directive('tooltip', vTooltip);

</script>

<style scoped>
/* Base Container */
.admininventory-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Enhanced Header Section */
.admininventory-header-section {
  margin-bottom: 2rem;
}

.admininventory-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: .25rem;
}

.admininventory-subtitle {
  color: #64748b;
  font-size: .75rem;
}

/* Improved Stats Grid */
.admininventory-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.admininventory-stat-card {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.admininventory-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.admininventory-stat-icon-wrapper {
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admininventory-stat-content {
  flex: 1;
}

.admininventory-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.admininventory-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

/* Enhanced Search Section */
.admininventory-search-section {
  margin-bottom: 1rem;
  background-color: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.admininventory-search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.admininventory-search-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.admininventory-category-wrapper,
.admininventory-search-wrapper {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  flex: 1;
  transition: all 0.2s ease;
}

.admininventory-category-wrapper:hover,
.admininventory-search-wrapper:hover {
  border-color: #cbd5e1;
}

.admininventory-category-wrapper:focus-within,
.admininventory-search-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.1);
}

.admininventory-search-icon {
  color: #64748b;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.admininventory-select-input,
.admininventory-search-input {
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1e293b;
  width: 100%;
  outline: none;
}

.admininventory-select-input:focus,
.admininventory-search-input:focus {
  outline: none;
}

.admininventory-reset-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admininventory-reset-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

/* Enhanced Table Styles */
.admininventory-inventory-table {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.admininventory-table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.admininventory-table-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.admininventory-table-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.admininventory-item-count {
  color: #64748b;
  font-size: 0.875rem;
}

.admininventory-table-wrapper {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.admininventory-table-container {
  width: 100%;
  min-width: 700px;
}

.admininventory-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.admininventory-table th {
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.admininventory-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

/* Enhanced Product Cell */
.admininventory-product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admininventory-product-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admininventory-product-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.admininventory-product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admininventory-product-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.admininventory-product-id {
  color: #64748b;
  font-size: 0.75rem;
}

/* Enhanced Category Tag */
.admininventory-category-tag {
  display: inline-flex;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Enhanced Treatment Tag */
.admininventory-treatment-tag {
  display: inline-flex;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Enhanced Price Cell */
.admininventory-price-cell {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: #1e293b;
}

/* Enhanced Stock Level */
.admininventory-stock-level {
  width: 100%;
}

.admininventory-stock-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admininventory-stock-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
  max-width: 120px;
}

.admininventory-stock-fill {
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
}

.admininventory-stock-text {
  font-weight: 500;
  min-width: 2rem;
  text-align: right;
  color: #64748b;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admininventory-container {
    padding: 1rem;
  }

  .admininventory-search-container {
    flex-direction: column;
  }

  .admininventory-search-group {
    flex-direction: column;
    width: 100%;
  }

  .admininventory-category-wrapper,
  .admininventory-search-wrapper {
    width: 100%;
  }

  .admininventory-reset-button {
    width: 100%;
    justify-content: center;
  }

  .admininventory-table-container {
    min-width: 700px;
  }
}

/* Utility Classes */
.admininventory-bg-green-500 { background-color: #10b981; }
.admininventory-bg-yellow-500 { background-color: #f59e0b; }
.admininventory-bg-red-500 { background-color: #ef4444; }
.admininventory-text-green-600 { color: #059669; }
.admininventorytext-yellow-600 { color: #d97706; }
.admininventory-text-red-600 { color: #dc2626; }
.admininventory-bg-purple-100 { background-color: #f3e8ff; }
.admininventory-text-purple-800 { color: #6b21a8; }
.admininventory-bg-blue-100 { background-color: #dbeafe; }
.admininventory-text-blue-800 { color: #1e40af; }
.admininventory-bg-green-100 { background-color: #dcfce7; }
.admininventory-text-green-800 { color: #166534; }
.admininventory-bg-yellow-100 { background-color: #fef8e0; }
.admininventory-text-yellow-800 { color: #975a00; }
.admininventory-bg-red-100 { background-color: #fdebeb; }
.admininventory-text-red-800 { color: #881313; }
.admininventory-bg-indigo-100 { background-color: #e6f2ff; }
.admininventory-text-indigo-800 { color: #3b1e70; }
.admininventory-bg-pink-100 { background-color: #fff1f2; }
.admininventory-text-pink-800 { color: #a8193f; }
.admininventory-bg-teal-100 { background-color: #ccfbf1; }
.admininventory-text-teal-800 { color: #115e59; }
.admininventory-bg-orange-100 { background-color: #ffedd5; }
.admininventory-text-orange-800 { color: #9a3412; }
.admininventory-bg-cyan-100 { background-color: #cffafe; }
.admininventory-text-cyan-800 { color: #155e75; }
.admininventory-bg-lime-100 { background-color: #ecfccb; }
.admininventory-text-lime-800 { color: #3f6212; }
.admininventory-bg-fuchsia-100 { background-color: #fae8ff; }
.admininventory-text-fuchsia-800 { color: #86198f; }
.admininventory-bg-gray-100 { background-color: #f3f4f6; }
.admininventory-text-gray-800 { color: #1f2937; }

/* Loading State Styles */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  gap: 1rem;
}

.spinner-container {
  width: 40px;
  height: 40px;
  position: relative;
}

.spinner {
  width: 100%;
  height: 100%;
  position: relative;
  animation: spin 1s linear infinite;
}

.spinner-line {
  position: absolute;
  width: 2px;
  height: 8px;
  background: #7c3aed;
  border-radius: 1px;
  left: 50%;
  top: 0;
  transform-origin: 50% 20px;
}

.loading-text {
  color: #7c3aed;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Added animation styles */
@keyframes stockReduction {
  0% {
    transform: scaleX(1);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.95);
    opacity: 0.6;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}

.stock-reducing {
  animation: stockReduction 1s ease-in-out infinite;
}

.admininventory-low-stock-section {
  margin-bottom: 1rem;
}

.admininventory-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 50;
}

.admininventory-notification-button {
  position: relative;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  color: #64748b;
  transition: all 0.2s;
}

.admininventory-notification-button:hover {
  background-color: #f8fafc;
  color: #1e293b;
}

.admininventory-notification-button.has-notifications {
  color: #dc2626;
}

.admininventory-notification-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.5rem;
  text-align: center;
}

.admininventory-notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.admininventory-notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.admininventory-notification-content {
  max-height: 400px;
  overflow-y: auto;
}

.admininventory-notification-empty {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.admininventory-notification-items {
  padding: 1rem;
}

.admininventory-notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.admininventory-notification-item:last-child {
  border-bottom: none;
}

.admininventory-price {
  color: #dc2626;
  font-weight: 600;
}

.admininventory-empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 1rem;
}

.admininventory-empty-icon {
  width: 4rem;
  height: 4rem;
  color: #64748b;
}

.admininventory-empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.admininventory-empty-subtext {
  font-size: 0.875rem;
  color: #64748b;
}

.admininventory-treatment-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.admininventory-more-indicator {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

[v-tooltip] {
  position: relative;
  cursor: pointer;
}

[v-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background-color: #1e293b;
  color: white;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  white-space: nowrap;
  z-index: 50;
  margin-bottom: 0.5rem;
}

[v-tooltip]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0.25rem;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
  margin-bottom: 0.25rem;
}
</style>

