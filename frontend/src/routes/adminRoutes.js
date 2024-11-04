// src/router/adminRoutes.js
import AdminDashboard from '../components/AdminDashboard.vue';
import Products from '../components/Products.vue';
import Services from '../components/Services.vue';
import Clients from '../components/Clients.vue';
import Appointments from '../components/Appointments.vue';
import Calendar from '../components/Calendar.vue';
import Analytics from '../components/Analytics.vue';
import Settings from '../components/Settings.vue';

export default [
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/products', component: Products, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/services', component: Services, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/clients', component: Clients, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/appointments', component: Appointments, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/calendar', component: Calendar, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/analytics', component: Analytics, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true, requiresAdmin: true } }
];