import { createRouter, createWebHistory } from 'vue-router';
import Landing from './components/Landing.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Homepage from './components/Homepage.vue';  // Ensure this is the correct homepage component

const routes = [
  { path: '/', component: Landing },  // Landing Page
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Homepage }, // Correct homepage component
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
