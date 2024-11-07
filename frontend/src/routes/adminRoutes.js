// src/router/adminRoutes.js
import AdminDashboard from '../components/AdminDashboard.vue';
import Products from '../components/Products.vue';
import Profiles from '../components/Profiles.vue';
import Inventory from '../components/Inventory.vue';
import Services from '../components/Services.vue';
import Treatments from '../components/Treatments.vue';
import TreatmentLists from '../components/TreatmentLists.vue';

import Clients from '../components/Clients.vue';
import Appointments from '../components/Appointments.vue';
import Calendar from '../components/Calendar.vue';
import ProductManage from '../components/ProductManage.vue';
import AppointmentLists from '../components/AppointmentLists.vue';

export default [
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/products', component: Products, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/inventory', component: Inventory, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/services', component: Services, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/treatments', component: Treatments, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/servicelist', component: TreatmentLists, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/clients', component: Clients, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/profiles', component: Profiles, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/appointments', component: Appointments, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/calendar', component: Calendar, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/productmanage', component: ProductManage, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/appointmentlists', component: AppointmentLists, meta: { requiresAuth: true, requiresAdmin: true } }
];