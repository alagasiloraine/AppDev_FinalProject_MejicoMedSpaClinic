// src/router/adminRoutes.js
import AdminDashboard from '../components/AdminDashboard.vue';
import Users from '../components/Users.vue';
import Patients from '../components/Patients.vue';
import Appointments from '../components/Appointments.vue';
import Calendar from '../components/Calendar.vue';
import Analytics from '../components/Analytics.vue';
import Settings from '../components/Settings.vue';

export default [
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/users', component: Users, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/patients', component: Patients, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/appointments', component: Appointments, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/calendar', component: Calendar, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/analytics', component: Analytics, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true, requiresAdmin: true } }
];
