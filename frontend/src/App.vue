<template>
  <div id="app">
    <AppLayout v-if="isAdminRoute" />
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/AppLayout.vue'; // Admin panel layout

// Use `useRoute` to access the current route information
const route = useRoute();

// Check if the current route has `requiresAdmin` metadata
const isAdminRoute = computed(() => route.meta.requiresAdmin);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>