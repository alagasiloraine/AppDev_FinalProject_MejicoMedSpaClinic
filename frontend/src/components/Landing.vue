<template>
    <div class="landing-container">
      <header>
        <h1>Welcome to Mejico Clinic</h1>
        <nav>
          <router-link to="/login">Login</router-link> |
          <router-link to="/register">Register</router-link> |
          <router-link to="/patients">Patient List</router-link> |
          <router-link to="/verify-email">Verify Email</router-link>
        </nav>
      </header>
      <main>
        <h2>Your Health, Our Priority</h2>
        <p>Mejico Clinic provides top-quality healthcare services to our community.</p>
        <ul>
          <li>Expert doctors and staff</li>
          <li>State-of-the-art facilities</li>
          <li>Comprehensive medical services</li>
        </ul>
        <p v-if="apiStatus">API Status: {{ apiStatus }}</p>
      </main>
      <footer>
        <p>&copy; 2023 Mejico Clinic. All rights reserved.</p>
      </footer>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { checkHealth } from '../services/api';
  
  export default {
    name: 'Landing',
    setup() {
      const apiStatus = ref('');
  
      onMounted(async () => {
        try {
          const response = await checkHealth();
          apiStatus.value = response.data.message;
        } catch (error) {
          console.error('Error checking API health:', error);
          apiStatus.value = 'Error connecting to API';
        }
      });
  
      return { apiStatus };
    }
  };
  </script>
  
  <style scoped>
  .landing-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  nav a {
    margin-left: 10px;
    text-decoration: none;
    color: #4CAF50;
  }
  
  main {
    margin-bottom: 40px;
  }
  
  ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  li::before {
    content: "✓ ";
    color: #4CAF50;
  }
  
  footer {
    text-align: center;
    color: #666;
  }
  </style>