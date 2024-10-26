import { createRouter, createWebHistory } from 'vue-router';
import Landing from './components/Landing.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import PatientList from './components/PatientList.vue';
import EmailVerification from './components/EmailVerification.vue';
import ScheduleApp from './components/ScheduleApp.vue';

const routes = [
  { path: '/', component: Landing },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/patients', component: PatientList },
  { path: '/verify-email', component: EmailVerification },
  { path: '/ScheduleApp', component: ScheduleApp },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;