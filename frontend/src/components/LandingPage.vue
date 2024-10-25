<template>
  <div class="landing-container">
    <header>
      <h1 class="text-3xl font-bold mb-4">Welcome to Mejico Clinic</h1>
      <nav class="space-x-4">
        <router-link to="/login" class="text-blue-500 hover:text-blue-700">Login</router-link>
        <router-link to="/register" class="text-blue-500 hover:text-blue-700">Register</router-link>
      </nav>
    </header>
    <main class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Your Health, Our Priority</h2>
      <p class="mb-4">Mejico Clinic provides top-quality healthcare services to our community.</p>
      <ul class="list-disc pl-5 mb-4">
        <li>Expert doctors and staff</li>
        <li>State-of-the-art facilities</li>
        <li>Comprehensive medical services</li>
      </ul>
    </main>
    <footer class="mt-8 text-center text-gray-500">
      <p>&copy; 2023 Mejico Clinic. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Landing',
};
</script>

<style scoped>
.landing-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
