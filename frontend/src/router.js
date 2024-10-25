import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isAdmin } from './services/authService';

import Register from './components/Register.vue';
import EmailVerification from './components/EmailVerification.vue';
import Login from './components/Login.vue';
import LandingPage from './components/LandingPage.vue';
import AdminDashboard from './components/AdminDashboard.vue';

const routes = [
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/email-verification',
    name: 'EmailVerification',
    component: EmailVerification,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/landing',
    name: 'LandingPage',
    component: LandingPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/',
    redirect: '/landing',
  },
];

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