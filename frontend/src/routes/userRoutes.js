import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../components/Landing.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Homepage from '../components/Homepage.vue';
import About from '../components/About.vue';
import CustomizeProfile from '../components/CustomizeProfile.vue';
import ContactUs from '../components/ContactUs.vue';
import Appointment from '../components/Appointment.vue';

// Export the routes array separately
export const userRoutes = [
  { path: '/landing', name: 'Landing', component: Landing },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/home', name: 'Homepage', component: Homepage },
  { path: '/about', name: 'About', component: About },
  { path: '/customizeprofile', name: 'CustomizeProfile', component: CustomizeProfile },
  { path: '/contact', name: 'ContactUs', component: ContactUs },
  { path: '/appointment', name: 'Appointment', component: Appointment },
];

// You can still export the router if needed elsewhere
const router = createRouter({
  history: createWebHistory(),
  routes: userRoutes,
});

export default router;