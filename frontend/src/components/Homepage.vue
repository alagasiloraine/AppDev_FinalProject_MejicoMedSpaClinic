<template>
  <div class="homepage">
    <header class="header">
      <nav class="nav">
        <h1 class="logo">Logo</h1>
        <ul class="nav-links">
          <li v-for="link in navLinks" :key="link">
            <a href="#" @click.prevent="activePage = link" :class="{ active: activePage === link }">{{ link }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <main class="main-content">
      <section class="hero">
        <h2>Welcome to Our Website</h2>
        <p>Discover amazing content and services</p>
        <button class="cta-button" @click="showModal = true">Get Started</button>
      </section>

      <section class="features">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" :style="{ backgroundColor: feature.color }"></div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; 2023 Your Company Name. All rights reserved.</p>
    </footer>

    <div v-if="showModal" class="modal" @click.self="showModal = false">
      <div class="modal-content">
        <h3>Get Started</h3>
        <p>Thank you for your interest! We'll be in touch soon.</p>
        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const navLinks = ['Home', 'About', 'Services', 'Contact'];
const activePage = ref('Home');
const showModal = ref(false);

const features = [
  { title: 'Feature 1', description: 'Amazing feature description goes here.', color: '#FF6B6B' },
  { title: 'Feature 2', description: 'Incredible feature you cannot miss.', color: '#4ECDC4' },
  { title: 'Feature 3', description: 'Unbelievable feature that will blow your mind.', color: '#45B7D1' },
];
</script>

<style scoped>
.homepage {
  font-family: Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

.header {
  background-color: #1a1a1a;
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 2rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.nav-links a:hover, .nav-links a.active {
  color: #4ECDC4;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.cta-button {
  background-color: #FF6B6B;
  color: #fff;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #ff4f4f;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #f4f4f4;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.footer {
  background-color: #1a1a1a;
  color: #fff;
  text-align: center;
  padding: 1rem;
  margin-top: 4rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.modal-content button {
  background-color: #4ECDC4;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-content button:hover {
  background-color: #3dbdab;
}
</style>