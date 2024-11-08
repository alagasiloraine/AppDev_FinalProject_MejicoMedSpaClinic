import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isAdmin } from '../services/authService';
import { userRoutes } from './userRoutes'; // Import user routes
import { adminRoutes } from './adminRoutes'; // Import admin routes

// Combine routes
const routes = [...userRoutes, ...adminRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const currentUser = await getCurrentUser();

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if (requiresAuth && currentUser && !currentUser.emailVerified) {
    next('/verify-email');
  } else if (requiresAdmin && !(await isAdmin())) {
    next('/home');
  } else {
    next();
  }
});

export default router;