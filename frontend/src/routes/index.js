// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isAdmin } from '../services/authService';
import userRoutes from './userRoutes'; // Import user routes
import adminRoutes from './adminRoutes'; // Import admin routes

// Combine routes
const routes = [...userRoutes, ...adminRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if (requiresAdmin && !(await isAdmin())) {
    next('/landing');
  } else {
    next();
  }
});

export default router;