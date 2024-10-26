// src/router/userRoutes.js
import Register from '../components/Register.vue';
import EmailVerification from '../components/EmailVerification.vue';
import Login from '../components/Login.vue';
import LandingPage from '../components/LandingPage.vue';
import ScheduleApp from '../components/ScheduleApp.vue';
import Homepage from '../components/Homepage.vue';


export default [
  {
    path: '/register',
    name: 'Register',
    component: Register,

  },
  {
    path: '/email-verification',
    name: 'EmailVerification',
    component: EmailVerification,
    meta: { requiresAuth: true },

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
  },
  {
    path: '/schedule-app',
    component: ScheduleApp,
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    component: Homepage,
    meta: { requiresAuth: true },
    
  },
  {
    path: '/',
    redirect: '/landing',
  },
];
