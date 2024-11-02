<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Admin Dashboard</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="route in routes"
          :key="route.path"
          :to="`/admin${route.path}`" 
          class="nav-link"
          :class="{ 'active': $route.path === `/admin${route.path}` }" 
        >
          {{ route.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view> <!-- Displays the selected component -->
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const routes = [
  { path: '/services', name: 'Services' }, // Ensure paths start with '/'
];
</script>

<style scoped>
/* Styles remain unchanged */
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f0f4f8;
}

.sidebar {
  width: 250px;
  background: linear-gradient(to bottom, #6a1b9a, #00bcd4);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
}

.sidebar-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.sidebar-nav {
  flex-grow: 1;
}

.nav-link {
  display: block;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.active {
  background-color: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 20px;
}

.main-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
}
</style>
