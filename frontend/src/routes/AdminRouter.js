// src/routes/AdminRouter.js
import AdminDashboard from '../components/adminComponent/AdminDashboard.vue';
import Services from '../components/adminComponent/Services.vue';

export default [
  {
    path: '/admin',
    component: AdminDashboard,
    children: [
      { path: 'services', component: Services },
    ],
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];
