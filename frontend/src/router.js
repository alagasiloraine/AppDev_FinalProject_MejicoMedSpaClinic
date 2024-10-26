import { createRouter, createWebHistory } from 'vue-router';
import Landing from './components/Landing.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Homepage from './components/Homepage.vue';

const routes = [
  { path: '/', component: Landing },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Homepage }, 
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
